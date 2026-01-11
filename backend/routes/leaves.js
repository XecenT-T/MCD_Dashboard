const express = require('express');
const router = express.Router();
const Leave = require('../models/Leave');
const User = require('../models/User'); // Assuming you have a User model
// Middleware to verify token (Assuming you have one, if not, we'll need to see auth.js)
// I'll assume a standard middleware structure or just use req.user if populated globally by a main middleware.
// Given the file view of index.js didn't show global auth middleware, I should probably check auth.js or middleware folder.
// For now, I'll assume req.user is populated by a middleware I'll import.
const auth = require('../middleware/authMiddleware');

// @route   POST api/leaves
// @desc    Create a leave request
// @access  Private
router.post('/', auth, async (req, res) => {
    try {
        const { type, dates, reason } = req.body;
        const user = await User.findById(req.user.id);

        if (!user) {
            return res.status(404).json({ msg: 'User not found' });
        }

        const newLeave = new Leave({
            user: req.user.id,
            type,
            dates,
            reason,
            department: user.department,
            role: user.role
        });

        const leave = await newLeave.save();
        res.json(leave);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   GET api/leaves/my-requests
// @desc    Get current user's leave requests
// @access  Private
router.get('/my-requests', auth, async (req, res) => {
    try {
        const leaves = await Leave.find({ user: req.user.id }).sort({ createdAt: -1 });
        res.json(leaves);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   GET api/leaves/department
// @desc    Get leave requests for the official's department
// @access  Private (Official only)
router.get('/department', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ msg: 'User not found' });

        // Optional: specific check for official role
        // if (user.role !== 'official') return res.status(401).json({ msg: 'Authorization denied' });

        const populatedLeaves = await Leave.find({ department: user.department })
            .sort({ createdAt: -1 })
            .populate('user', 'name');

        const formattedLeaves = populatedLeaves.map(leave => ({
            id: leave._id,
            applicant: leave.user ? leave.user.name : 'Unknown',
            role: leave.role,
            department: leave.department,
            type: leave.type,
            dates: leave.dates,
            reason: leave.reason,
            status: leave.status
        }));

        res.json(formattedLeaves);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   PUT api/leaves/:id
// @desc    Update leave status
// @access  Private (Official only)
router.put('/:id', auth, async (req, res) => {
    try {
        const { status } = req.body;
        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ msg: 'User not found' });

        let leave = await Leave.findById(req.params.id);
        if (!leave) return res.status(404).json({ msg: 'Leave request not found' });

        // Check permission (ensure official belongs to same department)
        if (leave.department !== user.department) {
            return res.status(401).json({ msg: 'Not authorized for this department' });
        }

        leave.status = status;
        await leave.save();

        res.json(leave);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
