import React, { useEffect, useState } from 'react';
import api from '../services/api';

export default function Patients() {
  const [patients, setPatients] = useState([]);
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [condition, setCondition] = useState('');

  useEffect(() => {
    async function load() {
      const res = await api.get('/patients');
      setPatients(res.data || []);
    }
    load();
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    const newP = { name, age: Number(age), condition };
    await api.post('/patients', newP);
    setPatients(prev => [...prev, newP]);
    setName(''); setAge(''); setCondition('');
  }

  return (
    <div>
      <h2>Register Patient</h2>
      <form id="patientForm" onSubmit={handleSubmit}>
        <input id="patientName" value={name} onChange={e => setName(e.target.value)} placeholder="Name" required />
        <input id="patientAge" value={age} onChange={e => setAge(e.target.value)} placeholder="Age" type="number" required />
        <input id="patientCondition" value={condition} onChange={e => setCondition(e.target.value)} placeholder="Condition" required />
        <button type="submit">Save Patient</button>
      </form>

      <h3>Patients List</h3>
      <table>
        <thead>
          <tr><th>Name</th><th>Age</th><th>Condition</th></tr>
        </thead>
        <tbody id="patientTableBody">
          {patients.map((p, i) => (
            <tr key={i}><td>{p.name}</td><td>{p.age}</td><td>{p.condition}</td></tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
