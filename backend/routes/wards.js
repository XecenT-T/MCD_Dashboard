const express = require('express');
const router = express.Router();
const Ward = require('../models/Ward');
const User = require('../models/User');
const DepartmentNotice = require('../models/DepartmentNotice');

// @route   POST /api/wards/seed
// @desc    Seed default wards
// @access  Public (should be protected in prod)
router.post('/seed', async (req, res) => {
    try {
        const defaultWards = [
            "Dwarka Sub City Wards",
            "Janakpuri Wards",
            "Karol Bagh Area Wards",
            "South Delhi Wards",
            "North Delhi Wards"
        ];

        const createdWards = [];
        for (const name of defaultWards) {
            let ward = await Ward.findOne({ name });
            if (!ward) {
                ward = await Ward.create({ name, requiredWorkers: 10 }); // Default 10 required
                createdWards.push(ward);
            }
        }

        res.json({ msg: 'Wards seeded successfully', createdWards });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   GET /api/wards/unassigned
// @desc    Get unassigned workers (optional department filter)
// @access  Public
router.get('/unassigned', async (req, res) => {
    try {
        const { department } = req.query;
        const query = { role: 'worker', ward: null };
        if (department) {
            query.department = department;
        }

        const workers = await User.find(query);
        res.json(workers);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   GET /api/wards
// @desc    Get all wards with workers (optional department filter)
// @access  Public
router.get('/', async (req, res) => {
    try {
        const { department } = req.query;
        // Populate options: match workers by department if provided
        const populateOptions = {
            path: 'workers',
            match: department ? { department } : {}
        };

        const wards = await Ward.find().populate(populateOptions);
        res.json(wards);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   POST /api/wards/transfer
// @desc    Transfer worker to a ward
// @access  Public
router.post('/transfer', async (req, res) => {
    const { workerId, targetWardId } = req.body;

    try {
        const worker = await User.findById(workerId);
        if (!worker) {
            return res.status(404).json({ msg: 'Worker not found' });
        }

        // Check if target ward exists if we want to be strict, currently relying on frontend ID
        // const ward = await Ward.findById(targetWardId);
        // if (!ward) return res.status(404).json({ msg: 'Ward not found' });

        worker.ward = targetWardId;
        await worker.save();

        res.json({ msg: 'Transfer successful', worker });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   POST /api/wards/transfer/batch
// @desc    Batch transfer workers and generate notice
// @access  Public
router.post('/transfer/batch', async (req, res) => {
    const { changes, department, officialId } = req.body; // changes: [{ workerId, targetWardId, workerName, fromWardName, toWardName }]

    if (!changes || changes.length === 0) {
        return res.status(400).json({ msg: 'No changes provided' });
    }

    try {
        // 1. Perform all updates
        const updatePromises = changes.map(change => {
            return User.findByIdAndUpdate(change.workerId, { ward: change.targetWardId });
        });

        await Promise.all(updatePromises);

        // 2. Generate Notice Content
        // Format:
        // Worker Name (ID) moved from [Ward A] to [Ward B]
        let noticeContent = "The following ward transfer orders have been issued:\n\n";
        changes.forEach(change => {
            const from = change.fromWardName || 'Unassigned';
            const to = change.toWardName || 'Unassigned';
            noticeContent += `- ${change.workerName}: Transferred from ${from} to ${to}\n`;
        });

        noticeContent += `\nTotal Transfers: ${changes.length}\n`;
        noticeContent += `Approved by Official ID: ${officialId}`;

        // 3. Create Department Notice
        const notice = new DepartmentNotice({
            title: `Ward Transfer Order - ${new Date().toLocaleDateString()}`,
            content: noticeContent,
            department: department || 'General',
            type: 'Transfer Order',
            postedBy: officialId
        });

        await notice.save();

        res.json({ msg: 'Batch transfer successful and notice generated', notice });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
