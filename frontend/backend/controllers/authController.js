const jwt = require('jsonwebtoken');
const { loadData, saveData, findUserByCredential } = require('../utils/dataStore');

const createToken = (user) => {
  return jwt.sign(
    {
      id: user.id,
      role: user.role,
      name: user.name,
      email: user.email,
      nationalId: user.nationalId
    },
    process.env.JWT_SECRET || 'ecitizen-secret',
    { expiresIn: '8h' }
  );
};

const login = (req, res) => {
  const { credential, password } = req.body;
  const user = findUserByCredential(credential);

  if (!user || user.password !== password) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  const token = createToken(user);
  res.json({ token, user: { id: user.id, role: user.role, name: user.name, email: user.email } });
};

const register = (req, res) => {
  const { name, email, nationalId, password } = req.body;
  const data = loadData();
  const exists = data.users.find(
    (user) => user.email === email || user.nationalId === nationalId
  );

  if (exists) {
    return res.status(400).json({ message: 'User already exists' });
  }

  const newUser = {
    id: data.users.length + 1,
    name,
    email,
    nationalId,
    password,
    role: 'PATIENT'
  };

  data.users.push(newUser);
  data.patients.push({ id: newUser.id, name, email, nationalId, records: [], prescriptions: [] });
  data.auditLogs.push({ event: 'register', user: newUser.email, time: new Date().toISOString() });
  saveData(data);

  const token = createToken(newUser);
  res.status(201).json({ token, user: { id: newUser.id, role: newUser.role, name: newUser.name, email: newUser.email } });
};

module.exports = { login, register };