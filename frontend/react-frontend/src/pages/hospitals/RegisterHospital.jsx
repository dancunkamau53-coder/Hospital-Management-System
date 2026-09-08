import React, { useState } from 'react';
import { registerHospital } from '../../services/hospitalService';

export default function RegisterHospital() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', adminName: '', adminEmail: '', adminPassword: '' });
  const [message, setMessage] = useState('');
  const update = (key) => (event) => setForm({ ...form, [key]: event.target.value });
  const submit = async (event) => { event.preventDefault(); try { const response = await registerHospital(form); setMessage(response.data.message); setForm({ name: '', email: '', phone: '', adminName: '', adminEmail: '', adminPassword: '' }); } catch (error) { setMessage(error.response?.data?.message || 'Unable to register hospital.'); } };
  return <div><div className="admin-dashboard"><h1>Register your hospital</h1><p>Submit your hospital for approval. An administrator account will be created for your organization after approval.</p></div><section className="form-card"><form onSubmit={submit}><input value={form.name} onChange={update('name')} placeholder="Hospital name" required /><input value={form.email} onChange={update('email')} type="email" placeholder="Hospital email" required /><input value={form.phone} onChange={update('phone')} placeholder="Hospital phone" /><input value={form.adminName} onChange={update('adminName')} placeholder="Administrator full name" required /><input value={form.adminEmail} onChange={update('adminEmail')} type="email" placeholder="Administrator email" required /><input value={form.adminPassword} onChange={update('adminPassword')} type="password" minLength="8" placeholder="Administrator password" required /><button type="submit">Submit hospital registration</button></form>{message && <div className="panel-note">{message}</div>}</section></div>;
}
