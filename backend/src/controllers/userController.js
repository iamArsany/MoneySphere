const prisma = require("../config/db");
const AppError = require("../utils/appError");
const { ok } = require("../utils/response");
const { sanitizeUser } = require("./authController");

async function me(req, res) {
  return ok(res, { user: sanitizeUser(req.user) });
}

async function updateMe(req, res) {
  const data = {};
  for (const key of ["fullName", "email", "phone", "preferredLanguage", "preferredCurrency", "avatarUrl"]) {
    if (req.body[key] !== undefined) data[key] = key === "email" ? req.body[key].toLowerCase() : req.body[key];
  }
  const user = await prisma.user.update({ where: { id: req.user.id }, data, include: { role: true } });
  return ok(res, { user: sanitizeUser(user) });
}

async function deleteMe(req, res) {
  if (req.user.role.name === "admin") {
    const activeAdmins = await prisma.user.count({ where: { role: { name: "admin" }, status: "active", id: { not: req.user.id } } });
    if (activeAdmins < 1) throw new AppError(400, "LAST_ADMIN", "There must always be at least one active Administrator account.");
  }
  await prisma.user.delete({ where: { id: req.user.id } });
  return ok(res, { message: "Account deleted successfully." });
}

module.exports = { me, updateMe, deleteMe };
