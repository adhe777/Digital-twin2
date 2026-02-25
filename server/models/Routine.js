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
        max: 5  // MVP Requirement: 1-5
    },
    date: {
        type: Date,
        default: Date.now
    }
}, { collection: 'routines' }); // MVP Requirement: strict collection name

module.exports = mongoose.model('Routine', RoutineSchema);
