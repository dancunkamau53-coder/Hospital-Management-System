# PR Notes: eCitizen Hospital Portal Update

## Summary

This PR converts the existing hospital system into an eCitizen-style portal with:

- Single login for all roles using email or national ID
- JWT authentication with role-based access controls
- Patient, Doctor, and Admin dashboards
- Patient portal with appointment booking, medical record viewing, prescription review, payment stub, and report download placeholder
- Doctor portal with patient lists, appointment views, prescription creation, and record updates
- Admin portal with doctor management, reports, and audit logs
- Secure backend middleware and clearly defined API routes

## Files changed

- `backend/server.js`
- `backend/middleware/authMiddleware.js`
- `backend/middleware/roleMiddleware.js`
- `backend/controllers/authController.js`
- `backend/controllers/patientController.js`
- `backend/controllers/doctorController.js`
- `backend/controllers/adminController.js`
- `backend/controllers/serviceController.js`
- `backend/routes/authRoutes.js`
- `backend/routes/patientRoutes.js`
- `backend/routes/doctorRoutes.js`
- `backend/routes/adminRoutes.js`
- `backend/routes/serviceRoutes.js`
- `backend/utils/dataStore.js`
- `backend/data.json`
- `react-frontend/src/context/AuthContext.jsx`
- `react-frontend/src/routes/AppRoutes.jsx`
- `react-frontend/src/pages/Login.jsx`
- `react-frontend/src/pages/Register.jsx`
- `react-frontend/src/pages/Services.jsx`
- `react-frontend/src/pages/patient/Dashboard.jsx`
- `react-frontend/src/pages/doctor/Dashboard.jsx`
- `react-frontend/src/pages/admin/AdminDashboard.jsx`
- `react-frontend/src/components/Navbar.jsx`
- `react-frontend/src/components/Sidebar.jsx`
- `react-frontend/src/api/axios.js`
- `react-frontend/src/services/billingService.js`
- `react-frontend/src/services/appointmentService.js`
- `frontend/README.md`
- `react-frontend/README.md`
- `tests/test.js`

## Seeded user accounts

- `admin@hospital.gov` / `admin123`
- `doctor@hospital.gov` / `doctor123`
- `patient@hospital.gov` / `patient123`

## How to run

From `frontend`:

```bash
npm install
npm start
```

Open `http://localhost:3000` and log in with one of the seeded accounts.

## Test command

```bash
npm test
```

This runs a backend validation suite that checks login, patient appointment booking, payment submission, and admin report access.
