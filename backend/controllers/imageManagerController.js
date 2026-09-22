const db = require('../config/database');
const multer = require('multer');
const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const { searchPexelsScored, searchPexelsForItem } = require('../utils/pexelsService');
const { buildSearchQuery, buildSearchQueries } = require('../utils/foodSearchQuery');

const IMAGE_URL_MAX_LENGTH = 1000;

// Store uploaded image temporarily in memory
const storage = multer.memoryStorage();

const upload = multer({
    storage,
    limits: {
        fileSize: 10 * 1024 * 1024 // 10 MB
    },
    fileFilter: (req, file, cb) => {
        const allowedTypes = [
            'image/jpeg',
            'image/png',
            'image/webp'
        ];

        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Only JPG, PNG and WEBP images are allowed'));
        }
    }
});

// GET all menu items for image management
exports.getMenuItems = async (req, res, next) => {
    try {
        const {
            search = '',
            category = 'all',
            filter = 'all'
        } = req.query;

        let query = `
            SELECT
                mi.id,
                mi.name,
                mi.price,
                mi.image_url,
                c.name AS category_name
            FROM menu_items mi
            LEFT JOIN categories c ON mi.category_id = c.id
            WHERE mi.is_available = 1
        `;

        const params = [];

        if (search.trim()) {
            query += ` AND mi.name LIKE ?`;
            params.push(`%${search.trim()}%`);
        }

        if (category !== 'all') {
            query += ` AND c.id = ?`;
            params.push(category);
        }

        if (filter === 'uploaded' || filter === 'assigned') {
            query += ` AND mi.image_url IS NOT NULL AND mi.image_url != ''`;
        }

        if (filter === 'missing') {
            query += ` AND (mi.image_url IS NULL OR mi.image_url = '')`;
        }

        query += ` ORDER BY c.id ASC, mi.name ASC`;

        const [items] = await db.query(query, params);

        const [categories] = await db.query(`
            SELECT id, name
            FROM categories
            ORDER BY id ASC
        `);

        const [statsRows] = await db.query(`
            SELECT
                COUNT(*) AS total,
                SUM(
                    CASE
                        WHEN image_url IS NOT NULL
                        AND image_url != ''
                        THEN 1
                        ELSE 0
                    END
                ) AS uploaded
            FROM menu_items
            WHERE is_available = 1
        `);

        const total = Number(statsRows[0].total || 0);
        const uploaded = Number(statsRows[0].uploaded || 0);

        res.json({
            success: true,
            data: {
                items,
                categories,
                stats: {
                    total,
                    uploaded,
                    missing: total - uploaded,
                    progress: total > 0
                        ? Math.round((uploaded / total) * 100)
                        : 0
                }
            }
        });

    } catch (error) {
        next(error);
    }
};


// POST upload/replace menu item image
exports.upload = upload.single('image');

exports.uploadImage = async (req, res, next) => {
    try {
        const menuItemId = parseInt(req.body.menu_item_id, 10);

        if (!menuItemId || Number.isNaN(menuItemId)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid menu item ID'
            });
        }

        if (!req.file) {
            return res.status(400).json({
                success: false,
                error: 'Please select an image'
            });
        }

        // Verify menu item exists
        const [items] = await db.query(
            `SELECT id, name, image_url
             FROM menu_items
             WHERE id = ?`,
            [menuItemId]
        );

        if (items.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'Menu item not found'
            });
        }

        const item = items[0];

        // Upload directory
        const uploadDir = path.join(
            __dirname,
            '../../frontend/uploads/menu'
        );

        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, {
                recursive: true
            });
        }

        // Use menu item ID as filename
        const filename = `${menuItemId}.jpg`;

        const filepath = path.join(
            uploadDir,
            filename
        );

        // Process image
        await sharp(req.file.buffer)
            .resize(1024, 1024, {
                fit: 'inside',
                withoutEnlargement: true
            })
            .jpeg({
                quality: 85,
                progressive: true
            })
            .toFile(filepath);

        const dbPath = `/uploads/menu/${filename}`;

        // Remove old image if it exists
        if (
            item.image_url &&
            item.image_url !== dbPath
        ) {
            const oldPath = path.join(
                __dirname,
                '../../frontend',
                item.image_url
            );

            if (
                fs.existsSync(oldPath) &&
                fs.statSync(oldPath).isFile()
            ) {
                fs.unlinkSync(oldPath);
            }
        }

        // Update database
        await db.query(
            `UPDATE menu_items
             SET image_url = ?
             WHERE id = ?`,
            [dbPath, menuItemId]
        );

        res.json({
            success: true,
            message: 'Image uploaded successfully',
            data: {
                image_url: dbPath,
                filename,
                menu_item_id: menuItemId
            }
        });

    } catch (error) {
        console.error('Image upload error:', error);
        next(error);
    }
};


