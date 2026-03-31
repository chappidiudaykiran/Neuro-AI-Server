require('dotenv').config();
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const User = require('./models/User');

async function testGET() {
    await mongoose.connect(process.env.MONGO_URI);
    const user = await User.findOne({ email: 'udaykiran24689@gmail.com' });
    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });
    
    const res = await fetch('http://localhost:3001/api/predict/preview', {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });
    
    const data = await res.json();
    console.log(data);
    process.exit(0);
}
testGET();
