const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    date: {
        type: Date,
        default: Date.now
    },
    checkInTime: {
        type: String,
        default: () => new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
    },
    location: {
        lat: { type: Number },
        lng: { type: Number },
        address: { type: String, default: 'Office Location' }
    },
    status: {
        type: String,
        enum: ['Present', 'Absent', 'Late'],
        default: 'Present'
    },
    method: {
        type: String,
        enum: ['Face', 'Manual'],
        default: 'Face'
    }
});

module.exports = mongoose.model('Attendance', attendanceSchema);
