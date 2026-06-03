# API Reference (Generated)

This reference summarizes the primary endpoints exposed by the HMS backend and their required roles.

## Authentication

- `POST /api/auth/register` — Register a new user. Public.
- `POST /api/auth/login` — Login and receive JWT token. Public.

## Patients

- `GET /api/patients` — List patients. Roles: `ADMIN`, `RECEPTIONIST`, `DOCTOR`, `NURSE`.
- `POST /api/patients` — Create patient. Roles: `ADMIN`, `RECEPTIONIST`.
- `PUT /api/patients/:id` — Update patient. Roles: `ADMIN`.
- `DELETE /api/patients/:id` — Delete patient. Roles: `ADMIN`.

## Doctors

- `GET /api/doctors` — Public list of doctors.
- `POST /api/doctors` — Create doctor. Role: `ADMIN`.
- `PUT /api/doctors/:id`, `DELETE /api/doctors/:id` — Admin only.

## Appointments

- `GET /api/appointments` — List appointments. Roles: `ADMIN`, `DOCTOR`, `RECEPTIONIST`.
- `POST /api/appointments` — Create appointment. Roles: `PATIENT`, `RECEPTIONIST`, `ADMIN`.
- `PATCH /api/appointments/:id/status` — Update appointment status. Roles: `ADMIN`, `DOCTOR`.
- `DELETE /api/appointments/:id` — Admin only.

## Medical Records

- `POST /api/medical-records` — Create record. Roles: `DOCTOR`, `ADMIN`.
- `GET /api/medical-records/*` — Roles: `ADMIN`, `DOCTOR`, `NURSE` as applicable.

## Prescriptions

- `POST /api/prescriptions` — Create prescription. Roles: `DOCTOR`.
- `GET /api/prescriptions` — Roles: `ADMIN`, `DOCTOR`, `PHARMACIST`.
- `DELETE /api/prescriptions/:id` — Admin only.

## Pharmacy

- `GET /api/pharmacy/*`, `POST /api/pharmacy/*`, `PATCH /api/pharmacy/*` — Pharmacist/Admin workflows for inventory and dispensing.

## Payments & Billing

- `POST /api/payments` — Create payment. Roles: `PATIENT` (and other allowed roles via admin flows).
- `GET /api/payments/*`, `PUT /api/payments/*` — Admin/Cashier.
- `POST/GET /api/billing/*` — Cashier/Admin.

## Ward & Admissions

- `POST /api/ward/admit` — Admit patient (NURSE, DOCTOR, ADMIN)
- `POST /api/ward/discharge` — Discharge patient (NURSE, DOCTOR, ADMIN)

## Workflows

- `POST /api/workflows` — Create workflow (ADMIN)
- `GET /api/workflows` — List workflows (ADMIN, DOCTOR)
- `POST /api/workflows/:id/instantiate` — Instantiate workflow (ADMIN, DOCTOR)
- `POST /api/workflows/instances/:id/transition` — Transition instance (ADMIN, DOCTOR, NURSE)

For technical details, see the OpenAPI spec at `docs/openapi.yaml`.
