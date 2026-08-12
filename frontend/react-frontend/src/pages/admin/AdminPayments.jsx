import React, { useEffect, useMemo, useState } from 'react';
import api from '../../api/axios';

export default function AdminPayments() {
  const [payments, setPayments] = useState([]);
  const [referrals, setReferrals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [modal, setModal] = useState({ open: false, action: null, id: null });

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
        setLoading(false);
      }
    };

    load();
  }, []);

  const filteredPayments = useMemo(() => {
    return payments.filter((payment) => {
      const matchesSearch =
        !search ||
        String(payment.id).includes(search) ||
        String(payment.subscriptionId || '').includes(search) ||
        String(payment.amount || '').includes(search);
      const matchesStatus = statusFilter === 'ALL' || payment.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [payments, search, statusFilter]);

  const openModal = (action, id) => {
    setModal({ open: true, action, id });
  };

  const confirmModal = async () => {
    const { action, id } = modal;
    setModal({ open: false, action: null, id: null });

    try {
      if (action === 'APPROVE') {
        await api.put(`/payments/approve/${id}`);
        setPayments((prev) =>
          prev.map((payment) => (payment.id === id ? { ...payment, status: 'APPROVED' } : payment))
        );
      } else if (action === 'REJECT') {
        await api.put(`/payments/reject/${id}`);
        setPayments((prev) =>
          prev.map((payment) => (payment.id === id ? { ...payment, status: 'REJECTED' } : payment))
        );
      }
    } catch (err) {
      console.error('Action error', err);
    }
  };

  const cancelModal = () => setModal({ open: false, action: null, id: null });

  return (
    <div className="page-shell">
      <div className="table-card">
        <h2>Subscription Payments</h2>

        <div style={{ display: 'flex', gap: '12px', marginBottom: '12px', alignItems: 'center' }}>
          <input
            placeholder="Search by id, subscription, amount"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="ALL">All</option>
            <option value="PENDING">Pending</option>
            <option value="APPROVED">Approved</option>
            <option value="REJECTED">Rejected</option>
          </select>
        </div>

        {loading ? (
          <p>Loading payments…</p>
        ) : filteredPayments.length ? (
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Subscription</th>
                <th>Amount</th>
                <th>Method</th>
                <th>Status</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredPayments.map((payment) => (
                <tr key={payment.id}>
                  <td>{payment.id}</td>
                  <td>{payment.subscriptionId}</td>
                  <td>KES {payment.amount}</td>
                  <td>{payment.method}</td>
                  <td>{payment.status}</td>
                  <td>{new Date(payment.createdAt).toLocaleString()}</td>
                  <td>
                    {payment.status === 'PENDING' && (
                      <>
                        <button onClick={() => openModal('APPROVE', payment.id)} style={{ marginRight: '8px' }}>
                          Approve
                        </button>
                        <button onClick={() => openModal('REJECT', payment.id)}>Reject</button>
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
              {referrals.map((referral) => (
                <tr key={referral.id}>
                  <td>{referral.id}</td>
                  <td>{referral.userId || referral.entityId}</td>
                  <td>{referral.details}</td>
                  <td>{new Date(referral.createdAt).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>No referral requests found.</p>
        )}
      </div>

      {modal.open && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <div style={{ background: '#fff', padding: 24, borderRadius: 12, width: 420 }}>
            <h3>Confirm {modal.action === 'APPROVE' ? 'Approval' : 'Rejection'}</h3>
            <p>
              Are you sure you want to {modal.action === 'APPROVE' ? 'approve' : 'reject'} payment #{modal.id}?
            </p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 12 }}>
              <button onClick={cancelModal}>Cancel</button>
              <button
                onClick={confirmModal}
                style={{ background: 'linear-gradient(135deg,#0d55d3,#0f63f1)', color: '#fff' }}
              >
                {modal.action === 'APPROVE' ? 'Approve' : 'Reject'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
