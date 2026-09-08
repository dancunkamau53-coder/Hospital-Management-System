const { loadData, saveData } = require('../utils/dataStore');

function currentUser(data, userId) {
  return data.users.find((user) => user.id === Number(userId));
}

function getPatient(data, userId) {
  return data.patients.find((patient) => patient.id === Number(userId));
}

function getProfile(req, res) {
  const data = loadData();
  const user = currentUser(data, req.user.id);
  const patient = getPatient(data, req.user.id);

  if (!user) return res.status(404).json({ message: 'Profile not found' });

  res.json({
    id: user.id,
    name: user.name,
    email: user.email,
    nationalId: user.nationalId,
    phone: user.phone || '',
    address: patient?.address || '',
    emergencyContact: patient?.emergencyContact || '',
    profilePhoto: user.profilePhoto || '',
    role: user.role
  });
}

function updateProfile(req, res) {
  const data = loadData();
  const user = currentUser(data, req.user.id);
  const patient = getPatient(data, req.user.id);

  if (!user) return res.status(404).json({ message: 'Profile not found' });

  const { name, phone, address, emergencyContact, profilePhoto } = req.body;
  if (name) user.name = String(name).trim();
  if (phone !== undefined) user.phone = String(phone).trim();
  if (profilePhoto !== undefined) user.profilePhoto = profilePhoto;
  if (patient) {
    if (address !== undefined) patient.address = String(address).trim();
    if (emergencyContact !== undefined) patient.emergencyContact = String(emergencyContact).trim();
    if (name) patient.name = user.name;
    if (phone !== undefined) patient.phone = user.phone;
  }

  data.auditLogs.push({ event: 'profile_updated', user: user.email, time: new Date().toISOString() });
  saveData(data);
  getProfile(req, res);
}

