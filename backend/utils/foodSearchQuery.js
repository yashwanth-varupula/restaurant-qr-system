/**
 * foodSearchQuery.js
 * Builds intelligent Pexels search queries from the actual menu item name
 * and its category so image suggestions are relevant.
 *
 * Strategy:
 *  - The PRIMARY query is the exact, cleaned dish name ("Baby Corn Manchurian Wet"
 *    -> "baby corn manchurian"). Cuisine/category words are NOT appended to the
 *    dish name because Pexels treats every term as a filter word and the extra
 *    cuisine token biases results toward generic dishes of that cuisine.
 *  - 2-3 FALLBACK queries are generated for difficult dishes (exact dish first),
 *    each progressively more generic, so niche dishes still find candidates.
 */

const STOP_TOKENS = [
    'spl', 'special', 'spec', 'supreme', 'flavours', 'flavour', 'house',
    'fresh', 'classic', 'normal', 'plain'
];

// Preparation / serving words that do not help Pexels find a better photo.
const PREP_TOKENS = [
    'full', 'half', 'wet', 'dry', 'fried', 'bone', 'boneless', 'wingless',
    'family', 'pack', 'pak', 'medium', 'large', 'small', 'regular',
    'jumbo', 'extra', 'kilo', 'kg', 'combo', 'custom', 'deluxe', 'king',
    'food', 'dish', 'curries', 'starter', 'starters', 'plate', 'item',
    'rice plate', 'curd', 'gravy'
];

// Modifier words on the FRONT of a dish name that can be dropped in a
// fallback query without changing what food is shown ("chicken biryani"
// from "gongura chicken biryani", "manchurian" from "veg manchurian").
const LEADING_MODIFIERS = [
    'veg', 'baby', 'corn', 'gongura', 'dum', 'kothu', 'kolhapuri', 'ghee',
    'special', 'chilli', 'chili', 'butter', 'garlic', 'mushroom', 'paneer',
    'mexican', 'schezwan', 'schezwan', 'peri', 'kadai', 'karampudi', 'roast'
];

// Distinctive food nouns used both as family cores and as strong scoring tokens.
const FAMILY_CORES = [
    'biryani', 'biriyani', 'manchurian', 'noodles', 'fried rice', 'dosa',
    'idli', 'vada', 'thali', 'paratha', 'naan', 'roti', 'kebab', 'paneer',
    'curry', 'sambar', 'biryani'
];

function normalizeName(raw) {
    let s = String(raw || '').toLowerCase();

    s = s.replace(/&/g, ' ');
    s = s.replace(/\(.*?\)/g, ' ');
    s = s.replace(/\b(biriyani)\b/g, 'biryani');

    PREP_TOKENS.forEach((token) => {
        const word = String(token).trim();
        if (word) s = s.replace(new RegExp(`\\b${word}\\b`, 'g'), ' ');
    });

    STOP_TOKENS.forEach((token) => {
        const word = String(token).trim();
        if (word) s = s.replace(new RegExp(`\\b${word}\\b`, 'g'), ' ');
    });

    s = s.replace(/[^a-z0-9\s]/g, ' ');
    s = s.replace(/\s+/g, ' ').trim();

    return s;
}

function categoryFlavour(categoryName) {
    const category = String(categoryName || '').toLowerCase();

    if (category.includes('south indian')) return 'south indian';
    if (category.includes('chinese') && category.includes('noodles')) return 'chinese noodles';
    if (category.includes('chinese') && category.includes('fried rice')) return 'chinese fried rice';
    if (category.includes('chinese')) return 'chinese';
    if (category.includes('biryani')) return 'indian';
    if (category.includes('tandoor')) return 'indian tandoori';
    if (category.includes('north indian')) return 'north indian';
    if (category.includes('andhra')) return 'andhra indian';
    if (category.includes('raita')) return 'indian raita';
    if (category.toLowerCase().includes('bread')) return 'indian bread';
    if (category.includes('soup')) return 'indian soup';
    if (category.includes('salad')) return 'salad';
    if (category.includes('egg')) return 'egg';
    return '';
}

function addUnique(list, query, tier) {
    const q = String(query || '').trim().replace(/\s+/g, ' ');
    if (!q) return;
    if (list.some((entry) => entry.query === q)) return;
    if (list.length >= 4) return; // 1 exact + up to 3 fallbacks
    list.push({ query: q, tier });
}

