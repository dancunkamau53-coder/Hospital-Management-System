const express = require("express");
const router = express.Router();

// ==============================
// 🔐 MIDDLEWARE
// ==============================
const {
  authMiddleware,
  authorizeRoles
} = require("../middleware/authMiddleware");

// ==============================
// 📊 CONTROLLERS
// ==============================
const {
  getDashboardStats
} = require("../controllers/adminController");
const { listSubscriptionPayments, listReferralRequests } = require("../controllers/adminController");


// ==============================
// 👑 ADMIN DASHBOARD ROUTE
// ==============================
router.get(
  "/dashboard",
  authMiddleware,
  authorizeRoles("ADMIN"),
  getDashboardStats
);

router.get(
  "/payments",
  authMiddleware,
  authorizeRoles("ADMIN"),
  listSubscriptionPayments
);

router.get(
  "/referrals",
  authMiddleware,
  authorizeRoles("ADMIN"),
  listReferralRequests
);

module.exports = router;