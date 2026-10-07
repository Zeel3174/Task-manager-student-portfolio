function validateTask(req, res, next) {
  if (!req.body.title || !req.body.title.trim()) return res.status(400).json({ message: 'title is required' });
  next();
}
module.exports = validateTask;
