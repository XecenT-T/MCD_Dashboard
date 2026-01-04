const mongoose = require('mongoose');
const User = require('./models/User');
const bcrypt = require('bcrypt');
require('dotenv').config();

const createTestUsers = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        // Define test users
        const users = [
            {
                name: 'Worker Test',
                username: 'worker_test',
                password: 'password123',
                role: 'worker'
            },
            {
                name: 'Supervisor Test',
                username: 'supervisor_test',
                password: 'password123',
                role: 'supervisor'
            }
        ];

        for (const u of users) {
            // Check if exists
            const existing = await User.findOne({ username: u.username });
            if (existing) {
                console.log(`User ${u.username} already exists. Updating password.`);
                const salt = await bcrypt.genSalt(10);
                existing.password = await bcrypt.hash(u.password, salt);
                await existing.save();
                console.log(`Updated password for ${u.username}`);
            } else {
                const salt = await bcrypt.genSalt(10);
                const hashedPassword = await bcrypt.hash(u.password, salt);
                const newUser = new User({
                    name: u.name,
                    username: u.username,
                    password: hashedPassword,
                    role: u.role
                });
                await newUser.save();
                console.log(`Created user ${u.username}`);
            }
        }

        mongoose.connection.close();
    } catch (err) {
        console.error('Error:', err);
        process.exit(1);
    }
};

createTestUsers();
