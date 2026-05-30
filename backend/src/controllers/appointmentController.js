const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const createAppointment = async (req, res) => {
  try {
    const {
      date,
      reason,
      patientId: rawPatientId,
      doctorId: rawDoctorId
    } = req.body;

    const patientId = parseInt(rawPatientId);
    const doctorId = req.user.role === "DOCTOR"
      ? req.user.doctorId || parseInt(rawDoctorId)
      : parseInt(rawDoctorId);

    const appointment = await prisma.appointment.create({
      data: {
        date: new Date(date),
        reason,
        status: "PENDING",
        patientId,
        doctorId,
        hospitalId: req.user.hospitalId
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
};

const getAppointments = async (req, res) => {
  try {
    const appointments = await prisma.appointment.findMany({
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

    res.json(appointments);
  } catch (error) {
    res.status(500).json({
      message: "Error fetching appointments",
      error: error.message
    });
  }
};

const getAppointmentById = async (req, res) => {
  try {
    const id = parseInt(req.params.id);

    const appointment = await prisma.appointment.findFirst({
      where: {
        id,
        hospitalId: req.user.hospitalId
      },
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
};

const updateAppointmentStatus = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { status } = req.body;

    const allowed = ["PENDING", "CONFIRMED", "CANCELLED"];

    if (!allowed.includes(status)) {
      return res.status(400).json({
        message: "Invalid status"
      });
    }

    const appointment = await prisma.appointment.updateMany({
      where: {
        id,
        hospitalId: req.user.hospitalId
      },
      data: { status }
    });

    if (appointment.count === 0) {
      return res.status(404).json({
        message: "Appointment not found"
      });
    }

    const updatedAppointment = await prisma.appointment.findUnique({
      where: { id },
      include: {
        patient: true,
        doctor: true
      }
    });

    res.json({
      message: "Appointment status updated",
      appointment: updatedAppointment
    });
  } catch (error) {
    res.status(500).json({
      message: "Error updating appointment",
      error: error.message
    });
  }
};

const deleteAppointment = async (req, res) => {
  try {
    const id = parseInt(req.params.id);

    const deleted = await prisma.appointment.deleteMany({
      where: {
        id,
        hospitalId: req.user.hospitalId
      }
    });

    if (deleted.count === 0) {
      return res.status(404).json({
        message: "Appointment not found"
      });
    }

    res.json({
      message: "Appointment deleted successfully"
    });
  } catch (error) {
    res.status(500).json({
      message: "Error deleting appointment",
      error: error.message
    });
  }
};

module.exports = {
  createAppointment,
  getAppointments,
  getAppointmentById,
  updateAppointmentStatus,
  deleteAppointment
};