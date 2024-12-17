const express = require('express');
const router = express.Router();

const { generateAndStoreQuiz, getQuizById, findQuiz, getHints, getAnswers, getScore } = require('./QuizController');
const { verifyToken } = require('../middleware/AuthMiddleware');

router.post('/gen', verifyToken, generateAndStoreQuiz);
router.get("/find", verifyToken, findQuiz)
router.get("/:id", verifyToken, getQuizById);
router.get("/:id/hints", verifyToken, getHints);
router.get("/:id/answers", verifyToken, getAnswers);
router.post("/:id/score", verifyToken, getScore);


module.exports = router;