const express = require('express');
const router = express.Router();

const { authMiddleware, authorizeRoles } = require('../middleware/authMiddleware');
const {
  create,
  list,
  get,
  instantiate,
  getInst,
  transition
} = require('../controllers/workflowController');

// Admin: create workflows
router.post('/', authMiddleware, authorizeRoles('ADMIN'), create);
// List workflows
router.get('/', authMiddleware, authorizeRoles('ADMIN', 'DOCTOR'), list);
// Get a workflow by ID
router.get('/:id', authMiddleware, authorizeRoles('ADMIN', 'DOCTOR'), get);
// Instantiate a workflow
router.post('/:id/instantiate', authMiddleware, authorizeRoles('ADMIN', 'DOCTOR'), instantiate);
// Get instance
router.get('/instances/:id', authMiddleware, authorizeRoles('ADMIN', 'DOCTOR', 'NURSE'), getInst);
// Transition instance
router.post('/instances/:id/transition', authMiddleware, authorizeRoles('ADMIN', 'DOCTOR', 'NURSE'), transition);

module.exports = router;
