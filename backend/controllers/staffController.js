const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/database');

exports.login = async (req, res, next) => {
    try {
        const { username, password } = req.body;

        // 1. Find user (case-sensitive username match is standard, trim whitespace)
        const [rows] = await db.query(
            'SELECT id, username, password_hash, role, restaurant_id, is_active FROM staff_users WHERE username = ?',
            [username.trim()]
        );

        // 2. Generic error to prevent username enumeration
        if (rows.length === 0 || !rows[0].is_active) {
            return res.status(401).json({ error: 'Invalid username or password' }); 
        }

        const user = rows[0];
        
        // 3. Verify password using bcrypt
        const isMatch = await bcrypt.compare(password, user.password_hash);

        if (!isMatch) {
            return res.status(401).json({ error: 'Invalid username or password' });
        }

        // 4. Create JWT
        const token = jwt.sign(
            { id: user.id, username: user.username, role: user.role, restaurant_id: user.restaurant_id },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN || '8h' }
        );

        // 5. Set HTTP-only cookie
        const maxAge = 8 * 60 * 60 * 1000; // 8 hours in ms

        res.cookie('staff_token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production', // Requires HTTPS in production
            sameSite: 'lax',
            maxAge: maxAge
        });

        // 6. Return success (NO password hash exposed)
        res.json({ 
            success: true, 
            message: 'Login successful',
            data: { username: user.username, role: user.role }
        });
    } catch (error) {
        next(error);
    }
};

exports.logout = async (req, res, next) => {
    try {
        // Clear the HTTP-only cookie
        res.clearCookie('staff_token', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax'
        });
        res.json({ success: true, message: 'Logged out successfully' });
    } catch (error) {
        next(error);
    }
};

// NEW: Endpoint to verify current authenticated staff member
exports.getMe = async (req, res, next) => {
    try {
        // req.staff is attached by the authenticateStaff middleware
        res.json({ 
            success: true, 
            staff: {
                id: req.staff.id,
                username: req.staff.username,
                role: req.staff.role,
                restaurant_id: req.staff.restaurant_id
            }
        });
    } catch (error) {
        next(error);
    }
};