import React, { useEffect, useState } from 'react';
import api from '../services/api';

export default function Appointments() {
  const [appointments, setAppointments] = useState([]);
  const [patient, setPatient] = useState('');
  const [doctor, setDoctor] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');

  useEffect(() => {
    async function load() {
      const res = await api.get('/appointments');
      setAppointments(res.data || []);
    }
    load();
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    const newA = { patient, doctor, date, time };
    await api.post('/appointments', newA);
    setAppointments(prev => [...prev, newA]);
    setPatient(''); setDoctor(''); setDate(''); setTime('');
  }

  return (
    <div>
      <h2>Book Appointment</h2>
      <form id="appointmentForm" onSubmit={handleSubmit}>
        <input id="appointmentPatient" value={patient} onChange={e => setPatient(e.target.value)} placeholder="Patient" required />
        <input id="appointmentDoctor" value={doctor} onChange={e => setDoctor(e.target.value)} placeholder="Doctor" required />
        <input id="appointmentDate" value={date} onChange={e => setDate(e.target.value)} type="date" required />
        <input id="appointmentTime" value={time} onChange={e => setTime(e.target.value)} type="time" required />
        <button type="submit">Book Appointment</button>
      </form>

      <h3>Appointments</h3>
      <table>
        <thead>
          <tr><th>Patient</th><th>Doctor</th><th>Date</th><th>Time</th></tr>
        </thead>
        <tbody id="appointmentTableBody">
          {appointments.map((a, i) => (
            <tr key={i}><td>{a.patient}</td><td>{a.doctor}</td><td>{a.date}</td><td>{a.time}</td></tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
