const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/specicare';
mongoose.connect(MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => {
    console.log('Connected to MongoDB');
});

// Import Routes
const authRoutes = require('./routes/auth');
const testRoutes = require('./routes/tests');
const bookingRoutes = require('./routes/bookings');
const smsRoutes = require('./routes/sms');

// Use Routes
app.use('/api/auth', authRoutes);
app.use('/api/tests', testRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/sms', smsRoutes);

// Sample data endpoint for frontend
app.get('/api/sample-data', (req, res) => {
    res.json({
        tests: [
            {
                id: 1,
                name: 'MRI Scan',
                hospital: 'Kigali Central Hospital',
                location: 'Kigali',
                price: 85000,
                description: 'Magnetic Resonance Imaging for detailed internal body scans'
            },
            {
                id: 2,
                name: 'CT Scan',
                hospital: 'King Faisal Hospital',
                location: 'Kigali',
                price: 75000,
                description: 'Computed Tomography scan for cross-sectional body images'
            },
            {
                id: 3,
                name: 'Blood Test (Full Panel)',
                hospital: 'Bugesera District Hospital',
                location: 'Bugesera',
                price: 15000,
                description: 'Complete blood count and comprehensive metabolic panel'
            }
        ]
    });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        message: 'SpeciCare API is running',
        timestamp: new Date().toISOString()
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`SpeciCare server running on port ${PORT}`);
    console.log(`API Health Check: http://localhost:${PORT}/api/health`);
});

module.exports = app;