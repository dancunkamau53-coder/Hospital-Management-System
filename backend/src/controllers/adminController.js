const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();


// ==============================
// 📊 ADMIN DASHBOARD SUMMARY
// ==============================
const getDashboardStats = async (req, res) => {
  try {

    // ==========================
    // 🏥 HOSPITALS
    // ==========================
    const totalHospitals = await prisma.hospital.count();

    // ==========================
    // 👤 USERS
    // ==========================
    const totalUsers = await prisma.user.count();

    const totalPatients = await prisma.patient.count();
    const totalDoctors = await prisma.doctor.count();
    const totalAppointments = await prisma.appointment.count();
    const totalMedications = await prisma.medication.count();
    const expiredMedications = await prisma.medication.count({
      where: {
        expiryDate: {
          lt: new Date()
        }
      }
    });

    // ==========================
    // 💳 SUBSCRIPTIONS
    // ==========================
    const activeSubscriptions = await prisma.subscription.count({
      where: { status: "ACTIVE" }
    });

    const pendingSubscriptions = await prisma.subscription.count({
      where: { status: "PENDING" }
    });

    const totalAuditLogs = await prisma.auditLog.count();

    // ==========================
    // 💰 REVENUE (FROM SUBSCRIPTIONS)
    // ==========================
    const revenue = await prisma.subscription.aggregate({
      _sum: {
        amount: true
      },
      where: {
        status: "ACTIVE"
      }
    });

    // ==========================
    // 📤 PAYMENT REQUESTS
    // ==========================
    const pendingPayments = await prisma.subscriptionPayment.count({
      where: { status: "PENDING" }
    });

    const approvedPayments = await prisma.subscriptionPayment.count({
      where: { status: "APPROVED" }
    });

    // ==========================
    // RESPONSE
    // ==========================
    res.json({
      message: "Admin dashboard stats loaded",

      hospitals: totalHospitals,
      users: totalUsers,

      auditLogs: totalAuditLogs,

      subscriptions: {
        active: activeSubscriptions,
        pending: pendingSubscriptions
      },

      payments: {
        pending: pendingPayments,
        approved: approvedPayments
      },

      revenue: {
        total: revenue._sum.amount || 0
      },

      totals: {
        patients: totalPatients,
        doctors: totalDoctors,
        appointments: totalAppointments,
        medications: totalMedications,
        expiredMedications
      }
    });

  } catch (error) {
    res.status(500).json({
      message: "Error loading dashboard",
      error: error.message
    });
  }
};


// ==============================
// 💳 LIST SUBSCRIPTION PAYMENTS
// ==============================
const listSubscriptionPayments = async (req, res) => {
  try {
    const payments = await prisma.subscriptionPayment.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        subscription: true,
        hospital: true
      }
    });

    res.json({ message: 'Subscription payments loaded', payments });
  } catch (error) {
    res.status(500).json({ message: 'Error loading payments', error: error.message });
  }
};


// ==============================
// 📋 LIST REFERRAL REQUESTS
// ==============================
const listReferralRequests = async (req, res) => {
  try {
    const referrals = await prisma.auditLog.findMany({
      where: { actionType: 'REFERRAL_REQUEST' },
      orderBy: { createdAt: 'desc' }
    });

    res.json({ message: 'Referral requests loaded', referrals });
  } catch (error) {
    res.status(500).json({ message: 'Error loading referrals', error: error.message });
  }
};


// ==============================
// EXPORTS
// ==============================
module.exports = {
  getDashboardStats,
  listSubscriptionPayments,
  listReferralRequests
};