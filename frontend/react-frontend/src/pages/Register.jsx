import React, { useContext, useState } from 'react';
import { AuthContext } from '../context/AuthContext';

export default function Register() {
  const { register } = useContext(AuthContext);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [nationalId, setNationalId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError(null);

    try {
      await register({ fullName: name, email, nationalId, password });
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <div className="auth-card form-card">
      <div className="privacy-badge">Private by default</div>
      <h1>eCitizen Health Registration</h1>
      <p>Create your official health portal account with your National ID. Registration is required before viewing health data.</p>
      <form onSubmit={handleSubmit}>
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Full name" required />
        <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" placeholder="Email" required />
        <input value={nationalId} onChange={(e) => setNationalId(e.target.value)} placeholder="National ID" required />
        <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" placeholder="Password" required />
        <button type="submit">Register</button>
        {error && <p className="form-error">{error}</p>}
      </form>
      <p className="privacy-note">We use your account to keep personal health information private and limit access to authorized users.</p>
    </div>
  );
}
