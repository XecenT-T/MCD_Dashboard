const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const Attendance = require('../models/Attendance');

// Mark Attendance
router.post('/mark', auth, async (req, res) => {
    try {
        const { location } = req.body;

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
            checkInTime: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
            location: location || { lat: 0, lng: 0, address: 'Office Location' },
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

// Get Department Attendance (Official Only)
router.get('/department', auth, async (req, res) => {
    try {
        const user = await require('../models/User').findById(req.user.id);
        if (user.role !== 'official') {
            return res.status(403).json({ msg: 'Not authorized' });
        }

        // Find users in the same department
        const departmentUsers = await require('../models/User').find({ department: user.department });
        const userIds = departmentUsers.map(u => u._id);

        let query = { user: { $in: userIds } };

        // Date Filtering
        if (req.query.date === 'today') {
            const startOfDay = new Date();
            startOfDay.setHours(0, 0, 0, 0);
            const endOfDay = new Date();
            endOfDay.setHours(23, 59, 59, 999);
            query.date = { $gte: startOfDay, $lte: endOfDay };
        }

        const attendance = await Attendance.find(query)
            .populate('user', 'name role')
            .sort({ date: -1 });

        res.json(attendance);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
