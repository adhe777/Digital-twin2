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

    const { sleepHours, studyHours, screenTime, mood, date, workoutEnabled, workoutDuration, workoutType, workoutIntensity, caloriesBurned, waterIntake, syncType } = req.body;

    try {
        const targetDate = new Date(date || Date.now());
        const startOfDay = new Date(targetDate);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(targetDate);
        endOfDay.setHours(23, 59, 59, 999);

        let routine = await Routine.findOne({ 
            user: req.user.id, 
            date: { $gte: startOfDay, $lte: endOfDay } 
        });

        if (!routine) {
            routine = new Routine({
                user: req.user.id,
                date: targetDate,
                sleepHours: 8, studyHours: 0, screenTime: 0, mood: 3 // Defaults
            });
        }

        // Apply Updates based on syncType and current lock status
        if ((syncType === 'habits' || syncType === 'both') && !routine.habitsSynced) {
            routine.sleepHours = sleepHours;
            routine.studyHours = studyHours;
            routine.screenTime = screenTime;
            routine.mood = mood;
            routine.habitsSynced = true;
        }

        if ((syncType === 'workout' || syncType === 'both') && !routine.workoutSynced) {
            routine.workoutEnabled = workoutEnabled;
            if (workoutEnabled) {
                routine.workoutDuration = workoutDuration;
                routine.workoutType = workoutType;
                routine.workoutIntensity = workoutIntensity;
                routine.caloriesBurned = caloriesBurned;
                routine.waterIntake = waterIntake;
            }
            routine.workoutSynced = true;
        }

        const User = require('../models/User');
        const user = await User.findById(req.user.id);

        if (user) {
            // Gamification logic (XP/Badges)
            const rawScore = (routine.studyHours * 10) - (routine.screenTime * 2) + (routine.sleepHours * 2) + (routine.mood * 5);
            const productivityScore = Math.max(0, Math.min(100, round(((rawScore + 20) / 185) * 100)));
            function round(num) { return Math.round(num); }

            // Streak Logic (only increment on first sync of the day)
            const isFirstSyncToday = !routine.isNew && (syncType !== 'both' && (!routine.habitsSynced || !routine.workoutSynced)); 
            // Wait, simplification: if any part was JUST synced, and it's the first log of the day, set streak.
            
            const previousLogs = await Routine.find({ 
                user: req.user.id, 
                _id: { $ne: routine._id },
                date: { $lt: startOfDay } 
            }).sort({ date: -1 }).limit(1);

            const lastLog = previousLogs[0];
            if (!lastLog) {
                if (productivityScore >= 50) user.streak = 1;
            }

            user.xp += 10; // Simple XP for any sync
            await user.save();
        }

        const savedRoutine = await routine.save();
        console.log(`ROUTINE: Independent sync (${syncType}) successful:`, savedRoutine._id);
        res.status(201).json({ success: true, data: savedRoutine, gamification: { streak: user.streak, xp: user.xp } });
    } catch (err) {
        console.error('ROUTINE: SYNC ERROR:', err.message);
        res.status(500).json({ success: false, message: 'Server Error: ' + err.message });
    }
});

// @route   GET api/routines/briefing
// @desc    Generate a personalized briefing based on recent data
// @access  Private
router.get('/briefing', auth, async (req, res) => {
    try {
        const logs = await Routine.find({ user: req.user.id }).sort({ date: -1 }).limit(7);
        
        if (logs.length === 0) {
            return res.json({ message: "I'm still calibrating your digital twin. Start syncing your daily habits so I can provide insights!" });
        }

        const latest = logs[0];
        const avgSleep = logs.reduce((acc, log) => acc + log.sleepHours, 0) / logs.length;
        const totalStudy = logs.reduce((acc, log) => acc + log.studyHours, 0);
        const fitnessDays = logs.filter(log => log.workoutEnabled).length;

        let message = "";
        const User = require('../models/User');
        const user = await User.findById(req.user.id);
        const name = user?.name || "User";

        // Trend Analysis Logic
        if (latest.sleepHours < 6) {
            message = `Hey ${name}, your sleep was a bit low today (${latest.sleepHours}h). Your twin's cognitive efficiency is dropping. Try reaching for 8 hours tonight.`;
        } else if (latest.studyHours > 5) {
            message = `Outstanding focus today! You put in ${latest.studyHours} hours. Your digital intelligence is evolving rapidly.`;
        } else if (fitnessDays >= 3) {
            message = `You've been consistent with your movement! ${fitnessDays} workouts this week. Your twin's energy levels are at their peak.`;
        } else if (latest.mood >= 4) {
            message = `Your positive mood today is driving excellent productivity. Stable and focused—this is your peak performance zone.`;
        } else {
            message = `Synchronization complete. You've maintained a ${user.streak}-day streak. Keep feeding the twin your data to reach higher intelligence tiers.`;
        }

        res.json({ message });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ success: false, message: 'Briefing Error' });
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
