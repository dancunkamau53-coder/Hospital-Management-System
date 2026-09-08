import api from '../api/axios';
export const getWards = () => api.get('/ward');
export const addAdmission = (admission) => api.post('/ward/admit', admission);
