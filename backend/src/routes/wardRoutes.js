const express = require("express");
const router = express.Router();

const {
  authMiddleware,
  authorizeRoles
} = require("../middleware/authMiddleware");

const {
  createWard,
  addBed,
  getWards,
  getBeds,
  getAdmissions,
  admitPatient,
  dischargePatient
} = require("../controllers/wardController");


// ==============================
// 🏥 CREATE WARD
// ==============================
router.post(
  "/ward",
  authMiddleware,
  authorizeRoles("ADMIN"),
  createWard
);


// ==============================
// 📋 GET WARDS
// ==============================
router.get(
  "/",
  authMiddleware,
  authorizeRoles("ADMIN", "NURSE", "DOCTOR"),
  getWards
);


// ==============================
// 🛏 ADD BED
// ==============================
router.post(
  "/bed",
  authMiddleware,
  authorizeRoles("ADMIN"),
  addBed
);


// ==============================
// 📋 GET BEDS
// ==============================
router.get(
  "/beds",
  authMiddleware,
  authorizeRoles("ADMIN", "NURSE", "DOCTOR"),
  getBeds
);


// ==============================
// 🏥 ADMIT PATIENT
// ==============================
router.post(
  "/admit",
  authMiddleware,
  authorizeRoles("NURSE", "DOCTOR"),
  admitPatient
);


// ==============================
// 📋 GET ADMISSIONS
// ==============================
router.get(
  "/admissions",
  authMiddleware,
  authorizeRoles("ADMIN", "NURSE", "DOCTOR"),
  getAdmissions
);


// ==============================
// 🚪 DISCHARGE PATIENT
// ==============================
router.put(
  "/discharge",
  authMiddleware,
  authorizeRoles("NURSE", "DOCTOR"),
  dischargePatient
);

module.exports = router;