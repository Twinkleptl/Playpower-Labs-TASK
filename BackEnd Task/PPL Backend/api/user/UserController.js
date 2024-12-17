const UserSchema = require("../../models/UserSchema");
const ScoreSchema = require("../../models/ScoreSchema");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { JWT_SECRET } = require("../../config/config");

const register = async (req, res) => {
    const { username, password } = req.body;
    try {
        if (!username || !password) {
            throw new Error("Please provide both username and password");
        }

        let user = await UserSchema.findOne({ username });
        if (user) {
            throw new Error("User already exists");
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        user = await UserSchema.create({ username, password: hashedPassword });

        const token = jwt.sign({ id: user._id }, JWT_SECRET);

        return res.status(201).json({ token });
    }
    catch (err) {
        return res.status(400).json({ error: err.message });
    }
}

const login = async (req, res) => {
    const { username, password } = req.body;
    try {
        if (!username || !password) {
            throw new Error("Please provide both username and password");
        }

        let user = await UserSchema.findOne({ username });
        if (!user) {
            throw new Error("Invalid credentials");
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            throw new Error("Invalid credentials");
        }

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);

        return res.cookie("token", token, {
            httpOnly: true,
            secure: true,
            maxAge: 3600000
        }).status(200).json({ token });
    }
    catch (err) {
        return res.status(400).json({ error: err.message });
    }
}

const filterScores = async (req, res) => {
    const { user_id } = req;
    const { score, subject, completedDate, quiz_id, grade, level, num_questions } = req.body;

    // Build the score query
    let scoreQuery = { user_id };
    if (score) scoreQuery.score = score;
    if (quiz_id) scoreQuery.quiz_id = quiz_id;
    if (completedDate) {
        try {
            const date = new Date(completedDate);
            scoreQuery.date = { $gte: date, $lt: new Date(date.getTime() + 86400000) };
        } catch (error) {
            return res.status(400).json({ error: "Invalid date" });
        }
    }

    try {
        // Find scores and populate quiz data
        const scores = await ScoreSchema.find(scoreQuery).populate({
            path: 'quiz_id',  // Populates quiz data
            select: 'grade subject level num_questions', // Selects only these fields
            match: {
                ...(grade && { grade }),            // Add grade filter if provided
                ...(subject && { subject }),        // Add subject filter if provided
                ...(level && { level }),            // Add level filter if provided
                ...(num_questions && { num_questions }) // Add number of questions filter if provided
            }
        });

        const result = scores.map(score => {
            const { quiz_id } = score;
            if (!quiz_id) return score; // In case the quiz_id is null or doesn't match

            return {
                _id: score._id,
                user_id: score.user_id,
                score: score.score,
                date: score.date,
                quiz_id: quiz_id._id, // Keep quiz_id as ObjectId
                grade: quiz_id.grade,  // Move quiz fields to the top level
                subject: quiz_id.subject,
                level: quiz_id.level,
                num_questions: quiz_id.num_questions
            };
        });

        // Check if any scores were found
        if (!result.length) {
            return res.status(404).json({ error: "Scores not found" });
        }

        return res.status(200).json({ scores: result });
    } catch (err) {
        return res.status(400).json({ error: err.message });
    }
};


const filterScoreByDate = async (req, res) => {
    const { user_id } = req;
    const { score, subject, quiz_id, grade, start, end } = req.body;
    let query = { user_id };
    if (score) query.score = score;
    if (subject) query.subject = subject;
    if (grade) query.grade = grade;
    if (quiz_id) query.quiz_id = quiz_id;
    if (start && end) {
        try {
            const startDate = new Date(start);
            const endDate = new Date((new Date(end)).getTime() + 86400000); // Add 1 day to end date
            query.date = { $gte: startDate, $lt: endDate };
        } catch (error) {
            return res.status(400).json({ error: "Invalid date" });
        }
    }
    try {
        const scores = await ScoreSchema.find(query);
        if (!scores) {
            return res.status(404).json({ error: "Scores not found" });
        }
        return res.status(200).json({ scores });
    }
    catch (err) {
        return res.status(400).json({ error: err.message });
    }
}

module.exports = { register, login, filterScores, filterScoreByDate };