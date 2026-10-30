const mongoose = require('mongoose');
const taskSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, default: '' },
  completed: { type: Boolean, default: false },
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null }
}, { timestamps: true });
module.exports = mongoose.model('Task', taskSchema);
