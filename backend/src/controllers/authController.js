const argon2 = require("argon2");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const { authenticator } = require("otplib");
const prisma = require("../config/db");
const env = require("../config/env");
const AppError = require("../utils/appError");
const { ok } = require("../utils/response");
const { hashToken, signAccessToken, signRefreshToken, setAuthCookies } = require("../utils/tokens");
const { sendEmail } = require("../services/emailService");

function sanitizeUser(user) {
  const { passwordHash, twoFactorSecret, resetPasswordTokenHash, ...safe } = user;
  return safe;
}

async function userRoleId() {
  const role = await prisma.role.findUnique({ where: { name: "user" } });
  if (!role) throw new AppError(500, "ROLE_MISSING", "Default user role is missing.");
  return role.id;
}

async function register(req, res) {
  const { fullName, email, phone, password, preferredLanguage, preferredCurrency } = req.body;
  const passwordHash = await argon2.hash(password, { type: argon2.argon2id });
  const user = await prisma.user.create({
    data: {
      fullName,
      email: email.toLowerCase(),
      phone,
      passwordHash,
      roleId: await userRoleId(),
      status: "active",
      preferredLanguage,
      preferredCurrency
    },
    include: { role: true }
  });
  await sendEmail({ to: user.email, subject: "Verify your account", text: "TODO: verification link format is not defined in api_spec.yaml." });
  return ok(res, { user: sanitizeUser(user), message: "Registration successful." });
}

async function login(req, res) {
  const { email, password, totp } = req.body;
  const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() }, include: { role: true } });
  if (!user) throw new AppError(401, "INVALID_CREDENTIALS", "Email or password is incorrect.");
  if (user.status === "suspended") throw new AppError(401, "ACCOUNT_SUSPENDED", "This account is suspended.");
  if (user.status !== "active") throw new AppError(401, "ACCOUNT_UNVERIFIED", "Please verify your account before logging in.");
  if (user.lockedUntil && user.lockedUntil > new Date()) throw new AppError(429, "ACCOUNT_LOCKED", "Account is temporarily locked. Try again later.");

  const validPassword = await argon2.verify(user.passwordHash, password);
  if (!validPassword) {
    const attempts = user.failedLoginAttempts + 1;
    const lockedUntil = attempts >= 5 ? new Date(Date.now() + 15 * 60 * 1000) : null;
    await prisma.user.update({ where: { id: user.id }, data: { failedLoginAttempts: attempts, lockedUntil } });
    if (lockedUntil) await sendEmail({ to: user.email, subject: "Account locked", text: "Your account was locked for 15 minutes." });
    throw new AppError(401, "INVALID_CREDENTIALS", "Email or password is incorrect.");
  }

  if (user.role.name === "admin") {
    if (!user.twoFactorSecret) throw new AppError(403, "TWO_FACTOR_REQUIRED", "Administrator 2FA is required.");
    if (!totp || !authenticator.check(totp, user.twoFactorSecret)) throw new AppError(403, "TWO_FACTOR_REQUIRED", "A valid TOTP code is required.");
  }

  await prisma.user.update({ where: { id: user.id }, data: { failedLoginAttempts: 0, lockedUntil: null, lastLoginAt: new Date() } });
  const accessToken = signAccessToken(user);
  const refreshToken = signRefreshToken(user);
  setAuthCookies(res, accessToken, refreshToken);
  return ok(res, { accessToken, refreshToken, user: sanitizeUser(user) });
}

async function logout(req, res) {
  const token = req.token || req.cookies.accessToken;
  if (token) {
    const decoded = jwt.decode(token);
    await prisma.revokedToken.create({
      data: { tokenHash: hashToken(token), expiresAt: decoded?.exp ? new Date(decoded.exp * 1000) : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) }
    }).catch(() => null);
  }
  res.clearCookie("accessToken");
  res.clearCookie("refreshToken");
  return ok(res, { message: "Logged out successfully." });
}

async function refresh(req, res) {
  const token = req.body.refreshToken || req.cookies.refreshToken;
  if (!token) throw new AppError(401, "UNAUTHORIZED", "Refresh token is required.");
  const payload = jwt.verify(token, env.jwtRefreshSecret);
  const user = await prisma.user.findUnique({ where: { id: payload.sub }, include: { role: true } });
  if (!user || user.status !== "active") throw new AppError(401, "UNAUTHORIZED", "Authentication is required.");
  const accessToken = signAccessToken(user);
  const refreshToken = signRefreshToken(user);
  setAuthCookies(res, accessToken, refreshToken);
  return ok(res, { accessToken, refreshToken });
}

async function forgotPassword(req, res) {
  const user = await prisma.user.findUnique({ where: { email: req.body.email.toLowerCase() } });
  if (user) {
    const token = crypto.randomBytes(32).toString("hex");
    await prisma.user.update({
      where: { id: user.id },
      data: { resetPasswordTokenHash: hashToken(token), resetPasswordExpiresAt: new Date(Date.now() + 60 * 60 * 1000) }
    });
    await sendEmail({ to: user.email, subject: "Reset your password", text: `${env.appBaseUrl}/reset-password?token=${token}` });
  }
  return ok(res, { message: "If the email exists, a reset link will be sent." });
}

async function resetPassword(req, res) {
  const tokenHash = hashToken(req.body.token);
  const user = await prisma.user.findFirst({ where: { resetPasswordTokenHash: tokenHash, resetPasswordExpiresAt: { gt: new Date() } } });
  if (!user) throw new AppError(400, "INVALID_RESET_TOKEN", "Password reset token is invalid or expired.");
  const passwordHash = await argon2.hash(req.body.password, { type: argon2.argon2id });
  await prisma.user.update({ where: { id: user.id }, data: { passwordHash, resetPasswordTokenHash: null, resetPasswordExpiresAt: null } });
  return ok(res, { message: "Password reset successfully." });
}

module.exports = { register, login, logout, refresh, forgotPassword, resetPassword, sanitizeUser };
