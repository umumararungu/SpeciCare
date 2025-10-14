const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();

// Import middleware
const { 
    securityHeaders, 
    authLimiter, 
    apiLimiter,
    handleValidationErrors 
} = require('./middleware/validation');

// Import routes
const authRoutes = require('./routes/auth');
const testRoutes = require('./routes/tests');
const bookingRoutes = require('./routes/bookings');
const hospitalRoutes = require('./routes/hospitals');
const userRoutes = require('./routes/users');

const app = express();
const PORT = process.env.PORT || 5000;

// Security middleware
app.use(securityHeaders);
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true
}));
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '10mb' }));

// Rate limiting
app.use('/api/auth/', authLimiter);
app.use('/api/', apiLimiter);

// Health check
app.get('/api/health', async (req, res) => {
    const { query } = require('./config/database');
    
    try {
        // Test database connection
        await query('SELECT 1');
        
        res.json({
            success: true,
            message: 'SpeciCare API is running with PostgreSQL',
            timestamp: new Date().toISOString(),
            database: 'PostgreSQL - Connected',
            environment: process.env.NODE_ENV || 'development'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Database connection failed',
            error: error.message
        });
    }
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/tests', testRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/hospitals', hospitalRoutes);
app.use('/api/users', userRoutes);

// 404 handler
app.use('*', (req, res) => {
    res.status(404).json({
        success: false,
        message: 'API endpoint not found'
    });
});

// Global error handler
app.use((error, req, res, next) => {
    console.error('Global error handler:', error);
    
    // Don't leak error details in production
    if (process.env.NODE_ENV === 'production') {
        return res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
    
    res.status(500).json({
        success: false,
        message: error.message,
        stack: error.stack
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`SpeciCare server running on port ${PORT}`);
    console.log(`Database: PostgreSQL`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`Health check: http://localhost:${PORT}/api/health`);
});

module.exports = app;
