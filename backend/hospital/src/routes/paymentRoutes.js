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
// 📦 CONTROLLERS
// ==============================
const {
  uploadPaymentProof,
  approvePayment
} = require("../controllers/paymentController");


// ==============================
// 📤 USER: UPLOAD PAYMENT PROOF
// ==============================
router.post(
  "/upload",
  authMiddleware,
  uploadPaymentProof
);


// ==============================
// 👑 ADMIN: APPROVE PAYMENT
// ==============================
router.put(
  "/approve/:paymentId",
  authMiddleware,
  authorizeRoles("ADMIN"),
  approvePayment
);

module.exports = router;