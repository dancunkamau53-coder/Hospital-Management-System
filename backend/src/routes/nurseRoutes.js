const express = require("express");
const router = express.Router();

const {
  authMiddleware,
  authorizeRoles
} = require("../middleware/authMiddleware");

const {
  recordVitals,
  addObservation,
  getPatientVitals
} = require("../controllers/nurseController");


// ==============================
// 💉 VITALS
// ==============================
router.post(
  "/vitals",
  authMiddleware,
  authorizeRoles("NURSE"),
  recordVitals
);

router.get(
  "/vitals/:patientId",
  authMiddleware,
  authorizeRoles("NURSE", "DOCTOR"),
  getPatientVitals
);


// ==============================
// 📝 OBSERVATIONS
// ==============================
router.post(
  "/observation",
  authMiddleware,
  authorizeRoles("NURSE"),
  addObservation
);

module.exports = router;