const mongoose = require('mongoose');
const User = require('../models/User');
const Chat = require('../models/Chat');
const Attendance = require('../models/Attendance');
const Payroll = require('../models/Payroll');
const DepartmentNotice = require('../models/DepartmentNotice');
require('dotenv').config();

const resetContext = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('MongoDB Connected');

        // Find the Official User
        // We will find ALL users with role 'official' and seed/reset for them to be safe
        const users = await User.find({ role: 'official' });

        console.log(`Found ${users.length} official users.`);

        for (const user of users) {
            console.log(`Processing User: ${user.name} (${user.email})`);
            await processUser(user);
        }
    } catch (err) {
        console.error(err);
    } finally {
        await mongoose.connection.close();
    }
};

const processUser = async (user) => {
    // 1. Clear Chat History
    const result = await Chat.deleteMany({ user: user._id });
    console.log(`Cleared ${result.deletedCount} chat histories.`);

    // 2. Check Data Presence
    const attendanceCount = await Attendance.countDocuments({ user: user._id });
    const payrollCount = await Payroll.countDocuments({ user: user._id });

    console.log(`- Attendance: ${attendanceCount}, Payroll: ${payrollCount}`);

    // 3. Seed Mock Data if Missing
    if (attendanceCount === 0) {
        console.log('Seeding Mock Attendance...');
        await Attendance.create({
            user: user._id,
            date: new Date(),
            status: 'Present',
            checkInTime: '09:00 AM',
            checkOutTime: '05:00 PM',
            dateKey: new Date().toISOString().split('T')[0]
        });
    }

    if (payrollCount === 0) {
        console.log('Seeding Mock Payroll...');
        await Payroll.create({
            user: user._id,
            month: 'October',
            year: '2023',
            netPay: '45000',
            status: 'Processed'
        });
    }
};

// resetContext(); 
// We need to move the call inside or remove the wrapper logic if we change structure.
// Refactoring slightly to keep it clean.


resetContext();
