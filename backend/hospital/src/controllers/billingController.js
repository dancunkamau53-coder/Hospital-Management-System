const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const createInvoice = async (req, res) => {
  try {
    const {
      patientId,
      doctorId,
      totalAmount,
      description
    } = req.body;

    if (!patientId || !totalAmount) {
      return res.status(400).json({
        message: "patientId and totalAmount are required"
      });
    }

    const invoice = await prisma.invoice.create({
      data: {
        patientId: parseInt(patientId),
        doctorId: doctorId ? parseInt(doctorId) : null,
        hospitalId: req.user.hospitalId,
        totalAmount: parseFloat(totalAmount),
        paidAmount: 0,
        status: "UNPAID",
        description: description || null
      }
    });

    res.status(201).json({
      message: "Invoice created successfully",
      invoice
    });
  } catch (error) {
    res.status(500).json({
      message: "Error creating invoice",
      error: error.message
    });
  }
};

const getInvoices = async (req, res) => {
  try {
    const invoices = await prisma.invoice.findMany({
      where: {
        hospitalId: req.user.hospitalId
      },
      include: {
        patient: true,
        doctor: true,
        payments: true
      },
      orderBy: {
        createdAt: "desc"
      }
    });

    res.json(invoices);
  } catch (error) {
    res.status(500).json({
      message: "Error fetching invoices",
      error: error.message
    });
  }
};

const addPayment = async (req, res) => {
  try {
    const { invoiceId, amount, method, reference } = req.body;

    if (!invoiceId || !amount || !method) {
      return res.status(400).json({
        message: "invoiceId, amount, and method are required"
      });
    }

    const invoice = await prisma.invoice.findUnique({
      where: { id: parseInt(invoiceId) }
    });

    if (!invoice) {
      return res.status(404).json({
        message: "Invoice not found"
      });
    }

    if (invoice.hospitalId !== req.user.hospitalId) {
      return res.status(403).json({
        message: "Cannot pay invoice from another hospital"
      });
    }

    const payment = await prisma.payment.create({
      data: {
        invoiceId: parseInt(invoiceId),
        amount: parseFloat(amount),
        method,
        reference: reference || null
      }
    });

    const paidAmount = invoice.paidAmount + parseFloat(amount);
    const status = paidAmount >= invoice.totalAmount ? "PAID" : "PARTIALLY_PAID";

    const updatedInvoice = await prisma.invoice.update({
      where: { id: invoice.id },
      data: {
        paidAmount,
        status
      }
    });

    res.json({
      message: "Payment recorded successfully",
      payment,
      invoice: updatedInvoice
    });
  } catch (error) {
    res.status(500).json({
      message: "Error recording payment",
      error: error.message
    });
  }
};

const getBillingDashboard = async (req, res) => {
  try {
    const totalInvoices = await prisma.invoice.count({
      where: { hospitalId: req.user.hospitalId }
    });

    const paidInvoices = await prisma.invoice.count({
      where: {
        hospitalId: req.user.hospitalId,
        status: "PAID"
      }
    });

    const unpaidInvoices = await prisma.invoice.count({
      where: {
        hospitalId: req.user.hospitalId,
        status: { not: "PAID" }
      }
    });

    const revenue = await prisma.invoice.aggregate({
      where: {
        hospitalId: req.user.hospitalId,
        status: "PAID"
      },
      _sum: {
        totalAmount: true,
        paidAmount: true
      }
    });

    res.json({
      message: "Billing dashboard loaded",
      totalInvoices,
      paidInvoices,
      unpaidInvoices,
      revenue: {
        total: revenue._sum.totalAmount || 0,
        paid: revenue._sum.paidAmount || 0
      }
    });
  } catch (error) {
    res.status(500).json({
      message: "Error loading billing dashboard",
      error: error.message
    });
  }
};

module.exports = {
  createInvoice,
  getInvoices,
  addPayment,
  getBillingDashboard
};
