const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const Grievance = require('../models/Grievance');

// @route   POST api/grievances
// @desc    Submit a new grievance
// @access  Private
router.post('/', auth, async (req, res) => {
    try {
        const { title, description } = req.body;

        const newGrievance = new Grievance({
            userId: req.user.id,
            title,
            description
        });

        const grievance = await newGrievance.save();
        res.json(grievance);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   GET api/grievances
// @desc    Get all grievances for current user
// @access  Private
router.get('/', auth, async (req, res) => {
    try {
        const grievances = await Grievance.find({ userId: req.user.id }).sort({ createdAt: -1 });
        res.json(grievances);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
