const express = require('express');
const router = express.Router();

// In-memory bookings storage (replace with MongoDB in production)
let bookings = [];
let bookingIdCounter = 1;

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

        // Create booking
        const booking = {
            id: bookingIdCounter++,
            patientName,
            patientPhone,
            patientEmail,
            testId,
            testName,
            hospital,
            appointmentDate,
            insuranceNumber,
            notes,
            status: 'confirmed',
            bookingDate: new Date(),
            reference: `SC${Date.now()}`
        };

        bookings.push(booking);

        res.status(201).json({
            success: true,
            message: 'Booking created successfully',
            booking: {
                id: booking.id,
                reference: booking.reference,
                patientName: booking.patientName,
                testName: booking.testName,
                hospital: booking.hospital,
                appointmentDate: booking.appointmentDate,
                status: booking.status
            }
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

    let filteredBookings = bookings;

    if (phone) {
        filteredBookings = filteredBookings.filter(booking =>
            booking.patientPhone.includes(phone)
        );
    }

    if (status) {
        filteredBookings = filteredBookings.filter(booking =>
            booking.status === status
        );
    }

    res.json({
        success: true,
        count: filteredBookings.length,
        bookings: filteredBookings
    });
});

// Get booking by ID
router.get('/:id', (req, res) => {
    const bookingId = parseInt(req.params.id);
    const booking = bookings.find(b => b.id === bookingId);

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

// Update booking status
router.patch('/:id/status', (req, res) => {
    const bookingId = parseInt(req.params.id);
    const { status } = req.body;

    const booking = bookings.find(b => b.id === bookingId);
    if (!booking) {
        return res.status(404).json({
            success: false,
            message: 'Booking not found'
        });
    }

    const validStatuses = ['confirmed', 'completed', 'cancelled', 'rescheduled'];
    if (!validStatuses.includes(status)) {
        return res.status(400).json({
            success: false,
            message: 'Invalid status'
        });
    }

    booking.status = status;
    booking.updatedAt = new Date();

    res.json({
        success: true,
        message: 'Booking status updated successfully',
        booking
    });
});

// Cancel booking
router.delete('/:id', (req, res) => {
    const bookingId = parseInt(req.params.id);
    const bookingIndex = bookings.findIndex(b => b.id === bookingId);

    if (bookingIndex === -1) {
        return res.status(404).json({
            success: false,
            message: 'Booking not found'
        });
    }

    const cancelledBooking = bookings.splice(bookingIndex, 1)[0];
    cancelledBooking.status = 'cancelled';

    res.json({
        success: true,
        message: 'Booking cancelled successfully',
        booking: cancelledBooking
    });
});

module.exports = router;
