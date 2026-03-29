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

    const { sleepHours, studyHours, screenTime, mood, date, workoutEnabled, workoutDuration, workoutType, workoutIntensity, caloriesBurned, waterIntake } = req.body;
    // ...
    try {
        const newRoutine = new Routine({
            sleepHours,
            studyHours,
            screenTime,
            mood,
            workoutEnabled,
            workoutDuration,
            workoutType,
            workoutIntensity,
            caloriesBurned,
            waterIntake,
            date: date || Date.now(),
            user: req.user.id
        });

        const User = require('../models/User');
        const user = await User.findById(req.user.id);

        if (user) {
            // Calculate productivity score for gamification
            const rawScore = (studyHours * 10) - (screenTime * 2) + (sleepHours * 2) + (mood * 5);
            const productivityScore = Math.max(0, Math.min(100, round(((rawScore + 20) / 185) * 100)));
            
            function round(num) { return Math.round(num); }

            // 1. Update Productivity Streak
            if (productivityScore > 70) {
                user.streak += 1;
            } else if (productivityScore < 40) {
                user.streak = 0;
            }

            // 2. Update Fitness Streak
            if (workoutEnabled === true) {
                user.fitnessStreak = (user.fitnessStreak || 0) + 1;
            } else {
                user.fitnessStreak = Math.max(0, (user.fitnessStreak || 0) - 1);
            }

            // 3. Update XP (bonus XP for working out)
            user.xp += Math.round(productivityScore * 0.5);
            if (workoutEnabled) user.xp += 10;

            // 4. Update Badges
            const newBadges = [];
            if (user.streak >= 3 && !user.badges.includes('Consistent Starter')) newBadges.push('Consistent Starter');
            if (user.streak >= 7 && !user.badges.includes('Focus Master')) newBadges.push('Focus Master');
            if (productivityScore > 80 && !user.badges.includes('Peak Performer')) newBadges.push('Peak Performer');
            // Fitness badges
            if (user.fitnessStreak >= 3 && !user.badges.includes('Fitness Starter')) newBadges.push('Fitness Starter');
            if (user.fitnessStreak >= 7 && !user.badges.includes('Active Performer')) newBadges.push('Active Performer');
            if (user.fitnessStreak >= 14 && !user.badges.includes('Fitness Master')) newBadges.push('Fitness Master');
            
            if (newBadges.length > 0) {
                user.badges = [...new Set([...user.badges, ...newBadges])];
            }

            await user.save();
        }

        console.log('ROUTINE: Attempting to save...');
        const routine = await newRoutine.save();
        console.log('ROUTINE: Save successful:', routine._id);

        res.status(201).json({ success: true, data: routine, gamification: { streak: user.streak, fitnessStreak: user.fitnessStreak, xp: user.xp, badges: user.badges } });
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
