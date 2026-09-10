const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

const id = (value) => Number.parseInt(value, 10);
const scopedHospital = (req) => (req.user?.hospitalId ? { hospitalId: req.user.hospitalId } : {});

const createOrganization = async (req, res) => {
  try {
    const { name, type, email, phone, licenseNumber } = req.body;
    if (!name || !type) return res.status(400).json({ message: "name and type are required" });

    const organization = await prisma.partnerOrganization.create({
      data: { name, type, email: email || null, phone: phone || null, licenseNumber: licenseNumber || null, hospitalId: req.user.hospitalId || null }
    });
    res.status(201).json(organization);
  } catch (error) {
    res.status(500).json({ message: "Unable to create organization", error: error.message });
  }
};

const listOrganizations = async (req, res) => {
  try {
    const organizations = await prisma.partnerOrganization.findMany({
      where: { type: req.query.type || undefined, isActive: true },
      orderBy: { name: "asc" }
    });
    res.json(organizations);
  } catch (error) {
    res.status(500).json({ message: "Unable to load organizations", error: error.message });
  }
};

const createLaboratoryOrder = async (req, res) => {
  try {
    const { patientId, doctorId, tests, clinicalNotes, partnerOrganizationId } = req.body;
    if (!patientId || !doctorId || !tests || !req.user.hospitalId) {
      return res.status(400).json({ message: "patientId, doctorId, tests, and hospital access are required" });
    }

    const order = await prisma.laboratoryOrder.create({
      data: {
        patientId: id(patientId), doctorId: id(doctorId), hospitalId: req.user.hospitalId,
        tests, clinicalNotes: clinicalNotes || null,
        partnerOrganizationId: partnerOrganizationId ? id(partnerOrganizationId) : null
      },
      include: { patient: true, doctor: true, results: true }
    });
    res.status(201).json(order);
  } catch (error) {
    res.status(500).json({ message: "Unable to create laboratory order", error: error.message });
  }
};

const listLaboratoryOrders = async (req, res) => {
  try {
    const patientId = req.user.role === "PATIENT"
      ? (req.user.patientId || req.user.id)
      : (req.query.patientId ? id(req.query.patientId) : undefined);
    const orders = await prisma.laboratoryOrder.findMany({
      where: { ...scopedHospital(req), patientId, status: req.query.status || undefined },
      include: { patient: true, doctor: true, results: true, partnerOrganization: true },
      orderBy: { createdAt: "desc" }
    });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: "Unable to load laboratory orders", error: error.message });
  }
};

const addLaboratoryResult = async (req, res) => {
  try {
    const { result, status } = req.body;
    if (!result) return res.status(400).json({ message: "result is required" });
    const order = await prisma.laboratoryOrder.findUnique({ where: { id: id(req.params.orderId) } });
    if (!order) return res.status(404).json({ message: "Laboratory order not found" });
    if (req.user.hospitalId && order.hospitalId !== req.user.hospitalId) return res.status(403).json({ message: "Order belongs to another hospital" });

    const created = await prisma.$transaction([
      prisma.laboratoryResult.create({ data: { laboratoryOrderId: order.id, result, status: status || "FINAL", reviewedById: req.user.id } }),
      prisma.laboratoryOrder.update({ where: { id: order.id }, data: { status: status === "DRAFT" ? "IN_PROGRESS" : "COMPLETED" } })
    ]);
    res.status(201).json({ result: created[0], order: created[1] });
  } catch (error) {
    res.status(500).json({ message: "Unable to record laboratory result", error: error.message });
  }
};

const createReferral = async (req, res) => {
  try {
    const { patientId, toHospitalId, reason, requestedByDoctorId } = req.body;
    if (!patientId || !reason || !requestedByDoctorId || !req.user.hospitalId) return res.status(400).json({ message: "patientId, reason, requestedByDoctorId, and hospital access are required" });
    const referral = await prisma.referral.create({
      data: { patientId: id(patientId), fromHospitalId: req.user.hospitalId, toHospitalId: toHospitalId ? id(toHospitalId) : null, reason, requestedByDoctorId: id(requestedByDoctorId) },
      include: { patient: true, fromHospital: true, toHospital: true }
    });
    res.status(201).json(referral);
  } catch (error) {
    res.status(500).json({ message: "Unable to create referral", error: error.message });
  }
};