function getNotifications(req, res) {
  const data = loadData();
  const notifications = [];
  const appointments = data.appointments.filter((item) => item.patientId === Number(req.user.id) && item.hospitalId === req.user.hospitalId);
  const payments = (data.payments || []).filter((item) => item.patientId === Number(req.user.id) && item.hospitalId === req.user.hospitalId);
  const patient = getPatient(data, req.user.id);

  appointments.forEach((item) => notifications.push({
    id: `appointment-${item.id}`,
    type: 'APPOINTMENT',
    title: `Appointment ${item.status.toLowerCase()}`,
    message: `${item.doctor} on ${item.date}${item.time ? ` at ${item.time}` : ''}`,
    createdAt: item.date
  }));
  payments.forEach((item) => notifications.push({
    id: `payment-${item.id}`,
    type: 'PAYMENT',
    title: 'Payment update',
    message: `${item.method || 'Payment'} of KES ${item.amount} is ${item.status.toLowerCase()}.`,
    createdAt: item.date
  }));
  (patient?.prescriptions || []).forEach((item) => notifications.push({
    id: `prescription-${item.id}`,
    type: 'PRESCRIPTION',
    title: 'Prescription available',
    message: `${item.medication} is ready to review.`,
    createdAt: item.date
  }));

  res.json(notifications.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
}

function updateAppointment(req, res) {
  const data = loadData();
  const appointment = data.appointments.find((item) => item.id === Number(req.params.id));
  if (!appointment || appointment.patientId !== Number(req.user.id)) {
    return res.status(404).json({ message: 'Appointment not found' });
  }

  const { date, time, reason, status } = req.body;
  if (date !== undefined) appointment.date = date;
  if (time !== undefined) appointment.time = time;
  if (reason !== undefined) appointment.reason = reason;
  if (status !== undefined && ['PENDING', 'CANCELLED'].includes(status)) appointment.status = status;
  saveData(data);
  res.json(appointment);
}

function getInvoices(req, res) {
  const data = loadData();
  const invoices = (data.payments || [])
    .filter((payment) => payment.patientId === Number(req.user.id))
    .map((payment) => ({
      id: `INV-${payment.id}`,
      amount: Number(payment.amount || 0),
      status: payment.status || 'PENDING',
      method: payment.method || 'M-Pesa',
      reference: payment.reference || `PAY-${payment.id}`,
      createdAt: payment.date || new Date().toISOString()
    }));
  res.json(invoices);
}

function search(req, res) {
  const data = loadData();
  const query = String(req.query.q || '').trim().toLowerCase();
  const type = req.query.type || 'all';
  if (!query) return res.json([]);
  const matches = [];

  if (type === 'all' || type === 'patients') {
    data.patients.filter((item) => item.hospitalId === req.user.hospitalId && JSON.stringify(item).toLowerCase().includes(query)).forEach((item) => matches.push({ type: 'patient', id: item.id, title: item.name || item.email, detail: item.email || item.nationalId }));
  }
  if (type === 'all' || type === 'doctors') {
    data.users.filter((item) => item.hospitalId === req.user.hospitalId && item.role === 'DOCTOR' && JSON.stringify(item).toLowerCase().includes(query)).forEach((item) => matches.push({ type: 'doctor', id: item.id, title: item.name, detail: item.email }));
  }
  if (type === 'all' || type === 'appointments') {
    data.appointments.filter((item) => item.hospitalId === req.user.hospitalId && JSON.stringify(item).toLowerCase().includes(query)).forEach((item) => matches.push({ type: 'appointment', id: item.id, title: item.doctor, detail: `${item.date} ${item.status}` }));
  }
  if (type === 'all' || type === 'medicines') {
    (data.medicines || []).filter((item) => item.hospitalId === req.user.hospitalId && JSON.stringify(item).toLowerCase().includes(query)).forEach((item) => matches.push({ type: 'medicine', id: item.id, title: item.name, detail: `Stock: ${item.stock}` }));
  }

  res.json(matches.slice(0, 100));
}

function changePassword(req, res) {
  const data = loadData();
  const user = currentUser(data, req.user.id);
  if (!user || user.password !== req.body.currentPassword) return res.status(400).json({ message: 'Current password is incorrect' });
  if (!req.body.newPassword || req.body.newPassword.length < 8) return res.status(400).json({ message: 'New password must be at least 8 characters' });
  user.password = req.body.newPassword;
  data.auditLogs.push({ event: 'password_changed', user: user.email, time: new Date().toISOString() });
  saveData(data);
  res.json({ message: 'Password changed successfully' });
}

function loginHistory(req, res) {
  const data = loadData();
  const user = currentUser(data, req.user.id);
  res.json((data.auditLogs || []).filter((item) => item.user === user?.email).slice(-20).reverse());
}

function requestPasswordReset(req, res) {
  const data = loadData();
  const user = data.users.find((item) => item.email?.toLowerCase() === String(req.body.email || '').trim().toLowerCase());
  if (user) {
    user.resetToken = `${user.id}-${Date.now()}`;
    user.resetExpires = Date.now() + 15 * 60 * 1000;
    saveData(data);
  }
  res.json({ message: 'If that email exists, a password reset code has been created.' });
}

function confirmPasswordReset(req, res) {
  const data = loadData();
  const user = data.users.find((item) => item.resetToken === req.body.token && item.resetExpires > Date.now());
  if (!user) return res.status(400).json({ message: 'Reset code is invalid or expired' });
  if (!req.body.newPassword || req.body.newPassword.length < 8) return res.status(400).json({ message: 'New password must be at least 8 characters' });
  user.password = req.body.newPassword;
  delete user.resetToken;
  delete user.resetExpires;
  saveData(data);
  res.json({ message: 'Password reset successfully' });
}

function verifyContact(req, res) {
  const data = loadData();
  const user = currentUser(data, req.user.id);
  if (!user || !['email', 'phone'].includes(req.params.channel)) return res.status(400).json({ message: 'Unsupported verification channel' });
  user[`${req.params.channel}Verified`] = true;
  saveData(data);
  res.json({ message: `${req.params.channel} marked as verified`, verified: true });
}

function refundInvoice(req, res) {
  const data = loadData();
  const payment = (data.payments || []).find((item) => `INV-${item.id}` === req.params.id && item.patientId === Number(req.user.id));
  if (!payment) return res.status(404).json({ message: 'Invoice not found' });
  payment.status = 'REFUND_REQUESTED';
  payment.refundRequestedAt = new Date().toISOString();
  saveData(data);
  res.json({ message: 'Refund request submitted', invoice: payment });
}

module.exports = { getProfile, updateProfile, getNotifications, updateAppointment, getInvoices, search, changePassword, loginHistory, requestPasswordReset, confirmPasswordReset, verifyContact, refundInvoice };
