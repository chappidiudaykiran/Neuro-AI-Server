// debug.js
require('dotenv').config()
const mongoose = require('mongoose')
const User = require('./models/User')

mongoose.connect(process.env.MONGO_URI, {
}).then(async () => {
    const users = await User.find({})
    for(const u of users) {
        console.log(`User: ${u.email}, ID: ${u._id}, learningStyle: ${u.learningStyle}`)
    }
    process.exit(0)
})