const listReferrals = async (req, res) => {
  try {
    const patientId = req.user.role === "PATIENT"
      ? (req.user.patientId || req.user.id)
      : (req.query.patientId ? id(req.query.patientId) : undefined);
    const referrals = await prisma.referral.findMany({
      where: { OR: [{ fromHospitalId: req.user.hospitalId || -1 }, { toHospitalId: req.user.hospitalId || -1 }], patientId },
      include: { patient: true, fromHospital: true, toHospital: true, requestedByDoctor: true },
      orderBy: { createdAt: "desc" }
    });
    res.json(referrals);
  } catch (error) {
    res.status(500).json({ message: "Unable to load referrals", error: error.message });
  }
};

const createConsent = async (req, res) => {
  try {
    const { patientId: requestedPatientId, purpose, expiresAt } = req.body;
    const patientId = req.user.role === "PATIENT" ? (req.user.patientId || req.user.id) : requestedPatientId;
    if (!patientId || !purpose) return res.status(400).json({ message: "patientId and purpose are required" });
    const consent = await prisma.consent.create({ data: { patientId: id(patientId), purpose, expiresAt: expiresAt ? new Date(expiresAt) : null, grantedById: req.user.id } });
    res.status(201).json(consent);
  } catch (error) {
    res.status(500).json({ message: "Unable to record consent", error: error.message });
  }
};

const createPolicy = async (req, res) => {
  try {
    const { patientId: requestedPatientId, providerOrganizationId, policyNumber, memberNumber, coverageDetails } = req.body;
    const patientId = req.user.role === "PATIENT" ? (req.user.patientId || req.user.id) : requestedPatientId;
    if (!patientId || !providerOrganizationId || !policyNumber) return res.status(400).json({ message: "patientId, providerOrganizationId, and policyNumber are required" });
    const policy = await prisma.insurancePolicy.create({ data: { patientId: id(patientId), providerOrganizationId: id(providerOrganizationId), policyNumber, memberNumber: memberNumber || null, coverageDetails: coverageDetails || null }, include: { providerOrganization: true } });
    res.status(201).json(policy);
  } catch (error) {
    res.status(500).json({ message: "Unable to create insurance policy", error: error.message });
  }
};

const createClaim = async (req, res) => {
  try {
    const { policyId, patientId, invoiceId, amount } = req.body;
    if (!policyId || !patientId || !amount || !req.user.hospitalId) return res.status(400).json({ message: "policyId, patientId, amount, and hospital access are required" });
    const claim = await prisma.insuranceClaim.create({ data: { policyId: id(policyId), patientId: id(patientId), hospitalId: req.user.hospitalId, invoiceId: invoiceId ? id(invoiceId) : null, amount: Number(amount) }, include: { policy: true, invoice: true } });
    res.status(201).json(claim);
  } catch (error) {
    res.status(500).json({ message: "Unable to submit insurance claim", error: error.message });
  }
};

const listNotifications = async (req, res) => {
  try {
    const notifications = await prisma.notification.findMany({ where: { userId: req.user.id }, orderBy: { createdAt: "desc" } });
    res.json(notifications);
  } catch (error) {
    res.status(500).json({ message: "Unable to load notifications", error: error.message });
  }
};

const markNotificationRead = async (req, res) => {
  try {
    const notification = await prisma.notification.updateMany({ where: { id: id(req.params.notificationId), userId: req.user.id }, data: { readAt: new Date() } });
    if (!notification.count) return res.status(404).json({ message: "Notification not found" });
    res.json({ message: "Notification marked as read" });
  } catch (error) {
    res.status(500).json({ message: "Unable to update notification", error: error.message });
  }
};

