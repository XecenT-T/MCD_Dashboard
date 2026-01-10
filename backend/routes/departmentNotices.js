const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const DepartmentNotice = require('../models/DepartmentNotice');
const User = require('../models/User');

// @route   GET api/department-notices
// @desc    Get notices for the user's department
// @access  Private
router.get('/', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ msg: 'User not found' });

        const notices = await DepartmentNotice.find({ department: user.department }).sort({ date: -1 });
        res.json(notices);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   POST api/department-notices
// @desc    Create a department notice
// @access  Private (Official only)
router.post('/', auth, async (req, res) => {
    try {
        const { title, content, type } = req.body;
        const user = await User.findById(req.user.id);

        if (user.role !== 'official') {
            return res.status(403).json({ msg: 'Not authorized' });
        }

        const newNotice = new DepartmentNotice({
            title,
            content,
            department: user.department,
            postedBy: user.id,
            type: type || 'General'
        });

        const notice = await newNotice.save();
        res.json(notice);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
