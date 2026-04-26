require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

async function check() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const students = await User.find({ role: 'student' }).select('name photo').lean();
        console.log('Students found:', students.length);
        students.forEach(s => {
            console.log(`Student: ${s.name}, Photo: ${s.photo ? (s.photo.substring(0, 30) + '...') : 'NONE'}`);
        });
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

check();
