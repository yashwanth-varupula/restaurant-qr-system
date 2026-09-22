const db = require('../config/database');

// Fetches full menu grouped by category
exports.getFullMenu = async (req, res, next) => {
    try {
        const query = `
            SELECT 
                c.id AS category_id, c.name AS category_name, c.display_order AS category_order,
                m.id AS item_id, m.name AS item_name, m.description, m.ingredients,
                m.price, m.image_url, m.is_veg, m.is_available, m.display_order AS item_order
            FROM categories c
            LEFT JOIN menu_items m ON c.id = m.category_id AND m.is_available = TRUE
            WHERE c.is_active = TRUE
            ORDER BY c.display_order ASC, m.display_order ASC, m.name ASC
        `;
        
        const [rows] = await db.query(query);

        // Group items by category in JavaScript (faster than complex SQL grouping)
        const menu = {};
        rows.forEach(row => {
            if (!menu[row.category_id]) {
                menu[row.category_id] = {
                    id: row.category_id,
                    name: row.category_name,
                    display_order: row.category_order,
                    items: []
                };
            }
            if (row.item_id) {
                menu[row.category_id].items.push({
                    id: row.item_id,
                    name: row.item_name,
                    description: row.description,
                    ingredients: row.ingredients,
                    price: parseFloat(row.price),
                    image_url: row.image_url,
                    is_veg: Boolean(row.is_veg),
                    is_available: Boolean(row.is_available)
                });
            }
        });

        const menuArray = Object.values(menu).sort((a, b) => a.display_order - b.display_order);
        res.json({ success: true, data: menuArray });
    } catch (error) {
        next(error);
    }
};

// Fetches single item details
exports.getMenuItemById = async (req, res, next) => {
    try {
        const { id } = req.params;
        const query = `
            SELECT m.id, m.name, m.description, m.ingredients, m.price, 
                   m.image_url, m.is_veg, m.is_available, c.name AS category_name
            FROM menu_items m
            JOIN categories c ON m.category_id = c.id
            WHERE m.id = ?
        `;
        
        const [rows] = await db.query(query, [id]);

        if (rows.length === 0) {
            return res.status(404).json({ error: 'Menu item not found' });
        }

        const item = rows[0];
        item.price = parseFloat(item.price);
        item.is_veg = Boolean(item.is_veg);
        item.is_available = Boolean(item.is_available);

        res.json({ success: true, data: item });
    } catch (error) {
        next(error);
    }
};