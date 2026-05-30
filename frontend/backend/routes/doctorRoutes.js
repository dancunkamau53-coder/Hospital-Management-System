const express = require('express');
const router = express.Router();
const { getDoctorPatients, getDoctorAppointments, addPrescription, updateRecord } = require('../controllers/doctorController');

router.get('/patients', getDoctorPatients);
router.get('/appointments', getDoctorAppointments);
router.post('/prescription', addPrescription);
router.post('/records', updateRecord);

module.exports = router;
