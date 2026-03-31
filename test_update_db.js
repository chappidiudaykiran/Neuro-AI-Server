require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

async function testUpdate() {
    await mongoose.connect(process.env.MONGO_URI);
    const user = await User.findOne({ email: 'udaykiran24689@gmail.com' });
    if (!user) {
        console.log("User not found");
        process.exit(1);
    }
    console.log("Before:", user.learningStyle);
    user.learningStyle = 2;
    await user.save();
    
    const u2 = await User.findOne({ email: 'udaykiran24689@gmail.com' });
    console.log("After:", u2.learningStyle);
    process.exit(0);
}
testUpdate();
