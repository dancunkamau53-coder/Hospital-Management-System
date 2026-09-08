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
        {!user && <Link to="/hospital/register">Register Hospital</Link>}
        {user && user.role === 'PATIENT' && <Link to="/patient">Patient Portal</Link>}
        {user && user.role === 'DOCTOR' && <Link to="/doctor">Doctor Portal</Link>}
        {user && user.role === 'ADMIN' && <Link to="/admin">Admin Panel</Link>}
        {user && user.role === 'SUPER_ADMIN' && <Link to="/admin/hospitals">Hospital Network</Link>}
        {user && ['ADMIN', 'SUPER_ADMIN'].includes(user.role) && <Link to="/hospital/settings">Hospital Settings</Link>}
        {user && <Link to="/appointments/manage">Appointments</Link>}
        {user && <Link to="/notifications">Notifications</Link>}
        {user && <Link to="/billing/invoices">Invoices</Link>}
        {user && <Link to="/search">Search</Link>}
        {user && <Link to="/account">Account & Privacy</Link>}
        {user && ['NURSE', 'PHARMACIST', 'RECEPTIONIST', 'CASHIER'].includes(user.role) && <Link to={`/${user.role.toLowerCase()}`}>Workspace</Link>}
        {user && <button onClick={logout}>Logout</button>}
      </nav>
    </header>
  );
}
