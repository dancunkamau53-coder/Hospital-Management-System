const express = require('express');
const router = express.Router();
const { getReports, addDoctor, getAuditLogs } = require('../controllers/adminController');

router.get('/reports', getReports);
router.post('/doctors', addDoctor);
router.get('/audit', getAuditLogs);

module.exports = router;
