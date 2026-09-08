import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Login from '../pages/Login';
import Register from '../pages/Register';
import Services from '../pages/Services';
import PatientDashboard from '../pages/patient/Dashboard';
import DoctorDashboard from '../pages/doctor/Dashboard';
import AdminDashboard from '../pages/admin/AdminDashboard';
import AdminPayments from '../pages/admin/AdminPayments';
import PaymentSuccess from '../pages/PaymentSuccess';
import PaymentCancelled from '../pages/PaymentCancelled';
import Unauthorized from '../pages/errors/Unauthorized';
import ProtectedRoute from '../components/auth/ProtectedRoute';
import Account from '../pages/account/Account';
import ManageAppointments from '../pages/appointments/ManageAppointments';
import Notifications from '../pages/notifications/Notifications';
import Search from '../pages/search/Search';
import RoleDashboard from '../pages/operations/RoleDashboard';
import InvoiceHistory from '../pages/billing/InvoiceHistory';

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/account" element={<ProtectedRoute><Account /></ProtectedRoute>} />
      <Route path="/appointments/manage" element={<ProtectedRoute><ManageAppointments /></ProtectedRoute>} />
      <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
      <Route path="/search" element={<ProtectedRoute><Search /></ProtectedRoute>} />
      <Route path="/billing/invoices" element={<ProtectedRoute><InvoiceHistory /></ProtectedRoute>} />
      <Route
        path="/services"
        element={
          <ProtectedRoute>
            <Services />
          </ProtectedRoute>
        }
      />
      <Route
        path="/patient"
        element={
          <ProtectedRoute roles={[ 'PATIENT' ]}>
            <PatientDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/payment-success"
        element={
          <ProtectedRoute roles={[ 'PATIENT' ]}>
            <PaymentSuccess />
          </ProtectedRoute>
        }
      />
      <Route
        path="/payment-cancelled"
        element={
          <ProtectedRoute roles={[ 'PATIENT' ]}>
            <PaymentCancelled />
          </ProtectedRoute>
        }
      />
      <Route
        path="/doctor"
        element={
          <ProtectedRoute roles={[ 'DOCTOR' ]}>
            <DoctorDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin"
        element={
          <ProtectedRoute roles={[ 'ADMIN' ]}>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/payments"
        element={
          <ProtectedRoute roles={[ 'ADMIN' ]}>
            <AdminPayments />
          </ProtectedRoute>
        }
      />
      {['NURSE', 'PHARMACIST', 'RECEPTIONIST', 'CASHIER'].map((role) => (
        <Route
          key={role}
          path={`/${role.toLowerCase()}`}
          element={<ProtectedRoute roles={[role]}><RoleDashboard role={role} /></ProtectedRoute>}
        />
      ))}
      <Route path="/unauthorized" element={<Unauthorized />} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}
