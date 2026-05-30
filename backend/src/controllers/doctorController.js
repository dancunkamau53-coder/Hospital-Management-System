const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const createDoctor = async (req, res) => {
  try {
    const { fullName, specialty, phone, email } = req.body;

    const doctor = await prisma.doctor.create({
      data: {
        fullName,
        specialty,
        phone,
        email,
        hospitalId: req.user.hospitalId
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
};

const getDoctors = async (req, res) => {
  try {
    const doctors = await prisma.doctor.findMany({
      where: {
        hospitalId: req.user.hospitalId
      }
    });

    res.json(doctors);
  } catch (error) {
    res.status(500).json({
      message: "Error fetching doctors",
      error: error.message
    });
  }
};

const getDoctorById = async (req, res) => {
  try {
    const id = parseInt(req.params.id);

    const doctor = await prisma.doctor.findFirst({
      where: {
        id,
        hospitalId: req.user.hospitalId
      }
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
};

const updateDoctor = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { fullName, specialty, phone, email } = req.body;

    const updated = await prisma.doctor.updateMany({
      where: {
        id,
        hospitalId: req.user.hospitalId
      },
      data: {
        fullName,
        specialty,
        phone,
        email
      }
    });

    if (updated.count === 0) {
      return res.status(404).json({
        message: "Doctor not found"
      });
    }

    const doctor = await prisma.doctor.findUnique({
      where: { id }
    });

    res.json({
      message: "Doctor updated successfully",
      doctor
    });
  } catch (error) {
    res.status(500).json({
      message: "Error updating doctor",
      error: error.message
    });
  }
};

const deleteDoctor = async (req, res) => {
  try {
    const id = parseInt(req.params.id);

    const deleted = await prisma.doctor.deleteMany({
      where: {
        id,
        hospitalId: req.user.hospitalId
      }
    });

    if (deleted.count === 0) {
      return res.status(404).json({
        message: "Doctor not found"
      });
    }

    res.json({
      message: "Doctor deleted successfully"
    });
  } catch (error) {
    res.status(500).json({
      message: "Error deleting doctor",
      error: error.message
    });
  }
};

module.exports = {
  createDoctor,
  getDoctors,
  getDoctorById,
  updateDoctor,
  deleteDoctor
};