const Payroll = require('../models/Payroll');
const User = require('../models/User');
const PDFDocument = require('pdfkit');

// @desc    Create a new payroll entry
// @route   POST /api/payroll/create
// @access  Private (HR only)
exports.createPayroll = async (req, res) => {
    try {
        const { user, month, earnings, deductions, netPay, status, paidOn, accountNo } = req.body;

        // Verify if user exists
        const employee = await User.findById(user);
        if (!employee) {
            return res.status(404).json({ msg: 'User not found' });
        }

        const newPayroll = new Payroll({
            user,
            month,
            earnings,
            deductions,
            netPay,
            status,
            paidOn,
            accountNo
        });

        const payroll = await newPayroll.save();
        res.json(payroll);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// @desc    Update payroll entry
// @route   PUT /api/payroll/update/:id
// @access  Private (HR only)
exports.updatePayroll = async (req, res) => {
    try {
        const { earnings, deductions, netPay, status, paidOn, accountNo } = req.body;

        let payroll = await Payroll.findById(req.params.id);
        if (!payroll) {
            return res.status(404).json({ msg: 'Payroll not found' });
        }

        // Update fields
        if (earnings) payroll.earnings = earnings;
        if (deductions) payroll.deductions = deductions;
        if (netPay) payroll.netPay = netPay;
        if (status) payroll.status = status;
        if (paidOn) payroll.paidOn = paidOn;
        if (accountNo) payroll.accountNo = accountNo;

        await payroll.save();
        res.json(payroll);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// @desc    Get payrolls for a specific user
// @route   GET /api/payroll/user/:userId
// @access  Private (Owner or HR)
exports.getPayrollByUserId = async (req, res) => {
    try {
        // Check if req.user.id matches userId or if req.user.role is hr
        if (req.user.id !== req.params.userId && req.user.role !== 'hr') {
            return res.status(401).json({ msg: 'Not authorized' });
        }

        const payrolls = await Payroll.find({ user: req.params.userId }).sort({ createdAt: -1 });
        res.json(payrolls);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// @desc    Get all payroll history
// @route   GET /api/payroll/history
// @access  Private (HR only)
exports.getAllPayrolls = async (req, res) => {
    try {
        const payrolls = await Payroll.find().populate('user', 'name post username').sort({ createdAt: -1 });
        res.json(payrolls);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// @desc    Download payroll PDF
// @route   GET /api/payroll/slip/:id/pdf
// @access  Private
exports.downloadPayslip = async (req, res) => {
    try {
        const payroll = await Payroll.findById(req.params.id).populate('user', 'name post accountNo');
        if (!payroll) {
            return res.status(404).json({ msg: 'Payroll not found' });
        }

        // Check auth
        if (req.user.id !== payroll.user._id.toString() && req.user.role !== 'hr') {
            return res.status(401).json({ msg: 'Not authorized' });
        }

        const doc = new PDFDocument();

        let filename = `Payslip-${payroll.month}-${payroll.user.name}.pdf`;
        filename = encodeURIComponent(filename);

        res.setHeader('Content-disposition', 'attachment; filename="' + filename + '"');
        res.setHeader('Content-type', 'application/pdf');

        doc.pipe(res);

        // Header
        doc.fontSize(20).text('McD Dashboard - Salary Slip', { align: 'center' });
        doc.moveDown();
        doc.fontSize(12).text(`Payslip for the month of: ${payroll.month}`, { align: 'center' });
        doc.moveDown();

        // Employee Details
        doc.text(`Employee Name: ${payroll.user.name}`);
        doc.text(`Designation: ${payroll.user.post || 'N/A'}`);
        doc.text(`Account No: ${payroll.accountNo || 'N/A'}`);
        doc.text(`Status: ${payroll.status}`);
        doc.text(`Paid On: ${payroll.paidOn || 'Pending'}`);
        doc.moveDown();
        doc.text('------------------------------------------------------------------');
        doc.moveDown();

        // Earnings
        doc.fontSize(14).text('Earnings', { underline: true });
        doc.fontSize(12);
        doc.text(`Basic Salary: ${payroll.earnings.basic}`);
        doc.text(`HRA: ${payroll.earnings.hra}`);
        doc.text(`Conveyance: ${payroll.earnings.conveyance}`);
        doc.text(`Medical: ${payroll.earnings.medical}`);
        doc.text(`Special Allowance: ${payroll.earnings.special}`);
        doc.text(`Total Earnings: ${payroll.earnings.total}`);
        doc.moveDown();

        // Deductions
        doc.fontSize(14).text('Deductions', { underline: true });
        doc.fontSize(12);
        doc.text(`Provident Fund (PF): ${payroll.deductions.pf}`);
        doc.text(`ESI: ${payroll.deductions.esi}`);
        doc.text(`Tax: ${payroll.deductions.tax}`);
        doc.text(`Total Deductions: ${payroll.deductions.total}`);
        doc.moveDown();

        doc.text('------------------------------------------------------------------');
        doc.moveDown();

        // Net Pay
        doc.fontSize(16).text(`Net Pay: Rs. ${payroll.netPay}`, { bold: true, align: 'right' });

        doc.end();

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

const fs = require('fs');

// @desc    Get all users (workers & officials) for payroll creation
// @route   GET /api/payroll/users
// @access  Private (HR only)
exports.getUsers = async (req, res) => {
    try {
        // DEBUG: Fetch ALL users to see what's in DB
        const users = await User.find({}).select('name username post role accountNo');

        // Log to debug file
        const logData = `[${new Date().toISOString()}] Queries users. Found: ${users.length} users. Content: ${JSON.stringify(users.map(u => u.role))}\n`;
        fs.appendFileSync('debug_log.txt', logData);

        // Filter in memory for now if needed, or just return all to see
        // const filtered = users.filter(u => ['worker', 'official'].includes(u.role));

        res.json(users);
    } catch (err) {
        console.error(err.message);
        fs.appendFileSync('debug_log.txt', `[${new Date().toISOString()}] Error: ${err.message}\n`);
        res.status(500).send('Server Error');
    }
};
