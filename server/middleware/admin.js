const User = require('../models/User');

module.exports = async function checkAdmin(req, res, next) {
    try {
        // req.user is set by the standard auth middleware which should run before this
        if (!req.user || !req.user.id) {
            return res.status(401).json({ msg: 'Access Denied: No authentication token provided.' });
        }

        const user = await User.findById(req.user.id);
        
        if (!user || user.isAdmin !== true) {
            return res.status(403).json({ msg: 'Access Denied: You do not have admin privileges.' });
        }

        next();
    } catch (err) {
        console.error("ADMIN MIDDLEWARE ERROR:", err);
        res.status(500).json({ msg: 'Server Error verifying admin status' });
    }
};
