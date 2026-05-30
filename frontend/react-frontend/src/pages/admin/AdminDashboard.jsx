import React, { useEffect, useState } from 'react';
import api from '../../api/axios';

export default function AdminDashboard() {
  const [report, setReport] = useState(null);

  useEffect(() => {
    api.get('/admin/reports').then((response) => setReport(response.data));
  }, []);

  return (
    <div>
      <div className="admin-dashboard">
        <h1>NHIF / SHA Style Admin Panel</h1>
        <p>Manage membership plans, paybill reconciliation, provider networks, and audit trails from a central admin console.</p>
        <div className="cards">
          <div className="card">
            <h3>Claims Management</h3>
            <p>Track submitted service claims and confirm reimbursements.</p>
          </div>
          <div className="card">
            <h3>Paybill Reconciliation</h3>
            <p>Reconcile M-Pesa paybill transactions tied to patient subscriptions.</p>
          </div>
          <div className="card">
            <h3>Provider Network</h3>
            <p>Manage SHA / NHIF network providers and benefit coverage.</p>
          </div>
          <div className="card">
            <h3>Audit & Compliance</h3>
            <p>Review portal events, subscription approvals, and security logs.</p>
          </div>
        </div>
      </div>
      {report ? (
        <div className="table-card">
          <h2>Admin Summary</h2>
          <div className="cards">
            <div className="card">
              <h3>Total Members</h3>
              <p>{report.totalPatients}</p>
            </div>
            <div className="card">
              <h3>Active Memberships</h3>
              <p>{report.activeMemberships}</p>
            </div>
            <div className="card">
              <h3>Pending Claims</h3>
              <p>{report.pendingClaims}</p>
            </div>
            <div className="card">
              <h3>Confirmed Claims</h3>
              <p>{report.confirmedClaims}</p>
            </div>
          </div>

          <div className="table-row" style={{ marginTop: '20px' }}>
            <div className="form-card">
              <h3>Scheme Status</h3>
              <p><strong>{report.schemeStatus}</strong></p>
              <p>Paybill: {report.paybillNumber}</p>
              <p>Use this number for all patient subscription and membership payments.</p>
            </div>
            <div className="form-card">
              <h3>Reconciliation Insights</h3>
              <p>Total Payments: KES {report.totalPayments}</p>
              <p>Claims submitted: {report.totalClaims}</p>
              <p>Provider network coverage active across the hospital.</p>
            </div>
          </div>

          <h3 style={{ marginTop: '18px' }}>Recent Audit Logs</h3>
          <table>
            <thead>
              <tr>
                <th>Event</th>
                <th>User</th>
                <th>Time</th>
              </tr>
            </thead>
            <tbody>
              {report.recentAudit.map((log, index) => (
                <tr key={index}>
                  <td>{log.event}</td>
                  <td>{log.user}</td>
                  <td>{new Date(log.time).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="form-card">
          <p>Loading admin report...</p>
        </div>
      )}
    </div>
  );
}
