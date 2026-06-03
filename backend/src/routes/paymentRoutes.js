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
  approvePayment,
  capturePayPalOrder
} = require("../controllers/paymentController");

const { rejectPayment } = require("../controllers/paymentController");
const { simulatePayPalCapture } = require('../controllers/devTestController');


// ==============================
// 📤 USER: UPLOAD PAYMENT PROOF
// ==============================
router.post(
  "/upload",
  authMiddleware,
  uploadPaymentProof
);


// ==============================
// 💳 PAYPAL ORDER CAPTURE
// ==============================
router.post(
  "/confirm",
  authMiddleware,
  capturePayPalOrder
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

router.put(
  "/reject/:paymentId",
  authMiddleware,
  authorizeRoles("ADMIN"),
  rejectPayment
);

// ==============================
// 🧪 DEV: Simulate PayPal capture (non-production only)
// ==============================
if (process.env.NODE_ENV !== 'production') {
  router.post(
    '/test-capture',
    authMiddleware,
    authorizeRoles('ADMIN'),
    simulatePayPalCapture
  );
}

module.exports = router;