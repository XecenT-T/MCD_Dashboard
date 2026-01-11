const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const Grievance = require('../models/Grievance');

// @route   POST api/grievances
// @desc    Submit a new grievance
// @access  Private
router.post('/', auth, async (req, res) => {
    try {
        const { title, description, department } = req.body;

        const user = await require('../models/User').findById(req.user.id);

        const newGrievance = new Grievance({
            userId: req.user.id,
            title,
            description,
            department: department || user.department || 'General'
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
        const grievances = await Grievance.find({ userId: req.user.id })
            .populate('replies.senderId', 'name role')
            .sort({ createdAt: -1 });
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

        // Find grievances for the official's department (case-insensitive)
        const grievances = await Grievance.find({
            department: { $regex: new RegExp(`^${user.department}$`, 'i') }
        })
            .populate('userId', 'name role department')
            .populate('replies.senderId', 'name role')
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

        if (user.role === 'hr' || (user.role === 'official' && hrDepartments.includes(user.department))) {
            // Authorized
        } else {
            return res.status(403).json({ msg: "Not authorized. HR Access Required." });
        }

        // Return only grievances submitted to HR departments (Case Insensitive)
        const regexDepts = hrDepartments.map(d => new RegExp(`^${d}$`, 'i'));

        const grievances = await Grievance.find({
            department: { $in: regexDepts }
        })
            .populate("userId", "name role department")
            .populate('replies.senderId', 'name role')
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

        if (user.role !== 'official' && user.role !== 'hr') {
            return res.status(403).json({ msg: 'Not authorized' });
        }

        // Validate allowed statuses
        const allowedStatuses = ['pending', 'forwarded-to-hr', 'resolved', 'rejected'];
        if (!allowedStatuses.includes(status)) {
            return res.status(400).json({ msg: 'Invalid status' });
        }

        let grievance = await Grievance.findById(req.params.id);
        if (!grievance) return res.status(404).json({ msg: 'Grievance not found' });

        // STRICT RESOLVE PERMISSIONS
        const hrDepartments = ["general", "administration", "hr"];
        const userDept = (user.department || '').toLowerCase();
        const grievanceDept = (grievance.department || '').toLowerCase();

        // 1. If Grievance is for HR/General -> Only HR/Admin/HR Role can resolve
        if (hrDepartments.includes(grievanceDept)) {
            if (user.role !== 'hr' && !hrDepartments.includes(userDept)) {
                return res.status(403).json({ msg: 'Only HR can resolve this grievance' });
            }
        }
        // 2. If Grievance is for specific department -> Only that department's Official OR HR can resolve
        else {
            if (user.role !== 'hr' && (grievanceDept !== userDept && !hrDepartments.includes(userDept))) {
                return res.status(403).json({ msg: 'Not authorized to manage this department' });
            }
        }

        grievance.status = status;
        await grievance.save();

        res.json(grievance);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});


// @route   POST api/grievances/:id/reply
// @desc    Add a reply to a grievance
// @access  Private (Official/HR/Submitter)
router.post('/:id/reply', auth, async (req, res) => {
    try {
        const { message } = req.body;
        const user = await require('../models/User').findById(req.user.id);
        const grievance = await Grievance.findById(req.params.id);

        if (!grievance) return res.status(404).json({ msg: 'Grievance not found' });

        // Authorization: Submitter, or Official, or HR
        const isSubmitter = grievance.userId.toString() === req.user.id;
        const isOfficial = user.role === 'official';
        const isHR = user.role === 'hr';

        // Allow submitter, official, or HR to reply
        if (!isSubmitter && !isOfficial && !isHR) {
            return res.status(403).json({ msg: 'Not authorized to reply' });
        }

        if (grievance.status === 'resolved' || grievance.status === 'rejected') {
            return res.status(400).json({ msg: 'Cannot reply to a closed grievance' });
        }

        const newReply = {
            senderId: req.user.id,
            role: user.role,
            message,
            createdAt: new Date()
        };

        grievance.replies.push(newReply);
        await grievance.save();

        // Return just the new reply or refreshed grievance.
        // We'll return fresh grievance with populated names
        const updatedGrievance = await Grievance.findById(req.params.id)
            .populate('replies.senderId', 'name role');

        res.json(updatedGrievance);

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
