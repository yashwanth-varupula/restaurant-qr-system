require('dotenv').config();
const QRCode = require('qrcode');
const path = require('path');
const fs = require('fs');
const db = require('../backend/config/database');

async function generateQRCodes() {
    const baseUrl = process.env.APP_BASE_URL;
    const restaurantId = process.env.DEFAULT_RESTAURANT_ID || 1;

    if (!baseUrl) {
        console.error('Error: APP_BASE_URL is not defined in .env');
        process.exit(1);
    }

    try {
        new URL(baseUrl); // Validate URL format
    } catch (e) {
        console.error('Error: APP_BASE_URL is not a valid HTTP/HTTPS URL.');
        process.exit(1);
    }

    const outputDir = path.join(__dirname, '../frontend/qr');
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
    }

    try {
        const [tables] = await db.query(
            'SELECT id, table_number FROM tables WHERE restaurant_id = ? AND is_active = TRUE ORDER BY table_number ASC',
            [restaurantId]
        );

        if (tables.length === 0) {
            console.log('No active tables found.');
            process.exit(0);
        }

        console.log('Generating QR codes...');
        let count = 0;

        for (const table of tables) {
            const url = `${baseUrl}/menu.html?table=${table.table_number}`;
            const fileName = `table-${table.table_number}.png`;
            const filePath = path.join(outputDir, fileName);

            await QRCode.toFile(filePath, url, {
                width: 512,
                margin: 2,
                color: {
                    dark: '#000000',
                    light: '#ffffff'
                }
            });

            console.log(`Table ${table.table_number} → frontend/qr/${fileName}`);
            count++;
        }

        console.log(`\nGenerated ${count} QR codes.`);
        process.exit(0);
    } catch (error) {
        console.error('Failed to generate QR codes:', error.message);
        process.exit(1);
    }
}

generateQRCodes();