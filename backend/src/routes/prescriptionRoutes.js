const express = require("express");
const router = express.Router();

const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const {
  authMiddleware,
  authorizeRoles
} = require("../middleware/authMiddleware");


// =====================================
// 💊 CREATE PRESCRIPTION
// DOCTOR + ADMIN ONLY
// =====================================
router.post(
  "/",
  authMiddleware,
  authorizeRoles("DOCTOR", "ADMIN"),
  async (req, res) => {
    try {
      const {
        patientId,
        medication,
        dosage,
        instructions
      } = req.body;

      // Ensure patient exists and derive hospital tenant when needed
      const patient = await prisma.patient.findUnique({
        where: { id: parseInt(patientId) }
      });

      if (!patient) {
        return res.status(404).json({ message: 'Patient not found' });
      }

      const hospitalId = req.user.hospitalId || patient.hospitalId || null;

      const prescription = await prisma.prescription.create({
        data: {
          patientId: parseInt(patientId),
          doctorId: req.body.doctorId
            ? parseInt(req.body.doctorId)
            : req.user.doctorId || req.user.id,
          hospitalId,
          medication,
          dosage,
          instructions
        },
        include: {
          patient: true,
          doctor: true
        }
      });

      res.status(201).json({
        message: "Prescription created successfully",
        prescription
      });

    } catch (error) {
      res.status(500).json({
        message: "Error creating prescription",
        error: error.message
      });
    }
  }
);


// =====================================
// 📋 GET ALL PRESCRIPTIONS
// ADMIN + DOCTOR + PHARMACIST
// =====================================
router.get(
  "/",
  authMiddleware,
  authorizeRoles("ADMIN", "DOCTOR", "PHARMACIST"),
  async (req, res) => {
    try {
      const prescriptions = await prisma.prescription.findMany({
        where: {
          hospitalId: req.user.hospitalId
        },
        include: {
          patient: true,
          doctor: true
        },
        orderBy: {
          createdAt: "desc"
        }
      });

      res.json(prescriptions);

    } catch (error) {
      res.status(500).json({
        message: "Error fetching prescriptions",
        error: error.message
      });
    }
  }
);


// =====================================
// 🔍 GET SINGLE PRESCRIPTION
// =====================================
router.get(
  "/:id",
  authMiddleware,
  authorizeRoles("ADMIN", "DOCTOR", "PHARMACIST"),
  async (req, res) => {
    try {
      const id = parseInt(req.params.id);

      const prescription = await prisma.prescription.findFirst({
        where: {
          id,
          hospitalId: req.user.hospitalId
        },
        include: {
          patient: true,
          doctor: true
        }
      });

      if (!prescription) {
        return res.status(404).json({
          message: "Prescription not found"
        });
      }

      res.json(prescription);

    } catch (error) {
      res.status(500).json({
        message: "Error fetching prescription",
        error: error.message
      });
    }
  }
);


// =====================================
// ❌ DELETE PRESCRIPTION
// ADMIN ONLY
// =====================================
router.delete(
  "/:id",
  authMiddleware,
  authorizeRoles("ADMIN"),
  async (req, res) => {
    try {
      const id = parseInt(req.params.id);

      const deleted = await prisma.prescription.deleteMany({
        where: {
          id,
          hospitalId: req.user.hospitalId
        }
      });

      if (deleted.count === 0) {
        return res.status(404).json({
          message: "Prescription not found"
        });
      }

      res.json({
        message: "Prescription deleted successfully"
      });

    } catch (error) {
      res.status(500).json({
        message: "Error deleting prescription",
        error: error.message
      });
    }
  }
);

module.exports = router;