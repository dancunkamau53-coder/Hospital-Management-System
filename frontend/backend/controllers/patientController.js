const { loadData, saveData } = require('../utils/dataStore');

const getRecords = (req, res) => {
  const data = loadData();
  if (req.user.role === 'PATIENT') {
    const patient = data.patients.find((p) => p.id === req.user.id);
    return res.json({ records: patient?.records || [], prescriptions: patient?.prescriptions || [] });
  }

  if (req.user.role === 'DOCTOR' || req.user.role === 'ADMIN') {
    return res.json({ records: data.records || [], prescriptions: data.prescriptions || [] });
  }

  res.status(403).json({ message: 'Forbidden' });
};

const getAppointments = (req, res) => {
  const data = loadData();
  if (req.user.role !== 'PATIENT') {
    return res.status(403).json({ message: 'Forbidden' });
  }

  const appointments = data.appointments.filter((appointment) => appointment.patientId === req.user.id);
  res.json({ appointments });
};

const getPayments = (req, res) => {
  const data = loadData();
  if (req.user.role !== 'PATIENT') {
    return res.status(403).json({ message: 'Forbidden' });
  }

  const payments = data.payments.filter((payment) => payment.patientId === req.user.id);
  res.json({ payments });
};

const bookAppointment = (req, res) => {
  const data = loadData();
  const appointment = {
    id: data.appointments.length + 1,
    patientId: req.user.id,
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
  const reference = req.body.reference || `PAYBILL-${req.user.id}-${Date.now()}`;
  const payment = {
    id: data.payments.length + 1,
    patientId: req.user.id,
    amount: Number(req.body.amount) || 0,
    method: req.body.method || 'M-Pesa',
    status: 'COMPLETED',
    date: new Date().toISOString(),
    paybillNumber: '200200',
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
