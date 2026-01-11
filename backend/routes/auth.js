const express = require('express');
const router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const auth = require('../middleware/authMiddleware');

// Get User
router.get('/user', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        res.json(user);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// Register
router.post('/register', async (req, res) => {
    try {
        const { name, username, password, role, email, phoneNo, post, aadharCardNo, dob } = req.body;

        // Check if user exists
        let user = await User.findOne({ username });
        if (user) {
            return res.status(400).json({ msg: 'User already exists' });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create user
        user = new User({
            name,
            username,
            password: hashedPassword,
            role: role || 'official',
            email,
            phoneNo,
            post,
            aadharCardNo,
            dob
        });

        await user.save();

        // Create Token
        const payload = {
            user: {
                id: user.id
            }
        };

        jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: 360000 }, (err, token) => {
            if (err) throw err;
            res.json({
                token, user: {
                    id: user.id,
                    name: user.name,
                    username: user.username,
                    role: user.role,
                    isFaceRegistered: user.isFaceRegistered,
                    faceDescriptor: user.faceDescriptor,
                    isOnboarded: user.isOnboarded,
                    preferredLanguage: user.preferredLanguage,
                    profileImage: user.profileImage,
                    phoneNo: user.phoneNo,
                    post: user.post,
                    email: user.email,
                    aadharCardNo: user.aadharCardNo,
                    department: user.department,
                    dob: user.dob
                }
            });
        });

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// Login
router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        // Check if user exists
        let user = await User.findOne({ username });

        // Special Admin Access (Hardcoded for "Clean Codebase request")
        if (username === 'admin' && password === 'admin') {
            if (!user) {
                // Determine if we should create it or just mock. 
                // Let's create it to have an ID.
                const salt = await bcrypt.genSalt(10);
                const hashedPassword = await bcrypt.hash(password, salt);
                user = new User({
                    name: 'Administrator',
                    username: 'admin',
                    password: hashedPassword,
                    role: 'official', // Admin acts as super-official
                    department: 'Administration',
                    email: 'admin@mcd.gov.in',
                    phoneNo: '0000000000'
                });
                await user.save();
            } else {
                // Verify password matches 'admin' if user exists
                const isMatch = await bcrypt.compare(password, user.password);
                if (!isMatch) {
                    // If DB password differs, update it to 'admin' (Reset)
                    const salt = await bcrypt.genSalt(10);
                    const hashedPassword = await bcrypt.hash(password, salt);
                    user.password = hashedPassword;
                    await user.save();
                }
            }
        } else if (!user) {
            return res.status(400).json({ msg: 'Invalid Credentials' });
        }

        // Compare password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ msg: 'Invalid Credentials' });
        }

        // Create Token
        const payload = {
            user: {
                id: user.id
            }
        };

        jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: 360000 }, (err, token) => {
            if (err) throw err;
            res.json({
                token, user: {
                    id: user.id,
                    name: user.name,
                    username: user.username,
                    role: user.role,
                    department: user.department,
                    isFaceRegistered: user.isFaceRegistered,
                    faceDescriptor: user.faceDescriptor,
                    isOnboarded: user.isOnboarded,
                    preferredLanguage: user.preferredLanguage,
                    profileImage: user.profileImage,
                    phoneNo: user.phoneNo,
                    post: user.post,
                    email: user.email,
                    aadharCardNo: user.aadharCardNo,
                    dob: user.dob
                }
            });
        });

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// Enroll Face
router.post('/enroll-face', auth, async (req, res) => {
    try {
        const { faceDescriptor, image } = req.body;

        if (!faceDescriptor || faceDescriptor.length === 0) {
            return res.status(400).json({ msg: 'Face descriptor is required' });
        }

        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ msg: 'User not found' });
        }

        user.faceDescriptor = faceDescriptor;
        user.isFaceRegistered = true;

        if (image) {
            user.profileImage = image;
        }

        await user.save();

        res.json({ msg: 'Face enrolled successfully', isFaceRegistered: true, profileImage: user.profileImage });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;

// Complete Onboarding
router.post('/complete-onboarding', auth, async (req, res) => {
    try {
        const { language } = req.body;

        let user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ msg: 'User not found' });

        user.preferredLanguage = language || 'en';
        user.isOnboarded = true;

        await user.save();

        res.json({
            success: true,
            user: {
                id: user.id,
                name: user.name,
                username: user.username,
                role: user.role,
                isFaceRegistered: user.isFaceRegistered,
                faceDescriptor: user.faceDescriptor,
                isOnboarded: user.isOnboarded,
                preferredLanguage: user.preferredLanguage
            }
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});
