const {
  createWorkflow,
  listWorkflows,
  getWorkflow,
  instantiateWorkflow,
  getInstance,
  transitionInstance
} = require('../service/workflowService');

const create = async (req, res) => {
  try {
    const { name, description, steps } = req.body;
    const wf = await createWorkflow({ name, description, steps });
    res.status(201).json({ message: 'Workflow created', workflow: wf });
  } catch (error) {
    res.status(500).json({ message: 'Error creating workflow', error: error.message });
  }
};

const list = async (req, res) => {
  try {
    const workflows = await listWorkflows();
    res.json(workflows);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching workflows', error: error.message });
  }
};

const get = async (req, res) => {
  try {
    const workflowId = parseInt(req.params.id);
    const workflow = await getWorkflow(workflowId);
    if (!workflow) return res.status(404).json({ message: 'Workflow not found' });
    res.json(workflow);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching workflow', error: error.message });
  }
};

const instantiate = async (req, res) => {
  try {
    const workflowId = parseInt(req.params.id);
    const context = req.body.context || {};
    const instance = await instantiateWorkflow({ workflowId, context });
    res.status(201).json({ message: 'Instance created', instance });
  } catch (error) {
    res.status(500).json({ message: 'Error instantiating workflow', error: error.message });
  }
};

const getInst = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const instance = await getInstance(id);
    if (!instance) return res.status(404).json({ message: 'Instance not found' });
    res.json(instance);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching instance', error: error.message });
  }
};

const transition = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { targetStepKey, details } = req.body;
    const updated = await transitionInstance({ instanceId: id, targetStepKey, userId: req.user?.id, details });
    res.json({ message: 'Transition successful', instance: updated });
  } catch (error) {
    res.status(500).json({ message: 'Error transitioning instance', error: error.message });
  }
};

module.exports = {
  create,
  list,
  get,
  instantiate,
  getInst,
  transition
};
