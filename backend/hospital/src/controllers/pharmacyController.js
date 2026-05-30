const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

const { logAction } = require("../service/auditService");
const { sendEmail } = require("../service/notificationService");

const notifyHospital = async (hospitalId, subject, text) => {
  try {
    const hospital = await prisma.hospital.findUnique({
      where: { id: hospitalId }
    });

    if (!hospital || !hospital.email) {
      return;
    }

    await sendEmail(hospital.email, subject, text);
  } catch (error) {
    console.log("Notification error:", error.message);
  }
};


// =====================================
// 💊 ADD MEDICATION
// =====================================
const addMedication = async (req, res) => {
  try {

    const {
      name,
      category,
      description,
      stock,
      unitPrice,
      batchNumber,
      supplier,
      expiryDate,
      reorderLevel
    } = req.body;

    // 🏥 GET HOSPITAL FROM JWT
    const hospitalId = req.user.hospitalId;

    const medication = await prisma.medication.create({
      data: {
        name,
        category,
        description,

        stock: parseInt(stock),

        unitPrice: parseFloat(unitPrice),

        batchNumber,
        supplier,

        expiryDate: new Date(expiryDate),

        reorderLevel: reorderLevel
          ? parseInt(reorderLevel)
          : 5,

        // 🔐 SECURE TENANT ISOLATION
        hospitalId
      }
    });

    await logAction({
      userId: req.user.id,
      hospitalId,
      actionType: "CREATE",
      entity: "Medication",
      entityId: medication.id,
      details: `Created medication ${medication.name} with stock ${medication.stock}`
    });

    const daysToExpiry = Math.ceil((medication.expiryDate - new Date()) / (1000 * 60 * 60 * 24));
    if (daysToExpiry <= 30) {
      await notifyHospital(
        hospitalId,
        `Expiry alert: ${medication.name}`,
        `Medication ${medication.name} expires in ${daysToExpiry} day(s). Please review stock and plan dispensing.`
      );
    }

    if (medication.stock <= medication.reorderLevel) {
      await notifyHospital(
        hospitalId,
        `Low stock alert: ${medication.name}`,
        `Medication ${medication.name} has low stock (${medication.stock}). Reorder level is ${medication.reorderLevel}.`
      );
    }

    res.status(201).json({
      message: "Medication added successfully",
      medication
    });

  } catch (error) {
    res.status(500).json({
      message: "Error adding medication",
      error: error.message
    });
  }
};



// =====================================
// 📦 GET ALL MEDICATIONS
// =====================================
const getMedications = async (req, res) => {
  try {

    const medications =
      await prisma.medication.findMany({
        where: {
          // 🔐 ONLY CURRENT HOSPITAL
          hospitalId: req.user.hospitalId
        },

        orderBy: {
          createdAt: "desc"
        }
      });

    res.json(medications);

  } catch (error) {
    res.status(500).json({
      message: "Error fetching medications",
      error: error.message
    });
  }
};



// =====================================


// =====================================
// 📋 GET SINGLE MEDICATION
// =====================================
const getMedicationById = async (req, res) => {
  try {
    const id = parseInt(req.params.id);

    const medication = await prisma.medication.findFirst({
      where: {
        id,
        hospitalId: req.user.hospitalId
      }
    });

    if (!medication) {
      return res.status(404).json({
        message: "Medication not found"
      });
    }

    res.json(medication);
  } catch (error) {
    res.status(500).json({
      message: "Error fetching medication",
      error: error.message
    });
  }
};


// =====================================
// 🔄 UPDATE MEDICATION
// =====================================
const updateMedication = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const {
      name,
      category,
      description,
      unitPrice,
      batchNumber,
      supplier,
      expiryDate,
      reorderLevel
    } = req.body;

    const medication = await prisma.medication.findFirst({
      where: {
        id,
        hospitalId: req.user.hospitalId
      }
    });

    if (!medication) {
      return res.status(404).json({
        message: "Medication not found"
      });
    }

    const updatedMedication = await prisma.medication.update({
      where: { id },
      data: {
        name,
        category,
        description,
        unitPrice: unitPrice ? parseFloat(unitPrice) : medication.unitPrice,
        batchNumber,
        supplier,
        expiryDate: expiryDate ? new Date(expiryDate) : medication.expiryDate,
        reorderLevel: reorderLevel ? parseInt(reorderLevel) : medication.reorderLevel
      }
    });

    await logAction({
      userId: req.user.id,
      hospitalId: req.user.hospitalId,
      actionType: "UPDATE",
      entity: "Medication",
      entityId: id,
      details: `Updated medication ${updatedMedication.name}`
    });

    const updatedExpiryDays = Math.ceil((updatedMedication.expiryDate - new Date()) / (1000 * 60 * 60 * 24));
    if (updatedExpiryDays <= 30) {
      await notifyHospital(
        req.user.hospitalId,
        `Expiry warning: ${updatedMedication.name}`,
        `Medication ${updatedMedication.name} will expire in ${updatedExpiryDays} day(s). Please take action.`
      );
    }

    res.json({
      message: "Medication updated successfully",
      medication: updatedMedication
    });
  } catch (error) {
    res.status(500).json({
      message: "Error updating medication",
      error: error.message
    });
  }
};


