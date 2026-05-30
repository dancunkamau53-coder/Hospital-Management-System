const express = require("express");
const router = express.Router();

const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const {
  authMiddleware,
  authorizeRoles
} = require("../middleware/authMiddleware");


// ==========================
// 👨‍⚕️ DOCTOR PROFILE
// ==========================
router.get(
  "/me",
  authMiddleware,
  authorizeRoles("DOCTOR"),
  async (req, res) => {
    try {
      const doctor = await prisma.user.findUnique({
        where: { id: req.user.id },
        select: {
          id: true,
          fullName: true,
          email: true,
          role: true,
          createdAt: true
        }
      });

      res.json(doctor);
    } catch (error) {
      res.status(500).json({
        message: "Error fetching doctor profile",
        error: error.message
      });
    }
  }
);


// ==========================
// 📅 DOCTOR APPOINTMENTS
// ==========================
router.get(
  "/appointments",
  authMiddleware,
  authorizeRoles("DOCTOR"),
  async (req, res) => {
    try {
      const doctorId = req.user.doctorId || req.user.id;

      const appointments = await prisma.appointment.findMany({
        where: {
          doctorId,
          hospitalId: req.user.hospitalId
        },
        include: {
          patient: true
        }
      });

      res.json(appointments);
    } catch (error) {
      res.status(500).json({
        message: "Error fetching appointments",
        error: error.message
      });
    }
  }
);


// ==========================
// 🧑‍⚕️ DOCTOR PATIENTS
// ==========================
router.get(
  "/patients",
  authMiddleware,
  authorizeRoles("DOCTOR"),
  async (req, res) => {
    try {
      const doctorId = req.user.doctorId || req.user.id;

      const patients = await prisma.appointment.findMany({
        where: {
          doctorId,
          hospitalId: req.user.hospitalId
        },
        include: {
          patient: true
        }
      });

      res.json(patients);
    } catch (error) {
      res.status(500).json({
        message: "Error fetching patients",
        error: error.message
      });
    }
  }
);

module.exports = router;