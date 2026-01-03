const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

mongoose.connect(process.env.MONGODB_URI)
    .then(async () => {
        console.log('Connected to MongoDB');
        try {
            // List indexes to verify
            const indexes = await mongoose.connection.db.collection('users').indexes();
            console.log('Current indexes:', indexes);

            // Drop email index if it exists
            const emailIndex = indexes.find(idx => idx.name === 'email_1');
            if (emailIndex) {
                await mongoose.connection.db.collection('users').dropIndex('email_1');
                console.log('Successfully dropped email_1 index');
            } else {
                console.log('email_1 index not found');
            }

        } catch (e) {
            console.log('Error:', e.message);
        }
        process.exit();
    })
    .catch(err => {
        console.error('Connection Error:', err);
        process.exit(1);
    });
