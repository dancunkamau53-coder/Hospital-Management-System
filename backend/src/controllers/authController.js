const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
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
      name,
      email,
      nationalId,
      phone,
      password,
      role,
      hospitalId,
    } = req.body;

    const resolvedFullName = fullName || name;

    // ==========================================
    // 1. VALIDATION
    // ==========================================
    if (!resolvedFullName || !password) {
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
        fullName: resolvedFullName,
        email: email || null,
        nationalId: nationalId || null,
        phone: phone || null,
        password: hashedPassword,
        role: role || "PATIENT",
        hospitalId: hospitalId || null,
      },
    });

    const token = jwt.sign(
      {
        id: user.id,
        role: user.role,
        hospitalId: user.hospitalId,
      },
      process.env.JWT_SECRET || "hospital_system_super_secure_secret_key",
      {
        expiresIn: "7d",
      }
    );

    // ==========================================
    // 5. RESPONSE
    // ==========================================
    return res.status(201).json({
      message: "User registered successfully",
      token,
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

//
// ==========================================
// 📝 LOGIN USER
// ==========================================
//
const login = async (req, res) => {
  try {
    const { email, nationalId, credential, password } = req.body;
    const resolvedEmail = email || (credential && credential.includes('@') ? credential : undefined);
    const resolvedNationalId = nationalId || (credential && !credential.includes('@') ? credential : undefined);

    if ((!resolvedEmail && !resolvedNationalId) || !password) {
      return res.status(400).json({
        message: "Email or National ID and password are required",
      });
    }

    const user = await prisma.user.findFirst({
      where: {
        OR: [
          resolvedEmail ? { email: resolvedEmail } : undefined,
          resolvedNationalId ? { nationalId: resolvedNationalId } : undefined,
        ].filter(Boolean),
      },
    });

    if (!user) {
      return res.status(401).json({
        message: "Invalid credentials",
      });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({
        message: "Invalid credentials",
      });
    }

    const token = jwt.sign(
      {
        id: user.id,
        role: user.role,
        hospitalId: user.hospitalId,
      },
      process.env.JWT_SECRET || "hospital_system_super_secure_secret_key",
      {
        expiresIn: "7d",
      }
    );

    return res.json({
      message: "Login successful",
      token,
      user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        nationalId: user.nationalId,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("LOGIN ERROR:", error);

    return res.status(500).json({
      message: "Server error",
    });
  }
};

module.exports = {
  register,
  login,
};