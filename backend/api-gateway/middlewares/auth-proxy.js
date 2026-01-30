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
        ['^/api/create-post'] : '/create-post',
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
    }
});

module.exports = {authProxy, postProxy};