const { loadData, saveData } = require('../utils/dataStore');

const getRecords = (req, res) => {
  const data = loadData();
  if (req.user.role === 'PATIENT') {
    const patient = data.patients.find((p) => p.id === req.user.id && p.hospitalId === req.user.hospitalId);
    return res.json({ records: patient?.records || [], prescriptions: patient?.prescriptions || [] });
  }

  if (req.user.role === 'DOCTOR' || req.user.role === 'ADMIN') {
    return res.json({
      records: (data.records || []).filter((item) => item.hospitalId === req.user.hospitalId),
      prescriptions: (data.prescriptions || []).filter((item) => item.hospitalId === req.user.hospitalId)
    });
  }

  res.status(403).json({ message: 'Forbidden' });
};

const getAppointments = (req, res) => {
  const data = loadData();
  if (req.user.role !== 'PATIENT') {
    return res.status(403).json({ message: 'Forbidden' });
  }

  const appointments = data.appointments.filter((appointment) => appointment.patientId === req.user.id && appointment.hospitalId === req.user.hospitalId);
  res.json({ appointments });
};

const getPayments = (req, res) => {
  const data = loadData();
  if (req.user.role !== 'PATIENT') {
    return res.status(403).json({ message: 'Forbidden' });
  }

  const payments = data.payments.filter((payment) => payment.patientId === req.user.id && payment.hospitalId === req.user.hospitalId);
  res.json({ payments });
};

const bookAppointment = (req, res) => {
  const data = loadData();
  const appointment = {
    id: data.appointments.length + 1,
    patientId: req.user.id,
    hospitalId: req.user.hospitalId,
    patientName: req.user.name,
    doctor: req.body.doctor || 'Assigned Doctor',
    date: req.body.date,
    time: req.body.time,
    reason: req.body.reason || 'General consultation',
    status: 'PENDING'
  };

  data.appointments.push(appointment);
  data.auditLogs.push({
    event: 'book_appointment',
    user: req.user.email,
    time: new Date().toISOString(),
    details: appointment
  });
  saveData(data);
  res.status(201).json(appointment);
};

const payBill = (req, res) => {
  const data = loadData();
  const amount = Number(req.body.amount);
  const phone = String(req.body.phone || '').trim();

  if (!Number.isFinite(amount) || amount <= 0) {
    return res.status(400).json({ message: 'A valid payment amount is required' });
  }

  if (!/^\+?\d{10,13}$/.test(phone)) {
    return res.status(400).json({ message: 'A valid M-Pesa phone number is required' });
  }

  const reference = req.body.reference || `PAYBILL-${req.user.id}-${Date.now()}`;
  const payment = {
    id: data.payments.length + 1,
    patientId: req.user.id,
    hospitalId: req.user.hospitalId,
    amount,
    method: req.body.method || 'M-Pesa',
    phone,
    status: 'COMPLETED',
    date: new Date().toISOString(),
    paybillNumber: data.hospitals?.find((hospital) => hospital.id === req.user.hospitalId)?.paybill || '200200',
    accountReference: req.body.accountReference || req.user.email,
    subscriptionPlan: req.body.plan || 'Standard Care Plan',
    reference
  };

  data.payments.push(payment);
  data.auditLogs.push({ event: 'payment', user: req.user.email, time: payment.date, details: payment });
  saveData(data);
  res.status(201).json(payment);
};

module.exports = { getRecords, getAppointments, getPayments, bookAppointment, payBill };
