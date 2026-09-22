// securityMiddleware.js
// Defense-in-depth CSRF / same-origin enforcement, on top of the
// SameSite=Lax session cookie already set in staffController.

const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);

// Reject state-changing requests whose Origin header does not match the
// Host the request was sent to. The frontend is served from the same
// Express server (same origin), so a cross-site Origin is always a red flag.
// NOTE: header-based checks are spoofable by non-browser clients, so this
// layers on top of the SameSite=Lax cookie rather than replacing it.
exports.enforceSameOrigin = (req, res, next) => {
    const origin = req.headers.origin;

    // No Origin header (curl/Postman/same-origin GET) -> allow through.
    if (!origin || SAFE_METHODS.has(req.method)) {
        return next();
    }

    const host = req.headers.host;
    let originHost = null;
    try {
        originHost = new URL(origin).host;
    } catch (_) {
        originHost = null;
    }

    if (!host || !originHost || originHost !== host) {
        return res.status(403).json({ error: 'Cross-origin request rejected' });
    }

    next();
};

// Ensure authenticated API responses are never cached on shared devices.
exports.enforceNoStore = (req, res, next) => {
    res.set('Cache-Control', 'no-store');
    next();
};
