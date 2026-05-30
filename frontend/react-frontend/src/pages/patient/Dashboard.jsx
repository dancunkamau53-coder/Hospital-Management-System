import React, { useContext, useEffect, useMemo, useState } from 'react';
import { AuthContext } from '../../context/AuthContext';
import {
  getPatientRecords,
  getPatientAppointments,
  getPatientPayments,
  bookPatientAppointment,
  payPatientBill
} from '../../services/patientService';

export default function PatientDashboard() {
  const { user } = useContext(AuthContext);
  const [patientData, setPatientData] = useState({ records: [], prescriptions: [] });
  const [appointments, setAppointments] = useState([]);
  const [payments, setPayments] = useState([]);
  const [appointment, setAppointment] = useState({ doctor: 'Dr. Alice Mwangi', date: '', time: '', reason: '' });
  const [payment, setPayment] = useState({ amount: 0, method: 'M-Pesa', plan: 'eCitizen Health Plan', accountReference: user?.email || '' });
  const [message, setMessage] = useState('');

  const upcomingAppointments = useMemo(
    () => appointments.filter((appointment) => new Date(appointment.date) >= new Date()).slice(0, 5),
    [appointments]
  );

  const totalPaid = useMemo(
    () => payments.reduce((sum, paymentItem) => sum + Number(paymentItem.amount || 0), 0),
    [payments]
  );

  useEffect(() => {
    setPayment((prev) => ({ ...prev, accountReference: user?.email || prev.accountReference }));
  }, [user]);

  useEffect(() => {
    getPatientRecords().then((response) => setPatientData(response.data)).catch(() => {});
    getPatientAppointments().then((response) => setAppointments(response.data.appointments)).catch(() => {});
    getPatientPayments().then((response) => setPayments(response.data.payments)).catch(() => {});
  }, []);

  const handleAppointmentSubmit = async (event) => {
    event.preventDefault();
    setMessage('');

    try {
      const response = await bookPatientAppointment(appointment);
      setAppointments((prev) => [response.data, ...prev]);
      setMessage(`Appointment requested for ${response.data.date} at ${response.data.time}. Confirmation will be sent to your portal.`);
      setAppointment({ doctor: 'Dr. Alice Mwangi', date: '', time: '', reason: '' });
    } catch (error) {
      setMessage(error.response?.data?.message || 'Unable to book appointment.');
    }
  };

  const handlePaymentSubmit = async (event) => {
    event.preventDefault();
    setMessage('');

    try {
      const response = await payPatientBill(payment);
      setPayments((prev) => [response.data, ...prev]);
      setMessage(`Payment of KES ${response.data.amount} completed via ${response.data.method}. Subscription confirmation is now available in your portal and will be delivered to your registered email.`);
      setPayment({ amount: 0, method: 'M-Pesa', plan: 'eCitizen Health Plan', accountReference: user?.email || '' });
    } catch (error) {
      setMessage(error.response?.data?.message || 'Payment failed.');
    }
  };

  const handleCopyPaybill = async () => {
    const details = `Paybill: 200200 | Account: ${payment.accountReference || user?.email}`;
    try {
      await navigator.clipboard.writeText(details);
      setMessage('M-Pesa Paybill details copied to clipboard.');
    } catch {
      setMessage('Copy failed. Use Paybill 200200 and your registered email as account reference.');
    }
  };

  return (
    <div>
      <div className="admin-dashboard">
        <h1>Patient Portal</h1>
        <p>Welcome back, {user?.name || 'Patient'}. Manage appointments, paybills, prescriptions, and your subscription from one secure eCitizen dashboard.</p>
        <div className="cards">
          <div className="card">
            <h3>Upcoming Appointment</h3>
            <p>{upcomingAppointments[0] ? `${upcomingAppointments[0].doctor} • ${upcomingAppointments[0].date} ${upcomingAppointments[0].time}` : 'No appointment scheduled.'}</p>
          </div>
          <div className="card">
            <h3>Active Subscription</h3>
            <p>eCitizen Health Plan • Portal + Email delivery</p>
          </div>
          <div className="card">
            <h3>Total Paid</h3>
            <p>KES {totalPaid}</p>
          </div>
          <div className="card">
            <h3>Latest Prescription</h3>
            <p>{patientData.prescriptions[0]?.medication || 'No prescriptions yet.'}</p>
          </div>
        </div>
      </div>

      <div className="table-card">
        <h2>Appointment & Paybill Hub</h2>
        <div className="table-row">
          <div className="form-card">
            <h3>Book Appointment</h3>
            <p>Choose a specialist and reserve a consultation slot with the hospital.</p>
            <form onSubmit={handleAppointmentSubmit}>
              <select
                value={appointment.doctor}
                onChange={(e) => setAppointment({ ...appointment, doctor: e.target.value })}
              >
                <option value="Dr. Alice Mwangi">Dr. Alice Mwangi</option>
                <option value="Dr. Samuel Kimani">Dr. Samuel Kimani</option>
                <option value="Dr. Grace Wambui">Dr. Grace Wambui</option>
              </select>
              <input
                value={appointment.date}
                onChange={(e) => setAppointment({ ...appointment, date: e.target.value })}
                type="date"
                required
              />
              <input
                value={appointment.time}
                onChange={(e) => setAppointment({ ...appointment, time: e.target.value })}
                type="time"
                required
              />
              <input
                value={appointment.reason}
                onChange={(e) => setAppointment({ ...appointment, reason: e.target.value })}
                placeholder="Reason for visit"
                required
              />
              <button type="submit">Send Booking Request</button>
            </form>
          </div>

          <div className="form-card">
            <h3>M-Pesa Paybill Instructions</h3>
            <p>Use the hospital paybill to settle membership, consultation, and prescription fees.</p>
            <div className="card" style={{ padding: '12px', border: '1px solid #0b5ed7' }}>
              <p><strong>Paybill:</strong> 200200</p>
              <p><strong>Account:</strong> {payment.accountReference || user?.email}</p>
              <p><strong>Purpose:</strong> {payment.plan}</p>
            </div>
            <button type="button" onClick={handleCopyPaybill}>Copy Paybill Details</button>
            <form onSubmit={handlePaymentSubmit}>
              <input
                value={payment.amount}
                onChange={(e) => setPayment({ ...payment, amount: e.target.value })}
                type="number"
                min="100"
                placeholder="Amount in KES"
                required
              />
              <select
                value={payment.plan}
                onChange={(e) => setPayment({ ...payment, plan: e.target.value })}
              >
                <option value="eCitizen Health Plan">eCitizen Health Plan</option>
                <option value="eCitizen Premium Plus">eCitizen Premium Plus</option>
                <option value="eCitizen Family Cover">eCitizen Family Cover</option>
              </select>
              <button type="submit">Submit Payment</button>
            </form>
          </div>

          <div className="form-card">
            <h3>Subscription Delivery</h3>
            <p>Your membership and invoice are delivered through the portal and your registered email address.</p>
            <p>If you need a copy of your subscription agreement or invoice, it will appear in your dashboard after payment.</p>
            <p><strong>Notifications sent to:</strong> {user?.email}</p>
          </div>
        </div>
        {message && <div className="card" style={{ background: '#e9f6ff', marginTop: '16px' }}>{message}</div>}
      </div>

      <div className="table-card">
        <h2>Upcoming Appointments</h2>
        {appointments.length ? (
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Doctor</th>
                <th>Time</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {appointments.map((item) => (
                <tr key={item.id}>
                  <td>{item.date}</td>
                  <td>{item.doctor}</td>
                  <td>{item.time}</td>
                  <td>{item.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>No upcoming appointments.</p>
        )}
      </div>

      <div className="table-card">
        <h2>Payment History</h2>
        {payments.length ? (
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Amount</th>
                <th>Method</th>
                <th>Reference</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((paymentItem) => (
                <tr key={paymentItem.id}>
                  <td>{new Date(paymentItem.date).toLocaleDateString()}</td>
                  <td>KES {paymentItem.amount}</td>
                  <td>{paymentItem.method}</td>
                  <td>{paymentItem.reference}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>No payments recorded yet.</p>
        )}
      </div>

      <div className="table-card">
        <h2>Medical Records</h2>
        {patientData.records.length ? (
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Diagnosis</th>
                <th>Notes</th>
              </tr>
            </thead>
            <tbody>
              {patientData.records.map((record) => (
                <tr key={record.id}>
                  <td>{record.date}</td>
                  <td>{record.diagnosis}</td>
                  <td>{record.note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>No medical records available.</p>
        )}
      </div>

      <div className="table-card">
        <h2>Active Prescriptions</h2>
        {patientData.prescriptions.length ? (
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Medication</th>
                <th>Instructions</th>
              </tr>
            </thead>
            <tbody>
              {patientData.prescriptions.map((prescription) => (
                <tr key={prescription.id}>
                  <td>{prescription.date}</td>
                  <td>{prescription.medication}</td>
                  <td>{prescription.instructions}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>No active prescriptions.</p>
        )}
      </div>
    </div>
  );
}
