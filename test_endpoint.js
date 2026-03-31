require('dotenv').config();
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const User = require('./models/User');

async function testPUT() {
    await mongoose.connect(process.env.MONGO_URI);
    const user = await User.findOne({ email: 'udaykiran24689@gmail.com' });
    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });
    
    // Simulate req manually
    const res = await fetch('http://localhost:3001/api/auth/profile', {
        method: 'PUT',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            name: "Uday Kiran",
            learningStyle: 1
        })
    });
    
    const data = await res.json();
    console.log(data);
    
    const updated = await User.findOne({ _id: user._id });
    console.log("DB LearningStyle:", updated.learningStyle);
    process.exit(0);
}
testPUT();
