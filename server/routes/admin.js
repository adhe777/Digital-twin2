const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const checkAdmin = require('../middleware/admin');
const User = require('../models/User');
const Routine = require('../models/Routine');
const Score = require('../models/Score');

// @route   GET /api/admin/users
// @desc    Get all users
// @access  Private/Admin
router.get('/users', [auth, checkAdmin], async (req, res) => {
    try {
        const users = await User.find().select('-password').sort({ date: -1 });
        res.json(users);
    } catch (err) {
        console.error("getAllUsers Error:", err);
        res.status(500).json({ msg: 'Something went wrong while fetching users' });
    }
});

// @route   DELETE /api/admin/users/:id
// @desc    Delete a user
// @access  Private/Admin
router.delete('/users/:id', [auth, checkAdmin], async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ msg: 'User not found' });
        }

        // Prevent admin from deleting themselves accidentally
        if (user._id.toString() === req.user.id) {
            return res.status(400).json({ msg: 'Cannot delete your own admin account' });
        }

        // Delete user's associated data
        await Routine.deleteMany({ user: req.params.id });
        await Score.deleteMany({ user: req.params.id });
        await User.findByIdAndDelete(req.params.id);

        res.json({ msg: 'User deleted successfully' });
    } catch (err) {
        console.error("deleteUser Error:", err);
        res.status(500).json({ msg: 'Something went wrong while deleting user' });
    }
});

// @route   GET /api/admin/stats
// @desc    Get admin dashboard statistics
// @access  Private/Admin
router.get('/stats', [auth, checkAdmin], async (req, res) => {
    try {
        const totalUsers = await User.countDocuments();
        const totalLogs = await Routine.countDocuments();

        const scores = await Score.find();
        let avgProductivity = 0;
        if (scores.length > 0) {
            const sum = scores.reduce((acc, curr) => acc + curr.score, 0);
            avgProductivity = (sum / scores.length).toFixed(1);
        }

        res.json({
            totalUsers,
            totalLogs,
            averageProductivityScore: parseFloat(avgProductivity)
        });
    } catch (err) {
        console.error("getAdminStats Error:", err);
        res.status(500).json({ msg: 'Something went wrong while fetching stats' });
    }
});

module.exports = router;
