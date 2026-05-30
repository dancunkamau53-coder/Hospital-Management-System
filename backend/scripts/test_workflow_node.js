// Node smoke test for workflow endpoints (requires Node 18+ with fetch)
const API = process.env.API_URL || 'http://localhost:5000/api';
const JWT = process.env.JWT || null;
const headers = { 'Content-Type': 'application/json' };
if (JWT) headers['Authorization'] = `Bearer ${JWT}`;

async function run() {
  console.log('Using API', API);
  // Create
  const createResp = await fetch(`${API}/workflows`, { method: 'POST', headers, body: JSON.stringify({ name: 'Test Workflow', description: 'node smoke', steps: [{key:'triage',name:'Triage'},{key:'assessment',name:'Assessment'}] }) });
  const createJson = await createResp.json();
  console.log('Create:', createJson);
  const workflowId = createJson.workflow?.id;
  // List
  const listResp = await fetch(`${API}/workflows`, { headers });
  console.log('List count:', (await listResp.json()).length);
  if (!workflowId) return;
  // Instantiate
  const instResp = await fetch(`${API}/workflows/${workflowId}/instantiate`, { method: 'POST', headers, body: JSON.stringify({ context: { patientId: 1 } }) });
  const instJson = await instResp.json();
  console.log('Instantiate:', instJson);
  const instanceId = instJson.instance?.id;
  if (!instanceId) return;
  // Transition
  const transResp = await fetch(`${API}/workflows/instances/${instanceId}/transition`, { method: 'POST', headers, body: JSON.stringify({ targetStepKey: 'assessment', details: 'moving' }) });
  console.log('Transition:', await transResp.json());
  // Get instance
  const getInst = await fetch(`${API}/workflows/instances/${instanceId}`, { headers });
  console.log('Instance:', await getInst.json());
}

run().catch(e=>{ console.error('Smoke test failed', e); process.exit(1); });
