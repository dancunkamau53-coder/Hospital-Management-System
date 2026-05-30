import api from '../api/axios';
export const getInvoices = () => api.get('/invoices');
export const submitPayment = (payment) => api.post('/payment', payment);