const setAvailability = async (req, res) => {
  try {
    const { status, startsAt, endsAt, note } = req.body;
    if (!status) return res.status(400).json({ message: "status is required" });
    const availability = await prisma.doctorAvailability.create({ data: { doctorId: id(req.params.doctorId), status, startsAt: startsAt ? new Date(startsAt) : new Date(), endsAt: endsAt ? new Date(endsAt) : null, note: note || null } });
    res.status(201).json(availability);
  } catch (error) {
    res.status(500).json({ message: "Unable to update doctor availability", error: error.message });
  }
};

const getWallet = async (req, res) => {
  try {
    const patientId = req.user.role === "PATIENT" ? (req.user.patientId || req.user.id) : id(req.params.patientId);
    const wallet = await prisma.wallet.findUnique({ where: { patientId }, include: { entries: { orderBy: { createdAt: "desc" }, take: 50 }, transactions: { orderBy: { createdAt: "desc" }, take: 50 } } });
    res.json(wallet || { patientId, balance: 0, currency: "KES", entries: [], transactions: [] });
  } catch (error) {
    res.status(500).json({ message: "Unable to load wallet", error: error.message });
  }
};

const createWalletTransaction = async (req, res) => {
  try {
    const { patientId: requestedPatientId, type, amount, invoiceId, providerReference } = req.body;
    const patientId = req.user.role === "PATIENT" ? (req.user.patientId || req.user.id) : requestedPatientId;
    const value = Number(amount);
    if (!patientId || !type || !Number.isFinite(value) || value <= 0) return res.status(400).json({ message: "patientId, type, and a positive amount are required" });
    const wallet = await prisma.wallet.upsert({ where: { patientId: id(patientId) }, update: {}, create: { patientId: id(patientId) } });
    const signedAmount = ["DEBIT", "PAYMENT", "WITHDRAWAL"].includes(type.toUpperCase()) ? -value : value;
    const balance = wallet.balance + signedAmount;
    if (balance < 0) return res.status(400).json({ message: "Insufficient wallet balance" });
    const transaction = await prisma.$transaction(async (tx) => {
      const created = await tx.financialTransaction.create({ data: { walletId: wallet.id, invoiceId: invoiceId ? id(invoiceId) : null, hospitalId: req.user.hospitalId || null, type: type.toUpperCase(), amount: value, status: "COMPLETED", providerReference: providerReference || null } });
      await tx.wallet.update({ where: { id: wallet.id }, data: { balance } });
      await tx.ledgerEntry.create({ data: { walletId: wallet.id, transactionId: created.id, type: type.toUpperCase(), amount: signedAmount, balanceAfter: balance, reference: providerReference || null } });
      return created;
    });
    res.status(201).json({ transaction, balance });
  } catch (error) {
    res.status(500).json({ message: "Unable to record wallet transaction", error: error.message });
  }
};

const getAnalyticsSummary = async (req, res) => {
  try {
    const hospital = scopedHospital(req);
    const [patients, appointments, laboratoryOrders, referrals, claims, revenue] = await Promise.all([
      prisma.patient.count({ where: hospital }),
      prisma.appointment.count({ where: hospital }),
      prisma.laboratoryOrder.count({ where: hospital }),
      prisma.referral.count({ where: { fromHospitalId: req.user.hospitalId || -1 } }),
      prisma.insuranceClaim.count({ where: hospital }),
      prisma.invoice.aggregate({ where: hospital, _sum: { paidAmount: true } })
    ]);
    res.json({ scope: req.user.hospitalId ? "hospital" : "platform", patients, appointments, laboratoryOrders, referrals, insuranceClaims: claims, paidRevenue: revenue._sum.paidAmount || 0 });
  } catch (error) {
    res.status(500).json({ message: "Unable to load analytics summary", error: error.message });
  }
};

module.exports = {
  createOrganization, listOrganizations, createLaboratoryOrder, listLaboratoryOrders,
  addLaboratoryResult, createReferral, listReferrals, createConsent, createPolicy,
  createClaim, listNotifications, markNotificationRead, setAvailability, getWallet,
  createWalletTransaction, getAnalyticsSummary
};
