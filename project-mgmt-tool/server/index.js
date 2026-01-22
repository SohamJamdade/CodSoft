const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

// Route Imports
const projectRoutes = require('./routes/projectroutes');
const taskRoutes = require('./routes/taskroutes');

const app = express();

// 1. Enhanced Middleware
app.use(cors());
app.use(express.json());

// Request Logger (Helps you see if DELETE/POST requests hit the server)
app.use((req, res, next) => {
    console.log(`[${new Date().toLocaleTimeString()}] ${req.method} ${req.url}`);
    next();
});

// 2. Routes Mounting
app.use('/api/projects', projectRoutes);
app.use('/api/tasks', taskRoutes);

// 3. MongoDB Connection with Optimized Config
const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI);
        console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    } catch (err) {
        console.error(`❌ MongoDB Connection Error: ${err.message}`);
        process.exit(1); // Exit process with failure
    }
};

connectDB();

// 4. Base Route
app.get('/', (req, res) => {
    res.json({ 
        message: "Project Management API is live",
        status: "Healthy",
        version: "1.0.0" 
    });
});

// 5. Global Error Handling Middleware
// This prevents the server from crashing if a route fails
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        success: false,
        message: "Internal Server Error",
        error: process.env.NODE_ENV === 'development' ? err.message : {}
    });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`📂 API Docs: http://localhost:${PORT}/api/projects`);
});