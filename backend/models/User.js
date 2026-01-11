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
        unique: true,
        sparse: true
    },
    dob: {
        type: Date
    },
    email: {
        type: String,
        unique: true,
        sparse: true
    },
    phoneNo: {
        type: String
    },
    post: {
        type: String // Designation
    },
    role: {
        type: String,
        enum: ['official', 'worker', 'hr'],
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
        enum: ['en', 'hi', 'pa', 'mr', 'ta', 'te', 'bn'],
        default: 'en'
    },
    profileImage: {
        type: String,
        default: ''
    }
});

module.exports = mongoose.model('User', userSchema);
