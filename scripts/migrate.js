const pool = require('../backend/config/database');

async function runMigration() {
    try {
        console.log("Starting database migration...");
        
        // 1. Create sequences table
        await pool.query(`
            CREATE TABLE IF NOT EXISTS daily_order_sequences (
                id INT AUTO_INCREMENT PRIMARY KEY,
                restaurant_id INT NOT NULL,
                business_date DATE NOT NULL,
                last_order_number INT NOT NULL DEFAULT 0,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                UNIQUE KEY unique_restaurant_date (restaurant_id, business_date),
                FOREIGN KEY (restaurant_id) REFERENCES restaurants(id) ON DELETE CASCADE
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        `);
        console.log("Created daily_order_sequences table.");

        // 2. Add columns to orders
        try { await pool.query(`ALTER TABLE orders ADD COLUMN restaurant_id INT`); } catch(e) { if(e.code !== 'ER_DUP_FIELDNAME') throw e; }
        try { await pool.query(`ALTER TABLE orders ADD COLUMN business_date DATE`); } catch(e) { if(e.code !== 'ER_DUP_FIELDNAME') throw e; }
        try { await pool.query(`ALTER TABLE orders ADD COLUMN daily_order_number INT`); } catch(e) { if(e.code !== 'ER_DUP_FIELDNAME') throw e; }
        
        console.log("Added columns to orders.");

        // 3. Populate existing orders
        const [orders] = await pool.query(`
            SELECT o.id, t.restaurant_id, DATE(o.created_at) as b_date
            FROM orders o
            JOIN tables t ON o.table_id = t.id
            ORDER BY o.created_at ASC
        `);

        let currentRestaurant = null;
        let currentDate = null;
        let orderNum = 0;

        for (const order of orders) {
            // Format b_date to YYYY-MM-DD using timezone offset or simple string manipulation
            // The DATE() function from MySQL returns a Date object in Node.js mysql2
            const formattedDate = new Date(order.b_date).toISOString().split('T')[0];

            if (order.restaurant_id !== currentRestaurant || formattedDate !== currentDate) {
                currentRestaurant = order.restaurant_id;
                currentDate = formattedDate;
                orderNum = 1;
            } else {
                orderNum++;
            }

            await pool.query(`
                UPDATE orders 
                SET restaurant_id = ?, business_date = ?, daily_order_number = ?
                WHERE id = ?
            `, [currentRestaurant, currentDate, orderNum, order.id]);

            await pool.query(`
                INSERT INTO daily_order_sequences (restaurant_id, business_date, last_order_number)
                VALUES (?, ?, ?)
                ON DUPLICATE KEY UPDATE last_order_number = GREATEST(last_order_number, ?)
            `, [currentRestaurant, currentDate, orderNum, orderNum]);
        }
        console.log("Populated existing orders.");

        // 4. Modify columns and add constraints
        await pool.query(`ALTER TABLE orders MODIFY COLUMN restaurant_id INT NOT NULL`);
        await pool.query(`ALTER TABLE orders ADD CONSTRAINT fk_orders_restaurant FOREIGN KEY (restaurant_id) REFERENCES restaurants(id) ON DELETE RESTRICT`);
        await pool.query(`ALTER TABLE orders MODIFY COLUMN business_date DATE NOT NULL`);
        await pool.query(`ALTER TABLE orders MODIFY COLUMN daily_order_number INT NOT NULL`);
        
        try {
            await pool.query(`ALTER TABLE orders ADD UNIQUE KEY unique_daily_order (restaurant_id, business_date, daily_order_number)`);
        } catch (e) {
            if (e.code !== 'ER_DUP_KEYNAME') throw e;
        }

        console.log("Migration completed successfully.");
    } catch (err) {
        console.error("Migration failed:", err);
    } finally {
        process.exit();
    }
}

runMigration();
