const router = require('express').Router();
const auth = require('../middleware/auth');
const { generateTaskDescription } = require('../controllers/aiController');

router.post('/generate-description', auth, generateTaskDescription);

module.exports = router;
