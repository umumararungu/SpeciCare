const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
    reference: {
        type: String,
        required: true,
        unique: true,
        uppercase: true,
        match: [/^SC\d+$/, 'Invalid reference format']
    },
    patient: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Patient is required']
    },
    test: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'MedicalTest',
        required: [true, 'Test is required']
    },
    hospital: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Hospital',
        required: [true, 'Hospital is required']
    },
    appointmentDate: {
        type: Date,
        required: [true, 'Appointment date is required']
    },
    timeSlot: {
        type: String,
        required: [true, 'Time slot is required'],
        match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time slot format']
    },
    status: {
        type: String,
        enum: [
            'pending',
            'confirmed',
            'completed',
            'cancelled',
            'no_show',
            'rescheduled'
        ],
        default: 'pending'
    },
    payment: {
        totalAmount: {
            type: Number,
            required: [true, 'Total amount is required'],
            min: [0, 'Amount cannot be negative']
        },
        insuranceCovered: {
            type: Number,
            default: 0,
            min: 0
        },
        patientShare: {
            type: Number,
            required: true,
            min: 0
        },
        paymentStatus: {
            type: String,
            enum: ['pending', 'paid', 'failed', 'refunded'],
            default: 'pending'
        },
        paymentMethod: {
            type: String,
            enum: ['cash', 'mobile_money', 'insurance', 'card', 'bank_transfer'],
            default: 'cash'
        },
        transactionId: String,
        paidAt: Date
    },
    patientDetails: {
        name: {
            type: String,
            required: true,
            trim: true
        },
        phone: {
            type: String,
            required: true,
            match: [/^\+?250?\d{9}$/, 'Please enter a valid Rwandan phone number']
        },
        email: {
            type: String,
            lowercase: true,
            trim: true
        },
        insuranceNumber: String,
        dateOfBirth: Date,
        gender: {
            type: String,
            enum: ['male', 'female', 'other'],
            lowercase: true
        }
    },
    clinicalInformation: {
        referringDoctor: String,
        doctorContact: String,
        clinicalNotes: String,
        urgency: {
            type: String,
            enum: ['routine', 'urgent', 'emergency'],
            default: 'routine'
        },
        symptoms: [String],
        previousTests: [String]
    },
    notifications: {
        confirmationSms: {
            sent: { type: Boolean, default: false },
            sentAt: Date,
            messageId: String
        },
        reminderSms: {
            sent: { type: Boolean, default: false },
            sentAt: Date,
            messageId: String
        },
        resultSms: {
            sent: { type: Boolean, default: false },
            sentAt: Date,
            messageId: String
        }
    },
    cancellation: {
        reason: String,
        cancelledBy: {
            type: String,
            enum: ['patient', 'hospital', 'system']
        },
        cancelledAt: Date,
        refundAmount: Number
    },
    rescheduling: {
        originalDate: Date,
        originalTime: String,
        reason: String,
        rescheduledAt: Date,
        rescheduledBy: {
            type: String,
            enum: ['patient', 'hospital']
        }
    },
    results: {
        fileUrl: String,
        fileName: String,
        fileSize: Number,
        uploadedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        uploadedAt: Date,
        findings: String,
        interpretation: String,
        isNormal: Boolean,
        recommendations: [String]
    },
    feedback: {
        rating: {
            type: Number,
            min: 1,
            max: 5
        },
        comment: String,
        submittedAt: Date
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Generate reference before saving
appointmentSchema.pre('save', function(next) {
    if (!this.reference) {
        this.reference = `SC${Date.now()}${Math.random().toString(36).substr(2, 5).toUpperCase()}`;
    }
    next();
});

// Update updatedAt timestamp before saving
appointmentSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

// Virtual for appointment datetime
appointmentSchema.virtual('appointmentDateTime').get(function() {
    return new Date(`${this.appointmentDate.toDateString()} ${this.timeSlot}`);
});

// Virtual for isUpcoming
appointmentSchema.virtual('isUpcoming').get(function() {
    return this.appointmentDateTime > new Date() && this.status === 'confirmed';
});

// Virtual for isPast
appointmentSchema.virtual('isPast').get(function() {
    return this.appointmentDateTime <= new Date();
});

// Index for better query performance
appointmentSchema.index({ reference: 1 });
appointmentSchema.index({ patient: 1 });
appointmentSchema.index({ hospital: 1 });
appointmentSchema.index({ test: 1 });
appointmentSchema.index({ appointmentDate: 1 });
appointmentSchema.index({ status: 1 });
appointmentSchema.index({ 'patientDetails.phone': 1 });
appointmentSchema.index({ createdAt: -1 });
appointmentSchema.index({ 'notifications.confirmationSms.sent': 1 });
appointmentSchema.index({ 'notifications.reminderSms.sent': 1 });

module.exports = mongoose.model('Appointment', appointmentSchema);
