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
            method: 'Face',
            dateKey: new Date().toISOString().split('T')[0] // YYYY-MM-DD for uniqueness
        });

        await newAttendance.save();

        res.json({ msg: 'Attendance marked successfully', attendance: newAttendance });
    } catch (err) {
        if (err.code === 11000) {
            return res.status(400).json({ msg: 'Attendance already marked for today' });
        }
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

// Get Department Attendance Stats (Official Only)
router.get('/department-stats', auth, async (req, res) => {
    try {
        const User = require('../models/User'); // Inline require to avoid circular deps if any
        const user = await User.findById(req.user.id);
        if (user.role !== 'official' && user.role !== 'hr') {
            return res.status(403).json({ msg: 'Not authorized' });
        }

        // Find workers in department
        const workers = await User.find({
            role: 'worker',
            department: { $regex: new RegExp(`^${user.department}$`, 'i') }
        }).select('name post profileImage phoneNo');

        const startOfMonth = new Date();
        startOfMonth.setDate(1);
        startOfMonth.setHours(0, 0, 0, 0);

        const stats = await Promise.all(workers.map(async (worker) => {
            const presentCount = await Attendance.countDocuments({
                user: worker._id,
                status: 'Present',
                date: { $gte: startOfMonth }
            });

            // Calculate percentage based on days elapsed in month (simplified)
            const today = new Date().getDate();
            const totalDays = Math.max(1, today);
            // OR use standard 26/30. Let's use today's date - Sundays.
            // For simplicity, just use `today`.
            const percentage = Math.round((presentCount / totalDays) * 100);

            return {
                _id: worker._id,
                name: worker.name,
                post: worker.post || 'Worker',
                profileImage: worker.profileImage,
                phoneNo: worker.phoneNo,
                presentDays: presentCount,
                totalDays: totalDays,
                percentage: Math.min(100, percentage)
            };
        }));

        // Calculate Department Average
        const totalPercentage = stats.reduce((acc, curr) => acc + curr.percentage, 0);
        const averageAttendance = stats.length > 0 ? Math.round(totalPercentage / stats.length) : 0;

        // Calculate Today's Attendance Stats
        const startOfToday = new Date();
        startOfToday.setHours(0, 0, 0, 0);
        const endOfToday = new Date();
        endOfToday.setHours(23, 59, 59, 999);

        const todayPresentCount = await Attendance.countDocuments({
            user: { $in: workers.map(w => w._id) },
            status: 'Present',
            date: { $gte: startOfToday, $lte: endOfToday }
        });

        const todayPercentage = workers.length > 0 ? Math.round((todayPresentCount / workers.length) * 100) : 0;

        res.json({
            averageAttendance,
            todayAttendance: todayPercentage,
            workers: stats
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// Get Specific User Attendance History (Official Only)
router.get('/user/:userId', auth, async (req, res) => {
    try {
        const User = require('../models/User');
        const user = await User.findById(req.user.id);

        // Official/HR Check
        if (user.role !== 'official' && user.role !== 'hr') {
            return res.status(403).json({ msg: 'Not authorized' });
        }

        // Ideally check if target user is in same department, but for MVP skipping strictly
        const targetUser = await User.findById(req.params.userId);
        if (!targetUser) return res.status(404).json({ msg: 'User not found' });

        const attendance = await Attendance.find({ user: req.params.userId }).sort({ date: -1 });
        res.json(attendance);

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
