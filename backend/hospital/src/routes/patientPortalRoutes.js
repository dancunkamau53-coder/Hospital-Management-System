const express = require("express");
const router = express.Router();

const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const { authMiddleware } = require("../middleware/authMiddleware");


// 🧑 GET MY PROFILE (PATIENT ONLY)
router.get("/me", authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== "PATIENT") {
      return res.status(403).json({ message: "Patients only" });
    }

    const patient = await prisma.patient.findFirst({
      where: {
        id: req.user.patientId || req.user.id,
        hospitalId: req.user.hospitalId
      },
      select: {
        id: true,
        fullName: true,
        email: true,
        role: true,
        createdAt: true
      }
    });

    res.json(user);

  } catch (error) {
    res.status(500).json({
      message: "Error fetching profile",
      error: error.message
    });
  }
});


// 📋 GET MY MEDICAL RECORDS
router.get("/records", authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== "PATIENT") {
      return res.status(403).json({ message: "Patients only" });
    }

    const patientId = req.user.patientId || req.user.id;

    const patient = await prisma.patient.findFirst({
      where: { id: patientId },
      include: {
        medicalRecords: {
          include: {
            doctor: true
          }
        }
      }
    });

    res.json(patient?.medicalRecords || []);

  } catch (error) {
    res.status(500).json({
      message: "Error fetching records",
      error: error.message
    });
  }
});


// 📅 GET MY APPOINTMENTS
router.get("/appointments", authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== "PATIENT") {
      return res.status(403).json({ message: "Patients only" });
    }

    const patientId = req.user.patientId || req.user.id;

    const appointments = await prisma.appointment.findMany({
      where: {
        patientId,
        hospitalId: req.user.hospitalId
      },
      include: {
        doctor: true
      }
    });

    res.json(appointments);

  } catch (error) {
    res.status(500).json({
      message: "Error fetching appointments",
      error: error.message
    });
  }
});

module.exports = router;