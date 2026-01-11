const mongoose = require('mongoose');

const wardSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    department: {
        type: String, // Optional: if wards are department-specific
        default: 'General'
    },
    requiredWorkers: {
        type: Number,
        default: 10 // Default requirement
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
}, {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Virtual to populate workers count or details if needed
wardSchema.virtual('workers', {
    ref: 'User',
    localField: '_id',
    foreignField: 'ward'
});

module.exports = mongoose.model('Ward', wardSchema);
