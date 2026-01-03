const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const Attendance = require('../models/Attendance');

// Mark Attendance
router.post('/mark', auth, async (req, res) => {
    try {
        // Check if already marked for today
        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);

        const endOfDay = new Date();
        endOfDay.setHours(23, 59, 59, 999);

        const existingAttendance = await Attendance.findOne({
            user: req.user.id,
            date: { $gte: startOfDay, $lte: endOfDay }
        });

        if (existingAttendance) {
            return res.status(400).json({ msg: 'Attendance already marked for today' });
        }

        const newAttendance = new Attendance({
            user: req.user.id,
            status: 'Present',
            method: 'Face'
        });

        await newAttendance.save();

        res.json({ msg: 'Attendance marked successfully', attendance: newAttendance });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// Get Attendance History
router.get('/', auth, async (req, res) => {
    try {
        const attendance = await Attendance.find({ user: req.user.id }).sort({ date: -1 });
        res.json(attendance);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
