const express = require("express");
const router = express.Router();

const { authMiddleware } = require("../middleware/authMiddleware");

// ==============================
// ROUTES
// ==============================

router.get("/", authMiddleware, (req, res) => {
  res.json({ message: "Invoice routes" });
});

module.exports = router;
