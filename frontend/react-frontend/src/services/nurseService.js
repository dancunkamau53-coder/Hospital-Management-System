import api from '../api/axios';
export const getVitals = (patientId) => api.get(`/nurse/vitals/${patientId}`);
export const addObservation = (observation) => api.post('/nurse/observation', observation);
