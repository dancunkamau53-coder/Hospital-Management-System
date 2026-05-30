import api from '../api/axios';
export const getWards = () => api.get('/wards');
export const addAdmission = (admission) => api.post('/admissions', admission);
