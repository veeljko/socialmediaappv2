const { winstonLogger } = require("./logger/winstonLogger");

const POST_SERVICE_PORT = process.env.POST_SERVICE_PORT || 3003;
const FOLLOWER_SERVICE_PORT = process.env.FOLLOWER_SERVICE_PORT || 3004;

const POST_SERVICE_BASE_URL =
    process.env.POST_SERVICE_BASE_URL ||
    `http://localhost:${POST_SERVICE_PORT}`;
const FOLLOWER_SERVICE_BASE_URL =
    process.env.FOLLOWER_SERVICE_BASE_URL ||
    `http://localhost:${FOLLOWER_SERVICE_PORT}`;

async function parseJsonResponse(response, context) {
    const payload = await response.json().catch(() => null);

    if (!response.ok) {
        winstonLogger.error({
            message: "Inter-service request failed",
            context,
            status: response.status,
            payload,
        });
        throw new Error(`${context} failed with status ${response.status}`);
    }

    return payload;
}

async function getFollowerIdsBatch(authorId, cursor = "", limit = 1000) {
    const params = new URLSearchParams({
        limit: String(limit),
    });

    if (cursor) {
        params.set("cursor", cursor);
    }

    const response = await fetch(
        `${FOLLOWER_SERVICE_BASE_URL}/internal/follower-ids/${authorId}?${params.toString()}`
    );

    return parseJsonResponse(response, "getFollowerIdsBatch");
}

async function getPostsByIds(postIds) {
    if (!postIds.length) {
        return { posts: [] };
    }

    const response = await fetch(`${POST_SERVICE_BASE_URL}/internal/posts-by-ids`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ postIds }),
    });

    return parseJsonResponse(response, "getPostsByIds");
}

async function getPostsByAuthors({
    authorIds,
    cursorCreatedAt,
    cursorId,
    limit = 20,
}) {
    if (!authorIds.length) {
        return { posts: [] };
    }

    const response = await fetch(
        `${POST_SERVICE_BASE_URL}/internal/posts-by-authors`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                authorIds,
                cursorCreatedAt,
                cursorId,
                limit,
            }),
        }
    );

    return parseJsonResponse(response, "getPostsByAuthors");
}

async function getLatestPostsByAuthor(authorId, limit = 20) {
    const params = new URLSearchParams({
        limit: String(limit),
    });

    const response = await fetch(
        `${POST_SERVICE_BASE_URL}/get-posts-by-user/${authorId}?${params.toString()}`
    );

    return parseJsonResponse(response, "getLatestPostsByAuthor");
}

module.exports = {
    getFollowerIdsBatch,
    getPostsByIds,
    getPostsByAuthors,
    getLatestPostsByAuthor,
};
