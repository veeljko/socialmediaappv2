const { createProxyMiddleware } = require('http-proxy-middleware');

const authProxy = createProxyMiddleware({
    target: 'http://localhost:' + (process.env.USER_SERVICE_PORT || 3001),
    changeOrigin: true,
    logLevel: "debug",
    pathRewrite: {
        [`^/api/auth/login`] : '/login',
        [`^/api/auth/register`]: '/register',
        ['^/api/auth/refresh'] : '/refresh',
        ['^/api/auth/test'] : '/test',
        ['^/api/auth/deleteUser'] : '/deleteUser',
        ['^/api/auth/me'] : '/me',
        ['^/api/auth/logout'] :  '/logout'
    }
});

const postProxy = createProxyMiddleware({
    target: 'http://localhost:' + (process.env.POST_SERVICE_PORT || 3003),
    changeOrigin: true,
    logLevel: "debug",
    pathRewrite: {
        [`^/api/post/create-post`]: '/create-post',
        [`^/api/post/delete-post`] : '/delete-post',
        [`^/api/post/like-post`]: '/like-post',
        ['^/api/post/unlike-post'] : '/unlike-post',
        ['^/api/post/delete-all-posts-by-user'] : '/delete-all-posts-by-user',
        ['^/api/post/delete-all-likes-by-user'] : '/delete-all-likes-by-user',
        ['^/api/post/add-comment-to-post'] : '/add-comment-to-post',
        ['^/api/post/add-comment-to-comment'] : '/add-comment-to-comment',
        ['^/api/post/delete-comment'] : '/delete-comment',
        ['^/api/post/get-comments-from-post'] : '/get-comments-from-post',
        ['^/api/post/get-comments-from-comment/'] : '/get-comments-from-comment',
        ['^/api/post/get-posts-by-user'] : '/get-posts-by-user',
        ['^/api/post/get-posts'] : '/get-posts',
        ['^/api/post/update-post'] : '/update-post',
        ['^/api/post/update-comment'] : '/update-comment'
    }
});

const commentProxy = createProxyMiddleware({
    target: 'http://localhost:' + (process.env.COMMENT_SERVICE_PORT || 3002),
    changeOrigin: true,
    logLevel: "debug",
    pathRewrite: {
        ['^/api/comment/add-comment-to-post'] : '/add-comment-to-post',
        ['^/api/comment/add-comment-to-comment'] : '/add-comment-to-comment',
        ['^/api/comment/delete-comment'] : '/delete-comment',
        ['^/api/comment/get-comments-from-post'] : '/get-comments-from-post',
        ['^/api/comment/get-comments-from-comment/'] : '/get-comments-from-comment',
        ['^/api/comment/update-comment'] : '/update-comment'
    }
});

const followerProxy = createProxyMiddleware({
    target: 'http://localhost:' + (process.env.FOLLOWER_SERVICE_PORT || 3004),
    changeOrigin: true,
    logLevel: "debug",
    pathRewrite: {
        ['^/api/follower/test'] : '/test',
        ['^/api/follower/follow'] : '/follow',
        ['^/api/follower/unfollow'] : '/unfollow',
    }
});

const notificationProxy = createProxyMiddleware({
    target: 'http://localhost:' + (process.env.NOTIFICATION_SERVICE_PORT || 3005),
    changeOrigin: true,
    logLevel: "debug",
    pathRewrite: {
        ['^/api/notification/get-notifications'] : '/get-notifications'
    }
});

const messageProxy = createProxyMiddleware({
    target: 'http://localhost:' + (process.env.MESSAGE_SERVICE_PORT || 3006),
    changeOrigin: true,
    logLevel: "debug",
    pathRewrite: {
        ['^/api/message/create-chat'] : '/create-chat',
        ['^/api/message/add-user-to-chat'] : '/add-user-to-chat',
        ['^/api/message/remove-user-from-chat'] : '/remove-user-from-chat',
        ['^/api/message/delete-chat'] : '/delete-chat',
        ['^/api/message/load-messages'] : '/load-messages'
    }
});

module.exports = {
    authProxy,
    postProxy,
    commentProxy,
    followerProxy,
    notificationProxy,
    messageProxy
};