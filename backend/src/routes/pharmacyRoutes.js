const express = require("express");
const router = express.Router();

const {
  authMiddleware,
  authorizeRoles
} = require("../middleware/authMiddleware");

const {
  addMedication,
  getMedications,
  getMedicationById,
  updateMedication,
  restockMedication,
  getLowStockMedications,
  getExpiredMedications,
  dispenseMedication,
  getDispensations,
  getPharmacyDashboard
} = require("../controllers/pharmacyController");


// ==============================
// 💊 MEDICATIONS
// ==============================
router.post(
  "/medications",
  authMiddleware,
  authorizeRoles("ADMIN", "PHARMACIST"),
  addMedication
);

router.get(
  "/medications",
  authMiddleware,
  authorizeRoles("ADMIN", "PHARMACIST", "DOCTOR"),
  getMedications
);

router.get(
  "/medications/:id",
  authMiddleware,
  authorizeRoles("ADMIN", "PHARMACIST", "DOCTOR"),
  getMedicationById
);

router.patch(
  "/medications/:id",
  authMiddleware,
  authorizeRoles("ADMIN", "PHARMACIST"),
  updateMedication
);

router.post(
  "/medications/:id/restock",
  authMiddleware,
  authorizeRoles("ADMIN", "PHARMACIST"),
  restockMedication
);

router.get(
  "/low-stock",
  authMiddleware,
  authorizeRoles("ADMIN", "PHARMACIST", "DOCTOR"),
  getLowStockMedications
);

router.get(
  "/expired",
  authMiddleware,
  authorizeRoles("ADMIN", "PHARMACIST", "DOCTOR"),
  getExpiredMedications
);

router.get(
  "/dispensations",
  authMiddleware,
  authorizeRoles("ADMIN", "PHARMACIST"),
  getDispensations
);


// ==============================
// 💊 DISPENSE
// ==============================
router.post(
  "/dispense",
  authMiddleware,
  authorizeRoles("ADMIN", "PHARMACIST"),
  dispenseMedication
);


// ==============================
// 📊 DASHBOARD
// ==============================
router.get(
  "/dashboard",
  authMiddleware,
  authorizeRoles("ADMIN", "PHARMACIST"),
  getPharmacyDashboard
);

module.exports = router;