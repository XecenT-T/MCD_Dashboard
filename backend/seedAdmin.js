const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const dotenv = require('dotenv');
const User = require('./models/User');

dotenv.config();

const seedAdmin = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('MongoDB Connected');

        const username = 'admin';
        const password = 'admin';
        const hashedPassword = await bcrypt.hash(password, 10);

        const adminData = {
            name: 'System Administrator',
            username: username,
            password: hashedPassword,
            aadharCardNo: '0000-0000-0000',
            dob: new Date('1990-01-01'),
            email: 'admin@mcd.gov.in',
            phoneNo: '9999999999',
            post: 'Chief Administrator',
            role: 'official', // official acts as admin
            department: 'General'
        };

        let user = await User.findOne({ username });
        if (user) {
            console.log('Admin user already exists. Updating...');
            await User.findOneAndUpdate({ username }, adminData);
        } else {
            user = new User(adminData);
            await user.save();
            console.log('Admin user created.');
        }

        console.log('Done!');
        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

seedAdmin();
