const taskEvents = require('./eventBus');
let registered = false;
function registerTaskEvents() {
  if (registered) return;
  registered = true;
  taskEvents.on('task-created', async task => {
    await new Promise(resolve => setTimeout(resolve, 2000));
    console.log(`[EVENT HANDLER] Notification completed at ${new Date().toISOString()} | task="${task.title}" | assignedUser="${task.assignedTo || 'none'}"`);
  });
  taskEvents.on('task-deleted', task => console.log(`[EVENT HANDLER] Task deleted: ${task.title}`));
  taskEvents.on('error', err => console.error('[EVENT ERROR]', err));
  console.log('Task event handlers registered');
}
module.exports = { registerTaskEvents, taskEvents };
