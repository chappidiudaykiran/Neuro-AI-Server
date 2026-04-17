const mongoose = require('mongoose');
require('dotenv').config();

const Support = require('./models/Support');
const User = require('./models/User');

async function seedSupport() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    const students = await User.find({ role: 'student' }).limit(3);
    if (students.length === 0) {
      console.log('No students found to seed support for.');
      process.exit(0);
    }

    const messages = [
      "I need help with the recent React assignment.",
      "Could you explain the difference between useEffect and useLayoutEffect?",
      "I'm having trouble with the database connection in the project."
    ];

    for (let i = 0; i < students.length; i++) {
      const ticket = new Support({
        studentId: students[i]._id,
        subject: 'Support Chat',
        message: messages[i],
        status: 'open',
        replies: []
      });
      await ticket.save();
      console.log(`Created support ticket for ${students[i].name}`);
    }

    console.log('Seeding complete');
    process.exit(0);
  } catch (err) {
    console.error('Seeding failed:', err);
    process.exit(1);
  }
}

seedSupport();
