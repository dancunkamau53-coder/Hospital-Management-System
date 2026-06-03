# Role → Endpoint Matrix

This document maps user roles to the API endpoints they are authorized to use in the HMS backend.

## Roles

- ADMIN
- DOCTOR
- PATIENT
- NURSE
- PHARMACIST
- RECEPTIONIST
- CASHIER

## Endpoint matrix

### ADMIN
- Patients: `GET /api/patients`, `POST /api/patients`, `PUT /api/patients/:id`, `DELETE /api/patients/:id`
- Doctors: `GET/POST/PUT/DELETE /api/doctors`
- Appointments: `GET /api/appointments`, `POST /api/appointments`, `GET /api/appointments/:id`, `PATCH /api/appointments/:id/status`, `DELETE /api/appointments/:id`
- Medical records: `POST/GET/DELETE /api/medical-records` 
- Prescriptions: `POST/GET/DELETE /api/prescriptions`
- Pharmacy: `POST/GET/PATCH /api/pharmacy/*`
- Payments/Billing: `POST/GET/PUT /api/payments/*`, `POST/GET /api/billing/*`
- Ward: `GET/POST/PUT /api/ward/*` (admit/discharge)
- Workflows & Subscriptions: `POST/GET /api/workflows`, `POST /api/workflows/:id/instantiate`, `POST /api/workflows/instances/:id/transition`, `GET /api/subscriptions/*`
- Audit/Hospital: `GET /api/audit/*`, `GET/POST /api/hospital/*`

### DOCTOR
- Doctor portal: `GET /api/doctor-portal/*`
- Appointments: `GET /api/appointments`, `GET /api/appointments/:id`, `PATCH /api/appointments/:id/status`
- Medical records: `POST/GET /api/medical-records`
- Prescriptions: `GET /api/prescriptions`, `POST /api/prescriptions`
- Pharmacy (view/dispense flows): `GET /api/pharmacy/*`
- Workflows: `GET /api/workflows`, `POST /api/workflows/:id/instantiate`, instance transition endpoints

### PATIENT
- Auth: `POST /api/auth/register`, `POST /api/auth/login`
- Patient portal: `GET /api/patient-portal/me`, `GET /api/patient-portal/records`, `GET /api/patient-portal/appointments`, `POST /api/patient-portal/request-referral`, `GET /api/patient-portal/export-summary`
- Appointments: create/book via `POST /api/appointments` (portal)
- Payments/Invoices: `POST /api/payments`, `GET /api/invoices`
- Prescriptions: `GET /api/prescriptions` (their own)

### NURSE
- Ward: `POST /api/ward/admit`, `POST /api/ward/discharge`, `GET /api/ward/*`, `PUT /api/ward/*`
- Medical records & workflows: `GET /api/medical-records/*`, `GET/POST` on workflow instances and transitions (where allowed)

### PHARMACIST
- Pharmacy: `POST/GET/PATCH /api/pharmacy/*` (inventory, dispense)
- Prescriptions: `GET /api/prescriptions/*` (fulfillment/dispense flows)

### RECEPTIONIST
- Patients: `POST /api/patients`, `GET /api/patients`
- Appointments: `POST /api/appointments`, `GET /api/appointments`, `GET /api/appointments/:id`

### CASHIER
- Billing & payments: `POST/GET /api/billing/*`, `POST/GET/PUT /api/payments/*`

## Notes
- Public endpoints exist for some resources (e.g., `GET /api/doctors`, `/api/patients/public/*`).
- Role enforcement is implemented via `authorizeRoles(...)` middleware in route definitions.
- `Doctor.specialty` is a free-text field; `Patient.gender` UI options: `Male`, `Female`, `Other`.
- Appointment statuses: `PENDING`, `CONFIRMED`, `CANCELLED`.

If you want this matrix exported as CSV or HTML, or split into per-role documentation files, tell me which format.
