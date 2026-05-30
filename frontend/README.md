# MediFlow HMS

This repository contains a hospital eCitizen portal with a React frontend and Express backend.

## What changed

- One login system for all users
- Role-based dashboards for `PATIENT`, `DOCTOR`, and `ADMIN`
- Secure JWT authentication
- Patient portal with appointment booking, medical records, prescriptions, payments, and report download placeholder
- Doctor portal with patients, appointments, prescriptions, and record updates
- Admin panel with doctor management, hospital reports, and audit logs

## Run the full app

From `frontend`:

```bash
npm install
npm start
```

This starts:
- backend on `http://localhost:4000`
- frontend on `http://localhost:3000`

The React dev server proxies `/api` requests to the backend.

## Seeded accounts

- Admin: `admin@hospital.gov` / `admin123`
- Doctor: `doctor@hospital.gov` / `doctor123`
- Patient: `patient@hospital.gov` / `patient123`

## API endpoints

- `POST /api/auth/login`
- `POST /api/auth/register`
- `GET /api/services`
- `POST /api/appointment`
- `GET /api/records`
- `POST /api/payment`
- `GET /api/patients/appointments`
- `GET /api/patients/payments`
- `GET /api/admin/reports`
- `GET /api/doctor/patients`
- `GET /api/doctor/appointments`

## Paybill / Subscription

- Hospital Paybill: `200200`
- Account reference: use your registered email address
- Subscription confirmation is delivered via portal and registered email
- The patient dashboard now includes M-Pesa Paybill instructions and a subscription hub

## Projects

- `react-frontend`: React + Axios frontend
- `backend`: Express API server

## Useful scripts

- `npm start` - start backend and frontend together
- `npm run start:backend` - launch backend only
- `npm run start:frontend` - launch frontend only
- `npm run build` - build the React app for production
- `npm test` - run the auth/payment/report test harness
