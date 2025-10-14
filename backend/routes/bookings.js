const express = require('express');
const { query } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');
const { validateBooking, handleValidationErrors } = require('../middleware/validation');

const router = express.Router();

// Create a new booking
router.post('/', authenticateToken, validateBooking, handleValidationErrors, async (req, res) => {
    try {
        const {
            patientName,
            patientPhone,
            patientEmail,
            testId,
            testName,
            hospitalId,
            appointmentDate,
            timeSlot,
            insuranceNumber,
            notes
        } = req.body;

        // Generate unique reference
        const reference = `SC${Date.now()}${Math.random().toString(36).substr(2, 5).toUpperCase()}`;

        // Get test price
        const testResult = await query(
            'SELECT price, is_insurance_covered, insurance_co_pay FROM medical_tests WHERE id = $1',
            [testId]
        );

        if (testResult.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Medical test not found'
            });
        }

        const test = testResult.rows[0];
        const totalAmount = test.price;
        const insuranceCovered = test.is_insurance_covered ? test.insurance_co_pay : 0;
        const patientShare = totalAmount - insuranceCovered;

        // Create booking
        const result = await query(
            `INSERT INTO appointments 
            (reference, patient_id, test_id, hospital_id, appointment_date, time_slot,
             total_amount, insurance_covered, patient_share, patient_name, patient_phone,
             patient_email, patient_insurance_number, clinical_notes)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
            RETURNING id, reference, status, appointment_date, created_at`,
            [
                reference,
                req.user.userId,
                testId,
                hospitalId,
                appointmentDate,
                timeSlot,
                totalAmount,
                insuranceCovered,
                patientShare,
                patientName,
                patientPhone,
                patientEmail,
                insuranceNumber,
                notes
            ]
        );

        const booking = result.rows[0];

        res.status(201).json({
            success: true,
            message: 'Booking created successfully',
            booking: {
                id: booking.id,
                reference: booking.reference,
                status: booking.status,
                appointmentDate: booking.appointment_date,
                createdAt: booking.created_at
            }
        });

    } catch (error) {
        console.error('Create booking error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create booking'
        });
    }
});

// Get user's bookings
router.get('/my-bookings', authenticateToken, async (req, res) => {
    try {
        const result = await query(
            `SELECT a.*, mt.name as test_name, h.name as hospital_name
             FROM appointments a
             JOIN medical_tests mt ON a.test_id = mt.id
             JOIN hospitals h ON a.hospital_id = h.id
             WHERE a.patient_id = $1
             ORDER BY a.appointment_date DESC, a.created_at DESC`,
            [req.user.userId]
        );

        res.json({
            success: true,
            count: result.rows.length,
            bookings: result.rows
        });

    } catch (error) {
        console.error('Get bookings error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch bookings'
        });
    }
});

// Get booking by ID
router.get('/:id', authenticateToken, async (req, res) => {
    try {
        const bookingId = parseInt(req.params.id);

        const result = await query(
            `SELECT a.*, mt.name as test_name, mt.description as test_description,
                    h.name as hospital_name, h.phone as hospital_phone, 
                    h.district as hospital_district, h.sector as hospital_sector
             FROM appointments a
             JOIN medical_tests mt ON a.test_id = mt.id
             JOIN hospitals h ON a.hospital_id = h.id
             WHERE a.id = $1 AND (a.patient_id = $2 OR $3 = 'admin' OR $3 = 'hospital_staff')`,
            [bookingId, req.user.userId, req.user.role]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Booking not found'
            });
        }

        res.json({
            success: true,
            booking: result.rows[0]
        });

    } catch (error) {
        console.error('Get booking error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch booking'
        });
    }
});

// Cancel booking
router.patch('/:id/cancel', authenticateToken, async (req, res) => {
    try {
        const bookingId = parseInt(req.params.id);
        const { reason } = req.body;

        const result = await query(
            `UPDATE appointments 
             SET status = 'cancelled', cancellation_reason = $1, cancelled_by = $2, cancelled_at = CURRENT_TIMESTAMP
             WHERE id = $3 AND patient_id = $4 AND status IN ('pending', 'confirmed')
             RETURNING id, reference, status`,
            [reason, 'patient', bookingId, req.user.userId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Booking not found or cannot be cancelled'
            });
        }

        res.json({
            success: true,
            message: 'Booking cancelled successfully',
            booking: result.rows[0]
        });

    } catch (error) {
        console.error('Cancel booking error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to cancel booking'
        });
    }
});

module.exports = router;
