const express = require('express');
const router = express.Router();
const { getRecords, getAppointments, getPayments, bookAppointment, payBill } = require('../controllers/patientController');

router.get('/records', getRecords);
router.get('/appointments', getAppointments);
router.get('/payments', getPayments);
router.post('/appointment', bookAppointment);
router.post('/payment', payBill);

module.exports = router;
