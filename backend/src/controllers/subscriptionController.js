const { PrismaClient } = require("@prisma/client");
const { client: paypalClient } = require("../service/paypalClient");
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

    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + 30);

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

    const paypal = paypalClient();
    const domain = process.env.CLIENT_URL || "http://localhost:3000";
    const currency = process.env.PAYPAL_CURRENCY || "USD";

    const request = new (require('@paypal/checkout-server-sdk').orders.OrdersCreateRequest)();
    request.prefer("return=representation");
    request.requestBody({
      intent: "CAPTURE",
      purchase_units: [
        {
          reference_id: subscription.id.toString(),
          description: `${plan} Hospital Subscription`,
          amount: {
            currency_code: currency,
            value: amount.toFixed(2)
          }
        }
      ],
      application_context: {
        brand_name: "HMS Hospital Management System",
        landing_page: "BILLING",
        user_action: "PAY_NOW",
        return_url: `${domain}/payment-success?subscriptionId=${subscription.id}`,
        cancel_url: `${domain}/payment-cancelled`
      }
    });

    const response = await paypal.execute(request);
    const approvalUrl = response.result.links.find((link) => link.rel === "approve")?.href;

    await prisma.subscriptionPayment.create({
      data: {
        subscriptionId: subscription.id,
        hospitalId: subscription.hospitalId,
        amount,
        method: "PAYPAL",
        status: "PENDING",
        paypalOrderId: response.result.id
      }
    });

    if (!approvalUrl) {
      return res.status(500).json({
        message: "Unable to create PayPal checkout session"
      });
    }

    res.status(201).json({
      message: "Subscription created. Complete payment using PayPal.",
      subscription,
      paypalApprovalUrl: approvalUrl,
      paypalOrderId: response.result.id
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