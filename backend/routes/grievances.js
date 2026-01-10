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

        // Find grievances for the official's department (case-insensitive)
        const grievances = await Grievance.find({
            department: { $regex: new RegExp(`^${user.department}$`, 'i') }
        })
            .populate('userId', 'name role department')
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
            .populate("userId", "name role department")
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
        const hrDepartments = ["general", "administration", "hr"];
        const userDept = (user.department || '').toLowerCase(); // Normalized user department

        if (grievance.department !== user.department && !hrDepartments.includes(userDept)) {
            // HR/General can edit any (simplified permission for this flow)
            // or restrict strictly. For now, strict department check unless HR.
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

// @route   PATCH api/grievances/:id/approval
// @desc    Update grievance approval (Supervisor/HR)
// @access  Private (Official only)
router.patch('/:id/approval', auth, async (req, res) => {
    try {
        const { role, approved } = req.body; // role: 'supervisor' | 'hr', approved: boolean
        const user = await require('../models/User').findById(req.user.id);

        if (user.role !== 'official') {
            return res.status(403).json({ msg: 'Not authorized' });
        }

        let grievance = await Grievance.findById(req.params.id);
        if (!grievance) return res.status(404).json({ msg: 'Grievance not found' });

        // Update specific approval flag
        if (role === 'supervisor') {
            grievance.supervisorApproval = approved;
        } else if (role === 'hr') {
            grievance.hrApproval = approved;
        } else {
            return res.status(400).json({ msg: 'Invalid role for approval' });
        }

        // Calculate Status based on rules
        // 1. If supervisor marks FALSE -> Denied (Independent of HR)
        // 2. If HR marks FALSE -> Denied
        // 3. If Both TRUE -> Approved
        // 4. Otherwise -> Pending

        // Fetch the submitter's role to determine approval logic
        const submitter = await require('../models/User').findById(grievance.userId);
        const isOfficialSubmitter = submitter && submitter.role === 'official';

        // Logic Refinement:
        // 1. Rejected if ANY active approval is set to FALSE
        if (grievance.supervisorApproval === false) {
            grievance.status = 'rejected';
        } else if (grievance.hrApproval === false) {
            grievance.status = 'rejected';
        }
        // 2. Resolved (Approved) Condition
        else if (isOfficialSubmitter) {
            // Officials only need HR Approval (Supervisor approval is null/irrelevant)
            if (grievance.hrApproval === true) {
                grievance.status = 'resolved';
            } else {
                grievance.status = 'pending';
            }
        } else {
            // Workers need BOTH Supervisor AND HR Approval
            if (grievance.supervisorApproval === true && grievance.hrApproval === true) {
                grievance.status = 'resolved';
            } else {
                grievance.status = 'pending';
            }
        }

        await grievance.save();
        res.json(grievance);

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
