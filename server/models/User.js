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
    preferences: {
        theme: { type: String, enum: ['light', 'dark'], default: 'light' },
        animations: { type: Boolean, default: true }
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
    }
});

module.exports = mongoose.model('User', UserSchema);
