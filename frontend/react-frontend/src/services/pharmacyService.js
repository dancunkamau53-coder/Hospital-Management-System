import api from '../api/axios';
export const getMedicines = () => api.get('/medicines');
export const addMedicine = (medicine) => api.post('/medicines', medicine);
