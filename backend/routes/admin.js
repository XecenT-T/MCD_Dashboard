const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const User = require('../models/User');
const auth = require('../middleware/authMiddleware');

// Helper to generate UserID
// Helper to generate UserID
const generateUserId = async (dob) => {
    // Format: MCD-YYYYMMDD-XXXX
    // Use DOB to ensure personalization, plus global sequence for uniqueness
    const date = new Date(dob);
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    const dobStr = `${yyyy}${mm}${dd}`;

    const count = await User.countDocuments() + 1;
    const sequence = count.toString().padStart(4, '0');
    return `MCD-${dobStr}-${sequence}`;
};

// Helper to generate generic password (or random)
const generatePassword = () => {
    return Math.random().toString(36).slice(-8); // 8 char random string
};

// @route   POST api/admin/create-user
// @desc    Admin creates a new user
// @access  Private (Admin/Official only)
router.post('/create-user', auth, async (req, res) => {
    try {
        const loggedInUser = await User.findById(req.user.id);

        // Basic check - in real app, might strict check 'admin' role
        if (loggedInUser.role !== 'official') {
            return res.status(403).json({ msg: 'Not authorized. Only Officials/Admins can create users.' });
        }

        const { name, aadharCardNo, dob, email, phoneNo, post, department, role } = req.body;

        // Check duplicates
        let existingUser = await User.findOne({
            $or: [{ email }, { aadharCardNo }]
        });

        if (existingUser) {
            return res.status(400).json({ msg: 'User with this Email or Aadhar already exists.' });
        }

        // Generate Credentials
        const username = await generateUserId(dob);
        const password = generatePassword();

        // Hash Password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = new User({
            name,
            username,
            password: hashedPassword,
            aadharCardNo,
            dob,
            email,
            phoneNo,
            post,
            department: department || 'General',
            role: role || 'worker'
        });

        await newUser.save();

        // Mock Email Sending (In production, use nodemailer)
        console.log(`[EMAIL MOCK] To: ${email} | Subject: MCD Portal Credentials | Content: UserID: ${username}, Password: ${password}`);

        res.json({
            msg: 'User created successfully',
            credentials: { username, password } // Return to admin for verification or fallback
        });

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
