require('dotenv').config();
const mongoose = require('mongoose');
const Subject = require('./models/Subject');

async function seed() {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('Connected to DB');

    // Check if it already exists
    const existing = await Subject.findOne({ shortName: 'MERN 101' });
    if (existing) {
      console.log('MERN Stack course already exists.');
      process.exit(0);
    }

    const mernCourse = new Subject({
      name: 'Full Stack MERN Masterclass',
      shortName: 'MERN 101',
      description: 'Learn MongoDB, Express, React, and Node.js from scratch.',
      category: 'MERN Stack',
      stressTag: 'medium_stress',
      motivationBase: 3,
      videos: [
        { title: 'Intro to React', youtubeId: 'Tn6-PIqc4UM', duration: 45 },
        { title: 'Express & Node API', youtubeId: 'Oe421EPjeBE', duration: 60 },
        { title: 'MongoDB Crash Course', youtubeId: 'pWbMrx5rVBE', duration: 30 }
      ]
    });

    await mernCourse.save();
    console.log('MERN Stack course created successfully!');
    process.exit(0);
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
}

seed();
