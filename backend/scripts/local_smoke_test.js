const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
  try {
    console.log('Starting local smoke test (DB-only)...');

    // create a test hospital
    const hospital = await prisma.hospital.create({
      data: {
        name: 'SmokeTest Hospital',
        email: process.env.SMOKE_TEST_EMAIL || 'smoketest@example.com'
      }
    });

    // create a test user (admin)
    const adminUser = await prisma.user.create({
      data: {
        email: process.env.SMOKE_TEST_ADMIN_EMAIL || 'admin@smoketest.local',
        name: 'Smoke Admin',
        role: 'ADMIN',
        hospitalId: hospital.id
      }
    });

    // create a patient and subscription
    const patient = await prisma.patient.create({ data: { name: 'Test Patient', hospitalId: hospital.id } });

    const subscription = await prisma.subscription.create({
      data: {
        patientId: patient.id,
        hospitalId: hospital.id,
        name: 'Monthly Plan (SmokeTest)',
        amount: 10.0,
        status: 'PENDING'
      }
    });

    console.log('Created subscription', subscription.id);

    // simulate PayPal capture (create payment)
    const orderId = `SMOKE-${Date.now()}`;
    const captureId = `SIMCAP-${Date.now()}`;

    const payment = await prisma.subscriptionPayment.create({
      data: {
        subscriptionId: subscription.id,
        hospitalId: hospital.id,
        amount: subscription.amount,
        method: 'PAYPAL',
        status: 'APPROVED',
        paypalOrderId: orderId,
        paypalCaptureId: captureId
      }
    });

    // activate subscription
    await prisma.subscription.update({ where: { id: subscription.id }, data: { status: 'ACTIVE' } });

    // write audit log
    await prisma.auditLog.create({
      data: {
        hospitalId: hospital.id,
        userId: adminUser.id,
        actionType: 'PAYMENT_CAPTURED_TEST',
        entity: 'SUBSCRIPTION_PAYMENT',
        entityId: payment.id,
        details: JSON.stringify({ orderId, captureId, amount: payment.amount })
      }
    });

    const payments = await prisma.subscriptionPayment.findMany({ where: { subscriptionId: subscription.id } });
    const audits = await prisma.auditLog.findMany({ where: { entityId: payment.id } });
    const sub = await prisma.subscription.findUnique({ where: { id: subscription.id } });

    console.log('Subscription after capture:', sub);
    console.log('Payments:', payments);
    console.log('Audit entries for payment:', audits);

    console.log('Smoke test complete. Clean up not performed; you may remove test records manually.');
  } catch (err) {
    console.error('Smoke test failed:', err);
  } finally {
    await prisma.$disconnect();
  }
}

run();