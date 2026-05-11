// BehaviorAuth - Express Server
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();

const routes = require('./routes');

// Initialize Express app
const app = express();

// Middleware
app.use(cors()); // Enable CORS for frontend requests
app.use(bodyParser.json({ limit: '10mb' })); // Parse JSON requests
app.use(bodyParser.urlencoded({ extended: true, limit: '10mb' }));

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/behaviorauth';

mongoose.connect(MONGODB_URI)
    .then(() => {
        console.log('✅ Connected to MongoDB successfully');
        console.log(`📊 Database: ${MONGODB_URI}`);
    })
    .catch((error) => {
        console.error('❌ MongoDB connection error:', error.message);
        process.exit(1);
    });

// API Routes
app.use('/api', routes);

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({
        status: 'OK',
        message: 'BehaviorAuth server is running',
        timestamp: new Date().toISOString()
    });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Server error:', err);
    res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: err.message
    });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 BehaviorAuth server running on port ${PORT}`);
    console.log(`🌐 Health check: http://localhost:${PORT}/health`);
    console.log(`📡 API endpoints:`);
    console.log(`   POST http://localhost:${PORT}/api/register`);
    console.log(`   POST http://localhost:${PORT}/api/login`);
});
