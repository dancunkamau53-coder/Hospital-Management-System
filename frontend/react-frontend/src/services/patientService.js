import api from '../api/axios';
export const getPatients = () => api.get('/patients');
export const addPatient = (patient) => api.post('/patients', patient);
export const getPatientRecords = () => api.get('/records');
export const getPatientAppointments = () => api.get('/patients/appointments');
export const getPatientPayments = () => api.get('/patients/payments');
export const bookPatientAppointment = (appointment) => api.post('/appointment', appointment);
export const payPatientBill = (payment) => api.post('/payment', payment);
