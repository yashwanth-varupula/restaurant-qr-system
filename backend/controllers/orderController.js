const db = require('../config/database');
const { signOrder, verifyOrder } = require('../utils/orderToken');

// ==========================================
// STRICT ID VALIDATION
// ==========================================

const isValidId = (id) =>
    typeof id === 'string' &&
    /^\d+$/.test(id) &&
    parseInt(id, 10) > 0;

const getBusinessDate = () => {
    const timeZone = process.env.TIMEZONE || 'Asia/Kolkata';
    return new Intl.DateTimeFormat('en-CA', {
        timeZone,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
    }).format(new Date());
};


// ==========================================
// 1. CREATE ORDER - CUSTOMER
// ==========================================

exports.createOrder = async (req, res, next) => {

    let connection;

    try {

        connection = await db.getConnection();

        const {
            table_id,
            items,
            notes
        } = req.body;


        // Validate table
        const [tableRows] = await connection.query(
            `
            SELECT id, restaurant_id, is_active
            FROM tables
            WHERE id = ? AND is_active = TRUE
            `,
            [table_id]
        );


        if (tableRows.length === 0) {

            return res.status(400).json({
                error: 'Invalid or inactive table.'
            });
        }


        // Validate items
        if (
            !Array.isArray(items) ||
            items.length === 0
        ) {

            return res.status(400).json({
                error: 'Order must contain at least one item.'
            });
        }


        const itemIds =
            items.map(item => item.menu_item_id);


        const [menuRows] = await connection.query(
            `
            SELECT
                id,
                price,
                is_available
            FROM menu_items
            WHERE id IN (?)
            `,
            [itemIds]
        );


        const menuMap = {};

        menuRows.forEach(row => {
            menuMap[row.id] = row;
        });


        let totalAmount = 0;

        const orderItemsData = [];


        // Calculate everything from DB prices
        for (const item of items) {

            const dbItem =
                menuMap[item.menu_item_id];


            if (!dbItem) {

                const notFoundError =
                    new Error(
                        `Menu item ${item.menu_item_id} not found.`
                    );

                notFoundError.status = 400;

                throw notFoundError;
            }


            if (!dbItem.is_available) {

                const unavailableError =
                    new Error(
                        `Item ${item.menu_item_id} is unavailable.`
                    );

                unavailableError.status = 400;

                throw unavailableError;
            }


            const quantity =
                Number(item.quantity);


            if (
                !Number.isInteger(quantity) ||
                quantity <= 0
            ) {

                const quantityError =
                    new Error(
                        `Invalid quantity for menu item ${item.menu_item_id}.`
                    );

                quantityError.status = 400;

                throw quantityError;
            }


            const actualPrice =
                parseFloat(dbItem.price);


            const subtotal =
                actualPrice * quantity;


            totalAmount += subtotal;


            orderItemsData.push({
                menu_item_id: item.menu_item_id,
                quantity: quantity,
                price_at_order: actualPrice,
                subtotal: subtotal
            });
        }


        // ==========================================
        // TRANSACTION
        // ==========================================

        await connection.beginTransaction();

        const business_date = getBusinessDate();
        const restaurant_id = tableRows[0].restaurant_id;

        // Ensure sequence counter row exists for this restaurant and business date
        await connection.query(
            `INSERT INTO daily_order_sequences (restaurant_id, business_date, last_order_number)
             VALUES (?, ?, 0)
             ON DUPLICATE KEY UPDATE id = id`,
            [restaurant_id, business_date]
        );
        
        // Exclusively lock the row for atomic increment
        const [seqRows] = await connection.query(
            `SELECT last_order_number 
             FROM daily_order_sequences 
             WHERE restaurant_id = ? AND business_date = ? 
             FOR UPDATE`,
            [restaurant_id, business_date]
        );
        const daily_order_number = (seqRows[0]?.last_order_number || 0) + 1;

        await connection.query(
            `UPDATE daily_order_sequences 
             SET last_order_number = ? 
             WHERE restaurant_id = ? AND business_date = ?`,
            [daily_order_number, restaurant_id, business_date]
        );


        const [orderResult] =
            await connection.query(
                `
                INSERT INTO orders
                    (
                        restaurant_id,
                        table_id,
                        business_date,
                        daily_order_number,
                        total_amount,
                        notes,
                        status
                    )
                VALUES (?, ?, ?, ?, ?, ?, ?)
                `,
                [
                    restaurant_id,
                    table_id,
                    business_date,
                    daily_order_number,
                    totalAmount,
                    notes || null,
                    'NEW'
                ]
            );


        const orderId =
            orderResult.insertId;


        const itemValues =
            orderItemsData.map(item => [
                orderId,
                item.menu_item_id,
                item.quantity,
                item.price_at_order,
                item.subtotal
            ]);


        await connection.query(
            `
            INSERT INTO order_items
                (
                    order_id,
                    menu_item_id,
                    quantity,
                    price_at_order,
                    subtotal
                )
            VALUES ?
            `,
            [itemValues]
        );


        await connection.commit();


        // ==========================================
        // SUCCESS
        // ==========================================

        res.status(201).json({

            success: true,

            message:
                'Order placed successfully',

            data: {

                order_id: orderId,

                daily_order_number: daily_order_number,

                business_date: business_date,

                table_id: table_id,

                total_amount:
                    totalAmount,

                status:
                    'NEW',

                confirm_token:
                    signOrder(orderId, table_id)
            }
        });


    } catch (error) {

        if (connection) {

            try {
                await connection.rollback();
            } catch (rollbackError) {
                console.error(
                    'Rollback error:',
                    rollbackError.message
                );
            }
        }

        next(error);


    } finally {

        if (connection) {
            connection.release();
        }
    }
};


