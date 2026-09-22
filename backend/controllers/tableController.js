const db = require('../config/database');

// Returns active tables for QR printing. 
// Scoped to DEFAULT_RESTAURANT_ID to prevent cross-restaurant data leakage in a single-tenant setup.
exports.getActiveTables = async (req, res, next) => {
    try {
        const restaurantId = process.env.DEFAULT_RESTAURANT_ID || 1;
        
        const [rows] = await db.query(
            'SELECT id, table_number FROM tables WHERE restaurant_id = ? AND is_active = TRUE ORDER BY table_number ASC',
            [restaurantId]
        );
        
        res.json({ success: true, tables: rows });
    } catch (error) {
        next(error);
    }
};