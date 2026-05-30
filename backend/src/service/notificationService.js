const nodemailer = require("nodemailer");

// =====================================================
// 📧 EMAIL TRANSPORTER SETUP
// =====================================================
const transporter = nodemailer.createTransport({
  service: "gmail",

  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});


// =====================================================
// 📧 SEND EMAIL FUNCTION
// =====================================================
const sendEmail = async (to, subject, text) => {

  try {

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to,
      subject,
      text
    });

    console.log("✅ Email sent successfully");

  } catch (error) {

    console.log("❌ Email error:", error.message);

  }
};


// =====================================================
// EXPORT FUNCTION
// =====================================================
module.exports = {
  sendEmail
};