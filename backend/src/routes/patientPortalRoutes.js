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

    res.json(patient);

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


// 📤 EXPORT MY MEDICAL SUMMARY (JSON)
router.get('/export-summary', authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== 'PATIENT') {
      return res.status(403).json({ message: 'Patients only' });
    }

    const patientId = req.user.patientId || req.user.id;

    const patient = await prisma.patient.findUnique({
      where: { id: patientId },
      select: { id: true, fullName: true, email: true, createdAt: true }
    });

    const records = await prisma.medicalRecord.findMany({ where: { patientId } });
    const prescriptions = await prisma.prescription.findMany({ where: { patientId } });
    const appointments = await prisma.appointment.findMany({ where: { patientId } });

    return res.json({ patient, records, prescriptions, appointments });
  } catch (error) {
    res.status(500).json({ message: 'Error exporting summary', error: error.message });
  }
});


  // 🩺 REQUEST A SPECIALIST REFERRAL
  router.post('/request-referral', authMiddleware, async (req, res) => {
    try {
      if (req.user.role !== 'PATIENT') {
        return res.status(403).json({ message: 'Patients only' });
      }

      const patientId = req.user.patientId || req.user.id;
      const { specialty, reason } = req.body || {};

      const log = await prisma.auditLog.create({
        data: {
          hospitalId: req.user.hospitalId,
          userId: req.user.id,
          actionType: 'REFERRAL_REQUEST',
          entity: 'REFERRAL',
          entityId: patientId,
          details: JSON.stringify({ specialty: specialty || 'GENERAL', reason: reason || 'Requested via patient portal' })
        }
      });

      return res.json({ message: 'Referral request submitted', referral: log });
    } catch (error) {
      res.status(500).json({ message: 'Error creating referral request', error: error.message });
    }
  });

module.exports = router;