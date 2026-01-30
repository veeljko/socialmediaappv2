const { StatusCodes } = require("http-status-codes");
const jwt = require("jsonwebtoken");

function authenticate(req, res, next) {
    const authHeader = req.headers.authorization; // "Bearer token"

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(StatusCodes.UNAUTHORIZED).json({
            message: "No token provided",
        });
    }

    const token = authHeader.split(" ")[1];

    try {
        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        return res.status(StatusCodes.UNAUTHORIZED).json({
            message: "Token expired or invalid",
        });
    }
}

module.exports = authenticate;
