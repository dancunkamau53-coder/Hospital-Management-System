const { spawn } = require('child_process');
const path = require('path');
const http = require('http');
const net = require('net');

const rootDir = path.resolve(__dirname, '..');

function getFreePort() {
  return new Promise((resolve, reject) => {
    const server = net.createServer();
    server.unref();
    server.on('error', reject);
    server.listen(0, () => {
      const address = server.address();
      const port = address && address.port;
      server.close(() => resolve(port));
    });
  });
}

function spawnServer(command, cwd, label, env = {}) {
  const proc = spawn(command, { cwd, shell: true, env: { ...process.env, ...env }, stdio: ['ignore', 'pipe', 'pipe'] });
  proc.stdout.on('data', (data) => process.stdout.write(`[${label}] ${data}`));
  proc.stderr.on('data', (data) => process.stderr.write(`[${label}] ${data}`));
  proc.on('error', (error) => console.error(`[${label}] spawn error:`, error));
  return proc;
}

function waitForServer(port, path = '/api/status', timeout = 30000) {
  const start = Date.now();
  return new Promise((resolve, reject) => {
    const attempt = () => {
      const req = http.request({ hostname: '127.0.0.1', port, path, method: 'GET', timeout: 2000 }, (res) => {
        if (res.statusCode === 200) {
          resolve();
        } else if (Date.now() - start > timeout) {
          reject(new Error(`Timeout waiting for server at port ${port}`));
        } else {
          setTimeout(attempt, 500);
        }
      });
      req.on('error', () => {
        if (Date.now() - start > timeout) {
          reject(new Error(`Timeout waiting for server at port ${port}`));
        } else {
          setTimeout(attempt, 500);
        }
      });
      req.end();
    };
    attempt();
  });
}

function httpRequest(port, path, method = 'GET', headers = {}, body = null) {
  return new Promise((resolve, reject) => {
    const data = body ? JSON.stringify(body) : null;
    const req = http.request(
      {
        hostname: '127.0.0.1',
        port,
        path,
        method,
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': data ? Buffer.byteLength(data) : 0,
          ...headers
        }
      },
      (res) => {
        let chunks = '';
        res.on('data', (chunk) => (chunks += chunk));
        res.on('end', () => {
          const responseBody = chunks ? JSON.parse(chunks) : {};
          resolve({ status: res.statusCode, body: responseBody });
        });
      }
    );
    req.on('error', reject);
    if (data) req.write(data);
    req.end();
  });
}

async function shutdown(processes) {
  for (const proc of processes) {
    if (!proc.killed) {
      proc.kill();
    }
  }
}

(async () => {
  const backendPort = await getFreePort();
  const backend = spawnServer('npm --workspace backend start', rootDir, 'backend', { PORT: `${backendPort}` });

  try {
    await waitForServer(backendPort);

    const status = await httpRequest(backendPort, '/api/status');
    if (status.status !== 200 || status.body.status !== 'Hospital eCitizen API is running') {
      throw new Error('Backend status endpoint failed');
    }

    const services = await httpRequest(backendPort, '/api/services');
    if (services.status !== 200 || !Array.isArray(services.body)) {
      throw new Error('Services endpoint failed');
    }

    const patientLogin = await httpRequest(backendPort, '/api/auth/login', 'POST', {}, { credential: 'patient@hospital.gov', password: 'patient123' });
    if (patientLogin.status !== 200 || patientLogin.body.user.role !== 'PATIENT') {
      throw new Error('Patient login failed');
    }

    const patientToken = patientLogin.body.token;
    const appointment = await httpRequest(backendPort, '/api/appointment', 'POST', { Authorization: `Bearer ${patientToken}` }, { doctor: 'Dr. Alice Mwangi', date: '2026-06-05', time: '10:30' });
    if (appointment.status !== 201 || appointment.body.doctor !== 'Dr. Alice Mwangi') {
      throw new Error('Appointment booking failed');
    }

    const payment = await httpRequest(backendPort, '/api/payment', 'POST', { Authorization: `Bearer ${patientToken}` }, { amount: 500, method: 'M-Pesa' });
    if (payment.status !== 201 || payment.body.status !== 'COMPLETED') {
      throw new Error('Payment submission failed');
    }

    const adminLogin = await httpRequest(backendPort, '/api/auth/login', 'POST', {}, { credential: 'admin@hospital.gov', password: 'admin123' });
    if (adminLogin.status !== 200 || adminLogin.body.user.role !== 'ADMIN') {
      throw new Error('Admin login failed');
    }

    const adminToken = adminLogin.body.token;
    const reports = await httpRequest(backendPort, '/api/admin/reports', 'GET', { Authorization: `Bearer ${adminToken}` });
    if (reports.status !== 200 || typeof reports.body.totalPatients !== 'number') {
      throw new Error('Admin reports failed');
    }

    const unauthorized = await httpRequest(backendPort, '/api/admin/reports', 'GET', { Authorization: `Bearer ${patientToken}` });
    if (unauthorized.status !== 403) {
      throw new Error('Role enforcement failed: patient accessed admin reports');
    }

    console.log('ALL_TESTS_PASSED');
    await shutdown([backend]);
    process.exit(0);
  } catch (err) {
    console.error('TEST_FAILED:', err.message || err);
    await shutdown([backend]);
    process.exit(1);
  }
})();

process.on('unhandledRejection', async (err) => {
  console.error('TEST_FAILED:', err && err.message ? err.message : err);
  process.exit(1);
});
