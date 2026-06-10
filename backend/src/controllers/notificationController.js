const prisma = require("../config/db");
const AppError = require("../utils/appError");
const { ok } = require("../utils/response");

async function listNotifications(req, res) {
  const page = Number(req.query.page || 1);
  const limit = Math.min(Number(req.query.limit || 20), 100);
  const where = { userId: req.user.id, ...(req.query.includeArchived === "true" ? {} : { archivedAt: null }) };
  const [notifications, total, unreadCount] = await Promise.all([
    prisma.notification.findMany({ where, orderBy: { createdAt: "desc" }, skip: (page - 1) * limit, take: limit }),
    prisma.notification.count({ where }),
    prisma.notification.count({ where: { userId: req.user.id, readFlag: false, archivedAt: null } })
  ]);
  return ok(res, { notifications, unreadCount, pagination: { page, limit, total } });
}

async function markRead(req, res) {
  const notification = await prisma.notification.findFirst({ where: { id: req.params.id, userId: req.user.id } });
  if (!notification) throw new AppError(404, "NOTIFICATION_NOT_FOUND", "The notification was not found.");
  const updated = await prisma.notification.update({ where: { id: notification.id }, data: { readFlag: true } });
  return ok(res, { notification: updated });
}

async function markAllRead(req, res) {
  await prisma.notification.updateMany({ where: { userId: req.user.id, readFlag: false }, data: { readFlag: true } });
  return ok(res, { message: "All notifications marked as read." });
}

async function getPreferences(req, res) {
  return ok(res, { preferences: req.user.notificationPreferences });
}

async function updatePreferences(req, res) {
  const user = await prisma.user.update({ where: { id: req.user.id }, data: { notificationPreferences: req.body.preferences }, include: { role: true } });
  return ok(res, { preferences: user.notificationPreferences });
}

module.exports = { listNotifications, markRead, markAllRead, getPreferences, updatePreferences };
