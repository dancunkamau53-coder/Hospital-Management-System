import React, { useEffect, useState } from 'react';
import api from '../../api/axios';

export default function AdminPayments() {
  const [payments, setPayments] = useState([]);
  const [referrals, setReferrals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [pRes, rRes] = await Promise.all([
          api.get('/admin/payments'),
          api.get('/admin/referrals')
        ]);
        setPayments(pRes.data.payments || []);
        setReferrals(rRes.data.referrals || []);
      } catch (err) {
        console.error('Admin list load error', err);
      } finally {
            const [search, setSearch] = useState('');
            const [statusFilter, setStatusFilter] = useState('ALL');
            const [modal, setModal] = useState({ open: false, action: null, id: null });
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleApprove = async (id) => {
    try {
      await api.put(`/payments/approve/${id}`);
      setPayments((prev) => prev.map((p) => (p.id === id ? { ...p, status: 'APPROVED' } : p)));
    } catch (err) {
      console.error('Approve error', err);
    }
  };

  const handleReject = async (id) => {
    try {
      await api.put(`/payments/reject/${id}`);
      setPayments((prev) => prev.map((p) => (p.id === id ? { ...p, status: 'REJECTED' } : p)));
            const handleApprove = async (id) => {
              setModal({ open: true, action: 'APPROVE', id });
            };

            const handleReject = async (id) => {
              setModal({ open: true, action: 'REJECT', id });
            };

            const confirmModal = async () => {
              const { action, id } = modal;
              setModal({ ...modal, open: false });
              try {
                if (action === 'APPROVE') {
                  await api.put(`/payments/approve/${id}`);
                  setPayments((prev) => prev.map((p) => (p.id === id ? { ...p, status: 'APPROVED' } : p)));
                } else if (action === 'REJECT') {
                  await api.put(`/payments/reject/${id}`);
                  setPayments((prev) => prev.map((p) => (p.id === id ? { ...p, status: 'REJECTED' } : p)));
                }
              } catch (err) {
                console.error('Action error', err);
              }
            };

            const cancelModal = () => setModal({ open: false, action: null, id: null });
          <table>
            <thead>
              <tr>
            const filteredPayments = payments.filter((p) => {
              const matchesSearch = !search || String(p.id).includes(search) || String(p.subscriptionId).includes(search) || String(p.amount).includes(search);
              const matchesStatus = statusFilter === 'ALL' || p.status === statusFilter;
              return matchesSearch && matchesStatus;
            });
                <th>ID</th>
                <th>Subscription</th>
                <th>Amount</th>
                <th>Method</th>
                <th>Status</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((p) => (
                  <div style={{ display: 'flex', gap: '12px', marginBottom: '12px', alignItems: 'center' }}>
                    <input placeholder="Search by id, subscription, amount" value={search} onChange={(e) => setSearch(e.target.value)} />
                    <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                      <option value="ALL">All</option>
                      <option value="PENDING">Pending</option>
                      <option value="APPROVED">Approved</option>
                      <option value="REJECTED">Rejected</option>
                    </select>
                  </div>
                <tr key={p.id}>
                  <td>{p.id}</td>
                  <td>{p.subscriptionId}</td>
                  <td>KES {p.amount}</td>
                  <td>{p.method}</td>
                  <td>{p.status}</td>
                  <td>{new Date(p.createdAt).toLocaleString()}</td>
                  <td>
                    {p.status === 'PENDING' && (
                      <>
                        <button onClick={() => handleApprove(p.id)} style={{ marginRight: '8px' }}>Approve</button>
                        <button onClick={() => handleReject(p.id)}>Reject</button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>No subscription payments recorded.</p>
        )}
      </div>

      <div className="table-card">
        <h2>Referral Requests</h2>
        {referrals.length ? (
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>User</th>
                <th>Details</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {referrals.map((r) => (
                <tr key={r.id}>
                  <td>{r.id}</td>
                  <td>{r.userId || r.entityId}</td>
                  <td>{r.details}</td>
                  <td>{new Date(r.createdAt).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>No referral requests found.</p>
        )}
      </div>
      {modal.open && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: '#fff', padding: 24, borderRadius: 12, width: 420 }}>
            <h3>Confirm {modal.action === 'APPROVE' ? 'Approval' : 'Rejection'}</h3>
            <p>Are you sure you want to {modal.action === 'APPROVE' ? 'approve' : 'reject'} payment #{modal.id}?</p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 12 }}>
              <button onClick={cancelModal}>Cancel</button>
              <button onClick={confirmModal} style={{ background: 'linear-gradient(135deg,#0d55d3,#0f63f1)', color: '#fff' }}>{modal.action === 'APPROVE' ? 'Approve' : 'Reject'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
