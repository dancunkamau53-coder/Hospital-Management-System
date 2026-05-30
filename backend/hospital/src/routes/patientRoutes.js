const express = require("express");
const router = express.Router();

const {
  authMiddleware,
  authorizeRoles
} = require("../middleware/authMiddleware");

const {
  createPatient,
  getPatients,
  getPatientById,
  updatePatient,
  deletePatient,
  getPatientsPublic,
  createPatientPublic
} = require("../controllers/patientController");


// ==============================
// PUBLIC ROUTES (for frontend testing)
// ==============================
router.get("/public/all", getPatientsPublic);

router.post("/public/create", createPatientPublic);


// ==============================
// AUTHENTICATED ROUTES
// ==============================
router.post(
  "/",
  authMiddleware,
  authorizeRoles("ADMIN", "RECEPTIONIST"),
  createPatient
);

router.get(
  "/",
  authMiddleware,
  authorizeRoles("ADMIN", "DOCTOR", "NURSE"),
  getPatients
);

router.get(
  "/:id",
  authMiddleware,
  authorizeRoles("ADMIN", "DOCTOR"),
  getPatientById
);

router.put(
  "/:id",
  authMiddleware,
  authorizeRoles("ADMIN"),
  updatePatient
);

router.delete(
  "/:id",
  authMiddleware,
  authorizeRoles("ADMIN"),
  deletePatient
);

module.exports = router;