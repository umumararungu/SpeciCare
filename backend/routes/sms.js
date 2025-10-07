const express = require('express');
const router = express.Router();

// Africa's Talking SMS configuration
const africastalking = require('africastalking')({
    apiKey: process.env.AT_API_KEY || 'your_africas_talking_api_key',
    username: process.env.AT_USERNAME || 'your_africas_talking_username'
});

const sms = africastalking.SMS;

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

        // In development, simulate SMS sending
        if (process.env.NODE_ENV === 'development') {
            console.log('SMS Simulation:');
            console.log('To:', formattedPhone);
            console.log('Message:', message);
            console.log('Booking ID:', bookingId);

            return res.json({
                success: true,
                message: 'SMS sent successfully (simulated)',
                data: {
                    to: formattedPhone,
                    message: message,
                    bookingId: bookingId,
                    simulated: true
                }
            });
        }

        // Production: Send actual SMS via Africa's Talking
        const options = {
            to: [formattedPhone],
            message: message,
            from: 'SpeciCare' // Your shortcode or alphanumeric
        };

        const response = await sms.send(options);
        
        res.json({
            success: true,
            message: 'SMS sent successfully',
            data: response
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

// Send booking confirmation
router.post('/booking-confirmation', async (req, res) => {
    try {
        const { booking, patient } = req.body;

        const message = `SpeciCare: Your ${booking.testName} is confirmed at ${booking.hospital} on ${booking.appointmentDate}. Booking Ref: ${booking.reference}. Bring your insurance card.`;

        await sms.send({
            to: [patient.phone],
            message: message,
            from: 'SpeciCare'
        });

        res.json({
            success: true,
            message: 'Booking confirmation SMS sent'
        });

    } catch (error) {
        console.error('Booking confirmation SMS error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to send booking confirmation'
        });
    }
});

// Send result notification
router.post('/result-notification', async (req, res) => {
    try {
        const { patientPhone, testName, hospital } = req.body;

        const message = `SpeciCare: Your ${testName} results from ${hospital} are ready. Log in to your account to view them.`;

        await sms.send({
            to: [patientPhone],
            message: message,
            from: 'SpeciCare'
        });

        res.json({
            success: true,
            message: 'Result notification SMS sent'
        });

    } catch (error) {
        console.error('Result notification SMS error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to send result notification'
        });
    }
});

// Get SMS balance (Africa's Talking)
router.get('/balance', async (req, res) => {
    try {
        // This would typically check your SMS balance
        // Africa's Talking doesn't have a direct balance API, so we simulate
        res.json({
            success: true,
            balance: 'Simulated - Check Africa\'s Talking dashboard for actual balance',
            currency: 'KES'
        });

    } catch (error) {
        console.error('Balance check error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to check SMS balance'
        });
    }
});

module.exports = router;
