const FeedEntry = require("../models/feed-entry-model");
const PullSource = require("../models/pull-source-model");
const CelebrityAuthor = require("../models/celebrity-author-model");
const { getFollowerIdsBatch } = require("../utils/serviceClients");
const { winstonLogger } = require("../utils/logger/winstonLogger");

const CELEBRITY_THRESHOLD =
  Number.parseInt(process.env.FEED_CELEBRITY_THRESHOLD, 10) || 10000;
const FOLLOWER_BATCH_SIZE =
  Number.parseInt(process.env.FEED_FOLLOWER_BATCH_SIZE, 10) || 1000;
const WRITE_CHUNK_SIZE =
  Number.parseInt(process.env.FEED_WRITE_CHUNK_SIZE, 10) || 500;

function chunkItems(items, size) {
  const chunks = [];

  for (let index = 0; index < items.length; index += size) {
    chunks.push(items.slice(index, index + size));
  }

  return chunks;
}

async function upsertFeedEntries(userIds, postId, authorId, createdAt) {
  const chunks = chunkItems(userIds, WRITE_CHUNK_SIZE);

  for (const chunk of chunks) {
    await FeedEntry.bulkWrite(
      chunk.map((userId) => ({
        updateOne: {
          filter: {
            userId,
            postId,
          },
          update: {
            $setOnInsert: {
              userId,
              postId,
              postAuthorId: authorId,
              createdAt,
              source: "push",
            },
          },
          upsert: true,
        },
      })),
      { ordered: false }
    );
  }
}

async function promoteToCelebrity({ authorId }) {
  let cursor = "";
  const batch = await getFollowerIdsBatch(
    authorId,
    cursor,
    FOLLOWER_BATCH_SIZE
  );
  const followerIds = batch.followerIds || [];
  await CelebrityAuthor.updateOne(
    { authorId },
    {
      $setOnInsert: {
        authorId,
        activatedAt: new Date(),
      },
    },
    { upsert: true }
  );

  if (followerIds.length) {
    await upsertPullSources(followerIds, authorId);
  }

  cursor = batch.cursor || "";

  while (cursor) {
    const nextBatch = await getFollowerIdsBatch(
      authorId,
      cursor,
      FOLLOWER_BATCH_SIZE
    );

    if (nextBatch.followerIds?.length) {
      await upsertPullSources(nextBatch.followerIds, authorId);
    }

    cursor = nextBatch.cursor || "";
  }

  winstonLogger.info({
    message: "Author promoted to celebrity pull source",
    authorId,
    followerCount: batch.totalCount,
  });
}

async function upsertPullSources(userIds, authorId) {
  const chunks = chunkItems(userIds, WRITE_CHUNK_SIZE);

  for (const chunk of chunks) {
    await PullSource.bulkWrite(
      chunk.map((userId) => ({
        updateOne: {
          filter: {
            userId,
            authorId,
          },
          update: {
            $setOnInsert: {
              userId,
              authorId,
              createdAt: new Date(),
            },
          },
          upsert: true,
        },
      })),
      { ordered: false }
    );
  }
}

const handlePostCreated = async ({ postId, authorId, createdAt }) => {
  if (!postId || !authorId || !createdAt) {
    winstonLogger.error({
      message: "Invalid post.created payload",
      postId,
      authorId,
      createdAt,
    });
    return;
  }

  try {
    const alreadyCelebrity = await CelebrityAuthor.exists({ authorId });

    if (alreadyCelebrity) {
      winstonLogger.info({
        message: "Skipping feed push for celebrity author",
        authorId,
        postId,
      });
      return;
    }

    let cursor = "";
    let isFirstBatch = true;

    do {
      const batch = await getFollowerIdsBatch(
        authorId,
        cursor,
        FOLLOWER_BATCH_SIZE
      );
      const followerIds = batch.followerIds || [];

      if (isFirstBatch && (batch.totalCount || 0) >= CELEBRITY_THRESHOLD) {
        await promoteToCelebrity({ authorId });
        return;
      }

      if (followerIds.length) {
        await upsertFeedEntries(followerIds, postId, authorId, createdAt);
      }

      cursor = batch.cursor || "";
      isFirstBatch = false;
    } while (cursor);

    winstonLogger.info({
      message: "Feed entries created for post",
      authorId,
      postId,
    });
  } catch (err) {
    winstonLogger.error({
      message: "Unable to handle post.created in Feed service",
      postId,
      authorId,
      error: err,
    });
  }
};

const handlePostDeleted = async ({ postId }) => {
  if (!postId) {
    winstonLogger.error({
      message: "Invalid post.deleted payload",
      postId,
    });
    return;
  }

  try {
    await FeedEntry.deleteMany({ postId });

    winstonLogger.info({
      message: "Feed entries removed for deleted post",
      postId,
    });
  } catch (err) {
    winstonLogger.error({
      message: "Unable to handle post.deleted in Feed service",
      postId,
      error: err,
    });
  }
};

module.exports = { handlePostCreated, handlePostDeleted };
