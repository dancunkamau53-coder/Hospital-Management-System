const fs = require('fs');
const path = require('path');

const base = path.resolve('c:/Users/server/Downloads/HMS PROJECT/frontend/react-frontend');
const root = path.resolve('c:/Users/server/Downloads/HMS PROJECT/frontend');

const dirs = [
  'src/api',
  'src/assets',
  'src/assets/avatars',
  'src/components/layout',
  'src/components/patients',
  'src/components/appointments',
  'src/components/pharmacy',
  'src/components/nurse',
  'src/components/ward',
  'src/components/billing',
  'src/components/auth',
  'src/components/common',
  'src/context',
  'src/hooks',
  'src/pages',
  'src/pages/patients',
  'src/pages/appointments',
  'src/pages/doctors',
  'src/pages/pharmacy',
  'src/pages/nurse',
  'src/pages/ward',
  'src/pages/billing',
  'src/pages/admin',
  'src/pages/errors',
  'src/routes',
  'src/services',
  'src/styles',
  'src/utils'
];

dirs.forEach(dir => {
  const target = path.join(base, dir);
  if (!fs.existsSync(target)) {
    fs.mkdirSync(target, { recursive: true });
    console.log('Created directory', target);
  }
});

const files = {
  'src/api/axios.js': `import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: { 'Content-Type': 'application/json' }
});

export default api;
`,
  'src/components/layout/Sidebar.jsx': `import React from 'react';

export default function Sidebar() {
  return <aside>Sidebar</aside>;
}
`,
  'src/components/layout/Navbar.jsx': `import React from 'react';

export default function Navbar() {
  return <header>Navbar</header>;
}
`,
  'src/components/layout/Footer.jsx': `import React from 'react';

export default function Footer() {
  return <footer>Footer</footer>;
}
`,
  'src/components/layout/DashboardLayout.jsx': `import React from 'react';

export default function DashboardLayout({ children }) {
  return <div className="dashboard-layout">{children}</div>;
}
`,
  'src/components/patients/PatientForm.jsx': `import React from 'react';

export default function PatientForm() {
  return <div>PatientForm</div>;
}
`,
  'src/components/patients/PatientTable.jsx': `import React from 'react';

export default function PatientTable() {
  return <div>PatientTable</div>;
}
`,
  'src/components/patients/PatientCard.jsx': `import React from 'react';

export default function PatientCard() {
  return <div>PatientCard</div>;
}
`,
  'src/components/patients/PatientDetails.jsx': `import React from 'react';

export default function PatientDetails() {
  return <div>PatientDetails</div>;
}
`,
  'src/components/appointments/AppointmentForm.jsx': `import React from 'react';

export default function AppointmentForm() {
  return <div>AppointmentForm</div>;
}
`,
  'src/components/appointments/AppointmentTable.jsx': `import React from 'react';

export default function AppointmentTable() {
  return <div>AppointmentTable</div>;
}
`,
  'src/components/appointments/AppointmentCalendar.jsx': `import React from 'react';

export default function AppointmentCalendar() {
  return <div>AppointmentCalendar</div>;
}
`,
  'src/components/pharmacy/MedicationForm.jsx': `import React from 'react';

export default function MedicationForm() {
  return <div>MedicationForm</div>;
}
`,
  'src/components/pharmacy/MedicationTable.jsx': `import React from 'react';

export default function MedicationTable() {
  return <div>MedicationTable</div>;
}
`,
  'src/components/pharmacy/DispenseForm.jsx': `import React from 'react';

export default function DispenseForm() {
  return <div>DispenseForm</div>;
}
`,
  'src/components/pharmacy/LowStockAlert.jsx': `import React from 'react';

export default function LowStockAlert() {
  return <div>LowStockAlert</div>;
}
`,
  'src/components/nurse/VitalForm.jsx': `import React from 'react';

export default function VitalForm() {
  return <div>VitalForm</div>;
}
`,
  'src/components/nurse/VitalsTable.jsx': `import React from 'react';

export default function VitalsTable() {
  return <div>VitalsTable</div>;
}
`,
  'src/components/nurse/ObservationForm.jsx': `import React from 'react';

export default function ObservationForm() {
  return <div>ObservationForm</div>;
}
`,
  'src/components/nurse/NurseDashboard.jsx': `import React from 'react';

export default function NurseDashboard() {
  return <div>NurseDashboard</div>;
}
`,
  'src/components/ward/WardForm.jsx': `import React from 'react';

export default function WardForm() {
  return <div>WardForm</div>;
}
`,
  'src/components/ward/BedTable.jsx': `import React from 'react';

export default function BedTable() {
  return <div>BedTable</div>;
}
`,
  'src/components/ward/AdmissionForm.jsx': `import React from 'react';

export default function AdmissionForm() {
  return <div>AdmissionForm</div>;
}
`,
  'src/components/ward/WardDashboard.jsx': `import React from 'react';

export default function WardDashboard() {
  return <div>WardDashboard</div>;
}
`,
  'src/components/billing/InvoiceForm.jsx': `import React from 'react';

export default function InvoiceForm() {
  return <div>InvoiceForm</div>;
}
`,
  'src/components/billing/InvoiceTable.jsx': `import React from 'react';

export default function InvoiceTable() {
  return <div>InvoiceTable</div>;
}
`,
  'src/components/billing/PaymentForm.jsx': `import React from 'react';

export default function PaymentForm() {
  return <div>PaymentForm</div>;
}
`,
  'src/components/billing/BillingDashboard.jsx': `import React from 'react';

export default function BillingDashboard() {
  return <div>BillingDashboard</div>;
}
`,
  'src/components/auth/LoginForm.jsx': `import React from 'react';

export default function LoginForm() {
  return <div>LoginForm</div>;
}
`,
  'src/components/auth/RegisterForm.jsx': `import React from 'react';

export default function RegisterForm() {
  return <div>RegisterForm</div>;
}
`,
  'src/components/auth/ProtectedRoute.jsx': `import React from 'react';

export default function ProtectedRoute({ children }) {
  return <>{children}</>;
}
`,
  'src/components/common/Loader.jsx': `import React from 'react';

export default function Loader() {
  return <div>Loading...</div>;
}
`,
  'src/components/common/Modal.jsx': `import React from 'react';

export default function Modal({ children }) {
  return <div className="modal">{children}</div>;
}
`,
  'src/components/common/Button.jsx': `import React from 'react';

export default function Button({ children, ...props }) {
  return <button {...props}>{children}</button>;
}
`,
  'src/components/common/Table.jsx': `import React from 'react';

export default function Table({ children }) {
  return <table>{children}</table>;
}
`,
  'src/components/common/EmptyState.jsx': `import React from 'react';

export default function EmptyState({ message }) {
  return <div>{message || 'No data available'}</div>;
}
`,
  'src/components/common/ErrorMessage.jsx': `import React from 'react';

export default function ErrorMessage({ message }) {
  return <div className="error">{message}</div>;
}
`,
  'src/context/AuthContext.jsx': `import React, { createContext, useState } from 'react';

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  return <AuthContext.Provider value={{ user, setUser }}>{children}</AuthContext.Provider>;
}
`,
  'src/context/HospitalContext.jsx': `import React, { createContext, useState } from 'react';

export const HospitalContext = createContext(null);

export function HospitalProvider({ children }) {
  const [settings] = useState({ name: 'MediFlow Hospital' });
  return <HospitalContext.Provider value={{ settings }}>{children}</HospitalContext.Provider>;
}
`,
  'src/context/ThemeContext.jsx': `import React, { createContext, useState } from 'react';

export const ThemeContext = createContext('light');

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState('light');
  return <ThemeContext.Provider value={{ theme, setTheme }}>{children}</ThemeContext.Provider>;
}
`,
  'src/hooks/useAuth.js': `import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

export default function useAuth() {
  return useContext(AuthContext);
}
`,
  'src/hooks/usePatients.js': `import { useState, useEffect } from 'react';
import api from '../api/axios';

export default function usePatients() {
  const [patients, setPatients] = useState([]);
  useEffect(() => {
    api.get('/patients').then(res => setPatients(res.data || []));
  }, []);
  return { patients, setPatients };
}
`,
  'src/hooks/useAppointments.js': `import { useState, useEffect } from 'react';
import api from '../api/axios';

export default function useAppointments() {
  const [appointments, setAppointments] = useState([]);
  useEffect(() => {
    api.get('/appointments').then(res => setAppointments(res.data || []));
  }, []);
  return { appointments, setAppointments };
}
`,
  'src/hooks/usePharmacy.js': `import { useState, useEffect } from 'react';
import api from '../api/axios';

export default function usePharmacy() {
  const [medicines, setMedicines] = useState([]);
  useEffect(() => {
    api.get('/medicines').then(res => setMedicines(res.data || []));
  }, []);
  return { medicines, setMedicines };
}
`,
  'src/hooks/useFetch.js': `import { useState, useEffect } from 'react';

export default function useFetch(url) {
  const [data, setData] = useState(null);
  useEffect(() => {
    fetch(url).then(res => res.json()).then(setData);
  }, [url]);
  return data;
}
`,
  'src/pages/Dashboard.jsx': `import React from 'react';

export default function Dashboard() {
  return <div>Dashboard</div>;
}
`,
  'src/pages/Login.jsx': `import React from 'react';

export default function Login() {
  return <div>Login</div>;
}
`,
  'src/pages/Register.jsx': `import React from 'react';

export default function Register() {
  return <div>Register</div>;
}
`,
  'src/pages/patients/Patients.jsx': `import React from 'react';

export default function Patients() {
  return <div>Patients page</div>;
}
`,
  'src/pages/patients/AddPatient.jsx': `import React from 'react';

export default function AddPatient() {
  return <div>AddPatient</div>;
}
`,
  'src/pages/patients/EditPatient.jsx': `import React from 'react';

export default function EditPatient() {
  return <div>EditPatient</div>;
}
`,
  'src/pages/patients/PatientProfile.jsx': `import React from 'react';

export default function PatientProfile() {
  return <div>PatientProfile</div>;
}
`,
  'src/pages/appointments/Appointments.jsx': `import React from 'react';

export default function Appointments() {
  return <div>Appointments page</div>;
}
`,
  'src/pages/appointments/ScheduleAppointment.jsx': `import React from 'react';

export default function ScheduleAppointment() {
  return <div>ScheduleAppointment</div>;
}
`,
  'src/pages/doctors/Doctors.jsx': `import React from 'react';

export default function Doctors() {
  return <div>Doctors</div>;
}
`,
  'src/pages/doctors/DoctorDashboard.jsx': `import React from 'react';

export default function DoctorDashboard() {
  return <div>DoctorDashboard</div>;
}
`,
  'src/pages/pharmacy/Pharmacy.jsx': `import React from 'react';

export default function PharmacyPage() {
  return <div>Pharmacy</div>;
}
`,
  'src/pages/pharmacy/Inventory.jsx': `import React from 'react';

export default function Inventory() {
  return <div>Inventory</div>;
}
`,
  'src/pages/pharmacy/DispenseMedication.jsx': `import React from 'react';

export default function DispenseMedication() {
  return <div>DispenseMedication</div>;
}
`,
  'src/pages/nurse/NurseDashboard.jsx': `import React from 'react';

export default function NurseDashboardPage() {
  return <div>NurseDashboard</div>;
}
`,
  'src/pages/nurse/Vitals.jsx': `import React from 'react';

export default function Vitals() {
  return <div>Vitals</div>;
}
`,
  'src/pages/nurse/Observations.jsx': `import React from 'react';

export default function Observations() {
  return <div>Observations</div>;
}
`,
  'src/pages/ward/Wards.jsx': `import React from 'react';

export default function Wards() {
  return <div>Wards</div>;
}
`,
  'src/pages/ward/Admissions.jsx': `import React from 'react';

export default function Admissions() {
  return <div>Admissions</div>;
}
`,
  'src/pages/ward/Beds.jsx': `import React from 'react';

export default function Beds() {
  return <div>Beds</div>;
}
`,
  'src/pages/billing/Billing.jsx': `import React from 'react';

export default function Billing() {
  return <div>Billing</div>;
}
`,
  'src/pages/billing/Invoices.jsx': `import React from 'react';

export default function Invoices() {
  return <div>Invoices</div>;
}
`,
  'src/pages/billing/Payments.jsx': `import React from 'react';

export default function Payments() {
  return <div>Payments</div>;
}
`,
  'src/pages/admin/AdminDashboard.jsx': `import React from 'react';

export default function AdminDashboard() {
  return <div>AdminDashboard</div>;
}
`,
  'src/pages/admin/Users.jsx': `import React from 'react';

export default function Users() {
  return <div>Users</div>;
}
`,
  'src/pages/admin/Hospitals.jsx': `import React from 'react';

export default function Hospitals() {
  return <div>Hospitals</div>;
}
`,
  'src/pages/admin/Analytics.jsx': `import React from 'react';

export default function Analytics() {
  return <div>Analytics</div>;
}
`,
  'src/pages/errors/NotFound.jsx': `import React from 'react';

export default function NotFound() {
  return <div>Page not found</div>;
}
`,
  'src/pages/errors/Unauthorized.jsx': `import React from 'react';

export default function Unauthorized() {
  return <div>Unauthorized</div>;
}
`,
  'src/routes/AppRoutes.jsx': `import React from 'react';

export default function AppRoutes() {
  return <div>AppRoutes</div>;
}
`,
  'src/services/authService.js': `import api from '../api/axios';

export function login(credentials) {
  return api.post('/auth/login', credentials);
}
`,
  'src/services/patientService.js': `import api from '../api/axios';

export function fetchPatients() {
  return api.get('/patients');
}
`,
  'src/services/appointmentService.js': `import api from '../api/axios';

export function fetchAppointments() {
  return api.get('/appointments');
}
`,
  'src/services/pharmacyService.js': `import api from '../api/axios';

export function fetchMedicines() {
  return api.get('/medicines');
}
`,
  'src/services/nurseService.js': `import api from '../api/axios';

export function fetchVitals() {
  return api.get('/nurse/vitals');
}
`,
  'src/services/wardService.js': `import api from '../api/axios';

export function fetchWards() {
  return api.get('/wards');
}
`,
  'src/services/billingService.js': `import api from '../api/axios';

export function fetchInvoices() {
  return api.get('/billing/invoices');
}
`,
  'src/styles/global.css': `:root {
  font-family: Inter, system-ui, sans-serif;
}
`,
  'src/styles/dashboard.css': `.dashboard-layout { padding: 1rem; }
`,
  'src/styles/forms.css': `form { display: grid; gap: 0.75rem; }
`,
  'src/styles/tables.css': `table { width: 100%; border-collapse: collapse; }
`,
  'src/styles/responsive.css': `@media (max-width: 768px) { body { font-size: 0.95rem; } }
`,
  'src/utils/formatDate.js': `export function formatDate(date) {
  return new Date(date).toLocaleDateString();
}
`,
  'src/utils/formatCurrency.js': `export function formatCurrency(value) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);
}
`,
  'src/utils/tokenManager.js': `export function getToken() {
  return localStorage.getItem('token');
}
`,
  'src/utils/validators.js': `export function isRequired(value) {
  return value !== undefined && value !== null && value !== '';
}
`,
  'src/utils/constants.js': `export const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';
`,
  'src/App.jsx': `import React from 'react';

export default function App() {
  return <div className="app">MediFlow HMS App</div>;
}
`,
  'src/main.jsx': `import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './styles/global.css';

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
`,
  'src/index.css': `body { margin: 0; padding: 0; }
`,
  'public/vite.svg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024"><path fill="#646cff" d="M512 0L0 1024h1024L512 0z"/></svg>`,
  '.gitignore': `node_modules/
dist/
.env
`,
  '.env': `VITE_API_URL=http://localhost:4000/api
`,
  'vite.config.js': `import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()]
});
`,
  'README.md': `# MediFlow React Frontend

This folder contains the React frontend for the MediFlow HMS project.

## Scripts

- npm run start
- npm run build
`,
  'package.json': `{
  "name": "mediflow-react-frontend",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "start": "vite",
    "build": "vite build"
  },
  "dependencies": {
    "axios": "^1.4.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^4.3.1",
    "vite": "^5.4.0"
  }
}
`
};

