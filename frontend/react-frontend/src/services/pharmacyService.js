import api from '../api/axios';
export const getMedicines = () => api.get('/pharmacy/medications');
export const addMedicine = (medicine) => api.post('/pharmacy/medications', medicine);
