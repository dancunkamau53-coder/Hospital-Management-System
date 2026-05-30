const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();


// ==============================
// 📤 UPLOAD PAYMENT PROOF (already existing)
// ==============================
const uploadPaymentProof = async (req, res) => {
  try {
    const {
      subscriptionId,
      amount,
      reference,
      proofImage
    } = req.body;

    const payment = await prisma.subscriptionPayment.create({
      data: {
        subscriptionId: parseInt(subscriptionId),
        hospitalId: req.user.hospitalId,
        amount: parseFloat(amount),
        reference,
        proofImage,
        status: "PENDING"
      }
    });

    res.status(201).json({
      message: "Payment proof submitted successfully",
      payment
    });

  } catch (error) {
    res.status(500).json({
      message: "Error submitting payment proof",
      error: error.message
    });
  }
};


// ==============================
// 👑 APPROVE PAYMENT (ADMIN ONLY)
// ==============================
const approvePayment = async (req, res) => {
  try {
    const { paymentId } = req.params;

    // 1. Find payment
    const payment = await prisma.subscriptionPayment.findUnique({
      where: { id: parseInt(paymentId) }
    });

    if (!payment || payment.hospitalId !== req.user.hospitalId) {
      return res.status(404).json({
        message: "Payment not found"
      });
    }

    // 2. Update payment status
    const updatedPayment = await prisma.subscriptionPayment.update({
      where: { id: parseInt(paymentId) },
      data: {
        status: "APPROVED"
      }
    });

    // 3. Activate subscription
    const subscription = await prisma.subscription.update({
      where: { id: payment.subscriptionId },
      data: {
        status: "ACTIVE"
      }
    });

    res.json({
      message: "Payment approved and subscription activated",
      payment: updatedPayment,
      subscription
    });

  } catch (error) {
    res.status(500).json({
      message: "Error approving payment",
      error: error.message
    });
  }
};


// ==============================
// EXPORTS
// ==============================
module.exports = {
  uploadPaymentProof,
  approvePayment
};