// ==========================================
// 2. GET ORDERS
// STAFF DASHBOARD
// ==========================================

exports.getOrders = async (
    req,
    res,
    next
) => {

    try {

        const { status, date } = req.query;

        let query = `
            SELECT

                o.id,
                o.table_id,
                t.table_number,
                o.status,
                o.total_amount,
                o.notes,
                o.created_at,
                o.business_date,
                o.daily_order_number,

                oi.menu_item_id,
                mi.name AS item_name,
                oi.quantity,
                oi.price_at_order,
                oi.subtotal

            FROM orders o

            JOIN tables t
                ON o.table_id = t.id

            LEFT JOIN order_items oi
                ON o.id = oi.order_id

            LEFT JOIN menu_items mi
                ON oi.menu_item_id = mi.id

            WHERE
                t.restaurant_id = ?
        `;


        const params = [
            req.staff.restaurant_id
        ];

        if (date) {
            query += ' AND o.business_date = ?';
            params.push(date);
        } else if (date !== 'all') { // if date is explicitly 'all', don't filter by date
            const business_date = getBusinessDate();
            query += ' AND o.business_date = ?';
            params.push(business_date);
        }


        if (
            status &&
            status !== 'ALL'
        ) {

            query +=
                ' AND o.status = ?';

            params.push(status);
        }


        query += `
            ORDER BY
                o.created_at DESC,
                o.id DESC
        `;


        const [rows] =
            await db.query(
                query,
                params
            );


        const ordersMap = {};


        rows.forEach(row => {

            if (!ordersMap[row.id]) {

                ordersMap[row.id] = {

                    id:
                        row.id,

                    table_id:
                        row.table_id,

                    table_number:
                        row.table_number,

                    status:
                        row.status,

                    total_amount:
                        parseFloat(
                            row.total_amount
                        ),

                    notes:
                        row.notes,

                    created_at:
                        row.created_at,

                    business_date:
                        row.business_date,

                    daily_order_number:
                        row.daily_order_number,

                    items: []
                };
            }


            if (row.menu_item_id) {

                ordersMap[row.id]
                    .items.push({

                        menu_item_id:
                            row.menu_item_id,

                        name:
                            row.item_name,

                        quantity:
                            row.quantity,

                        price:
                            parseFloat(
                                row.price_at_order
                            ),

                        subtotal:
                            parseFloat(
                                row.subtotal
                            )
                    });
            }
        });


        res.json({

            success: true,

            data: Object.values(ordersMap).sort((a, b) => b.id - a.id)
        });


    } catch (error) {

        next(error);
    }
};

// ==========================================
// 2.5 GET ORDER HISTORY SUMMARY
// STAFF DASHBOARD
// ==========================================

exports.getOrderHistorySummary = async (
    req,
    res,
    next
) => {
    try {
        const query = `
            SELECT 
                business_date, 
                COUNT(*) as total_orders
            FROM orders
            WHERE restaurant_id = ?
            GROUP BY business_date
            ORDER BY business_date DESC
        `;

        const [rows] = await db.query(query, [req.staff.restaurant_id]);

        res.json({
            success: true,
            data: rows
        });
    } catch (error) {
        next(error);
    }
};


// ==========================================
// 2.75 GET TODAY'S SUMMARY
// STAFF DASHBOARD - REAL DATA ONLY
// ==========================================

exports.getTodaySummary = async (
    req,
    res,
    next
) => {
    try {

        const business_date = getBusinessDate();
        const restaurant_id = req.staff.restaurant_id;

        const [rows] = await db.query(
            `
            SELECT
                COUNT(*) AS orders_today,
                COALESCE(SUM(
                    CASE
                        WHEN status <> 'CANCELLED' THEN total_amount
                        ELSE 0
                    END
                ), 0) AS sales_today,
                SUM(CASE WHEN status = 'NEW' THEN 1 ELSE 0 END) AS pending,
                SUM(CASE WHEN status IN ('NEW', 'CONFIRMED') THEN 1 ELSE 0 END) AS active,
                SUM(CASE WHEN status = 'COMPLETED' THEN 1 ELSE 0 END) AS completed
            FROM orders
            WHERE restaurant_id = ?
              AND business_date = ?
            `,
            [restaurant_id, business_date]
        );

        res.json({
            success: true,
            data: {
                business_date: business_date,
                orders_today: Number(rows[0].orders_today || 0),
                sales_today: parseFloat(rows[0].sales_today || 0),
                pending: Number(rows[0].pending || 0),
                active: Number(rows[0].active || 0),
                completed: Number(rows[0].completed || 0)
            }
        });

    } catch (error) {
        next(error);
    }
};


