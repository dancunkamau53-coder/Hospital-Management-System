import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useContext(AuthContext);

  return (
    <header className="sidebar">
      <h2>eCitizen Health Service</h2>
      <p className="sidebar-tagline">Government Health Portal</p>
      <nav>
        <Link to="/services">Services</Link>
        {!user && <Link to="/login">Login</Link>}
        {!user && <Link to="/register">Register</Link>}
        {user && user.role === 'PATIENT' && <Link to="/patient">Patient Portal</Link>}
        {user && user.role === 'DOCTOR' && <Link to="/doctor">Doctor Portal</Link>}
        {user && user.role === 'ADMIN' && <Link to="/admin">Admin Panel</Link>}
        {user && <button onClick={logout}>Logout</button>}
      </nav>
    </header>
  );
}
