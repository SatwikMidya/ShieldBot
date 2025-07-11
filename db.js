const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        await mongoose.connect(MONGO_URI);
        /**/  console.log('MongoDB connnected');
    } catch (err) {
        console.error(err.message);
        process.exit(1);
    }
};

module.exports = connectDB;