const bcrypt = require("bcryptjs");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

//
// ==========================================
// 📝 REGISTER USER (Email OR National ID)
// ==========================================
//
const register = async (req, res) => {
  try {
    const {
      fullName,
      email,
      nationalId,
      phone,
      password,
      role,
      hospitalId,
    } = req.body;

    // ==========================================
    // 1. VALIDATION
    // ==========================================
    if (!fullName || !password) {
      return res.status(400).json({
        message: "Full name and password are required",
      });
    }

    if (!email && !nationalId) {
      return res.status(400).json({
        message: "Provide either Email or National ID",
      });
    }

    // ==========================================
    // 2. CHECK IF USER EXISTS
    // ==========================================
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          email ? { email } : undefined,
          nationalId ? { nationalId } : undefined,
        ].filter(Boolean),
      },
    });

    if (existingUser) {
      return res.status(409).json({
        message: "User already exists",
      });
    }

    // ==========================================
    // 3. HASH PASSWORD
    // ==========================================
    const hashedPassword = await bcrypt.hash(password, 10);

    // ==========================================
    // 4. CREATE USER
    // ==========================================
    const user = await prisma.user.create({
      data: {
        fullName,
        email: email || null,
        nationalId: nationalId || null,
        phone: phone || null,
        password: hashedPassword,
        role: role || "PATIENT",
        hospitalId: hospitalId || null,
      },
    });

    // ==========================================
    // 5. RESPONSE
    // ==========================================
    return res.status(201).json({
      message: "User registered successfully",
      user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        nationalId: user.nationalId,
        role: user.role,
      },
    });

  } catch (error) {
    console.error("REGISTER ERROR:", error);

    return res.status(500).json({
      message: "Server error",
    });
  }
};

module.exports = {
  register,
};