const mongoose = require('mongoose');

const departmentNoticeSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    content: {
        type: String,
        required: true
    },
    department: {
        type: String,
        required: true
    },
    postedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    date: {
        type: Date,
        default: Date.now
    },
    type: { // e.g. 'PDF', 'General'
        type: String,
        default: 'General'
    }
});

module.exports = mongoose.model('DepartmentNotice', departmentNoticeSchema);
