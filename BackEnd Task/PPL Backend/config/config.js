require('dotenv').config();

const config = {
    PORT: process.env.PORT || 3000,
    JWT_SECRET: process.env.JWT_SECRET,
    MONGO_USER: process.env.MONGO_USER,
    MONGO_PASSWORD: process.env.MONGO_PASSWORD,
    MONGO_IP: process.env.MONGO_IP || "mongo",
    GROQ_API_KEY: process.env.GROQ_API_KEY,
    MONGO_URI: process.env.MONGO_URI
}

module.exports = config;