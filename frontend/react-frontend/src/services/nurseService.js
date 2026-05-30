import api from '../api/axios';
export const getVitals = () => api.get('/vitals');
export const addObservation = (observation) => api.post('/observations', observation);