// =====================================
// 📦 RESTOCK MEDICATION
// =====================================
const restockMedication = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { quantity } = req.body;

    if (!quantity || parseInt(quantity) <= 0) {
      return res.status(400).json({
        message: "Restock quantity must be a positive integer"
      });
    }

    const medication = await prisma.medication.findFirst({
      where: {
        id,
        hospitalId: req.user.hospitalId
      }
    });

    if (!medication) {
      return res.status(404).json({
        message: "Medication not found"
      });
    }

    const updatedMedication = await prisma.medication.update({
      where: { id },
      data: {
        stock: medication.stock + parseInt(quantity)
      }
    });

    await logAction({
      userId: req.user.id,
      hospitalId: req.user.hospitalId,
      actionType: "RESTOCK",
      entity: "Medication",
      entityId: id,
      details: `Restocked medication ${medication.name} by ${quantity}. New stock: ${updatedMedication.stock}`
    });

    if (updatedMedication.stock <= updatedMedication.reorderLevel) {
      await notifyHospital(
        req.user.hospitalId,
        `Low stock after restocking: ${updatedMedication.name}`,
        `Medication ${updatedMedication.name} remains below reorder level after restocking. Current stock: ${updatedMedication.stock}.`
      );
    }

    res.json({
      message: "Medication restocked successfully",
      medication: updatedMedication
    });
  } catch (error) {
    res.status(500).json({
      message: "Error restocking medication",
      error: error.message
    });
  }
};
// ⚠️ LOW STOCK ALERTS
// =====================================
const getLowStockMedications = async (req, res) => {
  try {

    const medications =
      await prisma.medication.findMany({
        where: {

          // 🔐 ONLY CURRENT HOSPITAL
          hospitalId: req.user.hospitalId,

          stock: {
            lte: 5
          }
        },

        orderBy: {
          stock: "asc"
        }
      });

    res.json(medications);

  } catch (error) {
    res.status(500).json({
      message:
        "Error fetching low stock medications",

      error: error.message
    });
  }
};



// =====================================
// ⏰ EXPIRED MEDICATIONS
// =====================================
const getExpiredMedications = async (req, res) => {
  try {

    const medications =
      await prisma.medication.findMany({
        where: {

          // 🔐 ONLY CURRENT HOSPITAL
          hospitalId: req.user.hospitalId,

          expiryDate: {
            lt: new Date()
          }
        },

        orderBy: {
          expiryDate: "asc"
        }
      });

    res.json(medications);

  } catch (error) {
    res.status(500).json({
      message:
        "Error fetching expired medications",

      error: error.message
    });
  }
};



