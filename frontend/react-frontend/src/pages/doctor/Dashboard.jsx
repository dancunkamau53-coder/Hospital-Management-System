import React, { useEffect, useState } from 'react';
import api from '../../api/axios';

export default function DoctorDashboard() {
  const [patients, setPatients] = useState([]);
  const [appointments, setAppointments] = useState([]);

  useEffect(() => {
    api.get('/doctor/patients').then((response) => setPatients(response.data));
    api.get('/doctor/appointments').then((response) => setAppointments(response.data));
  }, []);

  return (
    <div>
      <div className="admin-dashboard">
        <h1>Doctor Portal</h1>
        <div className="cards">
          <div className="card">
            <h3>View Patients</h3>
            <p>Access patient files and treatment history.</p>
          </div>
          <div className="card">
            <h3>Write Diagnosis</h3>
            <p>Add care instructions and medical notes.</p>
          </div>
          <div className="card">
            <h3>Add Prescriptions</h3>
            <p>Issue prescriptions directly from your dashboard.</p>
          </div>
          <div className="card">
            <h3>Update Records</h3>
            <p>Keep patient records current and secure.</p>
          </div>
        </div>
      </div>
      <div className="table-card">
        <h2>Assigned Patients</h2>
        {patients.length ? (
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>National ID</th>
              </tr>
            </thead>
            <tbody>
              {patients.map((patient) => (
                <tr key={patient.id}>
                  <td>{patient.name}</td>
                  <td>{patient.email}</td>
                  <td>{patient.nationalId}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>No patients assigned yet.</p>
        )}
      </div>
      <div className="table-card">
        <h2>Upcoming Appointments</h2>
        {appointments.length ? (
          <table>
            <thead>
              <tr>
                <th>Patient</th>
                <th>Doctor</th>
                <th>Date</th>
                <th>Time</th>
              </tr>
            </thead>
            <tbody>
              {appointments.map((appointment) => (
                <tr key={appointment.id}>
                  <td>{appointment.patientName}</td>
                  <td>{appointment.doctor}</td>
                  <td>{appointment.date}</td>
                  <td>{appointment.time}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>No appointments yet.</p>
        )}
      </div>
    </div>
  );
}
