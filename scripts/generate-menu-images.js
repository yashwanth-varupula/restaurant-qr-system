const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// =========================================
// CONFIGURATION & UTILS
// =========================================
// path.join ensures correct OS-specific separators (e.g., \ on Windows, / on Mac/Linux)
const UPLOAD_DIR = path.join(__dirname, '..', 'frontend', 'uploads', 'menu');
const FAILURE_LOG = path.join(__dirname, '..', 'menu-image-failures.json');

function slugify(text) {
    return text.toString().toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^\w\-]+/g, '')
        .replace(/\-\-+/g, '-')
        .replace(/^-+/, '')
        .replace(/-+$/, '');
}

function buildPrompt(item, category) {
    const baseStyle = "Authentic Andhra Pradesh / South Indian restaurant food photography, realistic Indian food, natural restaurant presentation, stainless-steel bowls or ceramic plates, natural restaurant lighting, realistic texture, appropriate garnish, simple clean background, appetizing but realistic, square composition, no text, no logos, no people, no hands, no cutlery.";
    const specifics = `Dish: ${item.name}. Category: ${category.name}. ${item.is_veg ? 'Vegetarian dish.' : 'Non-vegetarian dish.'}`;
    return `${baseStyle} ${specifics}`;
}

// =========================================
// API CALL WITH RETRIES & TIMEOUT
// =========================================
async function callImageAPI(prompt) {
    const apiUrl = process.env.IMAGE_API_URL || 'https://api.openai.com/v1/images/generations';
    const apiKey = process.env.IMAGE_API_KEY;
    const model = process.env.IMAGE_MODEL || 'dall-e-3';

    if (!apiKey) {
        throw new Error('IMAGE_API_KEY must be set in .env');
    }

    // Official OpenAI Images API payload (DALL-E 3)
    const payload = {
        model: model,
        prompt: prompt,
        n: 1, // DALL-E 3 only supports n=1
        size: "1024x1024",
        response_format: "url" // We download the URL immediately before it expires
    };

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 60000); // 60s timeout

    try {
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify(payload),
            signal: controller.signal
        });
        clearTimeout(timeoutId);

        if (response.status === 429) {
            throw new Error('Rate limit exceeded. Please wait or reduce concurrency.');
        }
        if (!response.ok) {
            const errText = await response.text();
            throw new Error(`API Error ${response.status}: ${errText}`);
        }

        const data = await response.json();
        
        if (data.data && data.data[0] && data.data[0].url) {
            // Download the image from the provided URL immediately
            const imgResponse = await fetch(data.data[0].url);
            if (!imgResponse.ok) {
                throw new Error(`Failed to download image from URL: ${imgResponse.status}`);
            }
            const arrayBuffer = await imgResponse.arrayBuffer();
            return Buffer.from(arrayBuffer);
        } else if (data.data && data.data[0] && data.data[0].b64_json) {
            // Fallback for b64_json if response_format was manually changed in .env
            return Buffer.from(data.data[0].b64_json, 'base64');
        }
        
        throw new Error('Unexpected API response format: missing image data');
    } catch (error) {
        clearTimeout(timeoutId);
        throw error;
    }
}

async function generateWithRetry(item, category, maxRetries = 3) {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            const prompt = buildPrompt(item, category);
            console.log(`  [${item.id}] Attempt ${attempt}/${maxRetries}...`);
            const imageBuffer = await callImageAPI(prompt);
            return { success: true, imageBuffer, prompt };
        } catch (error) {
            console.error(`  [${item.id}] Attempt ${attempt} failed: ${error.message}`);
            if (attempt === maxRetries) {
                return { success: false, error: error.message, prompt: buildPrompt(item, category) };
            }
            // Exponential backoff: 2s, 4s, 8s
            const delay = 1000 * Math.pow(2, attempt);
            console.log(`  [${item.id}] Retrying in ${delay/1000}s...`);
            await new Promise(resolve => setTimeout(resolve, delay));
        }
    }
}

