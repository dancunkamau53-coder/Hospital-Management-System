const { loadData, saveData } = require('../utils/dataStore');

const getDoctorPatients = (req, res) => {
  const data = loadData();
  res.json(data.patients.map((patient) => ({ id: patient.id, name: patient.name, email: patient.email, nationalId: patient.nationalId })));
};

const getDoctorAppointments = (req, res) => {
  const data = loadData();
  res.json(data.appointments.filter((appointment) => appointment.status !== 'CANCELLED'));
};

const addPrescription = (req, res) => {
  const data = loadData();
  const prescription = {
    id: data.prescriptions.length + 1,
    doctorId: req.user.id,
    patientId: req.body.patientId,
    medication: req.body.medication,
    instructions: req.body.instructions,
    date: new Date().toISOString()
  };

  data.prescriptions.push(prescription);
  const patient = data.patients.find((patient) => patient.id === req.body.patientId);
  if (patient) {
    patient.prescriptions = patient.prescriptions || [];
    patient.prescriptions.push(prescription);
  }

  data.auditLogs.push({ event: 'add_prescription', user: req.user.email, time: new Date().toISOString(), details: prescription });
  saveData(data);
  res.status(201).json(prescription);
};

const updateRecord = (req, res) => {
  const data = loadData();
  const record = {
    id: data.records.length + 1,
    doctorId: req.user.id,
    patientId: req.body.patientId,
    note: req.body.note,
    diagnosis: req.body.diagnosis,
    date: new Date().toISOString()
  };

  data.records.push(record);
  const patient = data.patients.find((patient) => patient.id === req.body.patientId);
  if (patient) {
    patient.records = patient.records || [];
    patient.records.push(record);
  }

  data.auditLogs.push({ event: 'update_record', user: req.user.email, time: record.date, details: record });
  saveData(data);
  res.status(201).json(record);
};

module.exports = { getDoctorPatients, getDoctorAppointments, addPrescription, updateRecord };
