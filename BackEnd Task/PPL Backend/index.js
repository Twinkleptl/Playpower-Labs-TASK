const express = require('express');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');

const { PORT, MONGO_URI } = require('./config/config');

const app = express();

const QuizRouter = require('./api/quiz/QuizRouter');
const AuthRouter = require('./api/user/UserRouter');

app.use(express.json());
app.use(cookieParser());

app.use('/auth', AuthRouter);
app.use('/quiz', QuizRouter);


app.get('/', (req, res) => {
    res.send('Hello World');
});

mongoose.connect(MONGO_URI)
    .then(() => {
        console.log('Connected to MongoDB');
        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });
    })
    .catch(err => console.log(err));