const express = require("express");
const router = express.Router();

const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const {
  authMiddleware,
  authorizeRoles
} = require("../middleware/authMiddleware");


// ==========================
// PUBLIC DOCTOR ROUTES
// For frontend appointment module
// ==========================
router.get(
  "/public/all",
  async (req, res) => {
    try {
      const doctors = await prisma.doctor.findMany();
      res.json(doctors);
    } catch (error) {
      res.status(500).json({
        message: "Error fetching doctors",
        error: error.message
      });
    }
  }
);


// ==========================
// 👨‍⚕️ CREATE DOCTOR (ADMIN ONLY)
// ==========================
router.post(
  "/",
  authMiddleware,
  authorizeRoles("ADMIN"),
  async (req, res) => {
    try {
      const { fullName, specialty, phone, email } = req.body;

      const doctor = await prisma.doctor.create({
        data: {
          fullName,
          specialty,
          phone,
          email
        }
      });

      res.status(201).json({
        message: "Doctor created successfully",
        doctor
      });

    } catch (error) {
      res.status(500).json({
        message: "Error creating doctor",
        error: error.message
      });
    }
  }
);


// ==========================
// 📋 GET ALL DOCTORS (ADMIN ONLY)
// ==========================
router.get(
  "/",
  authMiddleware,
  authorizeRoles("ADMIN"),
  async (req, res) => {
    try {
      const doctors = await prisma.doctor.findMany();

      res.json(doctors);

    } catch (error) {
      res.status(500).json({
        message: "Error fetching doctors",
        error: error.message
      });
    }
  }
);


// ==========================
// 🔍 GET SINGLE DOCTOR
// ==========================
router.get(
  "/:id",
  authMiddleware,
  authorizeRoles("ADMIN", "DOCTOR"),
  async (req, res) => {
    try {
      const id = parseInt(req.params.id);

      const doctor = await prisma.doctor.findUnique({
        where: { id }
      });

      if (!doctor) {
        return res.status(404).json({
          message: "Doctor not found"
        });
      }

      res.json(doctor);

    } catch (error) {
      res.status(500).json({
        message: "Error fetching doctor",
        error: error.message
      });
    }
  }
);


// ==========================
// ✏️ UPDATE DOCTOR (ADMIN ONLY)
// ==========================
router.put(
  "/:id",
  authMiddleware,
  authorizeRoles("ADMIN"),
  async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { fullName, specialty, phone, email } = req.body;

      const updated = await prisma.doctor.update({
        where: { id },
        data: {
          fullName,
          specialty,
          phone,
          email
        }
      });

      res.json({
        message: "Doctor updated successfully",
        doctor: updated
      });

    } catch (error) {
      res.status(500).json({
        message: "Error updating doctor",
        error: error.message
      });
    }
  }
);


// ==========================
// ❌ DELETE DOCTOR (ADMIN ONLY)
// ==========================
router.delete(
  "/:id",
  authMiddleware,
  authorizeRoles("ADMIN"),
  async (req, res) => {
    try {
      const id = parseInt(req.params.id);

      await prisma.doctor.delete({
        where: { id }
      });

      res.json({
        message: "Doctor deleted successfully"
      });

    } catch (error) {
      res.status(500).json({
        message: "Error deleting doctor",
        error: error.message
      });
    }
  }
);

module.exports = router;