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
