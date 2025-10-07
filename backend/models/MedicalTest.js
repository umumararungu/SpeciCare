const mongoose = require('mongoose');

const medicalTestSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Test name is required'],
        trim: true,
        maxlength: [200, 'Test name cannot exceed 200 characters']
    },
    description: {
        type: String,
        required: [true, 'Test description is required'],
        maxlength: [1000, 'Description cannot exceed 1000 characters']
    },
    category: {
        type: String,
        required: [true, 'Category is required'],
        enum: [
            'radiology',
            'laboratory',
            'cardiology',
            'neurology',
            'pathology',
            'endoscopy',
            'pulmonology',
            'other'
        ],
        lowercase: true
    },
    subcategory: {
        type: String,
        trim: true
    },
    price: {
        type: Number,
        required: [true, 'Price is required'],
        min: [0, 'Price cannot be negative']
    },
    currency: {
        type: String,
        default: 'RWF',
        uppercase: true
    },
    duration: {
        type: String, // e.g., "30 minutes", "1 hour"
        required: [true, 'Duration is required']
    },
    preparationInstructions: {
        type: String,
        maxlength: [2000, 'Preparation instructions cannot exceed 2000 characters']
    },
    isInsuranceCovered: {
        type: Boolean,
        default: true
    },
    insuranceCoPay: {
        type: Number,
        default: 0,
        min: [0, 'Co-pay cannot be negative']
    },
    isAvailable: {
        type: Boolean,
        default: true
    },
    requirements: [{
        type: String,
        trim: true
    }],
    tags: [{
        type: String,
        trim: true,
        lowercase: true
    }],
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
medicalTestSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

// Index for better query performance
medicalTestSchema.index({ name: 'text', description: 'text' });
medicalTestSchema.index({ category: 1 });
medicalTestSchema.index({ price: 1 });
medicalTestSchema.index({ isAvailable: 1 });
medicalTestSchema.index({ isInsuranceCovered: 1 });
medicalTestSchema.index({ createdAt: -1 });

module.exports = mongoose.model('MedicalTest', medicalTestSchema);
