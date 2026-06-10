const jwt = require("jsonwebtoken");
const prisma = require("../config/db");
const env = require("../config/env");
const AppError = require("../utils/appError");
const { hashToken } = require("../utils/tokens");

async function authenticate(req, res, next) {
  try {
    const header = req.headers.authorization || "";
    const token = header.startsWith("Bearer ") ? header.slice(7) : req.cookies.accessToken;
    if (!token) throw new AppError(401, "UNAUTHORIZED", "Authentication is required.");

    const revoked = await prisma.revokedToken.findUnique({ where: { tokenHash: hashToken(token) } });
    if (revoked) throw new AppError(401, "TOKEN_REVOKED", "This session is no longer valid.");

    const payload = jwt.verify(token, env.jwtAccessSecret);
    const user = await prisma.user.findUnique({ where: { id: payload.sub }, include: { role: true } });
    if (!user || user.status !== "active") throw new AppError(401, "UNAUTHORIZED", "Authentication is required.");
    req.user = user;
    req.token = token;
    req.tokenPayload = payload;
    return next();
  } catch (err) {
    return next(err.statusCode ? err : new AppError(401, "UNAUTHORIZED", "Authentication is required."));
  }
}

function requireRole(...roles) {
  return (req, res, next) => {
    if (!roles.includes(req.user.role.name)) {
      return next(new AppError(403, "FORBIDDEN", "You do not have permission to perform this action."));
    }
    if (req.user.role.name === "admin" && req.tokenPayload.twoFactorVerified !== true) {
      return next(new AppError(403, "TWO_FACTOR_REQUIRED", "Administrator access requires verified 2FA."));
    }
    return next();
  };
}

module.exports = { authenticate, requireRole };
