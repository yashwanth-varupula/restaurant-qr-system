const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const path = require('path');
require('dotenv').config();

// Fail fast if the signing secret is missing or weak
if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 16) {
    console.error('[SECURITY] JWT_SECRET is missing or too short. Set a strong secret (16+ characters) in your .env file.');
    process.exit(1);
}

// Routes
const menuRoutes = require('./routes/menuRoutes');
const orderRoutes = require('./routes/orderRoutes');
const staffRoutes = require('./routes/staffRoutes');
const tableRoutes = require('./routes/tableRoutes');
const imageManagerRoutes = require('./routes/imageManagerRoutes');
const { enforceSameOrigin } = require('./middleware/securityMiddleware');

const app = express();
app.set('trust proxy', 1);
const PORT = process.env.PORT || 3000;

// =========================================
// 1. SECURITY MIDDLEWARE
// =========================================

// Disable HTTPS upgrade for local HTTP development.
// The production server can use HTTPS separately.
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            'upgrade-insecure-requests': null,
            'img-src': ["'self'", 'data:', 'blob:', 'https://images.pexels.com'],
            'font-src': ["'self'", 'https://fonts.gstatic.com'],
            'style-src': ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com']
        }
    }
}));

// CORS is allowlist-driven. The frontend is served from the same Express
// server (same origin), so no CORS headers are emitted unless explicitly
// configured via CORS_ORIGIN (comma-separated list) in .env.
const corsOrigins = (process.env.CORS_ORIGIN || '')
    .split(',')
    .map(origin => origin.trim())
    .filter(Boolean);

app.use(cors({
    origin: corsOrigins.length > 0 ? corsOrigins : false,
    credentials: true
}));

app.use(express.json());
app.use(cookieParser());

// =========================================
// 2. RATE LIMITING
// =========================================

const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 500,
    message: {
        error: 'Too many requests, please try again later.'
    }
});

app.use('/api/', apiLimiter);

const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    message: {
        error: 'Too many login attempts, please try again later.'
    }
});

app.use('/api/staff/login', loginLimiter);

// Prevent authenticated API responses from being cached on shared devices.
// Reject cross-site / foreign-origin state-changing requests (CSRF defense-in-depth,
// on top of the existing SameSite=Lax session cookie).
app.use('/api', (req, res, next) => {
    res.set('Cache-Control', 'no-store');
    next();
});

app.use('/api', enforceSameOrigin);

// =========================================
// 3. STATIC FRONTEND FILES
// =========================================

app.use(express.static(
    path.join(__dirname, '../frontend'),
    { index: false }
));

// =========================================
// 5. ROOT ROUTE
// =========================================

app.get('/', (req, res) => {
    res.redirect('/menu.html?table=1');
});

// =========================================
// 6. API ROUTES
// =========================================

app.use('/api/menu', menuRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/staff', staffRoutes);
app.use('/api/tables', tableRoutes);
app.use('/api/image-manager', imageManagerRoutes);

// =========================================
// 7. GLOBAL ERROR HANDLER
// =========================================

app.use((err, req, res, next) => {
    console.error('Global Error:', err.message);

    const message = process.env.NODE_ENV === 'production'
        ? 'Internal server error'
        : err.message;

    res.status(err.status || 500).json({
        error: message
    });
});

// =========================================
// 8. START SERVER
// =========================================

app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`📱 Network access: http://172.21.172.174:${PORT}`);
});