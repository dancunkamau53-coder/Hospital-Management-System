import React, { useEffect, useState } from 'react';
import api from '../../api/axios';
import { updateAppointment } from '../../services/featureService';

export default function ManageAppointments() {
  const [appointments, setAppointments] = useState([]);
  const [message, setMessage] = useState('');

  const load = () => api.get('/patients/appointments').then((response) => setAppointments(response.data.appointments || [])).catch(() => setMessage('Unable to load appointments.'));
  useEffect(load, []);

  const edit = async (appointment) => {
    const date = window.prompt('New date (YYYY-MM-DD)', appointment.date);
    if (!date) return;
    const time = window.prompt('New time', appointment.time || '09:00');
    try {
      await updateAppointment(appointment.id, { date, time });
      setMessage('Appointment rescheduled.');
      load();
    } catch (error) {
      setMessage(error.response?.data?.message || 'Unable to reschedule appointment.');
    }
  };

  const cancel = async (appointment) => {
    if (!window.confirm('Cancel this appointment?')) return;
    try {
      await updateAppointment(appointment.id, { status: 'CANCELLED' });
      setMessage('Appointment cancelled.');
      load();
    } catch (error) {
      setMessage(error.response?.data?.message || 'Unable to cancel appointment.');
    }
  };

  return <div><div className="admin-dashboard"><h1>Appointments</h1><p>Review upcoming visits, reschedule when needed, or cancel an appointment.</p></div><section className="table-card"><div className="table-toolbar"><h2>Calendar view</h2><span>{appointments.length} appointments</span></div>{appointments.length ? <table><thead><tr><th>Date</th><th>Time</th><th>Doctor</th><th>Status</th><th>Actions</th></tr></thead><tbody>{appointments.map((appointment) => <tr key={appointment.id}><td>{appointment.date}</td><td>{appointment.time || 'Not set'}</td><td>{appointment.doctor}</td><td><span className={`status-pill ${appointment.status.toLowerCase()}`}>{appointment.status}</span></td><td><button type="button" onClick={() => edit(appointment)}>Reschedule</button>{appointment.status !== 'CANCELLED' && <button type="button" onClick={() => cancel(appointment)} style={{ marginLeft: '8px' }}>Cancel</button>}</td></tr>)}</tbody></table> : <p>No appointments scheduled.</p>}</section>{message && <div className="panel-note">{message}</div>}</div>;
}
