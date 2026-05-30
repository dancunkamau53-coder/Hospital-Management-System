const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();


// ==============================
// 🧾 CREATE MEDICAL RECORD
// ==============================
const createMedicalRecord = async (req, res) => {
  try {
    const { patientId, diagnosis, treatment, notes } = req.body;

    const record = await prisma.medicalRecord.create({
      data: {
        patientId: parseInt(patientId),
        doctorId: req.user.doctorId || req.user.id,
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
};


// ==============================
// 📋 GET ALL RECORDS (ADMIN)
// ==============================
const getAllMedicalRecords = async (req, res) => {
  try {

    const records = await prisma.medicalRecord.findMany({
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
};


// ==============================
// 👤 GET PATIENT RECORDS
// ==============================
const getPatientRecords = async (req, res) => {
  try {

    const patientId = parseInt(req.params.patientId);

    const records = await prisma.medicalRecord.findMany({
      where: { patientId },
      include: {
        doctor: true
      },
      orderBy: {
        createdAt: "desc"
      }
    });

    res.json(records);

  } catch (error) {
    res.status(500).json({
      message: "Error fetching patient records",
      error: error.message
    });
  }
};


// ==============================
// 📌 EXPORTS
// ==============================
module.exports = {
  createMedicalRecord,
  getAllMedicalRecords,
  getPatientRecords
};