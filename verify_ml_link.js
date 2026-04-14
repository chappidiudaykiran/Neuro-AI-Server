require('dotenv').config();
const { runPrediction } = require('./utils/predictionService');
const mongoose = require('mongoose');
const User = require('./models/User');

async function verify() {
    console.log("--- ML Service Verification Start ---");
    console.log(`Target URL: ${process.env.FLASK_URL}/api/v1/predict`);
    
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to Database.");

        const user = await User.findOne({ email: 'udaykiran24689@gmail.com' });
        if (!user) {
            console.error("Test student (udaykiran24689@gmail.com) not found in DB.");
            process.exit(1);
        }
        
        console.log(`Starting prediction for Student: ${user.name} (${user._id})`);
        
        const startTime = Date.now();
        const result = await runPrediction(user._id);
        const duration = Date.now() - startTime;

        console.log("\n✅ SUCCESS: ML Service returned output!");
        console.log(`Latency: ${duration}ms`);
        console.log("\n--- Parsed Results ---");
        console.log(`Grade: ${result.grade}`);
        console.log(`Stress: ${result.stress}`);
        console.log(`State: ${result.state}`);
        console.log(`Suggestions: ${result.suggestions.length} items`);
        
        process.exit(0);
    } catch (err) {
        console.error("\n❌ FAILURE: ML Service call failed!");
        if (err.response) {
            console.error(`Status: ${err.response.status}`);
            console.error(`Data: ${JSON.stringify(err.response.data)}`);
        } else {
            console.error(`Error: ${err.message}`);
        }
        process.exit(1);
    }
}

verify();
