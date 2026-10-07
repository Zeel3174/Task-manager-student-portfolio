const Task = require('../models/Task');
const cache = require('../cache/cache');
const { taskEvents } = require('../events/taskEvents');
const invalidate = id => { cache.del('all_tasks'); if(id) cache.del(`task_${id}`); };
async function getTasks(req,res,next){try{
  const cached=cache.get('all_tasks');
  if(cached){res.set('X-Cache','HIT');return res.json(cached)}
  const tasks=await Task.find().sort({createdAt:-1}); cache.set('all_tasks',tasks); res.set('X-Cache','MISS'); res.json(tasks);
}catch(e){next(e)}}
async function getTask(req,res,next){try{const key=`task_${req.params.id}`;const cached=cache.get(key);if(cached){res.set('X-Cache','HIT');return res.json(cached)}const task=await Task.findById(req.params.id);if(!task)return res.status(404).json({message:'Task not found'});cache.set(key,task);res.set('X-Cache','MISS');res.json(task)}catch(e){next(e)}}
async function createTask(req,res,next){try{const task=await Task.create({...req.body,assignedTo:req.user?.id||null});invalidate();console.log(`[API] Response sent at ${new Date().toISOString()}`);res.status(201).json(task);taskEvents.emit('task-created',task)}catch(e){next(e)}}
async function updateTask(req,res,next){try{const task=await Task.findByIdAndUpdate(req.params.id,req.body,{new:true,runValidators:true});if(!task)return res.status(404).json({message:'Task not found'});invalidate(task._id.toString());res.json(task)}catch(e){next(e)}}
async function deleteTask(req,res,next){try{const task=await Task.findByIdAndDelete(req.params.id);if(!task)return res.status(404).json({message:'Task not found'});invalidate(req.params.id);res.json({message:'Task deleted'});taskEvents.emit('task-deleted',task)}catch(e){next(e)}}
module.exports={getTasks,getTask,createTask,updateTask,deleteTask};
