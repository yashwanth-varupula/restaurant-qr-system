exports.validateOrder = (req, res, next) => {
    const { table_id, items, notes } = req.body;
    
    if (!table_id || !Number.isInteger(table_id) || table_id <= 0) {
        return res.status(400).json({ error: 'Valid table_id is required' });
    }
    
    if (!items || !Array.isArray(items) || items.length === 0) {
        return res.status(400).json({ error: 'Order must contain at least one item' });
    }
    
    for (const item of items) {
        if (!item.menu_item_id || !Number.isInteger(item.menu_item_id) || item.menu_item_id <= 0) {
            return res.status(400).json({ error: 'Valid menu_item_id is required for all items' });
        }
        if (!item.quantity || !Number.isInteger(item.quantity) || item.quantity <= 0 || item.quantity > 20) {
            return res.status(400).json({ error: 'Quantity must be an integer between 1 and 20' });
        }
    }
    
    if (notes !== undefined && notes !== null) {
        if (typeof notes !== 'string' || notes.length > 500) {
            return res.status(400).json({ error: 'Notes must be a string of maximum 500 characters' });
        }
    }
    
    next();
};

exports.validateLogin = (req, res, next) => {
    const { username, password } = req.body;
    if (!username || typeof username !== 'string' || username.trim() === '' || username.length > 50) {
        return res.status(400).json({ error: 'Valid username is required' });
    }
    if (!password || typeof password !== 'string' || password.length < 6 || password.length > 100) {
        return res.status(400).json({ error: 'Valid password is required' });
    }
    next();
};