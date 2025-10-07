const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'User is required']
    },
    type: {
        type: String,
        required: [true, 'Notification type is required'],
        enum: [
            'appointment_confirmation',
            'appointment_reminder',
            'result_ready',
            'payment_success',
            'payment_failure',
            'cancellation',
            'rescheduling',
            'system_alert',
            'promotional'
        ],
        lowercase: true
    },
    title: {
        type: String,
        required: [true, 'Title is required'],
        maxlength: [200, 'Title cannot exceed 200 characters']
    },
    message: {
        type: String,
        required: [true, 'Message is required'],
        maxlength: [1000, 'Message cannot exceed 1000 characters']
    },
    data: {
        appointment: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Appointment'
        },
        testResult: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'TestResult'
        },
        url: String,
        action: String,
        metadata: mongoose.Schema.Types.Mixed
    },
    channels: [{
        type: String,
        enum: ['sms', 'email', 'push', 'in_app'],
        required: true
    }],
    deliveryStatus: {
        sms: {
            sent: { type: Boolean, default: false },
            sentAt: Date,
            messageId: String,
            error: String
        },
        email: {
            sent: { type: Boolean, default: false },
            sentAt: Date,
            messageId: String,
            error: String
        },
        push: {
            sent: { type: Boolean, default: false },
            sentAt: Date,
            messageId: String,
            error: String
        },
        in_app: {
            sent: { type: Boolean, default: true },
            sentAt: {
                type: Date,
                default: Date.now
            }
        }
    },
    read: {
        type: Boolean,
        default: false
    },
    readAt: Date,
    priority: {
        type: String,
        enum: ['low', 'medium', 'high', 'urgent'],
        default: 'medium'
    },
    expiresAt: Date,
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Update updatedAt timestamp before saving
notificationSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

// Virtual for isExpired
notificationSchema.virtual('isExpired').get(function() {
    return this.expiresAt && this.expiresAt < new Date();
});

// Virtual for deliveryStatusSummary
notificationSchema.virtual('deliveryStatusSummary').get(function() {
    const channels = this.channels;
    const delivered = channels.filter(channel => this.deliveryStatus[channel]?.sent);
    
    if (delivered.length === channels.length) return 'fully_delivered';
    if (delivered.length > 0) return 'partially_delivered';
    return 'not_delivered';
});

// Index for better query performance
notificationSchema.index({ user: 1 });
notificationSchema.index({ type: 1 });
notificationSchema.index({ read: 1 });
notificationSchema.index({ createdAt: -1 });
notificationSchema.index({ priority: 1 });
notificationSchema.index({ expiresAt: 1 });
notificationSchema.index({ 'deliveryStatus.sms.sent': 1 });
notificationSchema.index({ 'deliveryStatus.email.sent': 1 });

// Compound index for common queries
notificationSchema.index({ user: 1, read: 1, createdAt: -1 });
notificationSchema.index({ type: 1, createdAt: -1 });

module.exports = mongoose.model('Notification', notificationSchema);
