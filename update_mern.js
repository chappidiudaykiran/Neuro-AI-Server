require('dotenv').config();
const mongoose = require('mongoose');
const Subject = require('./models/Subject');

async function update() {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('Connected to DB');

    const course = await Subject.findOne({ shortName: 'MERN 101' });
    if (course) {
      course.category = 'Programming';
      course.name = 'MERN Stack';
      await course.save();
      console.log('Updated MERN Stack course to be under Programming category.');
    } else {
      console.log('Course not found.');
    }
    process.exit(0);
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
}

update();
