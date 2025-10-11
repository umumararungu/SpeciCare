const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Import database
const db = require('./config/database');

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
        message: 'SpeciCare API is running with SQLite',
        timestamp: new Date().toISOString(),
        database: 'SQLite'
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`SpeciCare server running on port ${PORT}`);
    console.log(`SQLite database: ./data/specicare.db`);
    console.log(`API Health Check: http://localhost:${PORT}/api/health`);
});

module.exports = app;
