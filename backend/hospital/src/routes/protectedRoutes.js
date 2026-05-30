const express = require("express");
const router = express.Router();

// ✅ IMPORTANT: correct destructuring import
const { authMiddleware } = require("../middleware/authMiddleware");

// ======================
// 🛡 PROTECTED DASHBOARD ROUTE
// ======================
router.get("/dashboard", authMiddleware, (req, res) => {
  res.json({
    message: "Welcome to Hospital Dashboard",
    user: req.user
  });
});

module.exports = router;