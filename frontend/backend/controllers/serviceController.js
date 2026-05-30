const getServices = (req, res) => {
  res.json([
    { id: 1, title: 'Appointment Booking', description: 'Book a hospital appointment quickly and securely.' },
    { id: 2, title: 'Medical Records', description: 'View your medical history and lab reports.' },
    { id: 3, title: 'Billing & Payments', description: 'Pay your hospital bill with secure payment flows.' },
    { id: 4, title: 'Doctor Portal', description: 'Doctors manage patients, prescriptions, and records.' },
    { id: 5, title: 'Admin Portal', description: 'Hospital admins manage doctors, patients, and reports.' }
  ]);
};

module.exports = { getServices };