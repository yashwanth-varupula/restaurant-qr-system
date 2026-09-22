const crypto = require('crypto');

// Signed order-confirmation token.
// Lets a customer look up their fresh order by id+table without exposing
// predictable order/table combinations to arbitrary callers. No DB change.

function signOrder(orderId, tableId) {
    const secret = process.env.JWT_SECRET || '';
    return crypto
        .createHmac('sha256', secret)
        .update(`${orderId}:${tableId}`)
        .digest('base64url');
}

function verifyOrder(token, orderId, tableId) {
    if (typeof token !== 'string' || token.length === 0) return false;

    const expected = signOrder(orderId, tableId);
    const actual = Buffer.from(token);
    const wanted = Buffer.from(expected);

    if (actual.length !== wanted.length) return false;

    return crypto.timingSafeEqual(actual, wanted);
}

module.exports = { signOrder, verifyOrder };