const Groq = require("groq-sdk");
const QuizSchema = require("../../models/QuizSchema");
const ScoreSchema = require("../../models/ScoreSchema");

const { GROQ_API_KEY } = require("../../config/config");

const groq = new Groq({ apiKey: GROQ_API_KEY });

async function getGroqChatCompletion(client, prompt) {
    const response = await client.chat.completions.create({
        messages: [
            {
                "role": "user",
                "content": prompt
            }
        ],
        model: "llama3-8b-8192",
        response_format: { "type": "json_object" }
    });
    return (response.choices[0]?.message?.content);
};

async function getQuiz(client, grade, num_questions, level, subject) {
    let prompt = `You are a quiz generator assistant that responds in JSON. You need to generate a quiz for Grade ${grade} student for the subject ${subject}. Please generate ${num_questions} questions of ${level} level. Please generate 4 options for each question. Also generate a hint for each question. Output in the json format. The JSON output should have quiz as a key and the value should be an array of questions. Each question should have these keys, question, options, answer, hint. The options should be an array of 4 strings.`;
    return await getGroqChatCompletion(client, prompt)
}

const generateAndStoreQuiz = async (req, res) => {
    let { grade, num_questions, level, subject } = req.body;
    if (!grade || !num_questions || !level || !subject) {
        return res.status(400).json({ message: "grade, num_questions, level and subject are required" });
    }
    level = level.toLowerCase();
    if (grade < 1 || grade > 12) {
        return res.status(400).json({ message: "grade must be between 1 and 12" });
    }
    if (num_questions < 1) {
        return res.status(400).json({ message: "num_questions must be greater than 0" });
    }
    if (!["easy", "medium", "hard"].includes(level)) {
        return res.status(400).json({ message: "level must be easy, medium, or hard" });
    }

    try {
        let quiz = await getQuiz(groq, grade, num_questions, level, subject);
        quiz = JSON.parse(quiz);
        try {
            let newQuiz = new QuizSchema({
                grade,
                num_questions,
                level,
                subject,
                "quiz": quiz.quiz
            });
            await newQuiz.save();
            newQuiz.quiz = newQuiz.quiz.map(q => {
                return {
                    question: q.question,
                    options: q.options
                }
            })
            return res.status(200).json(newQuiz);
        } catch (error) {
            return res.status(500).json({ message: "Error storing quiz", error, quiz });
        }
    } catch (error) {
        return res.status(500).json({ message: "Error generating quiz", error, quiz });
    }
}

const getQuizById = async (req, res) => {
    const { id } = req.params;
    let quiz;
    try {
        quiz = await QuizSchema.findById(id);
        if (!quiz) {
            return res.status(404).json({ message: "Quiz not found" });
        }
        quiz.quiz = quiz.quiz.map(q => {
            return {
                question: q.question,
                options: q.options
            }
        })

        return res.status(200).json(quiz);
    } catch (error) {
        if (error.name === "CastError") {
            return res.status(400).json({ message: "Quiz not found" });
        }
        return res.status(500).json({ message: "Error fetching quiz", error });
    }
}

const findQuiz = async (req, res) => {
    const { grade, level, num_questions } = req.query;
    let query = {};

    if (grade) query.grade = grade;
    if (level) query.level = level;
    if (num_questions) query.num_questions = num_questions;

    try {
        let quizzes = await QuizSchema.find(query, { quiz: 0 });
        return res.status(200).json(quizzes);
    } catch (error) {
        return res.status(500).json({ message: "Error fetching quizzes", error });
    }
};

const getHints = async (req, res) => {
    const { id } = req.params;
    let quiz;
    try {
        quiz = await QuizSchema.findById(id);
        if (!quiz) {
            return res.status(404).json({ message: "Quiz not found" });
        }
        let hints = quiz.quiz.map(q => {
            return {
                question: q.question,
                hint: q.hint
            }
        })
        return res.status(200).json(hints);
    } catch (error) {
        if (error.name === "CastError") {
            return res.status(400).json({ message: "Quiz not found" });
        }
        return res.status(500).json({ message: "Error fetching hints", error });
    }
};

const getAnswers = async (req, res) => {
    const { id } = req.params;
    let quiz;
    try {
        quiz = await QuizSchema.findById(id);
        if (!quiz) {
            return res.status(404).json({ message: "Quiz not found" });
        }
        let answers = quiz.quiz.map(q => {
            return {
                question: q.question,
                answer: q.answer
            }
        })
        return res.status(200).json(answers);
    } catch (error) {
        if (error.name === "CastError") {
            return res.status(400).json({ message: "Quiz not found" });
        }
        return res.status(500).json({ message: "Error fetching", error });
    }
};

const getScore = async (req, res) => {
    const { id } = req.params;
    const user_id = req.user_id;
    let quiz;
    try {
        quiz = await QuizSchema.findById(id);
        if (!quiz) {
            return res.status(404).json({ message: "Quiz not found" });
        }
        let score = 0;
        let answers = req.body.answers;
        if (!answers) {
            return res.status(400).json({ message: "answers are required" });
        }
        if (answers.length !== quiz.quiz.length) {
            return res.status(400).json({ message: "answers must have the same length as the quiz" });
        }
        let indices = quiz.quiz.map(q => q.options.indexOf(q.answer));
        for (let i = 0; i < answers.length; i++) {
            if (answers[i] === indices[i]) {
                score++;
            }
        }
        try {
            let newScore = new ScoreSchema({
                quiz_id: id,
                user_id,
                score
            });
            await newScore.save();
            return res.status(200).json({ score });
        } catch (error) {
            return res.status(500).json({ message: "Error saving score", error });
        }
    } catch (error) {
        if (error.name === "CastError") {
            return res.status(400).json({ message: "Quiz not found" });
        }
        return res.status(500).json({ message: "Error fetching", error });
    }
}

module.exports = {
    generateAndStoreQuiz,
    getQuizById,
    findQuiz,
    getHints,
    getAnswers,
    getScore
};