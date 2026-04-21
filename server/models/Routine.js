const mongoose = require('mongoose');

const RoutineSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    sleepHours: {
        type: Number,
        required: true
    },
    studyHours: {
        type: Number,
        required: true
    },
    screenTime: {
        type: Number,
        required: true
    },
    mood: {
        type: Number,
        required: true,
        min: 1,
        max: 5
    },
    workoutEnabled: {
        type: Boolean,
        default: false
    },
    workoutDuration: {
        type: Number
    },
    workoutType: {
        type: String
    },
    workoutIntensity: {
        type: String
    },
    caloriesBurned: {
        type: Number
    },
    waterIntake: {
        type: Number
    },
    date: {
        type: Date,
        default: Date.now
    },
    habitsSynced: {
        type: Boolean,
        default: false
    },
    workoutSynced: {
        type: Boolean,
        default: false
    }
}, { collection: 'routines' }); // MVP Requirement: strict collection name

module.exports = mongoose.model('Routine', RoutineSchema);
