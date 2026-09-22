/**
 * pexelsService.js
 * Thin server-side wrapper around the Pexels API.
 *
 * - The API key is read from process.env.PEXELS_API_KEY (server-side only).
 * - Results are cached in memory to avoid unnecessary repeated external calls.
 * - A sliding-window rate guard protects the free-tier quota.
 * - When the key is missing the app must keep working, so callers receive a
 *   typed error (PEXELS_NOT_CONFIGURED) and the UI surfaces a setup message.
 */

const PEXELS_API_URL = 'https://api.pexels.com/v1/search';
const RESULTS_PER_PAGE = 12;
const CACHE_TTL_MS = 30 * 60 * 1000;
const MAX_CACHE_ENTRIES = 250;
const QUOTA_WINDOW_MS = 60 * 60 * 1000;
const QUOTA_MAX_PER_WINDOW = 196; // free tier allows 200/hour; keep headroom for 180-item passes

const { buildContext, filterAndAnnotate } = require('./pexelsRelevance');

const cache = new Map();
const requestTimes = [];

function isConfigured() {
    return Boolean(process.env.PEXELS_API_KEY);
}

function recordRequest() {
    const now = Date.now();
    while (requestTimes.length && requestTimes[0] <= now - QUOTA_WINDOW_MS) {
        requestTimes.shift();
    }
    if (requestTimes.length >= QUOTA_MAX_PER_WINDOW) {
        return false;
    }
    requestTimes.push(now);
    return true;
}

function trimCache() {
    if (cache.size <= MAX_CACHE_ENTRIES) return;
    const oldest = [...cache.entries()]
        .sort((a, b) => a[1].timestamp - b[1].timestamp)
        .slice(0, cache.size - MAX_CACHE_ENTRIES);
    oldest.forEach(([key]) => cache.delete(key));
}

/**
 * Build a resized URL on images.pexels.com. Kept to the params Pexels
 * officially supports so URLs stay short and predictable.
 */
function buildImageUrl(src, width) {
    try {
        const url = new URL(src);
        url.searchParams.set('auto', 'compress');
        url.searchParams.set('cs', 'tinysrgb');
        url.searchParams.set('w', String(width));
        url.searchParams.delete('h');
        url.searchParams.delete('fit');
        url.searchParams.delete('dpr');
        return url.toString();
    } catch (_) {
        return src;
    }
}

function normalizePhoto(photo) {
    return {
        id: photo.id,
        width: photo.width,
        height: photo.height,
        preview_url: buildImageUrl(photo.src.large, 320),
        image_url: buildImageUrl(photo.src.large, 800),
        alt: photo.alt || photo.photographer || 'Food photo',
        photographer: photo.photographer,
        photographer_url: photo.photographer_url,
        source_url: photo.url
    };
}

async function searchPexels(query, orientation = '') {
    if (!isConfigured()) {
        const error = new Error(
            'Pexels API key is not configured. Add PEXELS_API_KEY to your .env file.'
        );
        error.code = 'PEXELS_NOT_CONFIGURED';
        throw error;
    }

    const cacheKey = `${String(query).trim().toLowerCase()}|${orientation}`;
    const hit = cache.get(cacheKey);
    if (hit && Date.now() - hit.timestamp < CACHE_TTL_MS) {
        return hit.results;
    }

    if (!recordRequest()) {
        const error = new Error(
            'Pexels rate limit reached for this hour. Please try again later.'
        );
        error.code = 'PEXELS_RATE_LIMIT';
        throw error;
    }

    const params = new URLSearchParams({ query: String(query).trim(), per_page: String(RESULTS_PER_PAGE) });
    if (orientation) params.set('orientation', orientation);

    let response;
    try {
        response = await fetch(`${PEXELS_API_URL}?${params.toString()}`, {
            headers: { Authorization: process.env.PEXELS_API_KEY },
            signal: AbortSignal.timeout(15000)
        });
    } catch (fetchError) {
        const error = new Error('Could not reach the Pexels image service.');
        error.code = 'PEXELS_NETWORK';
        throw error;
    }

    if (response.status === 401 || response.status === 403) {
        const error = new Error('Pexels API key is invalid or has been revoked.');
        error.code = 'PEXELS_INVALID_KEY';
        throw error;
    }

    if (response.status === 429) {
        const error = new Error('Pexels rate limit reached. Please try again later.');
        error.code = 'PEXELS_RATE_LIMIT';
        throw error;
    }

    if (!response.ok) {
        const error = new Error(`Pexels API error (${response.status}).`);
        error.code = 'PEXELS_ERROR';
        throw error;
    }

    let payload;
    try {
        payload = await response.json();
    } catch (_) {
        const error = new Error('Unexpected response from the Pexels image service.');
        error.code = 'PEXELS_ERROR';
        throw error;
    }

    const results = (Array.isArray(payload.photos) ? payload.photos : [])
        .map(normalizePhoto);

    cache.set(cacheKey, { timestamp: Date.now(), results });
    trimCache();

    return results;
}

/**
 * Score + filter a single query's results against a dish/search context.
 * Returns { results, dropped }.
 */
async function searchPexelsScored(query, ctx) {
    const photos = await searchPexels(query);
    return filterAndAnnotate(photos, ctx || buildContext(query));
}

/**
 * Orchestrated search for a menu item: run the exact query first, then the
 * prepared fallback queries (each cached) until enough relevant photos have
 * been found. 'poor' (unrelated) results are dropped, so what the staff sees
 * is only relevant candidates, labelled Exact / Good / Possible.
 *
 * Returns {
 *   queries: [{ query, tier, resultCount, relevantCount }],
 *   results,        // annotated + de-duplicated, best first
 *   noResults       // true when everything was below the relevance floor
 * }
 */
async function searchPexelsForItem(itemName, preparedQueries) {
    const ctx = buildContext(itemName);
    const collected = [];
    const seen = new Set();
    const queryLog = [];

    const list = Array.isArray(preparedQueries) && preparedQueries.length
        ? preparedQueries
        : [{ query: String(itemName || '').trim() || 'indian food', tier: 'exact' }];

    for (const entry of list) {
        const query = String(entry.query || '').trim();
        if (!query) continue;

        let photos = [];
        let failed = '';
        try {
            photos = await searchPexels(query);
        } catch (error) {
            failed = error.code || 'PEXELS_ERROR';
        }

        const { results } = filterAndAnnotate(photos, ctx);

        results.forEach((photo) => {
            if (seen.has(photo.id)) return;
            seen.add(photo.id);
            collected.push({ ...photo, sourceQuery: query, sourceTier: entry.tier });
        });

        queryLog.push({
            query,
            tier: entry.tier,
            total: photos.length,
            relevant: results.length,
            failed
        });

        // Stop searching as soon as we have enough strong candidates.
        const strong = collected.filter((p) => p.match === 'exact' || p.match === 'good').length;
        if (strong >= 6) break;
    }

    const rank = { exact: 3, good: 2, possible: 1, poor: 0 };
    collected.sort((a, b) => (rank[b.match] - rank[a.match]) || (b.score - a.score));

    return {
        queries: queryLog,
        results: collected.slice(0, 12),
        noResults: collected.length === 0
    };
}

module.exports = {
    searchPexels,
    searchPexelsScored,
    searchPexelsForItem,
    isConfigured,
    buildImageUrl
};