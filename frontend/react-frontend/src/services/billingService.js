import api from '../api/axios';
export const getInvoices = () => api.get('/billing/invoices');
export const submitPayment = (payment) => api.post('/billing/payment', payment);
