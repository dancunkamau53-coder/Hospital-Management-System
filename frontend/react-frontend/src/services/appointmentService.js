import api from '../api/axios';
export const getAppointments = () => api.get('/appointments');
export const addAppointment = (appointment) => api.post('/appointment', appointment);
