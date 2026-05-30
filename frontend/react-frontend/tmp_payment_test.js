const axios = require('./node_modules/axios');
(async () => {
  try {
    const login = await axios.post('http://localhost:4000/api/auth/login', {
      credential: 'patient@hospital.gov',
      password: 'patient123'
    });

    const token = login.data.token;
    const payment = await axios.post('http://localhost:4000/api/payment', {
      amount: 600,
      method: 'M-Pesa'
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });

    console.log(JSON.stringify(payment.data, null, 2));
  } catch (err) {
    if (err.response) {
      console.error('ERROR', err.response.status, err.response.data);
    } else {
      console.error('ERROR', err.message);
    }
  }
})();