// ==========================================
// 3. UPDATE ORDER STATUS
// STAFF DASHBOARD
// ==========================================

exports.updateOrderStatus = async (
    req,
    res,
    next
) => {

    try {

        const { id } =
            req.params;

        const { status } =
            req.body;


        if (!isValidId(id)) {

            return res.status(400).json({
                error: 'Invalid Order ID'
            });
        }


        const validStatuses = [
            'CONFIRMED',
            'COMPLETED',
            'CANCELLED'
        ];


        if (
            !validStatuses.includes(status)
        ) {

            return res.status(400).json({
                error: 'Invalid status'
            });
        }


        const validTransitions = {

            NEW: [
                'CONFIRMED',
                'CANCELLED'
            ],

            CONFIRMED: [
                'COMPLETED',
                'CANCELLED'
            ]
        };


        // Restaurant isolation
        const [orderRows] =
            await db.query(
                `
                SELECT
                    o.status

                FROM orders o

                JOIN tables t
                    ON o.table_id = t.id

                WHERE
                    o.id = ?
                    AND t.restaurant_id = ?
                `,
                [
                    parseInt(id, 10),
                    req.staff.restaurant_id
                ]
            );


        if (orderRows.length === 0) {

            return res.status(404).json({
                error: 'Order not found'
            });
        }


        const currentStatus =
            orderRows[0].status;


        if (
            !validTransitions[currentStatus] ||
            !validTransitions[currentStatus]
                .includes(status)
        ) {

            return res.status(400).json({

                error:
                    `Invalid status transition from ${currentStatus} to ${status}`
            });
        }


        await db.query(
            `
            UPDATE orders
            SET status = ?
            WHERE id = ?
            `,
            [
                status,
                parseInt(id, 10)
            ]
        );


        res.json({

            success: true,

            message:
                `Order status updated to ${status}`
        });


    } catch (error) {

        next(error);
    }
};


// ==========================================
// 4. GET CUSTOMER ORDER
// CONFIRMATION PAGE
// ==========================================

exports.getCustomerOrder = async (
    req,
    res,
    next
) => {

    try {

        const { id } =
            req.params;

        const { table } =
            req.query;

        const token =
            typeof req.query.token === 'string'
                ? req.query.token
                : '';


        // Validate IDs
        if (
            !isValidId(id) ||
            !isValidId(table)
        ) {

            return res.status(400).json({

                error:
                    'Invalid Order ID or Table ID'
            });
        }


        const orderId =
            parseInt(id, 10);

        const tableId =
            parseInt(table, 10);


        // Require a signed confirmation token so that arbitrary
        // order/table combinations cannot be enumerated.
        if (
            !verifyOrder(token, orderId, tableId)
        ) {

            return res.status(404).json({
                error: 'Order not found'
            });
        }


        const query = `
            SELECT

                o.id,
                o.table_id,
                t.table_number,
                o.status,
                o.total_amount,
                o.created_at,
                o.business_date,
                o.daily_order_number,

                oi.menu_item_id,
                mi.name AS item_name,
                oi.quantity,
                oi.price_at_order,
                oi.subtotal

            FROM orders o

            JOIN tables t
                ON o.table_id = t.id

            LEFT JOIN order_items oi
                ON o.id = oi.order_id

            LEFT JOIN menu_items mi
                ON oi.menu_item_id = mi.id

            WHERE
                o.id = ?
                AND o.table_id = ?
        `;


        const [rows] =
            await db.query(
                query,
                [
                    orderId,
                    tableId
                ]
            );


        if (rows.length === 0) {

            return res.status(404).json({
                error: 'Order not found'
            });
        }


        const orderData = {

            id:
                rows[0].id,

            table_id:
                rows[0].table_id,

            table_number:
                rows[0].table_number,

            status:
                rows[0].status,

            total_amount:
                parseFloat(
                    rows[0].total_amount
                ),

            created_at:
                rows[0].created_at,

            business_date:
                rows[0].business_date,

            daily_order_number:
                rows[0].daily_order_number,

            items: []
        };


        rows.forEach(row => {

            if (row.menu_item_id) {

                orderData.items.push({

                    name:
                        row.item_name,

                    quantity:
                        row.quantity,

                    unit_price:
                        parseFloat(
                            row.price_at_order
                        ),

                    subtotal:
                        parseFloat(
                            row.subtotal
                        )
                });
            }
        });


        const statusMap = {

            NEW:
                'Order Received',

            CONFIRMED:
                'Order Confirmed',

            COMPLETED:
                'Order Completed',

            CANCELLED:
                'Order Cancelled'
        };


        orderData.status_text =
            statusMap[orderData.status] ||
            'Order Received';


        res.json({

            success: true,

            order:
                orderData
        });


    } catch (error) {

        console.error(
            'Get customer order error:',
            error
        );


        res.status(500).json({

            error:
                'Unable to load your order. Please try again.'
        });
    }
};