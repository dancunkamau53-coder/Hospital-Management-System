const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();


// ==============================
// 💉 RECORD VITALS
// ==============================
const recordVitals = async (req, res) => {
  try {
    const {
      patientId,
      temperature,
      bloodPressure,
      pulse,
      respiratoryRate,
      notes
    } = req.body;

    const vital = await prisma.vital.create({
      data: {
        patientId: parseInt(patientId),
        nurseId: req.user.id,
        hospitalId: req.user.hospitalId,

        temperature: temperature ? parseFloat(temperature) : null,
        bloodPressure,
        pulse: pulse ? parseInt(pulse) : null,
        respiratoryRate: respiratoryRate ? parseInt(respiratoryRate) : null,
        notes
      }
    });

    res.status(201).json({
      message: "Vitals recorded successfully",
      vital
    });

  } catch (error) {
    res.status(500).json({
      message: "Error recording vitals",
      error: error.message
    });
  }
};


// ==============================
// 📝 ADD OBSERVATION
// ==============================
const addObservation = async (req, res) => {
  try {
    const { patientId, observation, actionTaken } = req.body;

    const record = await prisma.nurseObservation.create({
      data: {
        patientId: parseInt(patientId),
        nurseId: req.user.id,
        hospitalId: req.user.hospitalId,
        observation,
        actionTaken
      }
    });

    res.status(201).json({
      message: "Observation saved",
      record
    });

  } catch (error) {
    res.status(500).json({
      message: "Error saving observation",
      error: error.message
    });
  }
};


// ==============================
// 📊 GET PATIENT VITALS
// ==============================
const getPatientVitals = async (req, res) => {
  try {
    const { patientId } = req.params;

    const vitals = await prisma.vital.findMany({
      where: {
        patientId: parseInt(patientId),
        hospitalId: req.user.hospitalId
      },
      orderBy: {
        recordedAt: "desc"
      }
    });

    res.json(vitals);

  } catch (error) {
    res.status(500).json({
      message: "Error fetching vitals",
      error: error.message
    });
  }
};


// ==============================
// EXPORTS
// ==============================
module.exports = {
  recordVitals,
  addObservation,
  getPatientVitals
};