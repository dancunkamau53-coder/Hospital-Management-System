const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const logAction = async ({
  userId,
  hospitalId,
  actionType,
  entity,
  entityId,
  details
}) => {
  return prisma.auditLog.create({
    data: {
      userId: userId || null,
      hospitalId: hospitalId || null,
      actionType,
      entity,
      entityId: entityId || null,
      details: details || null
    }
  });
};

module.exports = {
  logAction
};
