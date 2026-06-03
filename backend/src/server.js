// ==========================================
// 🚀 IMPORTS
// ==========================================
const express = require("express");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

// ==========================================
// 🚀 APP INITIALIZATION
// ==========================================
const app = express();


// ==========================================
// 🚀 MIDDLEWARE
// ==========================================

// Enable CORS
app.use(cors());

// Parse JSON requests
app.use(express.json());

// Parse form data
app.use(express.urlencoded({ extended: true }));

// Serve static files from public folder
app.use(express.static(path.join(__dirname, "../public")));


// ==========================================
// 🚀 IMPORT ROUTES
// ==========================================

// AUTH
const authRoutes = require("./routes/authRoutes");

// PATIENTS
const patientRoutes = require("./routes/patientRoutes");

// DOCTORS
const doctorRoutes = require("./routes/doctorRoutes");

// APPOINTMENTS
const appointmentRoutes = require("./routes/appointmentRoutes");

// MEDICAL RECORDS
const medicalRecordRoutes = require("./routes/medicalRecordRoutes");

// PRESCRIPTIONS
const prescriptionRoutes = require("./routes/prescriptionRoutes");

// INVOICES
const invoiceRoutes = require("./routes/invoiceRoutes");

// PAYMENTS
const paymentRoutes = require("./routes/paymentRoutes");

// PHARMACY
const pharmacyRoutes = require("./routes/pharmacyRoutes");

// NURSE
const nurseRoutes = require("./routes/nurseRoutes");

// WARDS
const wardRoutes = require("./routes/wardRoutes");

// ADMIN
const adminRoutes = require("./routes/adminRoutes");

// AUDIT
const auditRoutes = require("./routes/auditRoutes");

// BILLING
const billingRoutes = require("./routes/billingRoutes");

// DOCTOR PORTAL
const doctorPortalRoutes = require("./routes/doctorPortalRoutes");

// HOSPITAL
const hospitalRoutes = require("./routes/hospitalRoutes");

// PATIENT PORTAL
const patientPortalRoutes = require("./routes/patientPortalRoutes");

// SUBSCRIPTIONS
const subscriptionRoutes = require("./routes/subscriptionRoutes");

// WORKFLOW
const workflowRoutes = require("./routes/workflowRoutes");

// PROTECTED
const protectedRoutes = require("./routes/protectedRoutes");


// ==========================================
// 🚀 API ROUTES
// ==========================================

// AUTH
app.use("/api/auth", authRoutes);

// PATIENTS
app.use("/api/patients", patientRoutes);

// DOCTORS
app.use("/api/doctors", doctorRoutes);

// APPOINTMENTS
app.use("/api/appointments", appointmentRoutes);

// MEDICAL RECORDS
app.use("/api/medical-records", medicalRecordRoutes);

// PRESCRIPTIONS
app.use("/api/prescriptions", prescriptionRoutes);

// INVOICES
app.use("/api/invoices", invoiceRoutes);

// PAYMENTS
app.use("/api/payments", paymentRoutes);

// PHARMACY
app.use("/api/pharmacy", pharmacyRoutes);

// NURSE
app.use("/api/nurse", nurseRoutes);

// WARDS
app.use("/api/ward", wardRoutes);

// ADMIN
app.use("/api/admin", adminRoutes);

// AUDIT
app.use("/api/audit", auditRoutes);

// BILLING
app.use("/api/billing", billingRoutes);

// DOCTOR PORTAL
app.use("/api/doctor-portal", doctorPortalRoutes);

// HOSPITAL
app.use("/api/hospital", hospitalRoutes);

// PATIENT PORTAL
app.use("/api/patient-portal", patientPortalRoutes);

// SUBSCRIPTIONS
app.use("/api/subscriptions", subscriptionRoutes);

// WORKFLOW
app.use("/api/workflows", workflowRoutes);

// PROTECTED
app.use("/api/protected", protectedRoutes);


// ==========================================
// 🚀 TEST ROUTE
// ==========================================
app.get("/", (req, res) => {
  res.json({
    message: "🏥 HMS Backend Server Running Successfully"
  });
});


// ==========================================
// 🚀 ERROR HANDLER
// ==========================================
app.use((err, req, res, next) => {

  console.error(err.stack);

  res.status(500).json({
    success: false,
    message: "Internal Server Error"
  });

});


// ==========================================
// 🚀 START SERVER
// ==========================================
const PORT = process.env.PORT || 10000;

app.listen(PORT, () => {

  console.log(`
=========================================
🏥 HMS BACKEND SERVER STARTED
=========================================
🚀 Server Running On:
http://localhost:${PORT}
=========================================
`);

});