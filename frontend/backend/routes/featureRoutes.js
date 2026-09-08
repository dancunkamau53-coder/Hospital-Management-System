const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const {
  getProfile,
  updateProfile,
  getNotifications,
  updateAppointment,
  getInvoices,
  search,
  changePassword,
  loginHistory,
  requestPasswordReset,
  confirmPasswordReset,
  verifyContact,
  refundInvoice
} = require('../controllers/featureController');

router.use(authMiddleware);
router.get('/profile', getProfile);
router.put('/profile', updateProfile);
router.get('/notifications', getNotifications);
router.patch('/appointments/:id', updateAppointment);
router.get('/invoices', getInvoices);
router.get('/search', search);
router.put('/security/password', changePassword);
router.get('/security/login-history', loginHistory);
router.post('/security/password-reset', requestPasswordReset);
router.put('/security/password-reset/confirm', confirmPasswordReset);
router.post('/security/verify/:channel', verifyContact);
router.post('/invoices/:id/refund', refundInvoice);

module.exports = router;
