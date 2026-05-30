import React, { useEffect, useState } from 'react';
import api from '../services/api';

export default function Pharmacy() {
  const [medicines, setMedicines] = useState([]);
  const [name, setName] = useState('');
  const [stock, setStock] = useState('');

  useEffect(() => {
    async function load() {
      const res = await api.get('/medicines');
      setMedicines(res.data || []);
    }
    load();
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    const newM = { name, stock: Number(stock) };
    await api.post('/medicines', newM);
    setMedicines(prev => [...prev, newM]);
    setName(''); setStock('');
  }

  return (
    <div>
      <h2>Pharmacy System</h2>
      <form id="medicineForm" onSubmit={handleSubmit}>
        <input id="medicineName" value={name} onChange={e => setName(e.target.value)} placeholder="Medicine Name" required />
        <input id="medicineStock" value={stock} onChange={e => setStock(e.target.value)} placeholder="Stock" type="number" required />
        <button type="submit">Add Medicine</button>
      </form>

      <h3>Medicine Inventory</h3>
      <table>
        <thead><tr><th>Medicine</th><th>Stock</th></tr></thead>
        <tbody id="medicineTable">
          {medicines.map((m, i) => (
            <tr key={i}><td>{m.name}</td><td>{m.stock}</td></tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
