/**
 * pexelsRelevance.js
 * Client-and-server-side relevance scoring for Pexels photo results.
 *
 * Scores each Pexels photo against the MENU ITEM (its cleaned dish name and
 * significant tokens). The full dish phrase and distinctive food nouns match
 * highest; generic words and unrelated alt text score lowest. Results below a
 * floor are dropped so the modal shows FEWER, relevant photos instead of
 * 12 random ones.
 *
 * Why this fixes poor relevance: previously every photo was shown verbatim.
 * Now a photo must share at least one meaningful token (or an exact phrase)
 * with the dish, and each result is labelled Exact / Good / Possible so the
 * staff member can pick the most accurate image. Obvious mismatches are hidden.
 */

const GENERIC_TOKENS = new Set([
    'veg', 'vegetable', 'vegitable', 'plate', 'platter', 'bowl', 'serving',
    'indian', 'food', 'meal', 'dish', 'curry', 'recipe', 'home', 'handi',
    'hot', 'spicy', 'fresh', 'delicious', 'tasty', 'traditional', 'gourmet',
    'homestyle', 'lunch', 'dinner', 'breakfast', 'table', 'restaurant',
    'waiter', 'served', 'assorted', 'mixed', 'street', 'royal', 'homemade',
    'chinese', 'south', 'north', 'regular', 'special', 'veggie'
]);

const DIETARY_TOKENS = new Set(['veg', 'vegetable', 'veggie', 'egg', 'nonveg', 'non veg']);

// Distinctive dish nouns: matching one of these in alt text is a STRONG signal.
const DISTINCTIVE_TOKENS = new Set([
    'biryani', 'biriyani', 'manchurian', 'sambar', 'gongura', 'dosa', 'idli',
    'vada', 'thali', 'kebab', 'kolhapuri', 'paneer', 'tandoori', 'tikka',
    'curry', 'noodles', 'prawn', 'prawns', 'roti', 'naan', 'paratha',
    'parotta', 'bhatura', 'chole', 'rajma', 'dal', 'pongal', 'upma',
    'bonda', 'appam', 'kothu', 'fry', 'salt and pepper', 'pepper'
]);

/**
 * Build a scoring context from a menu item name (or a manual search query).
 * Returns { tokens, phrases } where phrases are ordered most-specific first.
 */
function buildContext(itemName) {
    const raw = String(itemName || '').toLowerCase();
    const phrases = [];
    const addPhrase = (p) => {
        const clean = p.trim().replace(/\s+/g, ' ');
        if (clean && !phrases.includes(clean)) phrases.push(clean);
    };

    let base = raw.replace(/&/g, ' ');
    base = base.replace(/[^a-z0-9\s]/g, ' ').replace(/\s+/g, ' ').trim();

    addPhrase(base);

    // Also consider the dish without a leading dietary/generic word:
    // "veg manchurian" -> phrase "manchurian" will still match its alt text.
    // (Single generic words are NOT added as phrases — that would make a photo
    //  whose alt merely mentions "plumbing" a false "exact match".)
    const WITH_AND_WITHOUT = /^(veg|vegetable|veggie|egg)\s+(.+)$/.exec(base);
    if (WITH_AND_WITHOUT) addPhrase(WITH_AND_WITHOUT[2]);

    const significant = base.split(' ').filter((word) => !GENERIC_TOKENS.has(word));

    const tokenCount = {};
    significant.forEach((word) => {
        tokenCount[word] = (tokenCount[word] || 0) + 1;
    });

    return {
        base,
        phrases,
        tokens: Object.keys(tokenCount).sort((a, b) => tokenCount[b] - tokenCount[a]),
        tokenCount
    };
}

function cleanAlt(alt) {
    return String(alt || '')
        .toLowerCase()
        .replace(/[^a-z0-9\s&]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
}

/**
 * Score a single photo against a context.
 * Returns { score, match, reasons } where match is one of
 * 'exact' | 'good' | 'possible' | 'poor'.
 */
function scorePhoto(photo, ctx) {
    const alt = cleanAlt(photo.alt);
    const reasons = [];

    if (!alt || !ctx.phrases.length) {
        return { score: 0, match: 'possible', reasons: ['generic'] };
    }

    // 1) Exact dish-phrase match scores highest.
    let phraseHits = 0;
    let matchedPhrase = null;
    for (const phrase of ctx.phrases) {
        if (phrase && alt.includes(phrase)) {
            matchedPhrase = phrase;
            phraseHits++;
            break;
        }
    }

    // 2) Token hits (boundary-aware).
    let hits = 0;
    const hitTokens = [];
    for (const token of ctx.tokens) {
        if (DIETARY_TOKENS.has(token)) continue;
        const pattern = new RegExp(`(^|[^a-z0-9])${token.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}([^a-z0-9]|$)`, 'i');
        if (pattern.test(alt)) {
            hits++;
            hitTokens.push(token);
        }
    }

    const distinctiveHits = hitTokens.filter((t) => DISTINCTIVE_TOKENS.has(t)).length;

    let score = 0;
    if (matchedPhrase) {
        const phraseWords = matchedPhrase.split(' ').filter((w) => !GENERIC_TOKENS.has(w)).length;
        score += 10 + Math.min(phraseWords, 3);
        reasons.push(`exact phrase "${matchedPhrase}"`);
    }
    score += hits * 2;
    score += distinctiveHits * 2;
    if (hits > 0) reasons.push(`${hits} token match(es)`);

    let match;
    if (matchedPhrase || (hits >= Math.max(1, Math.ceil(ctx.tokens.length * 0.6)))) {
        match = 'exact';
    } else if (hits >= 2 || (hits === 1 && distinctiveHits >= 1)) {
        match = 'good';
    } else if (hits === 1) {
        match = 'possible';
    } else {
        match = 'poor';
    }

    return { score, match, reasons, matchedPhrase };
}

/**
 * Annotate a list of raw photos with relevance against the context, then
 * drop 'poor' (unrelated) results and sort Exact -> Good -> Possible.
 * Returns { results, dropped }.
 */
function filterAndAnnotate(photos, ctx) {
    const annotated = (photos || [])
        .map((photo) => {
            const scored = scorePhoto(photo, ctx);
            return { ...photo, match: scored.match, score: scored.score, reasons: scored.reasons };
        })
        .sort((a, b) => {
            const rank = { exact: 3, good: 2, possible: 1, poor: 0 };
            return (rank[b.match] - rank[a.match]) || (b.score - a.score);
        });

    const dropped = annotated.filter((p) => p.match === 'poor');
    const kept = annotated.filter((p) => p.match !== 'poor');

    return { results: kept, dropped: dropped.length };
}

/**
 * Client-side mirror: annotate an already-received photo list.
 * Keeps the UI logic identical to the server without a second fetch.
 */
function scorePhotoList(photos, itemName) {
    return filterAndAnnotate(photos, buildContext(itemName)).results;
}

module.exports = { buildContext, scorePhoto, filterAndAnnotate, scorePhotoList };