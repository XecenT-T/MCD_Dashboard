const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const payrollController = require('../controllers/payrollController');

const User = require('../models/User');

// Middleware to check if user is HR (or Admin/Official in HR dept)
const checkHR = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ msg: 'User not found' });
        }

        const isHR = user.role === 'hr';
        const isAdminOrGeneral = user.role === 'official' && ['administration', 'general', 'hr'].includes((user.department || '').toLowerCase());

        if (!isHR && !isAdminOrGeneral) {
            return res.status(403).json({ msg: 'Access denied. HR or Administration role required.' });
        }

        // Attach full user to req for controller use if needed
        req.userRole = user.role;
        next();
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error during auth check');
    }
};

// @route   POST /api/payroll/create
// @desc    Create a new payroll entry
// @access  Private (HR only)
router.post('/create', auth, checkHR, payrollController.createPayroll);

// @route   PUT /api/payroll/update/:id
// @desc    Update payroll entry
// @access  Private (HR only)
router.put('/update/:id', auth, checkHR, payrollController.updatePayroll);

// @route   GET /api/payroll/user/:userId
// @desc    Get payrolls for a specific worker/official
// @access  Private (Owner or HR)
router.get('/user/:userId', auth, payrollController.getPayrollByUserId);

// @route   GET /api/payroll/history
// @desc    HR sees all payroll transactions
// @access  Private (HR only)
router.get('/history', auth, checkHR, payrollController.getAllPayrolls);

// @route   GET /api/payroll/slip/:id/pdf
// @desc    Generate and return PDF for a payroll entry
// @access  Private
router.get('/slip/:id/pdf', auth, payrollController.downloadPayslip);

// @route   GET /api/payroll/users
// @desc    Get all users for payroll
// @access  Private (HR only)
router.get('/users', auth, checkHR, payrollController.getUsers);

module.exports = router;
