const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const env = require("../config/env");

function hashToken(token) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

function signAccessToken(user) {
  const expiresIn = user.role?.name === "admin" ? env.adminJwtExpiresIn : env.jwtAccessExpiresIn;
  return jwt.sign(
    { sub: user.id, role: user.role.name, twoFactorVerified: user.role.name !== "admin" },
    env.jwtAccessSecret,
    { expiresIn }
  );
}

function signRefreshToken(user) {
  return jwt.sign({ sub: user.id, role: user.role.name }, env.jwtRefreshSecret, {
    expiresIn: env.jwtRefreshExpiresIn
  });
}

function setAuthCookies(res, accessToken, refreshToken) {
  const options = { httpOnly: true, secure: env.cookieSecure, sameSite: "strict" };
  res.cookie("accessToken", accessToken, options);
  res.cookie("refreshToken", refreshToken, options);
}

module.exports = { hashToken, signAccessToken, signRefreshToken, setAuthCookies };
