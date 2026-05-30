const express = require("express");
const router = express.Router();

const {
  authMiddleware,
  authorizeRoles
} = require("../middleware/authMiddleware");

const {
  getAuditLogs
} = require("../controllers/auditController");

router.get(
  "/audit-logs",
  authMiddleware,
  authorizeRoles("ADMIN"),
  getAuditLogs
);

module.exports = router;
