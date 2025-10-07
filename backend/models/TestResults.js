const mongoose = require('mongoose');

const testResultSchema = new mongoose.Schema({
    appointment: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Appointment',
        required: [true, 'Appointment is required']
    },
    test: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'MedicalTest',
        required: [true, 'Test is required']
    },
    patient: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Patient is required']
    },
    hospital: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Hospital',
        required: [true, 'Hospital is required']
    },
    resultType: {
        type: String,
        required: [true, 'Result type is required'],
        enum: ['numeric', 'text', 'image', 'file', 'mixed'],
        lowercase: true
    },
    files: [{
        filename: {
            type: String,
            required: true
        },
        originalName: String,
        fileUrl: {
            type: String,
            required: true
        },
        fileSize: Number,
        mimeType: String,
        uploadedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        uploadedAt: {
            type: Date,
            default: Date.now
        },
        description: String
    }],
    numericResults: [{
        parameter: {
            type: String,
            required: true,
            trim: true
        },
        value: {
            type: mongoose.Schema.Types.Mixed,
            required: true
        },
        unit: String,
        normalRange: {
            min: Number,
            max: Number,
            unit: String
        },
        interpretation: {
            type: String,
            enum: ['normal', 'low', 'high', 'abnormal', 'critical'],
            lowercase: true
        },
        flags: [String]
    }],
    textResults: {
        findings: String,
        impression: String,
        conclusion: String,
        recommendations: [String],
        technicalDetails: String
    },
    qualityControl: {
        performedBy: String,
        performedAt: Date,
        controls: [{
            parameter: String,
            expected: String,
            observed: String,
            status: {
                type: String,
                enum: ['pass', 'fail', 'warning']
            }
        }]
    },
    status: {
        type: String,
        enum: [
            'pending',
            'processing',
            'completed',
            'verified',
            'amended',
            'cancelled'
        ],
        default: 'pending'
    },
    verifiedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    verifiedAt: Date,
    priority: {
        type: String,
        enum: ['routine', 'urgent', 'stat'],
        default: 'routine'
    },
    turnaroundTime: {
        promised: Number, // in hours
        actual: Number,   // in hours
        metDeadline: Boolean
    },
    accessLog: [{
        accessedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        accessedAt: {
            type: Date,
            default: Date.now
        },
        action: {
            type: String,
            enum: ['viewed', 'downloaded', 'shared']
        },
        ipAddress: String,
        userAgent: String
    }],
    sharing: {
        sharedWith: [{
            healthcareProvider: String,
            sharedAt: Date,
            expiresAt: Date,
            accessToken: String
        }],
        isPublic: {
            type: Boolean,
            default: false
        }
    },
    amendments: [{
        reason: String,
        previousValue: mongoose.Schema.Types.Mixed,
        newValue: mongoose.Schema.Types.Mixed,
        amendedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        amendedAt: {
            type: Date,
            default: Date.now
        }
    }],
    metadata: {
        reportVersion: {
            type: String,
            default: '1.0'
        },
        templateUsed: String,
        generatedBy: String,
        language: {
            type: String,
            default: 'en'
        }
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

// Update updatedAt timestamp before saving
testResultSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

// Virtual for result age
testResultSchema.virtual('ageInDays').get(function() {
    return Math.floor((Date.now() - this.createdAt) / (1000 * 60 * 60 * 24));
});

// Virtual for isVerified
testResultSchema.virtual('isVerified').get(function() {
    return this.status === 'verified' && this.verifiedBy !== null;
});

// Virtual for hasCriticalValues
testResultSchema.virtual('hasCriticalValues').get(function() {
    if (this.numericResults && this.numericResults.length > 0) {
        return this.numericResults.some(result => result.interpretation === 'critical');
    }
    return false;
});

// Index for better query performance
testResultSchema.index({ appointment: 1 });
testResultSchema.index({ patient: 1 });
testResultSchema.index({ hospital: 1 });
testResultSchema.index({ test: 1 });
testResultSchema.index({ status: 1 });
testResultSchema.index({ createdAt: -1 });
testResultSchema.index({ 'numericResults.interpretation': 1 });
testResultSchema.index({ priority: 1 });

module.exports = mongoose.model('TestResult', testResultSchema);
