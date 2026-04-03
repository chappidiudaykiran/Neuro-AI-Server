require('dotenv').config({ path: '../.env' });
const mongoose = require('mongoose');
const { calculateStudentSubjectGrades } = require('./calculateGrade');
const User = require('../models/User');

async function test() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const user = await User.findOne({ email: 'udaykiran24689@gmail.com' });
        
        if (!user) {
            console.log("User not found!");
            process.exit(0);
        }

        console.log(`Calculating stress recommendations indicator map for UserId: ${user._id}`);
        const { getFormattedGradesList } = require('./calculateGrade');
        const formattedText = await getFormattedGradesList(user._id);

        console.log("\n====== Formatted ML Feed String =====");
        console.log(formattedText);
        console.log("=====================================\n");

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

test();
