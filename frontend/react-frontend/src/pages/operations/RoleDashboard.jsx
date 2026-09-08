import React, { useEffect, useState } from 'react';
import api from '../../api/axios';

const roleContent = { NURSE: ['Vitals and observations', 'Admissions and ward care', 'Patient follow-up'], PHARMACIST: ['Medication inventory', 'Dispensing queue', 'Low-stock alerts'], RECEPTIONIST: ['Patient registration', 'Appointment calendar', 'Check-in queue'], CASHIER: ['Invoices and receipts', 'Payment verification', 'Refund requests'] };

export default function RoleDashboard({ role }) {
  const [report, setReport] = useState(null);
  const items = roleContent[role] || ['Patients', 'Appointments', 'Reports'];
  useEffect(() => { api.get('/admin/reports').then((response) => setReport(response.data)).catch(() => {}); }, []);
  return <div><div className="admin-dashboard"><h1>{role.charAt(0) + role.slice(1).toLowerCase()} workspace</h1><p>Role-based tools and information are limited to your authorized responsibilities.</p></div><section className="cards">{items.map((item) => <article className="card" key={item}><h3>{item}</h3><p>Open the {item.toLowerCase()} workspace and keep patient care moving.</p></article>)}</section>{report && <section className="table-card"><h2>Operational summary</h2><div className="cards"><div className="card"><h3>Patients</h3><p>{report.totalPatients}</p></div><div className="card"><h3>Appointments</h3><p>{report.totalAppointments}</p></div><div className="card"><h3>Pending</h3><p>{report.pendingClaims}</p></div></div></section>}</div>;
}
