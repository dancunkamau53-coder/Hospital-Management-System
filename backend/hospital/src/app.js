const express = require("express");
const app = express();
require("dotenv").config();

// ==============================
// 🔐 MIDDLEWARE
// ==============================
app.use(express.json()); // IMPORTANT: allows JSON body requests

// ==============================
// 🧪 TEST ROUTE
// ==============================
app.get("/", (req, res) => {
  res.json({
    message: "Hospital Management System API is running 🚀"
  });
});

// ==============================
// 🧾 ROUTES IMPORTS
// ==============================

// AUTH ROUTES
const authRoutes = require("./routes/authRoutes");

// PATIENT ROUTES
const patientRoutes = require("./routes/patientRoutes");

// DOCTOR ROUTES
const doctorRoutes = require("./routes/doctorRoutes");

// APPOINTMENT ROUTES
const appointmentRoutes = require("./routes/appointmentRoutes");

// MEDICAL RECORD ROUTES
const medicalRecordRoutes = require("./routes/medicalRecordRoutes");


// ==============================
// 🔗 ROUTE CONNECTIONS
// ==============================

app.use("/api/auth", authRoutes);

app.use("/api/patients", patientRoutes);

app.use("/api/doctors", doctorRoutes);

app.use("/api/appointments", appointmentRoutes);

app.use("/api/medical-records", medicalRecordRoutes);


// ==============================
// 🚀 START SERVER
// ==============================
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});