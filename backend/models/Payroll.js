const mongoose = require('mongoose');

const payrollSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    month: {
        type: String, // e.g. "October 2023"
        required: true
    },
    earnings: {
        basic: { type: String, default: "0" },
        hra: { type: String, default: "0" },
        conveyance: { type: String, default: "0" },
        medical: { type: String, default: "0" },
        special: { type: String, default: "0" },
        total: { type: String, default: "0" }
    },
    deductions: {
        pf: { type: String, default: "0" },
        esi: { type: String, default: "0" },
        tax: { type: String, default: "0" },
        total: { type: String, default: "0" }
    },
    netPay: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['Processed', 'Pending', 'Hold'],
        default: 'Pending'
    },
    paidOn: {
        type: String // e.g. "Oct 31, 2023"
    },
    accountNo: {
        type: String
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Payroll', payrollSchema);
