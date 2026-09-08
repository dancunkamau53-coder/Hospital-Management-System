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
      ,hospitalId: user.hospitalId || 1
    },
    process.env.JWT_SECRET || 'ecitizen-secret',
    { expiresIn: '8h' }
  );
};

const login = (req, res) => {
  const { credential, email, nationalId, password } = req.body;
  const resolvedCredential = String(credential || email || nationalId || '').trim();
  const user = findUserByCredential(resolvedCredential);

  if (!user || user.password !== password) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  const data = loadData();
  const hospital = data.hospitals.find((item) => item.id === (user.hospitalId || 1));
  if (user.role !== 'SUPER_ADMIN' && hospital && hospital.status !== 'APPROVED') {
    return res.status(403).json({ message: 'Your hospital account is awaiting approval' });
  }

  const token = createToken(user);
  res.json({ token, user: { id: user.id, role: user.role, name: user.name, email: user.email, hospitalId: user.hospitalId || 1, hospital } });
};

const register = (req, res) => {
  const { name, fullName, email, nationalId, password } = req.body;
  const resolvedName = name || fullName;
  const data = loadData();
  const exists = data.users.find(
    (user) => user.email === email || user.nationalId === nationalId
  );

  if (exists) {
    return res.status(400).json({ message: 'User already exists' });
  }

  const newUser = {
    id: data.users.length + 1,
    name: resolvedName,
    email,
    nationalId,
    password,
    role: 'PATIENT'
    ,hospitalId: 1
  };

  data.users.push(newUser);
  data.patients.push({ id: newUser.id, name: resolvedName, email, nationalId, hospitalId: 1, records: [], prescriptions: [] });
  data.auditLogs.push({ event: 'register', user: newUser.email, time: new Date().toISOString() });
  saveData(data);

  const token = createToken(newUser);
  res.status(201).json({ token, user: { id: newUser.id, role: newUser.role, name: newUser.name, email: newUser.email, hospitalId: newUser.hospitalId } });
};

module.exports = { login, register };