import React, { useContext, useEffect, useMemo, useState } from 'react';
import { AuthContext } from '../../context/AuthContext';
import {
  getPatientRecords,
  getPatientAppointments,
  getPatientPayments,
  getPatientProfile,
  bookPatientAppointment,
  createSubscription,
  exportMedicalSummary,
  requestReferral
} from '../../services/patientService';

export default function PatientDashboard() {
  const { user } = useContext(AuthContext);
  const [patientData, setPatientData] = useState({ records: [], prescriptions: [] });
  const [appointments, setAppointments] = useState([]);
  const [payments, setPayments] = useState([]);
  const [profile, setProfile] = useState(null);
  const [appointment, setAppointment] = useState({ doctor: 'Dr. Alice Mwangi', date: '', time: '', reason: '' });
  const [subscriptionPlan, setSubscriptionPlan] = useState('BASIC');
  const [membershipStatus, setMembershipStatus] = useState('INACTIVE');
  const [membershipExpiry, setMembershipExpiry] = useState(null);
  const [subscriptionId, setSubscriptionId] = useState(null);
  const [message, setMessage] = useState('');
  const [notifications, setNotifications] = useState([
    { id: 1, title: 'Health ID activation', description: 'Your eCitizen health membership is ready to use once PayPal payment completes.' },
    { id: 2, title: 'New Consultation slots', description: 'New doctor consultation slots are available for the next 7 days.' },
    { id: 3, title: 'Document delivery', description: 'Your digital subscription certificate will appear in the portal after payment.' }
  ]);
  const [programs] = useState([
    { id: 1, name: 'MCH Care Support', description: 'Maternal and child health services under the national eCitizen program.' },
    { id: 2, name: 'Chronic Care Tracker', description: 'Enroll for follow-up reminders for diabetes, hypertension and long-term care.' },
    { id: 3, name: 'Immunization Schedule', description: 'View your personal vaccination program and renewal dates.' }
  ]);
  const [careTeam] = useState([
    { id: 1, name: 'Dr. Alice Mwangi', role: 'Primary Physician', phone: '+254 712 345678' },
    { id: 2, name: 'Nurse Jane Otieno', role: 'Care Coordinator', phone: '+254 723 987654' }
  ]);

  const upcomingAppointments = useMemo(
    () => appointments.filter((appointment) => new Date(appointment.date) >= new Date()).slice(0, 5),
    [appointments]
  );

  const totalPaid = useMemo(
    () => payments.reduce((sum, paymentItem) => sum + Number(paymentItem.amount || 0), 0),
    [payments]
  );

  useEffect(() => {
    getPatientRecords()
      .then((response) => {
        const data = response.data;
        setPatientData({
          records: Array.isArray(data) ? data : data.records || [],
          prescriptions: data.prescriptions || []
        });
      })
      .catch(() => {});
    getPatientAppointments().then((response) => setAppointments(response.data || [])).catch(() => {});
    getPatientPayments().then((response) => setPayments(response.data?.payments || [])).catch(() => {});
    getPatientProfile().then((response) => setProfile(response.data)).catch(() => {});
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

  const handleSubscribe = async (event) => {
    event && event.preventDefault();
    setMessage('');

    try {
      const payload = { plan: subscriptionPlan };
      const response = await createSubscription(payload);
      const subscription = response.data.subscription;
      setMembershipStatus(subscription?.status || 'PENDING');
      setMembershipExpiry(subscription?.endDate || null);
      setSubscriptionId(subscription?.id || null);
      const url = response.data.paypalApprovalUrl;
      if (url) {
        window.location.href = url;
        return;
      }
      setMessage('Subscription created. Please complete payment using the provided PayPal link.');
    } catch (error) {
      setMessage(error.response?.data?.message || 'Unable to start PayPal checkout.');
    }
  };

  const handleDownloadCertificate = () => {
    setMessage('Your subscription certificate will be available in the portal once PayPal payment is confirmed.');
  };

  const handleContactSupport = () => {
    setMessage('For help, email support@ecitizen.go.ke or call +254 700 000000.');
  };

  const handleExportSummary = async () => {
    setMessage('Preparing your medical summary export...');
    try {
      const response = await exportMedicalSummary();
      const data = response.data;
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `medical_summary_${profile?.id || 'patient'}.json`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      setMessage('Medical summary downloaded.');
    } catch (err) {
      setMessage('Unable to export summary.');
    }
  };

  const handleRequestReferral = async () => {
    setMessage('Submitting referral request...');
    try {
      const payload = { specialty: 'GENERAL', reason: 'Requested via patient dashboard' };
      const resp = await requestReferral(payload);
      setMessage(resp.data?.message || 'Referral request submitted. You will receive confirmation by email.');
    } catch (err) {
      setMessage(err.response?.data?.message || 'Unable to submit referral request.');
    }
  };

  const handleDownloadHealthID = () => {
    setMessage('Your eCitizen digital health ID will be made available once the payment is verified.');
  };

  const activeMemberSince = profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString() : 'N/A';
  const healthInsights = useMemo(() => {
    const totalVisits = patientData.records.length;
    const conditions = [...new Set(patientData.records.map((record) => record.diagnosis).filter(Boolean))];
    const nextRefill = patientData.prescriptions.find((prescription) => prescription.refillDate)?.refillDate || null;
    return {
      totalVisits,
      conditionCount: conditions.length,
      nextRefill
    };
  }, [patientData]);

  return (
    <div>
      <div className="admin-dashboard">
        <h1>eCitizen Health Dashboard</h1>
        <p>Welcome back, {user?.name || 'Patient'}. Access your government health services, consultations and membership information from this secure portal.</p>
      </div>

      <section className="dashboard-summary table-card">
        <h2>At a Glance</h2>
        <div className="cards">
          <div className="card">
            <h3>Membership Status</h3>
            <p>{membershipStatus}</p>
            {membershipExpiry && <p>Expires {new Date(membershipExpiry).toLocaleDateString()}</p>}
          </div>
          <div className="card">
            <h3>Selected Plan</h3>
            <p>{subscriptionPlan}</p>
          </div>
          <div className="card">
            <h3>Next Consultation</h3>
            <p>{upcomingAppointments[0] ? `${upcomingAppointments[0].doctor} • ${upcomingAppointments[0].date} ${upcomingAppointments[0].time}` : 'No appointment scheduled.'}</p>
          </div>
          <div className="card">
            <h3>Payments</h3>
            <p>KES {totalPaid}</p>
          </div>
          <div className="card">
            <h3>Patient Profile</h3>
            <p><strong>{profile?.fullName || user?.name || 'Unknown'}</strong></p>
            <p>Email: {profile?.email || user?.email || 'Not available'}</p>
            <p>Member since {activeMemberSince}</p>
          </div>
          <div className="card">
            <h3>Health Insights</h3>
            <p>Total government clinic visits: {healthInsights.totalVisits}</p>
            <p>Tracked conditions: {healthInsights.conditionCount || 'None recorded'}</p>
            <p>{healthInsights.nextRefill ? `Next refill due ${new Date(healthInsights.nextRefill).toLocaleDateString()}` : 'No refill scheduled'}</p>
          </div>
        </div>
      </section>

      <section className="table-card">
        <h2>Membership & Payments</h2>
        <div className="cards">
          <div className="card">
            <h3>Active Membership</h3>
            <p>eCitizen Health Membership • Portal + Email delivery</p>
            <div style={{ marginTop: '12px' }}>
              <label style={{ marginRight: '8px' }}>Plan:</label>
              <select value={subscriptionPlan} onChange={(e) => setSubscriptionPlan(e.target.value)}>
                <option value="BASIC">BASIC - KES 1,500</option>
                <option value="PRO">PRO - KES 3,000</option>
                <option value="PREMIUM">PREMIUM - KES 5,000</option>
              </select>
              <button style={{ marginLeft: '12px' }} onClick={handleSubscribe}>Subscribe / Pay</button>
            </div>
          </div>
          <div className="card">
            <h3>Transaction Summary</h3>
            <p>Total paid so far through your eCitizen membership.</p>
            <p style={{ marginTop: '10px', fontSize: '1.5rem', fontWeight: 700 }}>KES {totalPaid}</p>
          </div>
          <div className="card">
            <h3>Latest Prescription</h3>
            <p>{patientData.prescriptions[0]?.medication || 'No prescriptions yet.'}</p>
          </div>
        </div>
      </section>

      <section className="table-card">
        <h2>Portal Notifications</h2>
        <div className="cards">
          {notifications.map((note) => (
            <div className="card" key={note.id} style={{ flex: 1, minWidth: '220px' }}>
              <h3>{note.title}</h3>
              <p>{note.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="table-card">
        <h2>Appointments</h2>
        <div className="form-card">
          <h3>Book Consultation</h3>
          <p>Choose a specialist and reserve your government health consultation slot.</p>
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
      </section>

      <section className="table-card">
        <h2>Quick Actions</h2>
        <div className="table-row">
          <div className="form-card">
            <h3>Pay with PayPal</h3>
            <p>Complete your eCitizen health membership payment securely through PayPal.</p>
            <button type="button" onClick={handleSubscribe}>Pay Now</button>
            <button type="button" onClick={handleExportSummary} style={{ marginLeft: '10px' }}>Export Summary</button>
            <button type="button" onClick={handleRequestReferral} style={{ marginLeft: '10px' }}>Request Referral</button>
          </div>
          <div className="form-card">
            <h3>Support & Resources</h3>
            <p>Access your digital health card, programme details, and emergency contact support.</p>
            <button type="button" onClick={handleDownloadHealthID}>Download Health ID</button>
            <button type="button" onClick={handleContactSupport} style={{ marginLeft: '10px' }}>Contact Support</button>
            <p style={{ marginTop: '14px' }}><strong>Notifications sent to:</strong> {user?.email}</p>
          </div>
        </div>
      </section>

      <section className="table-card">
        <h2>Government Health Programs</h2>
        <div className="cards">
          {programs.map((program) => (
            <div className="card" key={program.id} style={{ minWidth: '220px' }}>
              <h3>{program.name}</h3>
              <p>{program.description}</p>
              <button type="button" onClick={() => setMessage(`You have opened details for ${program.name}.`)} style={{ marginTop: '14px' }}>
                View Details
              </button>
            </div>
          ))}
        </div>
      </section>

      <section className="table-card">
        <h2>My Care Team</h2>
        <div className="cards">
          {careTeam.map((member) => (
            <div className="card" key={member.id} style={{ minWidth: '220px' }}>
              <h3>{member.name}</h3>
              <p>{member.role}</p>
              <p>{member.phone}</p>
            </div>
          ))}
        </div>
      </section>

      {message && <div className="card" style={{ background: '#e9f6ff', marginTop: '16px' }}>{message}</div>}

      <div className="table-card">
        <h2>Upcoming Consultations</h2>
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
        <h2>Transaction History</h2>
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
