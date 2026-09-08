import React, { useEffect, useState } from 'react';
import { changePassword, getLoginHistory, getProfile, requestPasswordReset, updateProfile, verifyContact } from '../../services/featureService';

export default function Account() {
  const [profile, setProfile] = useState({ name: '', email: '', phone: '', address: '', emergencyContact: '', profilePhoto: '' });
  const [password, setPassword] = useState({ currentPassword: '', newPassword: '' });
  const [history, setHistory] = useState([]);
  const [message, setMessage] = useState('');

  useEffect(() => {
    getProfile().then((response) => setProfile((current) => ({ ...current, ...response.data }))).catch(() => setMessage('Unable to load your profile.'));
    getLoginHistory().then((response) => setHistory(response.data || [])).catch(() => {});
  }, []);

  const saveProfile = async (event) => {
    event.preventDefault();
    try {
      const response = await updateProfile(profile);
      setProfile(response.data);
      setMessage('Profile updated successfully.');
    } catch (error) {
      setMessage(error.response?.data?.message || 'Unable to update profile.');
    }
  };

  const savePassword = async (event) => {
    event.preventDefault();
    try {
      const response = await changePassword(password);
      setMessage(response.data.message);
      setPassword({ currentPassword: '', newPassword: '' });
    } catch (error) {
      setMessage(error.response?.data?.message || 'Unable to change password.');
    }
  };

  const verify = async (channel) => {
    try {
      const response = await verifyContact(channel);
      setMessage(response.data.message);
    } catch (error) {
      setMessage(error.response?.data?.message || `Unable to verify ${channel}.`);
    }
  };

  const resetPassword = async () => {
    try {
      const response = await requestPasswordReset(profile.email);
      setMessage(`${response.data.message} Check your reset service for the code.`);
    } catch (error) {
      setMessage(error.response?.data?.message || 'Unable to request a password reset.');
    }
  };

  return (
    <div>
      <div className="admin-dashboard"><h1>Account & Privacy</h1><p>Manage your contact details and protect access to your health information.</p></div>
      <div className="table-row">
        <section className="form-card"><h2>Personal profile</h2><form onSubmit={saveProfile}>
          <input value={profile.name || ''} onChange={(event) => setProfile({ ...profile, name: event.target.value })} placeholder="Full name" required />
          <input value={profile.email || ''} readOnly placeholder="Email" />
          <input value={profile.phone || ''} onChange={(event) => setProfile({ ...profile, phone: event.target.value })} placeholder="Phone number" />
          <div className="inline-actions"><button type="button" onClick={() => verify('email')}>Verify email</button><span>{profile.emailVerified ? 'Verified' : 'Not verified'}</span></div>
          <input value={profile.address || ''} onChange={(event) => setProfile({ ...profile, address: event.target.value })} placeholder="Address" />
          <input value={profile.emergencyContact || ''} onChange={(event) => setProfile({ ...profile, emergencyContact: event.target.value })} placeholder="Emergency contact" />
          <input value={profile.profilePhoto || ''} onChange={(event) => setProfile({ ...profile, profilePhoto: event.target.value })} placeholder="Profile photo URL" />
          <button type="submit">Save profile</button>
        </form></section>
        <section className="form-card"><h2>Change password</h2><form onSubmit={savePassword}>
          <input type="password" value={password.currentPassword} onChange={(event) => setPassword({ ...password, currentPassword: event.target.value })} placeholder="Current password" required />
          <input type="password" value={password.newPassword} onChange={(event) => setPassword({ ...password, newPassword: event.target.value })} placeholder="New password (8+ characters)" required minLength="8" />
          <button type="submit">Update password</button>
        </form><h2 style={{ marginTop: '28px' }}>Recent account activity</h2>{history.length ? <ul>{history.map((item, index) => <li key={`${item.time}-${index}`}>{item.event} · {new Date(item.time).toLocaleString()}</li>)}</ul> : <p>No recent activity.</p>}</section>
      </div>
      <button type="button" onClick={resetPassword} style={{ marginTop: '18px' }}>Send password reset code</button>
      {message && <div className="panel-note">{message}</div>}
    </div>
  );
}
