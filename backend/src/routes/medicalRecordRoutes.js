const express = require("express");
const router = express.Router();

const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const {
  authMiddleware,
  authorizeRoles
} = require("../middleware/authMiddleware");


// =====================================
// 🧑 CREATE MEDICAL RECORD
// DOCTOR + ADMIN ONLY
// =====================================
router.post(
  "/",
  authMiddleware,
  authorizeRoles("DOCTOR", "ADMIN"),
  async (req, res) => {
    try {
      const { patientId, diagnosis, treatment, notes } = req.body;

      const record = await prisma.medicalRecord.create({
        data: {
          patientId: parseInt(patientId),
          doctorId: req.user.doctorId || req.user.id, // IMPORTANT: doctor is logged in user
          hospitalId: req.user.hospitalId,
          diagnosis,
          treatment,
          notes
        },
        include: {
          patient: true,
          doctor: true
        }
      });

      res.status(201).json({
        message: "Medical record created successfully",
        record
      });

    } catch (error) {
      res.status(500).json({
        message: "Error creating medical record",
        error: error.message
      });
    }
  }
);


// =====================================
// 📋 GET ALL MEDICAL RECORDS
// ADMIN + DOCTOR + NURSE
// =====================================
router.get(
  "/",
  authMiddleware,
  authorizeRoles("ADMIN", "DOCTOR", "NURSE"),
  async (req, res) => {
    try {
      const records = await prisma.medicalRecord.findMany({
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

      res.json(records);

    } catch (error) {
      res.status(500).json({
        message: "Error fetching medical records",
        error: error.message
      });
    }
  }
);


// =====================================
// 🔍 GET SINGLE MEDICAL RECORD
// =====================================
router.get(
  "/:id",
  authMiddleware,
  authorizeRoles("ADMIN", "DOCTOR", "NURSE"),
  async (req, res) => {
    try {
      const id = parseInt(req.params.id);

      const record = await prisma.medicalRecord.findFirst({
        where: {
          id,
          hospitalId: req.user.hospitalId
        },
        include: {
          patient: true,
          doctor: true
        }
      });

      if (!record) {
        return res.status(404).json({
          message: "Medical record not found"
        });
      }

      res.json(record);

    } catch (error) {
      res.status(500).json({
        message: "Error fetching medical record",
        error: error.message
      });
    }
  }
);


// =====================================
// ❌ DELETE MEDICAL RECORD
// ADMIN ONLY
// =====================================
router.delete(
  "/:id",
  authMiddleware,
  authorizeRoles("ADMIN"),
  async (req, res) => {
    try {
      const id = parseInt(req.params.id);

      const deleted = await prisma.medicalRecord.deleteMany({
        where: {
          id,
          hospitalId: req.user.hospitalId
        }
      });

      if (deleted.count === 0) {
        return res.status(404).json({
          message: "Medical record not found"
        });
      }

      res.json({
        message: "Medical record deleted successfully"
      });

    } catch (error) {
      res.status(500).json({
        message: "Error deleting medical record",
        error: error.message
      });
    }
  }
);

module.exports = router;