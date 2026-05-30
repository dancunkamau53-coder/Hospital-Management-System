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


// ==============================
// 👑 ADMIN DASHBOARD ROUTE
// ==============================
router.get(
  "/dashboard",
  authMiddleware,
  authorizeRoles("ADMIN"),
  getDashboardStats
);

module.exports = router;