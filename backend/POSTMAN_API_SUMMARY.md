# Hospital Management System API Summary

This document summarizes the backend API routes available in the project.
Each route includes the HTTP method, path, authorization requirement, and request body details.

## Base URL

- `http://localhost:5000/api`

> Protected routes require `Authorization: Bearer <token>`.

---

## Auth

### POST /api/auth/register
- Creates a new user
- Public
- Body:
  - `fullName` (string)
  - `email` (string)
  - `password` (string)
  - `role` (string) - `ADMIN`, `DOCTOR`, `RECEPTIONIST`, `NURSE`, `PHARMACIST`, `CASHIER`, `PATIENT`
  - `hospitalId` (int, optional)
  - `specialty` (string, optional for DOCTOR)
  - `age` (int, optional for PATIENT)
  - `gender` (string, optional for PATIENT)
  - `phone` (string, optional)
  - `address` (string, optional)

### POST /api/auth/login
- Authenticates a user and returns JWT
- Public
- Body:
  - `email` (string)
  - `password` (string)

---

## Hospital

### POST /api/hospitals/register
- Register a new hospital and create an admin user
- Public
- Body:
  - `name` (string)
  - `email` (string)
  - `phone` (string)
  - `adminName` (string)
  - `adminEmail` (string)
  - `password` (string)

---

## Patients

### POST /api/patients
- Create a patient
- Roles: `ADMIN`, `RECEPTIONIST`
- Body:
  - `fullName` (string)
  - `age` (int)
  - `gender` (string)
  - `phone` (string)
  - `address` (string)

### GET /api/patients
- List patients
- Roles: `ADMIN`, `DOCTOR`, `NURSE`

### GET /api/patients/:id
- Get patient by ID
- Roles: `ADMIN`, `DOCTOR`

### PUT /api/patients/:id
- Update patient
- Role: `ADMIN`
- Body: same as create patient

### DELETE /api/patients/:id
- Delete patient
- Role: `ADMIN`

---

## Doctors

### POST /api/doctors
- Create a doctor
- Role: `ADMIN`
- Body:
  - `fullName` (string)
  - `specialty` (string)
  - `phone` (string)
  - `email` (string)

### GET /api/doctors
- List doctors
- Roles: `ADMIN`, `DOCTOR`

### GET /api/doctors/:id
- Get doctor by ID
- Roles: `ADMIN`, `DOCTOR`

### PUT /api/doctors/:id
- Update doctor
- Role: `ADMIN`

### DELETE /api/doctors/:id
- Delete doctor
- Role: `ADMIN`

---

## Appointments

### POST /api/appointments
- Create appointment
- Roles: `ADMIN`, `RECEPTIONIST`, `DOCTOR`
- Body:
  - `date` (datetime string)
  - `reason` (string)
  - `patientId` (int)
  - `doctorId` (int)

### GET /api/appointments
- List appointments
- Roles: `ADMIN`, `DOCTOR`, `RECEPTIONIST`

### GET /api/appointments/:id
- Get appointment by ID
- Roles: `ADMIN`, `DOCTOR`, `RECEPTIONIST`

### PATCH /api/appointments/:id/status
- Update appointment status
- Roles: `ADMIN`, `DOCTOR`
- Body:
  - `status` (string) - `PENDING`, `CONFIRMED`, `CANCELLED`

### DELETE /api/appointments/:id
- Delete appointment
- Role: `ADMIN`

---

## Medical Records

### POST /api/medical-records
- Create medical record
- Roles: `DOCTOR`, `ADMIN`
- Body:
  - `patientId` (int)
  - `diagnosis` (string)
  - `treatment` (string)
  - `notes` (string)

### GET /api/medical-records
- List medical records
- Roles: `ADMIN`, `DOCTOR`, `NURSE`

### GET /api/medical-records/:id
- Get medical record by ID
- Roles: `ADMIN`, `DOCTOR`, `NURSE`

### DELETE /api/medical-records/:id
- Delete medical record
- Role: `ADMIN`

---

## Prescriptions

### POST /api/prescriptions
- Create prescription
- Roles: `DOCTOR`, `ADMIN`
- Body:
  - `patientId` (int)
  - `medication` (string)
  - `dosage` (string)
  - `instructions` (string)

### GET /api/prescriptions
- List prescriptions
- Roles: `ADMIN`, `DOCTOR`, `PHARMACIST`

### GET /api/prescriptions/:id
- Get prescription by ID
- Roles: `ADMIN`, `DOCTOR`, `PHARMACIST`

### DELETE /api/prescriptions/:id
- Delete prescription
- Role: `ADMIN`

---

## Pharmacy

### POST /api/pharmacy/medications
- Add medication
- Roles: `ADMIN`, `PHARMACIST`
- Body:
  - `name` (string)
  - `category` (string)
  - `description` (string)
  - `stock` (int)
  - `unitPrice` (float)
  - `batchNumber` (string)
  - `supplier` (string)
  - `expiryDate` (date string)
  - `reorderLevel` (int)

### GET /api/pharmacy/medications
- List medications
- Roles: `ADMIN`, `PHARMACIST`, `DOCTOR`

### GET /api/pharmacy/medications/:id
- Get medication details
- Roles: `ADMIN`, `PHARMACIST`, `DOCTOR`

