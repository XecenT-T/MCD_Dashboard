const express = require('express');
const router = express.Router();
const Leave = require('../models/Leave');
const User = require('../models/User');
const auth = require('../middleware/authMiddleware');

// @route   POST api/leaves
// @desc    Apply for leave
// @access  Private (Worker)
router.post('/', auth, async (req, res) => {
    try {
        const { startDate, endDate, type, reason } = req.body;
        const user = await User.findById(req.user.id);

        if (!user) return res.status(404).json({ msg: 'User not found' });

        const newLeave = new Leave({
            user: req.user.id,
            department: user.department,
            role: user.role,
            startDate,
            endDate,
            type,
            reason
        });

        const leave = await newLeave.save();
        res.json(leave);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   GET api/leaves/my-leaves
// @desc    Get current user's leaves
// @access  Private
router.get('/my-leaves', auth, async (req, res) => {
    try {
        const leaves = await Leave.find({ user: req.user.id }).sort({ createdAt: -1 });
        res.json(leaves);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   GET api/leaves/department
// @desc    Get pending leaves for Official's department
// @access  Private (Official)
router.get('/department', auth, async (req, res) => {
    try {
        const official = await User.findById(req.user.id);
        if (official.role !== 'official') {
            return res.status(403).json({ msg: 'Not authorized' });
        }

        // Get leaves for same department, excluding the official themselves if needed (usually officials approve workers)
        // Also fetch user details
        const leaves = await Leave.find({
            department: official.department,
            role: 'worker' // Only show worker leaves to officials? Or all? User said "goes to local official"
            // Let's show all for now, or maybe exclude 'official' requests if officials approve each other? 
            // Simplified: officials approve workers.
        })
            .populate('user', 'name post profileImage')
            .sort({ createdAt: -1 });

        res.json(leaves);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   PATCH api/leaves/:id/status
// @desc    Approve or Reject leave
// @access  Private (Official)
router.patch('/:id/status', auth, async (req, res) => {
    try {
        const { status } = req.body; // 'Approved' or 'Rejected'
        const leave = await Leave.findById(req.params.id);

        if (!leave) return res.status(404).json({ msg: 'Leave request not found' });

        // Verify Official Authority
        const official = await User.findById(req.user.id);
        if (official.role !== 'official' || official.department !== leave.department) {
            return res.status(403).json({ msg: 'Not authorized to manage this leave' });
        }

        leave.status = status;
        leave.approver = req.user.id;
        await leave.save();

        res.json(leave);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
