const { StatusCodes } = require("http-status-codes");
const jwt = require("jsonwebtoken");

function authenticate(req, res, next) {
  let token = null;
  const authHeader = req.headers.authorization;

  if (authHeader && authHeader.startsWith("Bearer ")) {
    token = authHeader.split(" ")[1];
  }

  if (!token && req.cookies?.refreshToken) {
    token = req.cookies.refreshToken;
  }

  if (!token) {
    return res.status(StatusCodes.UNAUTHORIZED).json({
      message: "Authentication required",
    });
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env.REFRESH_TOKEN_SECRET
    );

    req.user = {
      userId: decoded.userId,
    };

    next();
  } catch (err) {
    return res.status(StatusCodes.UNAUTHORIZED).json({
      message: "Access token expired or invalid",
    });
  }
}

module.exports = authenticate;