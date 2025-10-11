const express = require('express');
const db = require('../config/database');
const router = express.Router();

// Create a new booking
router.post('/', (req, res) => {
    try {
        const {
            patientName,
            patientPhone,
            patientEmail,
            testId,
            testName,
            hospital,
            appointmentDate,
            insuranceNumber,
            notes
        } = req.body;

        // Validate required fields
        if (!patientName || !patientPhone || !testName || !hospital || !appointmentDate) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields'
            });
        }

        // Generate reference
        const reference = `SC${Date.now()}${Math.random().toString(36).substr(2, 5).toUpperCase()}`;

        // Get test price (simplified - in real app you'd get this from database)
        const testPrice = 15000; // Default price

        // Create booking
        const sql = `
            INSERT INTO appointments 
            (reference, patientName, patientPhone, patientEmail, testId, testName, hospital, 
             appointmentDate, insuranceNumber, totalAmount, patientShare, clinicalNotes)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        db.run(sql, [
            reference,
            patientName,
            patientPhone,
            patientEmail,
            testId,
            testName,
            hospital,
            appointmentDate,
            insuranceNumber,
            testPrice,
            testPrice, // For simplicity, patient pays full amount
            notes
        ], function(err) {
            if (err) {
                console.error('Booking creation error:', err);
                return res.status(500).json({
                    success: false,
                    message: 'Failed to create booking'
                });
            }

            res.status(201).json({
                success: true,
                message: 'Booking created successfully',
                booking: {
                    id: this.lastID,
                    reference: reference,
                    patientName: patientName,
                    testName: testName,
                    hospital: hospital,
                    appointmentDate: appointmentDate,
                    status: 'confirmed'
                }
            });
        });

    } catch (error) {
        console.error('Booking creation error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});

// Get all bookings
router.get('/', (req, res) => {
    const { phone, status } = req.query;

    let sql = 'SELECT * FROM appointments WHERE 1=1';
    let params = [];

    if (phone) {
        sql += ' AND patientPhone LIKE ?';
        params.push(`%${phone}%`);
    }

    if (status) {
        sql += ' AND status = ?';
        params.push(status);
    }

    sql += ' ORDER BY appointmentDate DESC';

    db.all(sql, params, (err, rows) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({
                success: false,
                message: 'Failed to fetch bookings'
            });
        }

        res.json({
            success: true,
            count: rows.length,
            bookings: rows
        });
    });
});

// Get booking by ID
router.get('/:id', (req, res) => {
    const bookingId = parseInt(req.params.id);
    
    db.get('SELECT * FROM appointments WHERE id = ?', [bookingId], (err, booking) => {
        if (err) {
            return res.status(500).json({
                success: false,
                message: 'Database error'
            });
        }

        if (!booking) {
            return res.status(404).json({
                success: false,
                message: 'Booking not found'
            });
        }

        res.json({
            success: true,
            booking
        });
    });
});

module.exports = router;