### PATCH /api/pharmacy/medications/:id
- Update medication metadata
- Roles: `ADMIN`, `PHARMACIST`
- Body: any of the medication fields above

### POST /api/pharmacy/medications/:id/restock
- Restock medication quantity
- Roles: `ADMIN`, `PHARMACIST`
- Body:
  - `quantity` (int)

### GET /api/pharmacy/low-stock
- List medications at or below reorder threshold
- Roles: `ADMIN`, `PHARMACIST`, `DOCTOR`

### GET /api/pharmacy/expired
- List expired medications
- Roles: `ADMIN`, `PHARMACIST`, `DOCTOR`

### GET /api/pharmacy/dispensations
- View dispensation history
- Roles: `ADMIN`, `PHARMACIST`

### POST /api/pharmacy/dispense
- Dispense medication
- Roles: `ADMIN`, `PHARMACIST`
- Body:
  - `medicationId` (int)
  - `patientId` (int)
  - `pharmacistId` (int, optional)
  - `quantity` (int)
  - `notes` (string)
  - `prescriptionId` (int, optional)

> Notification trigger: low-stock and near-expiry medication events will send admin alerts if email is configured.

### GET /api/pharmacy/dashboard
- Pharmacy dashboard
- Roles: `ADMIN`, `PHARMACIST`

---

## Billing

### POST /api/billing/invoice
- Create invoice
- Roles: `ADMIN`, `CASHIER`
- Body:
  - `patientId` (int)
  - `doctorId` (int, optional)
  - `totalAmount` (float)
  - `description` (string)

### GET /api/billing/invoices
- List invoices
- Roles: `ADMIN`, `CASHIER`

### POST /api/billing/payment
- Add payment to invoice
- Roles: `ADMIN`, `CASHIER`
- Body:
  - `invoiceId` (int)
  - `amount` (float)
  - `method` (string)
  - `reference` (string)

### GET /api/billing/dashboard
- Billing dashboard
- Roles: `ADMIN`, `CASHIER`

---

## Subscriptions

### POST /api/subscriptions
- Create subscription
- Role: `ADMIN`
- Body:
  - `hospitalId` (int, optional)
  - `plan` (string) - `BASIC`, `PRO`, `PREMIUM`

---

## Payments

### POST /api/payments/upload
- Upload subscription payment proof
- Role: authenticated user
- Body:
  - `subscriptionId` (int)
  - `amount` (float)
  - `reference` (string)
  - `proofImage` (string)

### PUT /api/payments/approve/:paymentId
- Approve payment
- Role: `ADMIN`

---

## Nurse Module

### POST /api/nurses/vitals
- Record vitals
- Role: `NURSE`
- Body:
  - `patientId` (int)
  - `temperature` (float)
  - `bloodPressure` (string)
  - `pulse` (int)
  - `respiratoryRate` (int)
  - `notes` (string)

### GET /api/nurses/vitals/:patientId
- Get patient vitals
- Roles: `NURSE`, `DOCTOR`

### POST /api/nurses/observation
- Add observation
- Role: `NURSE`
- Body:
  - `patientId` (int)
  - `observation` (string)
  - `actionTaken` (string)

---

## Ward & Admission

### POST /api/wards/ward
- Create ward
- Role: `ADMIN`
- Body:
  - `name` (string)
  - `capacity` (int)

### GET /api/wards
- List wards
- Roles: `ADMIN`, `NURSE`, `DOCTOR`

### POST /api/wards/bed
- Add bed to ward
- Role: `ADMIN`
- Body:
  - `wardId` (int)

### GET /api/wards/beds
- List beds
- Roles: `ADMIN`, `NURSE`, `DOCTOR`

### POST /api/wards/admit
- Admit patient to bed
- Roles: `NURSE`, `DOCTOR`
- Body:
  - `patientId` (int)
  - `bedId` (int)

### GET /api/wards/admissions
- List admissions
- Roles: `ADMIN`, `NURSE`, `DOCTOR`

### PUT /api/wards/discharge
- Discharge patient
- Roles: `NURSE`, `DOCTOR`
- Body:
  - `admissionId` (int)

---

## Portal Routes

### GET /api/doctor-portal/me
- Get doctor profile
- Role: `DOCTOR`

### GET /api/doctor-portal/appointments
- Get doctor appointments
- Role: `DOCTOR`

### GET /api/doctor-portal/patients
- Get doctor patients via appointments
- Role: `DOCTOR`

### GET /api/patient-portal/me
- Get patient profile
- Role: `PATIENT`

### GET /api/patient-portal/records
- Get patient medical records
- Role: `PATIENT`

### GET /api/patient-portal/appointments
- Get patient appointments
- Role: `PATIENT`

---

## Protected Test Route

### GET /api/protected/dashboard
- Test auth-protected route
- Role: authenticated user

---

## Admin Dashboard

### GET /api/admin/dashboard
- Get admin summary metrics
- Role: `ADMIN`

### GET /api/admin/audit-logs
- Get audit log history for current hospital
- Role: `ADMIN`

---

## Notes

- If you use Postman, set the collection environment variable `token` to the JWT returned from `/api/auth/login`.
- Protected endpoints require `Authorization: Bearer {{token}}`.
- Some actions are restricted by `role` and `hospitalId`.
