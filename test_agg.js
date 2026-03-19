const mongoose = require('mongoose');
const Subject = require('./models/Subject');
require('dotenv').config();

mongoose.connect(process.env.MONGO_URI).then(async () => {
    try {
        const summary = await Subject.aggregate([
            { $group: { _id: "$category", count: { $sum: 1 } } },
            { $project: { category: "$_id", count: 1, _id: 0 } },
            { $sort: { category: 1 } }
        ]);
        console.log("AGGREGATION RESULT:", JSON.stringify(summary));
    } catch (e) {
        console.error("AGGREGATION ERROR:", e);
    }
    process.exit(0);
}).catch(e => {
    console.error("DB CON ERROR:", e);
    process.exit(1);
});
