const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Simple workflow service: create workflow, instantiate, transition

const createWorkflow = async ({ name, description, steps }) => {
  // steps: [{ key, name, metadata }]
  const wf = await prisma.workflow.create({
    data: {
      name,
      description,
      steps: {
        create: steps.map(s => ({ key: s.key, name: s.name, metadata: s.metadata ? JSON.stringify(s.metadata) : null }))
      }
    },
    include: { steps: true }
  });

  // parse metadata before returning
  wf.steps = wf.steps.map(step => ({
    ...step,
    metadata: step.metadata ? JSON.parse(step.metadata) : null
  }));

  return wf;
};

const listWorkflows = async () => {
  const wfs = await prisma.workflow.findMany({ include: { steps: true } });
  return wfs.map(wf => ({
    ...wf,
    steps: wf.steps.map(s => ({ ...s, metadata: s.metadata ? JSON.parse(s.metadata) : null }))
  }));
};

const getWorkflow = async (id) => {
  const wf = await prisma.workflow.findUnique({ where: { id }, include: { steps: true } });
  if (!wf) return null;
  wf.steps = wf.steps.map(s => ({ ...s, metadata: s.metadata ? JSON.parse(s.metadata) : null }));
  return wf;
};

const instantiateWorkflow = async ({ workflowId, context }) => {
  const wf = await prisma.workflow.findUnique({ where: { id: workflowId }, include: { steps: true } });
  if (!wf) throw new Error('Workflow not found');
  const firstStep = wf.steps[0];
  const instance = await prisma.workflowInstance.create({
    data: {
      workflowId,
      currentStepKey: firstStep ? firstStep.key : 'start',
      context: context ? JSON.stringify(context) : null
    }
  });
  await prisma.workflowLog.create({
    data: {
      instanceId: instance.id,
      stepKey: instance.currentStepKey,
      action: 'INIT',
      details: 'Instance created'
    }
  });
  // parse context before returning
  instance.context = instance.context ? JSON.parse(instance.context) : null;
  return instance;
};

const getInstance = async (id) => {
  const inst = await prisma.workflowInstance.findUnique({ where: { id }, include: { logs: true } });
  if (!inst) return null;
  inst.context = inst.context ? JSON.parse(inst.context) : null;
  return inst;
};

const transitionInstance = async ({ instanceId, targetStepKey, userId, details }) => {
  const instance = await prisma.workflowInstance.findUnique({ where: { id: instanceId } });
  if (!instance) throw new Error('Instance not found');

  const updated = await prisma.workflowInstance.update({
    where: { id: instanceId },
    data: { currentStepKey: targetStepKey }
  });

  await prisma.workflowLog.create({
    data: {
      instanceId,
      stepKey: targetStepKey,
      action: 'TRANSITION',
      userId: userId || null,
      details: details || null
    }
  });

  return updated;
};

module.exports = {
  createWorkflow,
  listWorkflows,
  getWorkflow,
  instantiateWorkflow,
  getInstance,
  transitionInstance
};
