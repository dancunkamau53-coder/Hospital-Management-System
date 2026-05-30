const fs = require('fs');
const path = require('path');

const DATA_PATH = path.join(__dirname, '../data.json');

function loadData() {
  try {
    return JSON.parse(fs.readFileSync(DATA_PATH, 'utf8'));
  } catch (error) {
    return { users: [], patients: [], appointments: [], medicines: [], prescriptions: [], records: [], payments: [], auditLogs: [] };
  }
}

function saveData(data) {
  fs.writeFileSync(DATA_PATH, JSON.stringify(data, null, 2), 'utf8');
}

function findUserByCredential(credential) {
  const data = loadData();
  return data.users.find(
    (user) => user.email === credential || user.nationalId === credential
  );
}

module.exports = {
  loadData,
  saveData,
  findUserByCredential
};
