const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const authorizeRoles = require('../middleware/roleMiddleware');
const {
  registerHospital,
  listHospitals,
  approveHospital,
  updateSettings,
  getSettings,
  inviteStaff,
  listInvitations,
  acceptInvitation
} = require('../controllers/hospitalController');

router.post('/register', registerHospital);
router.post('/invitations/accept', acceptInvitation);
router.get('/', authMiddleware, authorizeRoles('SUPER_ADMIN'), listHospitals);
router.patch('/:id/approve', authMiddleware, authorizeRoles('SUPER_ADMIN'), approveHospital);
router.get('/settings', authMiddleware, getSettings);
router.put('/settings', authMiddleware, authorizeRoles('ADMIN', 'SUPER_ADMIN'), updateSettings);
router.post('/invitations', authMiddleware, authorizeRoles('ADMIN', 'SUPER_ADMIN'), inviteStaff);
router.get('/invitations', authMiddleware, authorizeRoles('ADMIN', 'SUPER_ADMIN'), listInvitations);

module.exports = router;
