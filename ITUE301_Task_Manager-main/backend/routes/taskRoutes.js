const router=require('express').Router();const auth=require('../middleware/auth');const validate=require('../middleware/validateTask');const c=require('../controllers/taskController');
router.use(auth);router.get('/',c.getTasks);router.get('/:id',c.getTask);router.post('/',validate,c.createTask);router.put('/:id',validate,c.updateTask);router.delete('/:id',c.deleteTask);module.exports=router;
