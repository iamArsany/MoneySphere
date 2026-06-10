const prisma = require("../config/db");

async function audit(adminUserId, action, entityType, entityId, ipAddress) {
  return prisma.auditLog.create({
    data: { userId: adminUserId, action, entityType, entityId, ipAddress }
  });
}

module.exports = { audit };
