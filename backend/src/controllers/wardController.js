const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();


// ==============================
// 🏥 CREATE WARD
// ==============================
const createWard = async (req, res) => {
  try {
    const { name, capacity } = req.body;

    const ward = await prisma.ward.create({
      data: {
        name,
        capacity: parseInt(capacity),
        hospitalId: req.user.hospitalId
      }
    });

    res.status(201).json({
      message: "Ward created",
      ward
    });
  } catch (error) {
    res.status(500).json({
      message: "Error creating ward",
      error: error.message
    });
  }
};


// ==============================
// 🛏 ADD BED
// ==============================
const addBed = async (req, res) => {
  try {
    const { wardId } = req.body;

    const ward = await prisma.ward.findFirst({
      where: {
        id: parseInt(wardId),
        hospitalId: req.user.hospitalId
      }
    });

    if (!ward) {
      return res.status(404).json({
        message: "Ward not found or does not belong to your hospital"
      });
    }

    const bed = await prisma.bed.create({
      data: {
        wardId: parseInt(wardId),
        hospitalId: req.user.hospitalId,
        status: "AVAILABLE"
      }
    });

    res.status(201).json({
      message: "Bed added",
      bed
    });
  } catch (error) {
    res.status(500).json({
      message: "Error adding bed",
      error: error.message
    });
  }
};


// ==============================
// 📋 GET WARDS
// ==============================
const getWards = async (req, res) => {
  try {
    const wards = await prisma.ward.findMany({
      where: {
        hospitalId: req.user.hospitalId
      },
      include: {
        beds: true
      }
    });

    res.json(wards);
  } catch (error) {
    res.status(500).json({
      message: "Error fetching wards",
      error: error.message
    });
  }
};


// ==============================
// 📋 GET BEDS
// ==============================
const getBeds = async (req, res) => {
  try {
    const beds = await prisma.bed.findMany({
      where: {
        hospitalId: req.user.hospitalId
      },
      include: {
        ward: true
      }
    });

    res.json(beds);
  } catch (error) {
    res.status(500).json({
      message: "Error fetching beds",
      error: error.message
    });
  }
};


// ==============================
// 🏥 ADMIT PATIENT
// ==============================
const admitPatient = async (req, res) => {
  try {
    const { patientId, bedId } = req.body;

    const bed = await prisma.bed.findFirst({
      where: {
        id: parseInt(bedId),
        hospitalId: req.user.hospitalId
      }
    });

    if (!bed || bed.status !== "AVAILABLE") {
      return res.status(400).json({
        message: "Bed not available"
      });
    }

    const admission = await prisma.admission.create({
      data: {
        patientId: parseInt(patientId),
        bedId: parseInt(bedId),
        hospitalId: req.user.hospitalId
      }
    });

    await prisma.bed.update({
      where: { id: parseInt(bedId) },
      data: {
        status: "OCCUPIED",
        patientId: parseInt(patientId)
      }
    });

    res.status(201).json({
      message: "Patient admitted",
      admission
    });
  } catch (error) {
    res.status(500).json({
      message: "Error admitting patient",
      error: error.message
    });
  }
};


// ==============================
// 📋 GET ADMISSIONS
// ==============================
const getAdmissions = async (req, res) => {
  try {
    const admissions = await prisma.admission.findMany({
      where: {
        hospitalId: req.user.hospitalId
      },
      include: {
        patient: true,
        bed: true
      },
      orderBy: {
        admittedAt: "desc"
      }
    });

    res.json(admissions);
  } catch (error) {
    res.status(500).json({
      message: "Error fetching admissions",
      error: error.message
    });
  }
};


// ==============================
// 🚪 DISCHARGE PATIENT
// ==============================
const dischargePatient = async (req, res) => {
  try {
    const { admissionId } = req.body;

    const admission = await prisma.admission.updateMany({
      where: {
        id: parseInt(admissionId),
        hospitalId: req.user.hospitalId
      },
      data: {
        status: "DISCHARGED",
        dischargedAt: new Date()
      }
    });

    if (admission.count === 0) {
      return res.status(404).json({
        message: "Admission not found"
      });
    }

    const updatedAdmission = await prisma.admission.findUnique({
      where: { id: parseInt(admissionId) }
    });

    await prisma.bed.update({
      where: { id: updatedAdmission.bedId },
      data: {
        status: "AVAILABLE",
        patientId: null
      }
    });

    res.json({
      message: "Patient discharged",
      admission: updatedAdmission
    });
  } catch (error) {
    res.status(500).json({
      message: "Error discharging patient",
      error: error.message
    });
  }
};


// ==============================
// EXPORTS
// ==============================
module.exports = {
  createWard,
  addBed,
  getWards,
  getBeds,
  getAdmissions,
  admitPatient,
  dischargePatient
};