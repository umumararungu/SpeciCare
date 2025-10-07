const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Import Models
const User = require('./models/User');
const MedicalTest = require('./models/MedicalTest');
const Hospital = require('./models/Hospital');
const Appointment = require('./models/Appointment');
const TestResult = require('./models/TestResult');
const Notification = require('./models/Notification');

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
    initializeSampleData();
});

// Import Routes
const authRoutes = require('./routes/auth');
const testRoutes = require('./routes/tests');
const bookingRoutes = require('./routes/bookings');
const smsRoutes = require('./routes/sms');
const hospitalRoutes = require('./routes/hospitals');
const resultRoutes = require('./routes/results');

// Use Routes
app.use('/api/auth', authRoutes);
app.use('/api/tests', testRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/sms', smsRoutes);
app.use('/api/hospitals', hospitalRoutes);
app.use('/api/results', resultRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        message: 'SpeciCare API is running',
        timestamp: new Date().toISOString(),
        database: db.readyState === 1 ? 'Connected' : 'Disconnected'
    });
});

// Initialize sample data
async function initializeSampleData() {
    try {
        const testCount = await MedicalTest.countDocuments();
        if (testCount === 0) {
            await createSampleData();
            console.log('Sample data initialized');
        }
    } catch (error) {
        console.error('Error initializing sample data:', error);
    }
}

async function createSampleData() {
    // Create sample medical tests
    const sampleTests = [
        {
            name: 'MRI Scan',
            description: 'Magnetic Resonance Imaging for detailed internal body scans',
            category: 'radiology',
            price: 85000,
            duration: '45 minutes',
            preparationInstructions: 'No food or drink 4 hours before scan',
            isInsuranceCovered: true,
            insuranceCoPay: 8500
        },
        {
            name: 'CT Scan',
            description: 'Computed Tomography scan for cross-sectional body images',
            category: 'radiology',
            price: 75000,
            duration: '30 minutes',
            preparationInstructions: 'No metal objects, fasting may be required',
            isInsuranceCovered: true,
            insuranceCoPay: 7500
        },
        {
            name: 'Blood Test (Full Panel)',
            description: 'Complete blood count and comprehensive metabolic panel',
            category: 'laboratory',
            price: 15000,
            duration: '15 minutes',
            preparationInstructions: 'Fasting for 8-12 hours required',
            isInsuranceCovered: true,
            insuranceCoPay: 1500
        }
    ];

    await MedicalTest.insertMany(sampleTests);
}

// Start server
app.listen(PORT, () => {
    console.log(`SpeciCare server running on port ${PORT}`);
    console.log(`API Health Check: http://localhost:${PORT}/api/health`);
});

module.exports = app;