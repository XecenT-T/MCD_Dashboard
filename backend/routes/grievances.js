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

        const user = await require('../models/User').findById(req.user.id);

        const newGrievance = new Grievance({
            userId: req.user.id,
            title,
            description,
            department: user.department || 'General'
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

// @route   GET api/grievances/department
// @desc    Get all grievances for official's department
// @access  Private (Official only)
router.get('/department', auth, async (req, res) => {
    try {
        const user = await require('../models/User').findById(req.user.id);
        if (user.role !== 'official') {
            return res.status(403).json({ msg: 'Not authorized' });
        }

        // Find grievances for the official's department
        // We can query directly by department now that it's in the schema
        const grievances = await Grievance.find({ department: user.department })
            .populate('userId', 'name')
            .sort({ createdAt: -1 });

        res.json(grievances);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   GET api/grievances/all
// @desc    Get ALL grievances (HR/Admin only)
// @access  Private (Official with HR/General dept only)
router.get("/all", auth, async (req, res) => {
    try {
        const user = await require("../models/User").findById(req.user.id);
        
        // Check if user is official and belongs to HR/General/Administration
        const hrDepartments = ["General", "Administration", "HR"];
        
        if (user.role !== "official" || !hrDepartments.includes(user.department)) {
            return res.status(403).json({ msg: "Not authorized. HR Access Required." });
        }

        // Return all grievances
        const grievances = await Grievance.find()
            .populate("userId", "name")
            .sort({ createdAt: -1 });

        res.json(grievances);
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server Error");
    }
});

// @route   PATCH api/grievances/:id/status
// @desc    Update grievance status
// @access  Private (Official only)
router.patch('/:id/status', auth, async (req, res) => {
    try {
        const { status } = req.body;
        const user = await require('../models/User').findById(req.user.id);

        if (user.role !== 'official') {
            return res.status(403).json({ msg: 'Not authorized' });
        }

        // Validate allowed statuses
        const allowedStatuses = ['pending', 'forwarded-to-hr', 'resolved', 'rejected'];
        if (!allowedStatuses.includes(status)) {
            return res.status(400).json({ msg: 'Invalid status' });
        }

        let grievance = await Grievance.findById(req.params.id);
        if (!grievance) return res.status(404).json({ msg: 'Grievance not found' });

        // Check if official is from the same department
        if (grievance.department !== user.department) {
            return res.status(403).json({ msg: 'Not authorized to manage this department' });
        }

        grievance.status = status;
        await grievance.save();

        res.json(grievance);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
