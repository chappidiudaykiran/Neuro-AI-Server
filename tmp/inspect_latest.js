const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

const Prediction = require('../models/Prediction');

async function checkLatest() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const latest = await Prediction.findOne().sort({ createdAt: -1 });
        if (!latest) {
            console.log("No predictions found.");
        } else {
            console.log("--- Latest Prediction Object ---");
            console.log(JSON.stringify(latest, null, 2));
            console.log("--------------------------------");
            
            if (latest.rawResponse) {
                console.log("--- Raw ML Response from Link ---");
                console.log(JSON.stringify(latest.rawResponse, null, 2));
            } else {
                console.log("No rawResponse found (older entry).");
            }
        }
        await mongoose.disconnect();
    } catch (err) {
        console.error(err);
    }
}

checkLatest();
