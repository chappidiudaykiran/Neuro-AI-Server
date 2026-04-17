const app = require('../app');
const connectDB = require('../config/db');

// Connect to MongoDB upon Serverless cold starts
connectDB().catch(console.error);

// Ensure admin user exists (Optional, depending on if you want it on every cold start)
const ensureAdminUser = require('../utils/ensureAdminUser');
ensureAdminUser().catch(console.error);

// Export the Express App for Vercel Node runtime interceptor
module.exports = app;
