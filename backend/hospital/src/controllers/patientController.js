const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();


// ==============================
// CREATE PATIENT
// ==============================
const createPatient = async (req, res) => {
  try {
    const { fullName, age, gender, phone, address } = req.body;

    const patient = await prisma.patient.create({
      data: {
        fullName,
        age: parseInt(age),
        gender,
        phone,
        address,
        hospitalId: req.user.hospitalId
      }
    });

    res.status(201).json(patient);

  } catch (error) {
    res.status(500).json({
      message: "Error creating patient",
      error: error.message
    });
  }
};


// ==============================
// GET ALL PATIENTS
// ==============================
const getPatients = async (req, res) => {
  try {
    const patients = await prisma.patient.findMany({
      where: {
        hospitalId: req.user.hospitalId
      }
    });
    res.json(patients);
  } catch (error) {
    res.status(500).json({
      message: "Error fetching patients",
      error: error.message
    });
  }
};


// ==============================
// GET ONE PATIENT
// ==============================
const getPatientById = async (req, res) => {
  try {
    const id = parseInt(req.params.id);

    const patient = await prisma.patient.findFirst({
      where: {
        id,
        hospitalId: req.user.hospitalId
      }
    });

    if (!patient) {
      return res.status(404).json({ message: "Patient not found" });
    }

    res.json(patient);

  } catch (error) {
    res.status(500).json({
      message: "Error fetching patient",
      error: error.message
    });
  }
};


// ==============================
// UPDATE PATIENT
// ==============================
const updatePatient = async (req, res) => {
  try {
    const id = parseInt(req.params.id);

    const { fullName, age, gender, phone, address } = req.body;

    const updated = await prisma.patient.updateMany({
      where: {
        id,
        hospitalId: req.user.hospitalId
      },
      data: {
        fullName,
        age: parseInt(age),
        gender,
        phone,
        address
      }
    });

    if (updated.count === 0) {
      return res.status(404).json({ message: "Patient not found" });
    }

    const patient = await prisma.patient.findUnique({
      where: { id }
    });

    res.json(patient);

  } catch (error) {
    res.status(500).json({
      message: "Error updating patient",
      error: error.message
    });
  }
};


// ==============================
// DELETE PATIENT
// ==============================
const deletePatient = async (req, res) => {
  try {
    const id = parseInt(req.params.id);

    const deleted = await prisma.patient.deleteMany({
      where: {
        id,
        hospitalId: req.user.hospitalId
      }
    });

    if (deleted.count === 0) {
      return res.status(404).json({ message: "Patient not found" });
    }

    res.json({ message: "Patient deleted successfully" });

  } catch (error) {
    res.status(500).json({
      message: "Error deleting patient",
      error: error.message
    });
  }
};


// ==============================
// PUBLIC FUNCTIONS (for testing)
// ==============================

// ==============================
// PUBLIC: GET ALL PATIENTS (no auth required)
// ==============================
const getPatientsPublic = async (req, res) => {
  try {
    const patients = await prisma.patient.findMany({
      orderBy: {
        createdAt: "desc"
      }
    });
    res.json(patients);
  } catch (error) {
    res.status(500).json({
      message: "Error fetching patients",
      error: error.message
    });
  }
};


// ==============================
// PUBLIC: CREATE PATIENT (no auth required)
// ==============================
const createPatientPublic = async (req, res) => {
  try {
    const { fullName, age, gender, phone, address } = req.body;

    const patient = await prisma.patient.create({
      data: {
        fullName,
        age: parseInt(age),
        gender,
        phone: phone || "",
        address: address || ""
      }
    });

    res.status(201).json(patient);

  } catch (error) {
    res.status(500).json({
      message: "Error creating patient",
      error: error.message
    });
  }
};


module.exports = {
  createPatient,
  getPatients,
  getPatientById,
  updatePatient,
  deletePatient,
  getPatientsPublic,
  createPatientPublic
};