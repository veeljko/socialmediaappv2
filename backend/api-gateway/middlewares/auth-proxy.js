const { createProxyMiddleware } = require('http-proxy-middleware');

const authProxy = createProxyMiddleware({
    target: 'http://localhost:' + (process.env.USER_SERVICE_PORT || 3001),
    changeOrigin: true,
    pathRewrite: {
        [`^/api/auth/login`] : '/login',
        [`^/api/auth/register`]: '/register',
        ['^/api/auth/refresh'] : '/refresh'
    }
});

module.exports = {authProxy};