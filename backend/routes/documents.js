const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const DepartmentNotice = require('../models/DepartmentNotice');
const User = require('../models/User');

// @route   GET api/documents
// @desc    Get documents relevant to the user's department
// @access  Private
router.get('/', auth, async (req, res) => {
    try {
        // Fetch user to know their department
        const user = await User.findById(req.user.id);

        let query = {};
        if (user.department) {
            // Find notices for specific department OR 'All'
            query = {
                $or: [
                    { department: user.department },
                    { department: 'All' }
                ]
            };
        }

        const notices = await DepartmentNotice.find(query).sort({ date: -1 });

        // Map to simpler format if needed by frontend, but Schema is quite similar to frontend expectation
        // Frontend expects: id, title, date, type, size
        const formatted = notices.map(doc => ({
            id: doc._id,
            title: doc.title,
            date: new Date(doc.date).toISOString().split('T')[0],
            type: doc.type || 'PDF',
            size: 'N/A', // Size not currently in schema, default placeholder
            content: doc.content // Include content for viewing details
        }));

        res.json(formatted);

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
