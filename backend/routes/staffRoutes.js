const express = require('express');
const router = express.Router();
const staffController = require('../controllers/staffController');
const { authenticateStaff } = require('../middleware/authMiddleware');
const { validateLogin } = require('../middleware/validateMiddleware');

// Public route (protected by rate limiting in server.js)
router.post('/login', validateLogin, staffController.login);

// Protected routes
router.post('/logout', staffController.logout);
router.get('/me', authenticateStaff, staffController.getMe);

module.exports = router;