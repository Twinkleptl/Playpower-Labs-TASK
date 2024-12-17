const router = require('express').Router();
const { verifyToken } = require('../middleware/AuthMiddleware');

const { register, login, filterScores, filterScoreByDate } = require('./UserController');

router.post('/register', register);
router.post('/login', login);
router.get('/scores', verifyToken, filterScores);
router.get('/scores/date', verifyToken, filterScoreByDate);

module.exports = router;