import React, { useEffect, useState } from 'react';
import api from '../services/api';

export default function Doctor() {
  const [patients, setPatients] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [patientName, setPatientName] = useState('');
  const [medicine, setMedicine] = useState('');
  const [instructions, setInstructions] = useState('');

  useEffect(() => {
    async function loadDoctorData() {
      try {
        const [patientsRes, appointmentsRes] = await Promise.all([
          api.get('/doctor/patients'),
          api.get('/doctor/appointments')
        ]);
        setPatients(patientsRes.data || []);
        setAppointments(appointmentsRes.data || []);
      } catch (error) {
        setPatients([]);
        setAppointments([]);
      }
    }

    loadDoctorData();
  }, []);

  async function handlePrescriptionSubmit(e) {
    e.preventDefault();
    const newPrescription = { patient: patientName, medicine, instructions };
    await api.post('/prescriptions', newPrescription);
    setPatientName('');
    setMedicine('');
    setInstructions('');
    alert('Prescription saved successfully!');
  }

  return (
    <div className="doctor-dashboard">
      <h2>Doctor Dashboard</h2>
      <div className="table-row">
        <div className="table-card">
          <h3>Assigned Patients</h3>
          <table>
            <thead>
              <tr><th>Patient</th><th>Condition</th><th>Status</th></tr>
            </thead>
            <tbody>
              {patients.map((p, idx) => (
                <tr key={idx}><td>{p.name}</td><td>{p.condition}</td><td>Under Care</td></tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="table-card">
          <h3>Doctor Appointments</h3>
          <table>
            <thead>
              <tr><th>Patient</th><th>Date</th><th>Time</th></tr>
            </thead>
            <tbody>
              {appointments.map((a, idx) => (
                <tr key={idx}><td>{a.patient}</td><td>{a.date}</td><td>{a.time}</td></tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <div className="form-card">
        <h3>Write Prescription</h3>
        <form onSubmit={handlePrescriptionSubmit}>
          <input value={patientName} onChange={e => setPatientName(e.target.value)} placeholder="Patient Name" required />
          <input value={medicine} onChange={e => setMedicine(e.target.value)} placeholder="Medicine" required />
          <textarea value={instructions} onChange={e => setInstructions(e.target.value)} placeholder="Instructions" required />
          <button type="submit">Save Prescription</button>
        </form>
      </div>
    </div>
  );
}
