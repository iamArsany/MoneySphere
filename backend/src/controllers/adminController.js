const prisma = require("../config/db");
const AppError = require("../utils/appError");
const { ok } = require("../utils/response");
const { audit } = require("../services/auditService");
const { sendEmail } = require("../services/emailService");
const { sanitizeUser } = require("./authController");

async function listUsers(req, res) {
  const page = Number(req.query.page || 1);
  const limit = Math.min(Number(req.query.limit || 20), 100);
  const where = req.query.search
    ? { OR: [{ fullName: { contains: req.query.search, mode: "insensitive" } }, { email: { contains: req.query.search, mode: "insensitive" } }] }
    : {};
  const [users, total] = await Promise.all([
    prisma.user.findMany({ where, include: { role: true }, orderBy: { createdAt: "desc" }, skip: (page - 1) * limit, take: limit }),
    prisma.user.count({ where })
  ]);
  return ok(res, { users: users.map(sanitizeUser), pagination: { page, limit, total } });
}

async function updateUserStatus(req, res) {
  const target = await prisma.user.findUnique({ where: { id: req.params.id }, include: { role: true } });
  if (!target) throw new AppError(404, "USER_NOT_FOUND", "The user was not found.");
  if (target.role.name === "admin" && req.body.status !== "active") {
    const activeAdmins = await prisma.user.count({ where: { role: { name: "admin" }, status: "active", id: { not: target.id } } });
    if (activeAdmins < 1) throw new AppError(400, "LAST_ADMIN", "There must always be at least one active Administrator account.");
  }
  const user = await prisma.user.update({ where: { id: target.id }, data: { status: req.body.status }, include: { role: true } });
  await audit(req.user.id, req.body.status === "suspended" ? "SUSPEND_USER" : "REACTIVATE_USER", "User", user.id, req.ip);
  await sendEmail({ to: user.email, subject: "Account status updated", text: `Your account status is now ${user.status}.` });
  return ok(res, { user: sanitizeUser(user) });
}

async function deleteUser(req, res) {
  const target = await prisma.user.findUnique({ where: { id: req.params.id }, include: { role: true } });
  if (!target) throw new AppError(404, "USER_NOT_FOUND", "The user was not found.");
  if (target.role.name === "admin") {
    const activeAdmins = await prisma.user.count({ where: { role: { name: "admin" }, status: "active", id: { not: target.id } } });
    if (activeAdmins < 1) throw new AppError(400, "LAST_ADMIN", "There must always be at least one active Administrator account.");
  }
  await prisma.user.delete({ where: { id: target.id } });
  await audit(req.user.id, "DELETE_USER", "User", target.id, req.ip);
  return ok(res, { message: "User deleted successfully." });
}

async function analytics(req, res) {
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const [totalRegisteredUsers, activeUsersLast30Days, totalTransactionsRecorded] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { lastLoginAt: { gte: thirtyDaysAgo } } }),
    prisma.transaction.count()
  ]);
  return ok(res, {
    metrics: { totalRegisteredUsers, activeUsersLast30Days, totalTransactionsRecorded },
    newRegistrationsLast30Days: [],
    dailyActiveUsersLast90Days: []
    // TODO: API spec does not define analytics bucket response shape; keep arrays until agreed.
  });
}

async function auditLog(req, res) {
  const page = Number(req.query.page || 1);
  const limit = Math.min(Number(req.query.limit || 20), 100);
  const where = {
    ...(req.query.action ? { action: req.query.action } : {}),
    ...(req.query.startDate || req.query.endDate ? { timestamp: { ...(req.query.startDate ? { gte: new Date(req.query.startDate) } : {}), ...(req.query.endDate ? { lte: new Date(req.query.endDate) } : {}) } } : {})
  };
  const [logs, total] = await Promise.all([
    prisma.auditLog.findMany({ where, include: { user: true }, orderBy: { timestamp: "desc" }, skip: (page - 1) * limit, take: limit }),
    prisma.auditLog.count({ where })
  ]);
  return ok(res, { auditLog: logs, pagination: { page, limit, total } });
}

async function createCategory(req, res) {
  const category = await prisma.category.create({ data: req.body });
  await audit(req.user.id, "CREATE_CATEGORY", "Category", category.id, req.ip);
  return ok(res, { category });
}

async function updateCategory(req, res) {
  const existing = await prisma.category.findUnique({ where: { id: req.params.id } });
  if (!existing) throw new AppError(404, "CATEGORY_NOT_FOUND", "The category was not found.");
  if (existing.isSystem) throw new AppError(400, "SYSTEM_CATEGORY_IMMUTABLE", "System categories cannot be edited or deleted.");
  const category = await prisma.category.update({ where: { id: existing.id }, data: req.body });
  await audit(req.user.id, "UPDATE_CATEGORY", "Category", category.id, req.ip);
  return ok(res, { category });
}

async function broadcast(req, res) {
  const users = await prisma.user.findMany({ where: { status: "active" }, select: { id: true } });
  await prisma.notification.createMany({
    data: users.map((user) => ({ userId: user.id, title: req.body.title, message: req.body.message, type: "BROADCAST", link: req.body.link }))
  });
  await audit(req.user.id, "BROADCAST", "Notification", null, req.ip);
  return ok(res, { delivered: users.length });
}

module.exports = { listUsers, updateUserStatus, deleteUser, analytics, auditLog, createCategory, updateCategory, broadcast };
