MediFlow React Frontend

This is a React + Axios frontend for the MediFlow hospital eCitizen portal.

Quick start:

1. cd react-frontend
2. npm install
3. npm start

The frontend expects a backend API at `http://localhost:4000/api`.

Roles supported:
- `PATIENT` portal
- `DOCTOR` portal
- `ADMIN` portal

Main backend API endpoints:
- `POST /auth/login`
- `POST /auth/register`
- `GET /services`
- `POST /appointment`
- `GET /records`
- `POST /payment`
- `GET /admin/reports`
- `GET /doctor/patients`
- `GET /doctor/appointments`

Seeded credentials:
- Admin: `admin@hospital.gov` / `admin123`
- Doctor: `doctor@hospital.gov` / `doctor123`
- Patient: `patient@hospital.gov` / `patient123`

Adjust `REACT_APP_API_URL` if your API is running on a different host.
