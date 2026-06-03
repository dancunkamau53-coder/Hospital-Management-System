const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Dev-only: simulate PayPal capture result and create subscription payment
const simulatePayPalCapture = async (req, res) => {
  try {
    const { orderId, subscriptionId, amount, captureId } = req.body;

    if (!orderId || !subscriptionId) {
      return res.status(400).json({ message: 'orderId and subscriptionId required' });
    }

    const subscription = await prisma.subscription.findUnique({ where: { id: parseInt(subscriptionId, 10) } });
    if (!subscription) return res.status(404).json({ message: 'Subscription not found' });

    const payment = await prisma.subscriptionPayment.upsert({
      where: { paypalOrderId: orderId },
      create: {
        subscriptionId: subscription.id,
        hospitalId: subscription.hospitalId,
        amount: amount ? parseFloat(amount) : subscription.amount,
        method: 'PAYPAL',
        status: 'APPROVED',
        paypalOrderId: orderId,
        paypalCaptureId: captureId || `SIM-${Date.now()}`
      },
      update: {
        status: 'APPROVED',
        paypalCaptureId: captureId || `SIM-${Date.now()}`
      }
    });

    await prisma.subscription.update({ where: { id: subscription.id }, data: { status: 'ACTIVE' } });

    res.json({ message: 'Simulated capture created', payment });
  } catch (err) {
    res.status(500).json({ message: 'Simulate capture error', error: err.message });
  }
};

module.exports = { simulatePayPalCapture };