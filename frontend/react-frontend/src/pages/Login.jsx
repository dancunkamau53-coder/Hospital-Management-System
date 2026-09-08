import React, { useContext, useState } from 'react';
import { AuthContext } from '../context/AuthContext';

export default function Login() {
  const { login } = useContext(AuthContext);
  const [credential, setCredential] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError(null);

    try {
      const normalizedCredential = credential.trim();
      await login({
        email: normalizedCredential.includes('@') ? normalizedCredential : undefined,
        nationalId: normalizedCredential.includes('@') ? undefined : normalizedCredential,
        password,
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    }
  };

  return (
    <div className="auth-card form-card">
      <div className="privacy-badge">Private by default</div>
      <h1>eCitizen Health Portal Login</h1>
      <p>Sign in with your Email or National ID to access your protected health services.</p>
      <form onSubmit={handleSubmit}>
        <input
          value={credential}
          onChange={(e) => setCredential(e.target.value)}
          placeholder="Email or National ID"
          required
        />
        <input
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          type="password"
          placeholder="Password"
          required
        />
        <button type="submit">Login</button>
        {error && <p className="form-error">{error}</p>}
      </form>
      <p className="privacy-note">Your health information stays behind authentication. Do not share your password or verification code.</p>
    </div>
  );
}
