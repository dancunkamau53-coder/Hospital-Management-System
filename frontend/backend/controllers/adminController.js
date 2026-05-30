const { loadData, saveData } = require('../utils/dataStore');

const getReports = (req, res) => {
  const data = loadData();
  const pendingClaims = data.appointments.filter((appointment) => appointment.status === 'PENDING').length;
  const confirmedClaims = data.appointments.filter((appointment) => appointment.status === 'CONFIRMED').length;
  const report = {
    totalPatients: data.patients.length,
    totalAppointments: data.appointments.length,
    totalDoctors: data.users.filter((user) => user.role === 'DOCTOR').length,
    totalPayments: data.payments?.reduce((sum, payment) => sum + Number(payment.amount || 0), 0),
    totalClaims: data.appointments.length,
    pendingClaims,
    confirmedClaims,
    activeMemberships: data.patients.length,
    paybillNumber: '200200',
    schemeStatus: 'Live',
    recentAudit: data.auditLogs.slice(-20)
  };

  res.json(report);
};

const addDoctor = (req, res) => {
  const data = loadData();
  const exists = data.users.find((user) => user.email === req.body.email || user.nationalId === req.body.nationalId);
  if (exists) {
    return res.status(400).json({ message: 'Doctor already exists' });
  }

  const doctor = {
    id: data.users.length + 1,
    name: req.body.name,
    email: req.body.email,
    nationalId: req.body.nationalId,
    password: req.body.password || 'password123',
    role: 'DOCTOR'
  };

  data.users.push(doctor);
  data.auditLogs.push({ event: 'add_doctor', user: req.user.email, time: new Date().toISOString(), details: doctor });
  saveData(data);
  res.status(201).json(doctor);
};

const getAuditLogs = (req, res) => {
  const data = loadData();
  res.json(data.auditLogs || []);
};

module.exports = { getReports, addDoctor, getAuditLogs };
