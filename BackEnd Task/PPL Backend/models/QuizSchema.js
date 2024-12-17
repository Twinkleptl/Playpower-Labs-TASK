const mongoose = require('mongoose');

const QuizSchema = new mongoose.Schema({
    grade: {
        type: Number,
        required: true,
        min: 1,
        max: 12
    },
    num_questions: {
        type: Number,
        required: true,
        min: 1
    },
    level: {
        type: String,
        required: true,
        enum: ['easy', 'medium', 'hard']
    },
    subject: {
        type: String,
        required: true
    },
    quiz: [
        {
            question: {
                type: String,
                required: true
            },
            options: {
                type: [String],
                required: true,
                validate: {
                    validator: function (v) {
                        return v.length === 4;
                    },
                    message: props => `${props.value} must have 4 options`
                }
            },
            answer: {
                type: String,
                required: true
            },
            hint: {
                type: String,
                required: true
            }
        }
    ]
});

module.exports = mongoose.model('quiz', QuizSchema, 'quiz');