// =====================================
// 💊 DISPENSE MEDICATION
// =====================================
const dispenseMedication = async (req, res) => {
  try {

    const {
      medicationId,
      patientId,
      pharmacistId,
      quantity,
      notes,
      prescriptionId
    } = req.body;

    // =====================================
    // 🔍 FIND MEDICATION SECURELY
    // =====================================
    const medication =
      await prisma.medication.findFirst({
        where: {

          // 🔐 MATCH MEDICATION
          id: parseInt(medicationId),

          // 🔐 SAME HOSPITAL ONLY
          hospitalId: req.user.hospitalId
        }
      });

    if (!medication) {
      return res.status(404).json({
        message:
          "Medication not found in your hospital"
      });
    }

    // =====================================
    // 🔍 VERIFY PRESCRIPTION IF PROVIDED
    // =====================================
    let prescription = null;
    if (prescriptionId) {
      prescription = await prisma.prescription.findFirst({
        where: {
          id: parseInt(prescriptionId),
          hospitalId: req.user.hospitalId
        }
      });

      if (!prescription) {
        return res.status(404).json({
          message: "Prescription not found"
        });
      }

      if (
        prescription.patientId !==
        parseInt(patientId)
      ) {
        return res.status(400).json({
          message:
            "Prescription patient does not match dispensing patient"
        });
      }
    }

    // =====================================
    // 🚫 BLOCK EXPIRED MEDICATIONS
    // =====================================
    if (
      medication.expiryDate < new Date()
    ) {
      return res.status(400).json({
        message:
          "Cannot dispense expired medication"
      });
    }

    // =====================================
    // 🚫 PREVENT NEGATIVE STOCK
    // =====================================
    if (
      medication.stock <
      parseInt(quantity)
    ) {
      return res.status(400).json({
        message:
          "Insufficient medication stock"
      });
    }

    // =====================================
    // 📦 UPDATE INVENTORY
    // =====================================
    const updatedMedication =
      await prisma.medication.update({
        where: {
          id: medication.id
        },

        data: {
          stock:
            medication.stock -
            parseInt(quantity)
        }
      });

    await logAction({
      userId: req.user.id,
      hospitalId: req.user.hospitalId,
      actionType: "DISPENSE",
      entity: "Medication",
      entityId: medication.id,
      details: `Dispensed ${quantity} of ${medication.name} to patient ${patientId}${prescription ? ` via prescription ${prescription.id}` : ""}`
    });

    if (updatedMedication.stock <= medication.reorderLevel) {
      await notifyHospital(
        req.user.hospitalId,
        `Low stock alert: ${medication.name}`,
        `Medication ${medication.name} stock is low (${updatedMedication.stock}). Reorder level is ${medication.reorderLevel}.`
      );
    }

    const daysToExpiry = Math.ceil((medication.expiryDate - new Date()) / (1000 * 60 * 60 * 24));
    if (daysToExpiry <= 30) {
      await notifyHospital(
        req.user.hospitalId,
        `Expiry alert: ${medication.name}`,
        `Medication ${medication.name} will expire in ${daysToExpiry} day(s). Please check inventory.`
      );
    }

    // =====================================
    // 💊 CREATE DISPENSATION RECORD
    // =====================================
    const dispensation =
      await prisma.dispensation.create({
        data: {
          medicationId:
            parseInt(medicationId),

          patientId:
            parseInt(patientId),

          pharmacistId:
            pharmacistId
              ? parseInt(pharmacistId)
              : null,

          prescriptionId: prescription
            ? prescription.id
            : null,

          quantity:
            parseInt(quantity),

          totalPrice:
            medication.unitPrice *
            parseInt(quantity),

          notes,

          // 🔐 SECURE HOSPITAL
          hospitalId:
            req.user.hospitalId
        }
      });

    res.status(201).json({
      message:
        "Medication dispensed successfully",

      remainingStock:
        updatedMedication.stock,

      dispensation
    });

  } catch (error) {
    res.status(500).json({
      message:
        "Error dispensing medication",

      error: error.message
    });
  }
};



// =====================================
// 📋 DISPENSATION HISTORY
// =====================================
const getDispensations = async (req, res) => {
  try {

    const dispensations =
      await prisma.dispensation.findMany({
        where: {

          // 🔐 SAME HOSPITAL ONLY
          hospitalId:
            req.user.hospitalId
        },

        include: {
          medication: true,
          patient: true
        },

        orderBy: {
          dispensedAt: "desc"
        }
      });

    res.json(dispensations);

  } catch (error) {
    res.status(500).json({
      message:
        "Error fetching dispensations",

      error: error.message
    });
  }
};



// =====================================
// 📊 PHARMACY DASHBOARD
// =====================================
const getPharmacyDashboard = async (req, res) => {
  try {
    const hospitalId = req.user.hospitalId;

    const totalMedications = await prisma.medication.count({
      where: { hospitalId }
    });

    const lowStockMedications = await prisma.medication.count({
      where: {
        hospitalId,
        stock: {
          lte: 5
        }
      }
    });

    const totalDispensations = await prisma.dispensation.count({
      where: { hospitalId }
    });

    const expiredMedications = await prisma.medication.count({
      where: {
        hospitalId,
        expiryDate: {
          lt: new Date()
        }
      }
    });

    const expiringSoonMedications = await prisma.medication.count({
      where: {
        hospitalId,
        expiryDate: {
          lte: new Date(new Date().setDate(new Date().getDate() + 30))
        }
      }
    });

    res.json({
      message: "Pharmacy dashboard loaded",
      totalMedications,
      lowStockMedications,
      totalDispensations,
      expiredMedications,
      expiringSoonMedications
    });
  } catch (error) {
    res.status(500).json({
      message: "Error loading pharmacy dashboard",
      error: error.message
    });
  }
};


// =====================================
// EXPORTS
// =====================================
module.exports = {
  addMedication,
  getMedications,
  getMedicationById,
  updateMedication,
  restockMedication,
  getLowStockMedications,
  getExpiredMedications,
  dispenseMedication,
  getDispensations,
  getPharmacyDashboard
};