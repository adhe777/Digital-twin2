const jwt = require('jsonwebtoken');

module.exports = function (req, res, next) {
    // Get token from header
    const authHeader = req.header('Authorization');

    // Check if not token
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ success: false, message: 'No token, authorization denied' });
    }

    const token = authHeader.split(' ')[1];

    // Verify token
    try {
        const secret = 'secrettokentemp';
        console.log('AUTH MIDDLEWARE: Verifying token...');
        const decoded = jwt.verify(token, secret);

        if (!decoded.user || !decoded.user.id) {
            console.error('AUTH MIDDLEWARE: Invalid payload structure - Missing user.id', decoded);
            return res.status(401).json({ success: false, message: 'Invalid token payload' });
        }

        req.user = decoded.user;
        console.log('AUTH MIDDLEWARE: Success. Authenticated user ID:', req.user.id);
        next();
    } catch (err) {
        console.error("AUTH MIDDLEWARE: Verification Error:", err.message);
        res.status(401).json({ success: false, message: 'Session expired or invalid: ' + err.message });
    }
};
