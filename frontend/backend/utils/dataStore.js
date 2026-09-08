const fs = require('fs');
const path = require('path');

const DATA_PATH = path.join(__dirname, '../data.json');

function loadData() {
  try {
    const data = JSON.parse(fs.readFileSync(DATA_PATH, 'utf8'));
    const hospitals = data.hospitals || [{
      id: 1,
      name: 'eCitizen Health Service',
      email: 'admin@hospital.gov',
      status: 'APPROVED',
      plan: 'BASIC',
      paybill: '200200',
      brandColor: '#1d427f'
    }];
    data.hospitals = hospitals;
    data.users = (data.users || []).map((user) => ({ ...user, hospitalId: user.hospitalId || 1 }));
    if (!data.users.some((user) => user.role === 'SUPER_ADMIN')) {
      data.users.push({ id: 999999, name: 'Platform Super Admin', email: 'superadmin@ecitizen.go.ke', password: 'ChangeMeImmediately123!', role: 'SUPER_ADMIN', hospitalId: 1 });
    }
    ['patients', 'appointments', 'medicines', 'prescriptions', 'records', 'payments'].forEach((key) => {
      data[key] = (data[key] || []).map((item) => ({ ...item, hospitalId: item.hospitalId || 1 }));
    });
    data.invitations = data.invitations || [];
    return data;
  } catch (error) {
    return { hospitals: [], users: [], patients: [], appointments: [], medicines: [], prescriptions: [], records: [], payments: [], invitations: [], auditLogs: [] };
  }
}

function saveData(data) {
  fs.writeFileSync(DATA_PATH, JSON.stringify(data, null, 2), 'utf8');
}

function findUserByCredential(credential) {
  const data = loadData();
  const normalizedCredential = String(credential || '').trim().toLowerCase();
  return data.users.find(
    (user) =>
      user.email?.toLowerCase() === normalizedCredential ||
      user.nationalId?.toLowerCase() === normalizedCredential
  );
}

module.exports = {
  loadData,
  saveData,
  findUserByCredential
};
