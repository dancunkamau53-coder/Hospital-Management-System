const { PrismaClient } = require("@prisma/client");
const paypal = require('@paypal/checkout-server-sdk');
const { client: paypalClient } = require("../service/paypalClient");
const { sendEmail } = require('../service/notificationService');
const prisma = new PrismaClient();

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
        status: "PENDING",
        method: "MANUAL"
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

const approvePayment = async (req, res) => {
  try {
    const { paymentId } = req.params;

    const payment = await prisma.subscriptionPayment.findUnique({
      where: { id: parseInt(paymentId) }
    });

    if (!payment || payment.hospitalId !== req.user.hospitalId) {
      return res.status(404).json({
        message: "Payment not found"
      });
    }

    const updatedPayment = await prisma.subscriptionPayment.update({
      where: { id: parseInt(paymentId) },
      data: {
        status: "APPROVED"
      }
    });

    const subscription = await prisma.subscription.update({
      where: { id: payment.subscriptionId },
      data: {
        status: "ACTIVE"
      }
    });

    // create audit log
    await prisma.auditLog.create({
      data: {
        hospitalId: req.user.hospitalId,
        userId: req.user.id,
        actionType: 'PAYMENT_APPROVED',
        entity: 'SUBSCRIPTION_PAYMENT',
        entityId: updatedPayment.id,
        details: JSON.stringify({ amount: updatedPayment.amount, method: updatedPayment.method })
      }
    });

    // send notification email to hospital (if available)
    try {
      const hospital = await prisma.hospital.findUnique({ where: { id: subscription.hospitalId } });
      if (hospital?.email) {
        await sendEmail(hospital.email, 'Payment approved', `Payment ${updatedPayment.id} for subscription ${subscription.id} has been approved.`);
      }
    } catch (e) {
      console.log('Email send error:', e.message);
    }

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

  const rejectPayment = async (req, res) => {
    try {
      const { paymentId } = req.params;

      const payment = await prisma.subscriptionPayment.findUnique({
        where: { id: parseInt(paymentId) }
      });

      if (!payment || payment.hospitalId !== req.user.hospitalId) {
        return res.status(404).json({
          message: "Payment not found"
        });
      }

      const updatedPayment = await prisma.subscriptionPayment.update({
        where: { id: parseInt(paymentId) },
        data: {
          status: "REJECTED"
        }
      });

      // audit log
      await prisma.auditLog.create({
        data: {
          hospitalId: req.user.hospitalId,
          userId: req.user.id,
          actionType: 'PAYMENT_REJECTED',
          entity: 'SUBSCRIPTION_PAYMENT',
          entityId: updatedPayment.id,
          details: JSON.stringify({ amount: updatedPayment.amount, method: updatedPayment.method })
        }
      });

      // notify hospital/admin
      try {
        const hospital = await prisma.hospital.findUnique({ where: { id: updatedPayment.hospitalId } });
        if (hospital?.email) {
          await sendEmail(hospital.email, 'Payment rejected', `Payment ${updatedPayment.id} for subscription ${updatedPayment.subscriptionId} was rejected.`);
        }
      } catch (e) {
        console.log('Email send error:', e.message);
      }

      res.json({
        message: "Payment rejected",
        payment: updatedPayment
      });
    } catch (error) {
      res.status(500).json({
        message: "Error rejecting payment",
        error: error.message
      });
    }
  };

const capturePayPalOrder = async (req, res) => {
  try {
    const { orderId, subscriptionId } = req.body;

    if (!orderId || !subscriptionId) {
      return res.status(400).json({
        message: "orderId and subscriptionId are required"
      });
    }

    const paypalClientInstance = paypalClient();
    const request = new paypal.orders.OrdersCaptureRequest(orderId);
    request.requestBody({});

    const captureResponse = await paypalClientInstance.execute(request);
    const captureStatus = captureResponse.result.status;

    if (captureStatus !== "COMPLETED") {
      return res.status(402).json({
        message: "PayPal payment not completed",
        status: captureStatus
      });
    }

    const subscription = await prisma.subscription.findUnique({
      where: { id: parseInt(subscriptionId, 10) }
    });

    if (!subscription) {
      return res.status(404).json({
        message: "Subscription not found"
      });
    }

    const captureId = captureResponse.result.purchase_units?.[0]?.payments?.captures?.[0]?.id || null;
    const paymentAmount = captureResponse.result.purchase_units?.[0]?.payments?.captures?.[0]?.amount?.value || subscription.amount;

    const payment = await prisma.subscriptionPayment.upsert({
      where: {
        paypalOrderId: orderId
      },
      create: {
        subscriptionId: subscription.id,
        hospitalId: subscription.hospitalId,
        amount: parseFloat(paymentAmount),
        method: "PAYPAL",
        status: "APPROVED",
        paypalOrderId: orderId,
        paypalCaptureId: captureId
      },
      update: {
        status: "APPROVED",
        paypalCaptureId: captureId
      }
    });

    const updatedSubscription = await prisma.subscription.update({
      where: { id: subscription.id },
      data: {
        status: "ACTIVE"
      }
    });

    res.json({
      message: "PayPal payment captured and subscription activated",
      payment,
      subscription: updatedSubscription
    });
  } catch (error) {
    res.status(500).json({
      message: "Error capturing PayPal order",
      error: error.message
    });
  }
};

module.exports = {
  uploadPaymentProof,
  approvePayment,
  rejectPayment,
  capturePayPalOrder
};