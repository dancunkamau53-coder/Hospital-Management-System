const express = require("express");
const router = express.Router();

const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const {
  authMiddleware,
  authorizeRoles
} = require("../middleware/authMiddleware");


// =====================================
// PUBLIC APPOINTMENT ROUTES
// For frontend testing and rapid prototyping
// =====================================
router.get(
  "/public/all",
  async (req, res) => {
    try {
      const appointments = await prisma.appointment.findMany({
        include: {
          patient: true,
          doctor: true
        },
        orderBy: {
          createdAt: "desc"
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

router.post(
  "/public/create",
  async (req, res) => {
    try {
      const {
        date,
        reason,
        patientId: rawPatientId,
        doctorId: rawDoctorId
      } = req.body;

      let patientId = rawPatientId ? parseInt(rawPatientId) : null;
      let doctorId = rawDoctorId ? parseInt(rawDoctorId) : null;

      if (!patientId) {
        const firstPatient = await prisma.patient.findFirst({
          orderBy: {
            createdAt: "desc"
          }
        });

        if (!firstPatient) {
          return res.status(400).json({
            message: "Create a patient first before adding an appointment."
          });
        }

        patientId = firstPatient.id;
      }

      if (!doctorId) {
        let doctor = await prisma.doctor.findFirst();

        if (!doctor) {
          doctor = await prisma.doctor.create({
            data: {
              fullName: "Default Doctor",
              specialty: "General",
              phone: "0000000000",
              email: "doctor@hospital.test"
            }
          });
        }

        doctorId = doctor.id;
      }

      const appointment = await prisma.appointment.create({
        data: {
          date: new Date(date),
          reason,
          status: "PENDING",
          patientId,
          doctorId
        },
        include: {
          patient: true,
          doctor: true
        }
      });

      res.status(201).json({
        message: "Appointment created successfully",
        appointment
      });
    } catch (error) {
      res.status(500).json({
        message: "Error creating appointment",
        error: error.message
      });
    }
  }
);


// =====================================
// 📅 CREATE APPOINTMENT
// Receptionist, Admin, Doctor
// =====================================
router.post(
  "/",
  authMiddleware,
  authorizeRoles("ADMIN", "RECEPTIONIST", "DOCTOR"),
  async (req, res) => {
    try {
      const { date, reason, patientId, doctorId } = req.body;

      const appointment = await prisma.appointment.create({
        data: {
          date: new Date(date),
          reason,
          status: "PENDING",
          patientId: parseInt(patientId),
          doctorId: parseInt(doctorId)
        },
        include: {
          patient: true,
          doctor: true
        }
      });

      res.status(201).json({
        message: "Appointment created successfully",
        appointment
      });

    } catch (error) {
      res.status(500).json({
        message: "Error creating appointment",
        error: error.message
      });
    }
  }
);


// =====================================
// 📋 GET ALL APPOINTMENTS
// Admin + Doctor + Receptionist
// =====================================
router.get(
  "/",
  authMiddleware,
  authorizeRoles("ADMIN", "DOCTOR", "RECEPTIONIST"),
  async (req, res) => {
    try {
      const appointments = await prisma.appointment.findMany({
        include: {
          patient: true,
          doctor: true
        },
        orderBy: {
          createdAt: "desc"
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


// =====================================
// 🔍 GET SINGLE APPOINTMENT
// =====================================
router.get(
  "/:id",
  authMiddleware,
  authorizeRoles("ADMIN", "DOCTOR", "RECEPTIONIST"),
  async (req, res) => {
    try {
      const id = parseInt(req.params.id);

      const appointment = await prisma.appointment.findUnique({
        where: { id },
        include: {
          patient: true,
          doctor: true
        }
      });

      if (!appointment) {
        return res.status(404).json({
          message: "Appointment not found"
        });
      }

      res.json(appointment);

    } catch (error) {
      res.status(500).json({
        message: "Error fetching appointment",
        error: error.message
      });
    }
  }
);


// =====================================
// 🔄 UPDATE STATUS (VERY IMPORTANT)
// Doctor or Admin
// =====================================
router.patch(
  "/:id/status",
  authMiddleware,
  authorizeRoles("ADMIN", "DOCTOR"),
  async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { status } = req.body;

      const allowed = ["PENDING", "CONFIRMED", "CANCELLED"];

      if (!allowed.includes(status)) {
        return res.status(400).json({
          message: "Invalid status"
        });
      }

      const appointment = await prisma.appointment.update({
        where: { id },
        data: { status },
        include: {
          patient: true,
          doctor: true
        }
      });

      res.json({
        message: "Appointment status updated",
        appointment
      });

    } catch (error) {
      res.status(500).json({
        message: "Error updating appointment",
        error: error.message
      });
    }
  }
);


// =====================================
// ❌ DELETE APPOINTMENT
// Admin only
// =====================================
router.delete(
  "/:id",
  authMiddleware,
  authorizeRoles("ADMIN"),
  async (req, res) => {
    try {
      const id = parseInt(req.params.id);

      await prisma.appointment.delete({
        where: { id }
      });

      res.json({
        message: "Appointment deleted successfully"
      });

    } catch (error) {
      res.status(500).json({
        message: "Error deleting appointment",
        error: error.message
      });
    }
  }
);


module.exports = router;