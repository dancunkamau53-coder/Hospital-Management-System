require('dotenv').config();
const express = require('express');
const cors = require('cors');
const authMiddleware = require('./middleware/authMiddleware');
const authorizeRoles = require('./middleware/roleMiddleware');
const authRoutes = require('./routes/authRoutes');
const patientRoutes = require('./routes/patientRoutes');
const doctorRoutes = require('./routes/doctorRoutes');
const adminRoutes = require('./routes/adminRoutes');
const serviceRoutes = require('./routes/serviceRoutes');
const { getRecords, bookAppointment, payBill } = require('./controllers/patientController');
const { getReports } = require('./controllers/adminController');

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api', serviceRoutes);
app.use('/api/patients', authMiddleware, authorizeRoles('PATIENT', 'DOCTOR', 'ADMIN'), patientRoutes);
app.use('/api/doctor', authMiddleware, authorizeRoles('DOCTOR', 'ADMIN'), doctorRoutes);
app.use('/api/admin', authMiddleware, authorizeRoles('ADMIN'), adminRoutes);

app.post('/api/appointment', authMiddleware, authorizeRoles('PATIENT'), bookAppointment);
app.get('/api/records', authMiddleware, getRecords);
app.post('/api/payment', authMiddleware, authorizeRoles('PATIENT'), payBill);
app.get('/api/admin/reports', authMiddleware, authorizeRoles('ADMIN'), getReports);

app.get('/api/status', (req, res) => {
  res.json({ status: 'Hospital eCitizen API is running' });
});

const port = process.env.PORT || 4000;
app.listen(port, () => {
  console.log(`Hospital eCitizen backend listening on http://localhost:${port}`);
});
