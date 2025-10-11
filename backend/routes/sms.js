const express = require('express');
const router = express.Router();

// Send SMS notification
router.post('/send', async (req, res) => {
    try {
        const { to, message, bookingId } = req.body;

        if (!to || !message) {
            return res.status(400).json({
                success: false,
                message: 'Phone number and message are required'
            });
        }

        // Format phone number for Rwanda
        let formattedPhone = to;
        if (!formattedPhone.startsWith('+250')) {
            formattedPhone = '+250' + formattedPhone.replace(/^0/, '');
        }

        // Simulate SMS sending (in development)
        console.log('SMS Simulation:');
        console.log('To:', formattedPhone);
        console.log('Message:', message);
        console.log('Booking ID:', bookingId);

        res.json({
            success: true,
            message: 'SMS sent successfully (simulated)',
            data: {
                to: formattedPhone,
                message: message,
                bookingId: bookingId,
                simulated: true
            }
        });

    } catch (error) {
        console.error('SMS sending error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to send SMS',
            error: error.message
        });
    }
});

module.exports = router;