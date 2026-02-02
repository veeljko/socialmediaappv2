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
    }
});

const postProxy = createProxyMiddleware({
    target: 'http://localhost:' + (process.env.POST_SERVICE_PORT || 3002),
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

const postProxy = createProxyMiddleware({
    target: 'http://localhost:' + (process.env.POST_SERVICE_PORT || 3002),
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

module.exports = {authProxy, postProxy};