const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const getAuditLogs = async (req, res) => {
  try {
    const auditLogs = await prisma.auditLog.findMany({
      where: {
        hospitalId: req.user.hospitalId
      },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            email: true,
            role: true
          }
        }
      },
      orderBy: {
        createdAt: "desc"
      }
    });

    res.json({
      message: "Audit logs loaded successfully",
      auditLogs
    });
  } catch (error) {
    res.status(500).json({
      message: "Error loading audit logs",
      error: error.message
    });
  }
};

module.exports = {
  getAuditLogs
};
