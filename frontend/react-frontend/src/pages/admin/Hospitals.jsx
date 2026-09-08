import React, { useEffect, useState } from 'react';
import { approveHospital, getHospitals } from '../../services/hospitalService';

export default function Hospitals() {
	const [hospitals, setHospitals] = useState([]);
	const [message, setMessage] = useState('');
	const load = () => getHospitals().then((response) => setHospitals(response.data || [])).catch((error) => setMessage(error.response?.data?.message || 'Unable to load hospitals.'));
	useEffect(() => { load(); }, []);
	const approve = async (hospital) => { try { await approveHospital(hospital.id); setMessage(`${hospital.name} approved.`); load(); } catch (error) { setMessage(error.response?.data?.message || 'Unable to approve hospital.'); } };
	return <div><div className="admin-dashboard"><h1>Hospital network</h1><p>Approve hospitals, monitor plans, and keep tenant access controlled.</p></div><section className="table-card"><table><thead><tr><th>Hospital</th><th>Email</th><th>Plan</th><th>Status</th><th>Action</th></tr></thead><tbody>{hospitals.map((hospital) => <tr key={hospital.id}><td>{hospital.name}</td><td>{hospital.email}</td><td>{hospital.plan}</td><td><span className={`status-pill ${hospital.status.toLowerCase()}`}>{hospital.status}</span></td><td>{hospital.status === 'PENDING' && <button type="button" onClick={() => approve(hospital)}>Approve</button>}</td></tr>)}</tbody></table>{!hospitals.length && <p>No hospital registrations yet.</p>}</section>{message && <div className="panel-note">{message}</div>}</div>;
}