// =========================================
// MAIN EXECUTION
// =========================================
async function main() {
    const args = process.argv.slice(2);
    const isDryRun = args.includes('--dry-run');
    const isForce = args.includes('--force');
    const limitArg = args.find(arg => arg.startsWith('--limit='));
    const limit = limitArg ? parseInt(limitArg.split('=')[1], 10) : null;

    console.log('=========================================');
    console.log('MENU IMAGE GENERATION SCRIPT');
    console.log(`Dry Run: ${isDryRun} | Force: ${isForce} | Limit: ${limit || 'None'}`);
    console.log('=========================================\n');

    if (!fs.existsSync(UPLOAD_DIR)) {
        fs.mkdirSync(UPLOAD_DIR, { recursive: true });
    }

    const pool = mysql.createPool({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        waitForConnections: true,
        connectionLimit: 2, // Keep low to avoid DB strain
    });

    try {
        const [rows] = await pool.query(`
            SELECT 
                m.id, m.name, m.description, m.image_url, m.is_veg, 
                c.name AS category_name 
            FROM menu_items m
            JOIN categories c ON m.category_id = c.id
            ORDER BY m.id ASC
        `);

        let total = rows.length;
        let skipped = 0;
        let generated = 0;
        let failed = 0;
        let failures = [];

        console.log(`Found ${total} menu items.\n`);

        for (const item of rows) {
            if (limit !== null && (generated + failed) >= limit) {
                console.log(`\nLimit of ${limit} reached. Stopping.`);
                break;
            }

            const filename = `${item.id}-${slugify(item.name)}.png`;
            // Forward slashes for DB/URL storage (works universally in Express static serving)
            const dbPath = `/uploads/menu/${filename}`;
            // path.join handles Windows (\) or Mac/Linux (/) local file system correctly
            const localPath = path.join(__dirname, '..', 'frontend', 'uploads', 'menu', filename);

            // Idempotency check: Skip if DB matches, file exists, and not forcing
            if (item.image_url === dbPath && fs.existsSync(localPath) && !isForce) {
                console.log(`[SKIP] ${item.id} - ${item.name} (Already exists)`);
                skipped++;
                continue;
            }

            if (isDryRun) {
                console.log(`[DRY-RUN] ${item.id} - ${item.name}`);
                console.log(`  -> Filename: ${filename}`);
                console.log(`  -> Prompt: ${buildPrompt(item, { name: item.category_name }).substring(0, 100)}...`);
                continue;
            }

            console.log(`[GEN] ${item.id} - ${item.name}`);
            const result = await generateWithRetry(item, { name: item.category_name });

            if (result.success) {
                fs.writeFileSync(localPath, result.imageBuffer);
                await pool.query('UPDATE menu_items SET image_url = ? WHERE id = ?', [dbPath, item.id]);
                console.log(`  -> SUCCESS: Saved to ${dbPath}`);
                generated++;
            } else {
                console.error(`  -> FAILED: ${result.error}`);
                failed++;
                failures.push({ id: item.id, name: item.name, error: result.error, prompt: result.prompt });
                
                // Save failure log incrementally so it's not lost on crash
                fs.writeFileSync(FAILURE_LOG, JSON.stringify(failures, null, 2));
            }
        }

        console.log('\n=========================================');
        console.log('SUMMARY');
        console.log('=========================================');
        console.log(`Total menu items:      ${total}`);
        console.log(`Already had images:    ${skipped}`);
        console.log(`Generated successfully:${generated}`);
        console.log(`Failed:                ${failed}`);
        console.log(`Database updates:      ${generated}`);
        if (failed > 0) {
            console.log(`\nFailure log saved to: ${FAILURE_LOG}`);
        }
        console.log('=========================================');

    } catch (error) {
        console.error('Fatal script error:', error);
    } finally {
        await pool.end();
    }
}

main();