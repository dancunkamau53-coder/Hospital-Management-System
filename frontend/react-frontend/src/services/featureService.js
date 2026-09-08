import api from '../api/axios';

export const getProfile = () => api.get('/profile');
export const updateProfile = (payload) => api.put('/profile', payload);
export const getNotifications = () => api.get('/notifications');
export const updateAppointment = (id, payload) => api.patch(`/appointments/${id}`, payload);
export const getInvoices = () => api.get('/invoices');
export const searchRecords = (q, type = 'all') => api.get('/search', { params: { q, type } });
export const changePassword = (payload) => api.put('/security/password', payload);
export const getLoginHistory = () => api.get('/security/login-history');
export const verifyContact = (channel) => api.post(`/security/verify/${channel}`);
export const requestPasswordReset = (email) => api.post('/security/password-reset', { email });
export const refundInvoice = (id) => api.post(`/invoices/${id}/refund`);
