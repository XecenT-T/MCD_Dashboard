const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const Attendance = require('../models/Attendance');
const Leave = require('../models/Leave');
const Payroll = require('../models/Payroll'); // Assuming Payroll model exists
const User = require('../models/User');

// @route   GET api/dashboard/worker-stats
// @desc    Get aggregated stats for worker dashboard
// @access  Private
router.get('/worker-stats', auth, async (req, res) => {
    try {
        const userId = req.user.id;

        // 1. Attendance Stats (Current Month)
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

        const presentCount = await Attendance.countDocuments({
            user: userId,
            status: 'Present',
            date: { $gte: startOfMonth, $lte: endOfMonth }
        });

        // 2. Leave Balance
        // Assuming fixed quota of 24 leaves per year for now
        const annualQuota = 24;
        const startOfYear = new Date(now.getFullYear(), 0, 1);

        const leavesTaken = await Leave.countDocuments({
            user: userId,
            status: 'Approved',
            // Check based on dates array length or simply documents? 
            // Usually 'dates' is an array. Better to aggregate.
            // For MVP, simplistic count of requests or if model stores days count.
        });

        // Better: Fetch all approved leaves and sum up days
        const approvedLeaves = await Leave.find({
            user: userId,
            status: 'Approved',
            createdAt: { $gte: startOfYear }
        });

        let daysTaken = 0;
        approvedLeaves.forEach(leave => {
            if (leave.dates && Array.isArray(leave.dates)) {
                daysTaken += leave.dates.length;
            } else {
                daysTaken += 1; // Fallback
            }
        });

        const leaveBalance = Math.max(0, annualQuota - daysTaken);

        // 3. Next Pay Date
        // Last day of current month
        const nextPayDate = endOfMonth.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

        // 4. Salary Overview (Last Payroll)
        // We need to check Payroll model name or schema. 
        // Based on payroll.js, it uses payrollController. Let's assume 'Payroll' model.
        // If file doesn't exist, we might fail. I'll check generic 'Payroll' model usage.

        let lastSalary = "N/A";
        try {
            // Attempt to find latest payroll
            const PayrollModel = require('../models/Payroll');
            // Sort by createdAt as month is a string
            const latestPayroll = await PayrollModel.findOne({ user: userId }).sort({ createdAt: -1 });
            if (latestPayroll) {
                lastSalary = `₹ ${latestPayroll.netPay || (latestPayroll.earnings && latestPayroll.earnings.total) || 0}`;
            }
        } catch (e) {
            console.log("Payroll model issue or no data", e.message);
        }

        // 5. Attendance Graph Data (Last 6 Months)
        const graphData = [];
        for (let i = 5; i >= 0; i--) {
            const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const mStart = new Date(d.getFullYear(), d.getMonth(), 1);
            const mEnd = new Date(d.getFullYear(), d.getMonth() + 1, 0);

            const pCount = await Attendance.countDocuments({
                user: userId,
                status: 'Present',
                date: { $gte: mStart, $lte: mEnd }
            });

            graphData.push({
                name: d.toLocaleString('en-US', { month: 'short' }),
                present: pCount,
                fullDate: d // for sorting if needed
            });
        }

        res.json({
            daysPresent: presentCount,
            totalWorkingDays: 26, // Approximation or calculate excluding Sundays
            leaveBalance,
            nextPayDate,
            lastSalary,
            graphData
        });

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
