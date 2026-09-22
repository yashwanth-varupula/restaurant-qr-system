const jwt = require('jsonwebtoken');

exports.authenticateStaff = (req, res, next) => {
    // Check HTTP-only cookie first, fallback to Authorization header
    let token = req.cookies?.staff_token || req.headers.authorization?.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'Access denied. No token provided.' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.staff = decoded; // Attaches { id, username, role, restaurant_id }
        next();
    } catch (error) {
        res.status(403).json({ error: 'Invalid or expired token.' });
    }
};