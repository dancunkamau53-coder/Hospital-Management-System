const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();


// ===============================
// 💊 CREATE PRESCRIPTION
// ===============================
const createPrescription = async (req, res) => {
  try {
    const { patientId, medication, dosage, instructions } = req.body;

    if (!patientId || !medication || !dosage) {
      return res.status(400).json({
        message: "patientId, medication, and dosage are required"
      });
    }

    const prescription = await prisma.prescription.create({
      data: {
        patientId: parseInt(patientId),
        doctorId: req.user.id,
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
};


// ===============================
// 📋 GET ALL PRESCRIPTIONS (ADMIN)
// ===============================
const getAllPrescriptions = async (req, res) => {
  try {

    const prescriptions = await prisma.prescription.findMany({
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
};


// ===============================
// 👤 GET PATIENT PRESCRIPTIONS
// ===============================
const getPatientPrescriptions = async (req, res) => {
  try {

    const patientId = parseInt(req.params.patientId);

    const prescriptions = await prisma.prescription.findMany({
      where: { patientId },
      include: {
        doctor: true
      },
      orderBy: {
        createdAt: "desc"
      }
    });

    res.json(prescriptions);

  } catch (error) {
    res.status(500).json({
      message: "Error fetching patient prescriptions",
      error: error.message
    });
  }
};


// ===============================
// 📌 EXPORTS
// ===============================
module.exports = {
  createPrescription,
  getAllPrescriptions,
  getPatientPrescriptions
};