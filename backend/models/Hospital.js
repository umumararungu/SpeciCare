const mongoose = require('mongoose');

const hospitalSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Hospital name is required'],
        trim: true,
        maxlength: [200, 'Hospital name cannot exceed 200 characters']
    },
    type: {
        type: String,
        required: [true, 'Hospital type is required'],
        enum: [
            'national_referral',
            'provincial',
            'district',
            'private',
            'health_center',
            'clinic'
        ],
        lowercase: true
    },
    contact: {
        phone: {
            type: String,
            required: [true, 'Phone number is required'],
            match: [/^\+?250?\d{9}$/, 'Please enter a valid Rwandan phone number']
        },
        email: {
            type: String,
            lowercase: true,
            trim: true,
            match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
        },
        emergencyPhone: String
    },
    address: {
        province: {
            type: String,
            required: [true, 'Province is required']
        },
        district: {
            type: String,
            required: [true, 'District is required']
        },
        sector: {
            type: String,
            required: [true, 'Sector is required']
        },
        cell: String,
        village: String,
        street: String,
        coordinates: {
            latitude: Number,
            longitude: Number
        }
    },
    operatingHours: {
        monday: { open: String, close: String },
        tuesday: { open: String, close: String },
        wednesday: { open: String, close: String },
        thursday: { open: String, close: String },
        friday: { open: String, close: String },
        saturday: { open: String, close: String },
        sunday: { open: String, close: String }
    },
    services: [{
        test: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'MedicalTest',
            required: true
        },
        available: {
            type: Boolean,
            default: true
        },
        price: {
            type: Number,
            required: true,
            min: 0
        },
        equipment: {
            name: String,
            status: {
                type: String,
                enum: ['operational', 'maintenance', 'out_of_service'],
                default: 'operational'
            }
        },
        staff: [{
            name: String,
            role: String,
            contact: String
        }],
        slots: [{
            date: Date,
            availableSlots: [String], // e.g., ["09:00", "10:00", "11:00"]
            bookedSlots: [String]
        }]
    }],
    facilities: [{
        type: String,
        trim: true,
        lowercase: true
    }],
    insuranceProviders: [{
        name: String,
        isAccepted: {
            type: Boolean,
            default: true
        }
    }],
    rating: {
        average: {
            type: Number,
            default: 0,
            min: 0,
            max: 5
        },
        count: {
            type: Number,
            default: 0
        },
        reviews: [{
            user: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User'
            },
            rating: {
                type: Number,
                required: true,
                min: 1,
                max: 5
            },
            comment: String,
            createdAt: {
                type: Date,
                default: Date.now
            }
        }]
    },
    isActive: {
        type: Boolean,
        default: true
    },
    registrationNumber: {
        type: String,
        unique: true,
        sparse: true
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
hospitalSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

// Virtual for full address
hospitalSchema.virtual('fullAddress').get(function() {
    const address = this.address;
    return `${address.street || ''}, ${address.village || ''}, ${address.cell || ''}, ${address.sector}, ${address.district}, ${address.province}`.trim().replace(/,\s*,/g, ',').replace(/^,\s*/, '');
});

// Index for better query performance
hospitalSchema.index({ name: 'text' });
hospitalSchema.index({ 'address.district': 1 });
hospitalSchema.index({ 'address.province': 1 });
hospitalSchema.index({ type: 1 });
hospitalSchema.index({ 'services.test': 1 });
hospitalSchema.index({ isActive: 1 });
hospitalSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Hospital', hospitalSchema);
