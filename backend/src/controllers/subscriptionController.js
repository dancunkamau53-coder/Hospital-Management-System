const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const createSubscription = async (req, res) => {
  try {
    const { hospitalId: requestedHospitalId, plan } = req.body;

    const hospitalId = requestedHospitalId
      ? parseInt(requestedHospitalId)
      : req.user?.hospitalId;

    if (!hospitalId) {
      return res.status(400).json({
        message: "Hospital ID is required for subscription"
      });
    }

    // ==========================
    // 💰 PLAN PRICING
    // ==========================
    const plans = {
      BASIC: 1500,
      PRO: 3000,
      PREMIUM: 5000
    };

    const amount = plans[plan];

    if (!amount) {
      return res.status(400).json({
        message: "Invalid plan selected"
      });
    }

    // ==========================
    // 📅 SUBSCRIPTION DATES
    // ==========================
    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + 30);

    // ==========================
    // 🏥 CREATE SUBSCRIPTION
    // ==========================
    const subscription = await prisma.subscription.create({
      data: {
        hospitalId: parseInt(hospitalId),
        plan,
        amount,
        status: "PENDING",
        startDate,
        endDate
      }
    });

    // ==========================
    // 💳 RESPONSE (BANK PAYMENT INFO)
    // ==========================
    res.status(201).json({
      message: "Subscription created successfully (PENDING PAYMENT)",

      subscription,

      paymentInstructions: {
        method: "BANK TRANSFER",

        bankDetails: {
          bankName: "KCB Bank",
          accountName: "Your Hospital SaaS Name",
          accountNumber: "1234567890",
          branch: "Nairobi CBD"
        },

        steps: [
          "1. Send payment to the bank account",
          "2. Use hospital name as reference",
          "3. Upload payment proof (screenshot or receipt)",
          "4. Wait for admin approval"
        ]
      }
    });

  } catch (error) {
    res.status(500).json({
      message: "Error creating subscription",
      error: error.message
    });
  }
};

module.exports = {
  createSubscription
};