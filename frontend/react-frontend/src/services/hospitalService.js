import api from '../api/axios';
import axios from 'axios';

const publicApi = axios.create({ baseURL: process.env.REACT_APP_API_URL || '/api', headers: { 'Content-Type': 'application/json' } });
export const registerHospital = (payload) => publicApi.post('/hospitals/register', payload);
export const getHospitals = () => api.get('/hospitals');
export const approveHospital = (id) => api.patch(`/hospitals/${id}/approve`);
export const getHospitalSettings = () => api.get('/hospitals/settings');
export const updateHospitalSettings = (payload) => api.put('/hospitals/settings', payload);
export const inviteStaff = (payload) => api.post('/hospitals/invitations', payload);
export const getInvitations = () => api.get('/hospitals/invitations');
export const acceptInvitation = (payload) => publicApi.post('/hospitals/invitations/accept', payload);
