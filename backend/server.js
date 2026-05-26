// Import required packages
require('dotenv').config(); // Loads environment variables from the .env file
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

// Import routes
const todoRoutes = require('./routes/todoRoutes');

// --- BEGINNER EXPLANATION ---
// 1. What is Express app?
// It creates our server application.
const app = express();

// 2. What is middleware?
// Middleware are functions that run before your routes.
// - cors(): Allows our React Native frontend to communicate with this backend without security blocks.
// - express.json(): Automatically parses incoming JSON data so we can use req.body.
app.use(cors());
app.use(express.json());

// 3. Route Mounting
// Whenever a request starts with '/todos', use the logic inside todoRoutes.js
app.use('/todos', todoRoutes);

// 4. Database Connection
// Connect to MongoDB using the URI from our .env file.
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('✅ Connected to MongoDB successfully'))
    .catch((err) => console.error('❌ MongoDB connection error:', err));

// 5. Server Start
// Start listening for incoming requests on the specified port.
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});