// DELETE menu item image
exports.removeImage = async (req, res, next) => {
    try {
        const menuItemId = parseInt(req.params.id, 10);

        if (!menuItemId || Number.isNaN(menuItemId)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid menu item ID'
            });
        }

        const [items] = await db.query(
            `SELECT image_url
             FROM menu_items
             WHERE id = ?`,
            [menuItemId]
        );

        if (items.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'Menu item not found'
            });
        }

        const imageUrl = items[0].image_url;

        if (imageUrl) {
            const filepath = path.join(
                __dirname,
                '../../frontend',
                imageUrl
            );

            if (
                fs.existsSync(filepath) &&
                fs.statSync(filepath).isFile()
            ) {
                fs.unlinkSync(filepath);
            }
        }

        await db.query(
            `UPDATE menu_items
             SET image_url = NULL
             WHERE id = ?`,
            [menuItemId]
        );

        res.json({
            success: true,
            message: 'Image removed successfully'
        });

    } catch (error) {
        next(error);
    }
};


/* -----------------------------------------
   Pexels search / save (external image URLs)
----------------------------------------- */

const VALID_PROTOCOL = /^https:\/\//i;

function validateImageUrl(rawUrl) {
    const value = String(rawUrl || '').trim();

    if (!value || value.length > IMAGE_URL_MAX_LENGTH) {
        return null;
    }

    // Relative same-origin paths (existing local uploads) are acceptable.
    if (value.startsWith('/') && !value.startsWith('//')) {
        return value;
    }

    if (!VALID_PROTOCOL.test(value)) {
        return null;
    }

    try {
        const parsed = new URL(value);
        if (parsed.protocol !== 'https:') return null;
        return parsed.toString();
    } catch (_) {
        return null;
    }
}

// GET /api/image-manager/search?q=...
exports.searchImages = async (req, res, next) => {
    try {
        const query = String(req.query.q || '')
            .trim()
            .replace(/\s+/g, ' ');

        if (query.length < 2 || query.length > 100) {
            return res.status(400).json({
                success: false,
                error: 'Search query must be between 2 and 100 characters.'
            });
        }

        const { results, dropped } = await searchPexelsScored(query);

        res.json({
            success: true,
            data: {
                query,
                results,
                dropped,
                noResults: results.length === 0
            }
        });

    } catch (error) {
        if (error.code === 'PEXELS_NOT_CONFIGURED') {
            return res.status(503).json({
                success: false,
                error: error.message,
                configNeeded: true
            });
        }
        if (error.code === 'PEXELS_INVALID_KEY' ||
            error.code === 'PEXELS_RATE_LIMIT' ||
            error.code === 'PEXELS_NETWORK' ||
            error.code === 'PEXELS_ERROR') {
            return res.status(502).json({
                success: false,
                error: error.message,
                configNeeded: false
            });
        }
        next(error);
    }
};

// POST /api/image-manager/suggest  { menu_item_id }
// Builds an exact-dish query (plus 2-3 fallback queries) from the item name +
// category, searches Pexels, and returns only relevance-scored candidates.
exports.suggestImages = async (req, res, next) => {
    try {
        const menuItemId = parseInt(req.body.menu_item_id, 10);

        if (!menuItemId || Number.isNaN(menuItemId)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid menu item ID'
            });
        }

        const [items] = await db.query(
            `SELECT mi.name, c.name AS category_name
             FROM menu_items mi
             LEFT JOIN categories c ON mi.category_id = c.id
             WHERE mi.id = ?`,
            [menuItemId]
        );

        if (items.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'Menu item not found'
            });
        }

        const { name, category_name } = items[0];

        const preparedQueries = buildSearchQueries(name, category_name);
        const searchResult = await searchPexelsForItem(name, preparedQueries);

        res.json({
            success: true,
            data: {
                item_name: name,
                query: preparedQueries.length ? preparedQueries[0].query : name,
                queryPlan: preparedQueries,
                queries: searchResult.queries,
                results: searchResult.results,
                noResults: searchResult.noResults
            }
        });

    } catch (error) {
        if (error.code === 'PEXELS_NOT_CONFIGURED') {
            return res.status(503).json({
                success: false,
                error: error.message,
                configNeeded: true
            });
        }
        if (error.code === 'PEXELS_INVALID_KEY' ||
            error.code === 'PEXELS_RATE_LIMIT' ||
            error.code === 'PEXELS_NETWORK' ||
            error.code === 'PEXELS_ERROR') {
            return res.status(502).json({
                success: false,
                error: error.message,
                configNeeded: false
            });
        }
        next(error);
    }
};

// POST /api/image-manager/save  { menu_item_id, image_url }
exports.saveImage = async (req, res, next) => {
    try {
        const menuItemId = parseInt(req.body.menu_item_id, 10);
        const imageUrl = validateImageUrl(req.body.image_url);

        if (!menuItemId || Number.isNaN(menuItemId)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid menu item ID'
            });
        }

        if (!imageUrl) {
            return res.status(400).json({
                success: false,
                error: 'A valid https image URL is required.'
            });
        }

        const [items] = await db.query(
            `SELECT id FROM menu_items WHERE id = ?`,
            [menuItemId]
        );

        if (items.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'Menu item not found'
            });
        }

        await db.query(
            `UPDATE menu_items
             SET image_url = ?
             WHERE id = ?`,
            [imageUrl, menuItemId]
        );

        res.json({
            success: true,
            message: 'Image assigned successfully',
            data: {
                menu_item_id: menuItemId,
                image_url: imageUrl
            }
        });

    } catch (error) {
        next(error);
    }
};