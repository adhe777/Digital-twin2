const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Routine = require('../models/Routine');

// @route   POST api/routines
// @desc    Add a daily routine
// @access  Private
router.post('/', auth, async (req, res) => {
    console.log('ROUTINE: POST request received');
    console.log('ROUTINE: Body:', req.body);
    console.log('ROUTINE: User ID from token:', req.user.id);

    const { sleepHours, studyHours, screenTime, mood, date } = req.body;
    // ...
    try {
        const newRoutine = new Routine({
            sleepHours,
            studyHours,
            screenTime,
            mood,
            date: date || Date.now(),
            user: req.user.id
        });

        console.log('ROUTINE: Attempting to save...');
        const routine = await newRoutine.save();
        console.log('ROUTINE: Save successful:', routine._id);

        res.status(201).json({ success: true, data: routine });
    } catch (err) {
        console.error('ROUTINE: SAVE ERROR:', err.message);
        res.status(500).json({ success: false, message: 'Server Error: ' + err.message });
    }
});

// @route   GET api/routines
// @desc    Get all routines for user
// @access  Private
router.get('/', auth, async (req, res) => {
    try {
        const routines = await Routine.find({ user: req.user.id }).sort({ date: -1 });
        res.status(200).json(routines);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
});

module.exports = router;