function fallbackVariants(base, cat) {
    const tokens = base.split(' ').filter(Boolean);
    const out = [];

    // 1) Drop a leading dietary/colour modifier ("veg manchurian" -> "manchurian")
    while (tokens.length > 1 && LEADING_MODIFIERS.includes(tokens[0])) {
        tokens.shift();
        out.push(tokens.join(' '));
    }

    // 2) Drop the first qualifier word for 3+ word names ("gongura chicken biryani" -> "chicken biryani")
    if (tokens.length >= 3) {
        out.push(tokens.slice(1).join(' '));
        if (tokens.length >= 4) out.push(tokens.slice(2).join(' '));
    }

    // 3) Keep two-word core ("veg soft noodles" -> "veg noodles")
    if (tokens.length >= 3) {
        out.push(tokens.slice(0, 2).join(' '));
    }

    // 4) Family core noun as the deepest fallback ("biryani", "manchurian", ...)
    for (const core of FAMILY_CORES) {
        const coreWords = core.split(' ');
        if (base.includes(core) && !coreWords.every((w) => tokens.includes(w))) {
            out.push(core);
        }
        if (tokens.length === 1 && base === core) {
            // single-word dish already uses its core as the exact query
            break;
        }
    }

    const seen = new Set();
    return out.filter((q) => {
        if (!q || seen.has(q) || q === base || (cat && q === base)) return false;
        seen.add(q);
        return true;
    });
}

/**
 * buildSearchQueries(name, category) -> [
 *   { query, tier: 'exact' | 'fallback' },
 *   ...
 * ]
 * Always returns at least one query. The exact dish query is always first.
 */
function buildSearchQueries(itemName, categoryName) {
    const base = normalizeName(itemName);
    const cat = categoryFlavour(categoryName);

    const queries = [];

    if (!base) {
        addUnique(queries, cat ? `${cat} food` : 'indian food', 'exact');
        addUnique(queries, 'indian food', 'fallback');
        return queries;
    }

    const has = (token) => base.includes(token);
    const vegOrNonVeg = /non ?veg|\b(chicken|mutton|prawns?|fish|combo)\b/.test(base);

    // ---- Special-case dishes whose EXACT query needs a serving word to be useful ----

    // Thali ("Veg Thali" -> "indian veg thali")
    if (has('thali')) {
        addUnique(queries, vegOrNonVeg ? 'indian non veg thali' : 'indian veg thali', 'exact');
        addUnique(queries, vegOrNonVeg ? 'chicken thali' : 'veg thali', 'fallback');
        addUnique(queries, 'indian thali platter', 'fallback');
        return queries;
    }

    // Sambar Rice ("Sambar Rice" -> "sambar rice")
    if (has('sambar') && has('rice')) {
        addUnique(queries, 'sambar rice', 'exact');
        addUnique(queries, 'sambar', 'fallback');
        addUnique(queries, 'south indian meal', 'fallback');
        return queries;
    }

    // Salt & pepper starters ("Prawn Salt & Pepper" -> "prawn salt pepper")
    if (has('salt') && has('pepper')) {
        const protein = base.split(' ')[0];
        addUnique(queries, base, 'exact');
        addUnique(queries, `${protein} salt and pepper`, 'fallback');
        addUnique(queries, `${protein}s`, 'fallback');
        return queries;
    }

    // ---- Default: the exact cleaned dish name ----
    addUnique(queries, base, 'exact');

    // Drop an interior prep/modifier word so a fallback keeps the core dish
    // ("chicken dum biryani" -> "chicken biryani").
    const afterInnerDrop = base
        .split(' ')
        .filter((word) => !/^(dum|gongura|kothu|kai|roast|special)$/.test(word))
        .join(' ');

    if (afterInnerDrop && afterInnerDrop !== base) {
        addUnique(queries, afterInnerDrop, 'fallback');
    }

    // ---- Fallbacks ----
    const variants = fallbackVariants(base, cat);
    variants.forEach((variant) => addUnique(queries, variant, 'fallback'));

    // Noodles: "veg soft noodles" should also surface "veg noodles"
    if (has('noodles') && /\bveg\b/.test(base)) {
        addUnique(queries, 'veg noodles', 'fallback');
    }

    // Single-content-word generics get a cuisine hint only as a fallback,
    // never on the exact query ("rice south indian"). Skipped when the single
    // word is already a recognizable dish core ("manchurian").
    const meaningfulWords = base.split(' ').filter((word) => !/^(veg|egg)$/.test(word));
    if (meaningfulWords.length <= 1 && !FAMILY_CORES.includes(meaningfulWords[0])) {
        addUnique(queries, `${base} ${cat || 'indian'}`, 'fallback');
    }

    return queries;
}

/**
 * buildSearchQuery(name, category) -> string
 * Backwards-compatible helper returning just the primary (exact) query.
 */
function buildSearchQuery(itemName, categoryName) {
    const queries = buildSearchQueries(itemName, categoryName);
    return queries.length ? queries[0].query : 'indian food';
}

module.exports = { buildSearchQuery, buildSearchQueries, normalizeName, categoryFlavour };