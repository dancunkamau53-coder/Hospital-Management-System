const express = require("express");
const router = express.Router();

const {
  authMiddleware,
  authorizeRoles
} = require("../middleware/authMiddleware");

const {
  createInvoice,
  getInvoices,
  addPayment,
  getBillingDashboard
} = require("../controllers/billingController");


// ==============================
// 🧾 INVOICES
// ==============================
router.post(
  "/invoice",
  authMiddleware,
  authorizeRoles("ADMIN", "CASHIER"),
  createInvoice
);

router.get(
  "/invoices",
  authMiddleware,
  authorizeRoles("ADMIN", "CASHIER"),
  getInvoices
);


// ==============================
// 💳 PAYMENTS
// ==============================
router.post(
  "/payment",
  authMiddleware,
  authorizeRoles("ADMIN", "CASHIER"),
  addPayment
);


// ==============================
// 📊 DASHBOARD
// ==============================
router.get(
  "/dashboard",
  authMiddleware,
  authorizeRoles("ADMIN", "CASHIER"),
  getBillingDashboard
);

module.exports = router;