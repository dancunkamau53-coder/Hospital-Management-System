import React, { useState } from 'react';
import { searchRecords } from '../../services/featureService';

export default function Search() {
  const [query, setQuery] = useState('');
  const [type, setType] = useState('all');
  const [results, setResults] = useState([]);
  const [message, setMessage] = useState('');
  const submit = async (event) => { event.preventDefault(); if (!query.trim()) return; try { const response = await searchRecords(query, type); setResults(response.data || []); setMessage(''); } catch (error) { setMessage(error.response?.data?.message || 'Search failed.'); } };
  return <div><div className="admin-dashboard"><h1>Search records</h1><p>Find patients, doctors, appointments, or medicines you are authorized to view.</p><form onSubmit={submit} className="search-form"><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search by name, email, date, or status" /><select value={type} onChange={(event) => setType(event.target.value)}><option value="all">Everything</option><option value="patients">Patients</option><option value="doctors">Doctors</option><option value="appointments">Appointments</option><option value="medicines">Medicines</option></select><button type="submit">Search</button></form></div>{message && <div className="panel-note">{message}</div>}<section className="cards">{results.map((result) => <article className="card" key={`${result.type}-${result.id}`}><h3>{result.title}</h3><p>{result.type} · {result.detail}</p></article>)}{query && !results.length && !message && <div className="table-card"><p>No matching records.</p></div>}</section></div>;
}
