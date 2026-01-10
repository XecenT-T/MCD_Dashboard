const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    username: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    aadharCardNo: {
        type: String,
        required: true,
        unique: true
    },
    dob: {
        type: Date,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    phoneNo: {
        type: String,
        required: true
    },
    post: {
        type: String, // Designation
        required: true
    },
    role: {
        type: String,
        enum: ['official', 'worker'],
        default: 'official'
    },
    department: {
        type: String,
        default: 'General'
    },
    faceDescriptor: {
        type: Array,
        default: []
    },
    isFaceRegistered: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    isOnboarded: {
        type: Boolean,
        default: false
    },
    preferredLanguage: {
        type: String,
        enum: ['en', 'hi'],
        default: 'en'
    }
});

module.exports = mongoose.model('User', userSchema);
