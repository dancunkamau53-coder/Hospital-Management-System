const crypto = require('crypto');
const { loadData, saveData } = require('../utils/dataStore');

function nextId(items) {
  return items.reduce((max, item) => Math.max(max, Number(item.id) || 0), 0) + 1;
}

function registerHospital(req, res) {
  const data = loadData();
  const { name, email, phone, adminName, adminEmail, adminPassword } = req.body;
  if (!name || !email || !adminName || !adminEmail || !adminPassword) {
    return res.status(400).json({ message: 'Hospital and administrator details are required' });
  }
  if (data.hospitals.some((hospital) => hospital.email?.toLowerCase() === email.toLowerCase())) {
    return res.status(409).json({ message: 'A hospital with this email already exists' });
  }

  const hospital = {
    id: nextId(data.hospitals), name, email, phone: phone || '', status: 'PENDING',
    plan: 'BASIC', paybill: '', brandColor: '#1d427f', settings: { timezone: 'Africa/Nairobi' },
    createdAt: new Date().toISOString()
  };
  const admin = {
    id: nextId(data.users), name: adminName, email: adminEmail, password: adminPassword,
    role: 'ADMIN', hospitalId: hospital.id
  };
  data.hospitals.push(hospital);
  data.users.push(admin);
  data.auditLogs.push({ event: 'hospital_registration', user: adminEmail, hospitalId: hospital.id, time: new Date().toISOString() });
  saveData(data);
  res.status(201).json({ message: 'Hospital registration submitted for approval', hospital: { ...hospital, adminId: admin.id } });
}

function listHospitals(req, res) {
  const data = loadData();
  res.json(data.hospitals);
}

function approveHospital(req, res) {
  const data = loadData();
  const hospital = data.hospitals.find((item) => item.id === Number(req.params.id));
  if (!hospital) return res.status(404).json({ message: 'Hospital not found' });
  hospital.status = 'APPROVED';
  hospital.approvedAt = new Date().toISOString();
  data.auditLogs.push({ event: 'hospital_approved', hospitalId: hospital.id, user: req.user.email, time: new Date().toISOString() });
  saveData(data);
  res.json(hospital);
}

function updateSettings(req, res) {
  const data = loadData();
  const hospitalId = Number(req.user.hospitalId);
  const hospital = data.hospitals.find((item) => item.id === hospitalId);
  if (!hospital) return res.status(404).json({ message: 'Hospital not found' });
  const { brandColor, paybill, settings } = req.body;
  if (brandColor !== undefined) hospital.brandColor = brandColor;
  if (paybill !== undefined) hospital.paybill = paybill;
  hospital.settings = { ...(hospital.settings || {}), ...(settings || {}) };
  saveData(data);
  res.json(hospital);
}

function getSettings(req, res) {
  const data = loadData();
  const hospital = data.hospitals.find((item) => item.id === Number(req.user.hospitalId));
  if (!hospital) return res.status(404).json({ message: 'Hospital not found' });
  res.json(hospital);
}

function inviteStaff(req, res) {
  const data = loadData();
  const { email, name, role } = req.body;
  const allowedRoles = ['DOCTOR', 'NURSE', 'PHARMACIST', 'RECEPTIONIST', 'CASHIER'];
  if (!email || !name || !allowedRoles.includes(role)) return res.status(400).json({ message: 'Name, email, and a supported staff role are required' });
  const invitation = { id: crypto.randomUUID(), email, name, role, hospitalId: Number(req.user.hospitalId), token: crypto.randomBytes(16).toString('hex'), status: 'PENDING', createdAt: new Date().toISOString() };
  data.invitations.push(invitation);
  saveData(data);
  res.status(201).json({ message: 'Staff invitation created', invitation });
}

function listInvitations(req, res) {
  const data = loadData();
  res.json(data.invitations.filter((item) => item.hospitalId === Number(req.user.hospitalId)));
}

function acceptInvitation(req, res) {
  const data = loadData();
  const invitation = data.invitations.find((item) => item.token === req.body.token && item.status === 'PENDING');
  if (!invitation) return res.status(400).json({ message: 'Invitation is invalid or already used' });
  if (!req.body.password || req.body.password.length < 8) return res.status(400).json({ message: 'Password must be at least 8 characters' });
  const user = { id: nextId(data.users), name: invitation.name, email: invitation.email, password: req.body.password, role: invitation.role, hospitalId: invitation.hospitalId };
  data.users.push(user);
  invitation.status = 'ACCEPTED';
  invitation.acceptedAt = new Date().toISOString();
  saveData(data);
  res.status(201).json({ message: 'Staff account created. You can now sign in.', user: { id: user.id, name: user.name, email: user.email, role: user.role, hospitalId: user.hospitalId } });
}

module.exports = { registerHospital, listHospitals, approveHospital, updateSettings, getSettings, inviteStaff, listInvitations, acceptInvitation };