function writeFile(rel, content) {
  const target = path.join(base, rel);
  const dir = path.dirname(target);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  if (!fs.existsSync(target)) {
    fs.writeFileSync(target, content, 'utf8');
    console.log('Created file', target);
  }
}

Object.entries(files).forEach(([rel, content]) => writeFile(rel, content));

const rootFiles = {
  '.env': `VITE_API_URL=http://localhost:4000/api\n`,
  'eslint.config.js': `module.exports = {
  root: true,
  env: {
    browser: true,
    es2021: true,
    node: true
  },
  extends: [
    'eslint:recommended',
    'plugin:react/recommended'
  ],
  parserOptions: {
    ecmaVersion: 2021,
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true
    }
  },
  settings: {
    react: {
      version: 'detect'
    }
  },
  rules: {}
};
`
};

Object.entries(rootFiles).forEach(([rel, content]) => {
  const target = path.join(root, rel);
  if (!fs.existsSync(target)) {
    fs.writeFileSync(target, content, 'utf8');
    console.log('Created root file', target);
  }
});

const placeholders = [
  'src/assets/logo.png',
  'src/assets/hospital-bg.jpg'
];
placeholders.forEach(rel => {
  const target = path.join(base, rel);
  if (!fs.existsSync(target)) {
    fs.writeFileSync(target, '', 'utf8');
    console.log('Created placeholder file', target);
  }
});
