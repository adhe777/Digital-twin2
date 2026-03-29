const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ['Student', 'Professional'],
        default: 'Student'
    },
    gender: {
        type: String,
        enum: ['Male', 'Female'],
        default: 'Male'
    },
    isAdmin: {
        type: Boolean,
        default: false
    },
    preferences: {
        theme: { type: String, enum: ['light', 'dark'], default: 'light' },
        animations: { type: Boolean, default: true },
        fitnessEnabled: { type: Boolean, default: false }
    },
    studentSettings: {
        preferredStudyTime: { type: String, enum: ['Morning', 'Afternoon', 'Night'], default: 'Morning' },
        studyGoal: { type: Number, default: 4 }
    },
    professionalSettings: {
        workHoursPerDay: { type: Number, default: 8 },
        focusLevel: { type: String, enum: ['Low', 'Medium', 'High'], default: 'Medium' }
    },
    date: {
        type: Date,
        default: Date.now
    },
    streak: {
        type: Number,
        default: 0
    },
    xp: {
        type: Number,
        default: 0
    },
    badges: {
        type: [String],
        default: []
    },
    fitnessStreak: {
        type: Number,
        default: 0
    }
});

module.exports = mongoose.model('User', UserSchema);
