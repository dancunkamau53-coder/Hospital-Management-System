const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const bcrypt = require("bcryptjs");


// ==============================
// 🏥 REGISTER HOSPITAL (SAAS SIGNUP)
// ==============================
const registerHospital = async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      adminName,
      adminEmail,
      password
    } = req.body;

    // ==========================
    // CHECK IF HOSPITAL EXISTS
    // ==========================
    const existingHospital = await prisma.hospital.findUnique({
      where: { email }
    });

    if (existingHospital) {
      return res.status(400).json({
        message: "Hospital already exists"
      });
    }

    // ==========================
    // CREATE HOSPITAL
    // ==========================
    const hospital = await prisma.hospital.create({
      data: {
        name,
        email,
        phone,
        plan: "BASIC",
        isActive: true
      }
    });

    // ==========================
    // CREATE ADMIN USER
    // ==========================
    const hashedPassword = await bcrypt.hash(password, 10);

    const adminUser = await prisma.user.create({
      data: {
        fullName: adminName,
        email: adminEmail,
        password: hashedPassword,
        role: "ADMIN",
        hospitalId: hospital.id
      }
    });

    // ==========================
    // RESPONSE
    // ==========================
    res.status(201).json({
      message: "Hospital registered successfully",
      hospital,
      adminUser: {
        id: adminUser.id,
        fullName: adminUser.fullName,
        email: adminUser.email,
        role: adminUser.role
      }
    });

  } catch (error) {
    res.status(500).json({
      message: "Error registering hospital",
      error: error.message
    });
  }
};


// ==============================
// EXPORTS
// ==============================
module.exports = {
  registerHospital
};