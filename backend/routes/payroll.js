const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const Payroll = require('../models/Payroll');

// @route   GET api/payroll
// @desc    Get all payroll records for the logged-in user
// @access  Private
router.get('/', auth, async (req, res) => {
    try {
        const payrolls = await Payroll.find({ user: req.user.id }).sort({ createdAt: -1 });
        res.json(payrolls);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   POST api/payroll
// @desc    Create a payroll record (For testing/seeding)
// @access  Private
router.post('/', auth, async (req, res) => {
    try {
        const newPayroll = new Payroll({
            user: req.user.id,
            ...req.body
        });

        const payroll = await newPayroll.save();
        res.json(payroll);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
