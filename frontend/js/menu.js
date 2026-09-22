/**
 * Customer menu logic.
 * Browser-only JavaScript. Uses the existing window.api wrapper.
 */

let menuData = [];
let cart = [];
let currentTableId = null;
let currentModalItem = null;
let modalQuantity = 1;

const elements = {
    tableDisplay: document.getElementById('table-display'),
    searchInput: document.getElementById('search-input'),
    categoryTabs: document.getElementById('category-tabs'),
    menuContent: document.getElementById('menu-content'),
    loadingState: document.getElementById('loading-state'),
    errorState: document.getElementById('error-state'),
    invalidTableState: document.getElementById('invalid-table-state'),
    cartBar: document.getElementById('cart-bar'),
    cartCount: document.getElementById('cart-count'),
    cartTotal: document.getElementById('cart-total'),
    viewCartBtn: document.getElementById('view-cart-btn'),
    itemModal: document.getElementById('item-modal'),
    modalContent: document.querySelector('.modal-content'),
    modalBackdrop: document.getElementById('modal-backdrop'),
    modalClose: document.getElementById('modal-close'),
    modalImage: document.getElementById('modal-image'),
    modalImageContainer: document.querySelector('.modal-image-container'),
    modalName: document.getElementById('modal-name'),
    modalVegIndicator: document.getElementById('modal-veg-indicator'),
    modalDescription: document.getElementById('modal-description'),
    modalIngredients: document.getElementById('modal-ingredients'),
    modalPrice: document.getElementById('modal-price'),
    qtyDecrease: document.getElementById('qty-decrease'),
    qtyIncrease: document.getElementById('qty-increase'),
    qtyDisplay: document.getElementById('qty-display'),
    modalAddBtn: document.getElementById('modal-add-btn'),
    toast: document.getElementById('toast')
};

const FALLBACK_SYMBOL = '✦';

const SPECIAL_CATEGORY_CLASSES = {
    'Indian Veg Curries': 'special-category curry-veg',
    'Indian Non-Veg Curries': 'special-category curry-nonveg',
    "Biryani's": 'special-category'
};

function escapeHtml(text) {
    if (typeof text !== 'string') return '';
    return text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

function money(value) {
    return `₹${Number(value || 0).toFixed(2)}`;
}

document.addEventListener('DOMContentLoaded', () => {
    if (!initializeTable()) return;
    loadCart();
    setupEventListeners();
    fetchMenu();
});

function initializeTable() {
    const params = new URLSearchParams(window.location.search);
    const tableParam = params.get('table');
    const tableNumber = Number(tableParam);

    if (!tableParam || !Number.isInteger(tableNumber) || tableNumber <= 0 || tableParam !== String(tableNumber)) {
        showInvalidTableState();
        return false;
    }

    currentTableId = tableNumber;
    if (elements.tableDisplay) elements.tableDisplay.textContent = `Table ${currentTableId}`;
    return true;
}

function loadCart() {
    const stored = localStorage.getItem(`qr_cart_table_${currentTableId}`);
    if (!stored) return;

    try {
        const parsed = JSON.parse(stored);
        cart = Array.isArray(parsed) ? parsed.filter(item => item && Number.isInteger(Number(item.id))) : [];
    } catch {
        cart = [];
        localStorage.removeItem(`qr_cart_table_${currentTableId}`);
    }
}

function saveCart() {
    localStorage.setItem(`qr_cart_table_${currentTableId}`, JSON.stringify(cart));
}

async function fetchMenu() {
    try {
        elements.loadingState?.classList.remove('hidden');
        elements.errorState?.classList.add('hidden');
        elements.menuContent?.classList.add('hidden');

        if (!window.api || typeof window.api.getMenu !== 'function') {
            throw new Error('Menu API is not available.');
        }

        const response = await window.api.getMenu();
        if (!response?.success || !Array.isArray(response.data)) {
            throw new Error('Invalid menu response.');
        }

        menuData = response.data;
        renderCategories();
        renderMenuItems(menuData);
        elements.loadingState?.classList.add('hidden');
        elements.menuContent?.classList.remove('hidden');
        updateCartBar();
    } catch (error) {
        console.error('Failed to load menu:', error);
        elements.loadingState?.classList.add('hidden');
        elements.errorState?.classList.remove('hidden');
    }
}

function renderCategories() {
    if (!elements.categoryTabs) return;
    elements.categoryTabs.innerHTML = '';

    const allTab = createCategoryTab('All', 'all', true);
    elements.categoryTabs.appendChild(allTab);

    menuData.forEach(category => {
        const itemCount = Array.isArray(category.items) ? category.items.length : 0;
        const tab = createCategoryTab(category.name, category.id, false, itemCount);
        elements.categoryTabs.appendChild(tab);
    });
}

function createCategoryTab(name, id, active = false, count = null) {
    const tab = document.createElement('button');
    tab.type = 'button';
    tab.className = `category-tab${active ? ' active' : ''}`;
    tab.dataset.categoryId = id;
    tab.textContent = count === null ? name : `${name}  ·  ${count}`;
    tab.addEventListener('click', () => filterByCategory(id, tab));
    return tab;
}

function renderMenuItems(categories) {
    if (!elements.menuContent) return;
    elements.menuContent.innerHTML = '';

    const visible = categories.filter(category => Array.isArray(category.items) && category.items.length > 0);
    if (visible.length === 0) {
        elements.menuContent.innerHTML = '<div class="state-message"><p>No dishes found matching your search.</p></div>';
        return;
    }

    visible.forEach(category => {
        const section = document.createElement('section');
        section.className = 'category-section';
        section.id = `category-${category.id}`;

        const specialClass = SPECIAL_CATEGORY_CLASSES[category.name];
        if (specialClass) section.classList.add(...specialClass.split(' '));

        const heading = document.createElement('div');
        heading.className = 'category-heading';

        const title = document.createElement('h2');
        title.className = 'category-title';
        title.textContent = category.name;

        const count = document.createElement('span');
        count.className = 'category-count';
        count.textContent = `${category.items.length} dishes`;

        heading.append(title, count);
        section.appendChild(heading);

        const rule = document.createElement('div');
        rule.className = 'category-rule';
        section.appendChild(rule);

        category.items.forEach(item => section.appendChild(createFoodCard(item)));
        elements.menuContent.appendChild(section);
    });
}

function createFoodCard(item) {
    const card = document.createElement('article');
    card.className = `food-card${!item.is_available ? ' unavailable' : ''}`;
    card.dataset.itemId = item.id;

    const imageWrapper = document.createElement('div');
    imageWrapper.className = 'food-image-wrapper';

    if (item.image_url) {
        const image = document.createElement('img');
        image.className = 'food-image';
        image.alt = item.name || 'Dish';
        image.loading = 'lazy';
        image.src = item.image_url;
        image.addEventListener('error', () => {
            image.remove();
            imageWrapper.innerHTML = `<span class="food-image-placeholder">${FALLBACK_SYMBOL}</span>`;
        }, { once: true });
        imageWrapper.appendChild(image);
    } else {
        imageWrapper.innerHTML = `<span class="food-image-placeholder">${FALLBACK_SYMBOL}</span>`;
    }

    const info = document.createElement('div');
    info.className = 'food-info';

    const top = document.createElement('div');
    const header = document.createElement('div');
    header.className = 'food-header';

    const name = document.createElement('h3');
    name.className = 'food-name';
    name.textContent = item.name;

    const indicator = document.createElement('span');
    indicator.className = `veg-indicator ${item.is_veg ? 'veg' : 'non-veg'}`;
    indicator.setAttribute('aria-label', item.is_veg ? 'Vegetarian' : 'Non-vegetarian');

    header.append(name, indicator);
    top.appendChild(header);

    const description = document.createElement('p');
    description.className = 'food-description';
    description.textContent = item.description || 'No description available.';
    top.appendChild(description);

    const footer = document.createElement('div');
    footer.className = 'food-footer';

    const price = document.createElement('span');
    price.className = 'food-price';
    price.textContent = money(item.price);
    footer.appendChild(price);

    if (item.is_available) {
        const existing = cart.find(cartItem => cartItem.id === item.id);
        if (existing) {
            const controls = document.createElement('div');
            controls.className = 'qty-control-inline';
            controls.innerHTML = `
                <button type="button" class="qty-btn" data-action="decrease" data-id="${item.id}" aria-label="Decrease ${escapeHtml(item.name)}">−</button>
                <span class="qty-val">${existing.quantity}</span>
                <button type="button" class="qty-btn" data-action="increase" data-id="${item.id}" aria-label="Increase ${escapeHtml(item.name)}">+</button>
            `;
            footer.appendChild(controls);
        } else {
            const add = document.createElement('button');
            add.type = 'button';
            add.className = 'btn-add';
            add.dataset.action = 'add';
            add.dataset.id = item.id;
            add.textContent = 'Add';
            footer.appendChild(add);
        }
    } else {
        const unavailable = document.createElement('span');
        unavailable.className = 'unavailable-badge';
        unavailable.textContent = 'Unavailable';
        footer.appendChild(unavailable);
    }

    info.append(top, footer);
    card.append(imageWrapper, info);
    return card;
}

function filterByCategory(categoryId, activeTab) {
    document.querySelectorAll('.category-tab').forEach(tab => tab.classList.remove('active'));
    activeTab.classList.add('active');

    if (categoryId === 'all') {
        renderMenuItems(menuData);
    } else {
        renderMenuItems(menuData.filter(category => Number(category.id) === Number(categoryId)));
    }

    if (elements.searchInput) elements.searchInput.value = '';

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    elements.menuContent?.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
}

function searchMenu(query) {
    const normalized = query.toLowerCase().trim();
    if (!normalized) {
        renderMenuItems(menuData);
        return;
    }

    const filtered = menuData
        .map(category => ({
            ...category,
            items: category.items.filter(item =>
                String(item.name || '').toLowerCase().includes(normalized) ||
                String(item.description || '').toLowerCase().includes(normalized)
            )
        }))
        .filter(category => category.items.length > 0);

    renderMenuItems(filtered);
}

function addToCart(item, quantity) {
    const qty = Math.min(20, Math.max(1, Number(quantity) || 1));
    const existingIndex = cart.findIndex(cartItem => cartItem.id === item.id);

    if (existingIndex >= 0) {
        const next = cart[existingIndex].quantity + qty;
        if (next > 20) {
            showToast('Maximum quantity is 20.');
            return;
        }
        cart[existingIndex].quantity = next;
    } else {
        cart.push({
            id: item.id,
            name: item.name,
            price: Number(item.price),
            image_url: item.image_url || null,
            quantity: qty
        });
    }

    saveCart();
    showToast(`${item.name} added to your order.`);
    updateCartBar();
}

function updateCartQuantity(itemId, change, shouldRender = true) {
    const index = cart.findIndex(item => item.id === itemId);
    if (index < 0) return;

    const next = cart[index].quantity + change;
    if (next <= 0) {
        cart.splice(index, 1);
    } else if (next <= 20) {
        cart[index].quantity = next;
    } else {
        showToast('Maximum quantity is 20.');
        return;
    }

    saveCart();
    
    if (shouldRender) {
        // Redraw only the affected card
        const card = document.querySelector(`.food-card[data-item-id="${itemId}"]`);
        if (card) {
            const item = menuData.flatMap(category => category.items).find(menuItem => Number(menuItem.id) === Number(itemId));
            if (item) {
                const newCard = createFoodCard(item);
                card.replaceWith(newCard);
            }
        }
    }
    
    updateCartBar();
}

function updateCartBar() {
    if (!elements.cartBar) return;
    const totalItems = cart.reduce((sum, item) => sum + Number(item.quantity || 0), 0);
    const totalPrice = cart.reduce((sum, item) => sum + Number(item.price || 0) * Number(item.quantity || 0), 0);

    if (totalItems > 0) {
        elements.cartCount.textContent = `${totalItems} item${totalItems === 1 ? '' : 's'}`;
        elements.cartTotal.textContent = money(totalPrice);
        elements.cartBar.classList.remove('hidden');
    } else {
        elements.cartBar.classList.add('hidden');
    }
}

function openItemModal(item) {
    currentModalItem = item;
    modalQuantity = 1;

    if (elements.modalImageContainer) {
        elements.modalImageContainer.innerHTML = '';
        if (item.image_url) {
            const image = document.createElement('img');
            image.id = 'modal-image';
            image.className = 'modal-image';
            image.alt = item.name || 'Dish';
            image.src = item.image_url;
            image.addEventListener('error', () => {
                elements.modalImageContainer.innerHTML = `<div class="modal-image-placeholder">${FALLBACK_SYMBOL}</div>`;
            }, { once: true });
            elements.modalImageContainer.appendChild(image);
            elements.modalImage = image;
        } else {
            elements.modalImageContainer.innerHTML = `<div class="modal-image-placeholder">${FALLBACK_SYMBOL}</div>`;
            elements.modalImage = null;
        }
    }

    elements.modalName.textContent = item.name;
    elements.modalDescription.textContent = item.description || 'No description available.';
    elements.modalPrice.textContent = money(item.price);
    elements.modalVegIndicator.className = `veg-indicator ${item.is_veg ? 'veg' : 'non-veg'}`;

    if (item.ingredients) {
        elements.modalIngredients.querySelector('span').textContent = item.ingredients;
        elements.modalIngredients.classList.remove('hidden');
    } else {
        elements.modalIngredients.classList.add('hidden');
    }

    updateModalQuantityDisplay();
    elements.itemModal.classList.remove('hidden');
    requestAnimationFrame(() => elements.modalContent?.classList.add('active'));
    document.body.style.overflow = 'hidden';
}

function closeModal() {
    elements.modalContent?.classList.remove('active');
    setTimeout(() => {
        elements.itemModal?.classList.add('hidden');
        document.body.style.overflow = '';
        currentModalItem = null;
    }, 220);
}

function updateModalQuantityDisplay() {
    if (elements.qtyDisplay) elements.qtyDisplay.textContent = modalQuantity;
}

function setupEventListeners() {
    elements.menuContent?.addEventListener('click', event => {
        const card = event.target.closest('.food-card');
        if (!card) return;

        const itemId = Number(card.dataset.itemId);
        const item = menuData.flatMap(category => category.items).find(menuItem => Number(menuItem.id) === itemId);
        if (!item || !item.is_available) return;

        const button = event.target.closest('button');
        if (button) {
            event.stopPropagation();
            const action = button.dataset.action;
            if (action === 'add') {
                addToCart(item, 1);
                const newCard = createFoodCard(item);
                card.replaceWith(newCard);
            } else if (action === 'increase') {
                updateCartQuantity(itemId, 1);
            } else if (action === 'decrease') {
                updateCartQuantity(itemId, -1);
            }
            return;
        }

        openItemModal(item);
    });

    elements.searchInput?.addEventListener('input', event => {
        document.querySelectorAll('.category-tab').forEach(tab => tab.classList.remove('active'));
        const allTab = document.querySelector('.category-tab[data-category-id="all"]');
        allTab?.classList.add('active');
        searchMenu(event.target.value);
    });

    elements.modalBackdrop?.addEventListener('click', closeModal);
    elements.modalClose?.addEventListener('click', closeModal);

    elements.qtyDecrease?.addEventListener('click', () => {
        if (modalQuantity > 1) {
            modalQuantity--;
            updateModalQuantityDisplay();
        }
    });

    elements.qtyIncrease?.addEventListener('click', () => {
        if (modalQuantity < 20) {
            modalQuantity++;
            updateModalQuantityDisplay();
        }
    });

    elements.modalAddBtn?.addEventListener('click', () => {
        if (!currentModalItem) return;
        addToCart(currentModalItem, modalQuantity);
        closeModal();
        
        const card = document.querySelector(`.food-card[data-item-id="${currentModalItem.id}"]`);
        if (card) {
            const newCard = createFoodCard(currentModalItem);
            card.replaceWith(newCard);
        }
    });

    document.getElementById('retry-menu-btn')?.addEventListener('click', fetchMenu);

    elements.viewCartBtn?.addEventListener('click', () => {
        window.location.href = `cart.html?table=${currentTableId}`;
    });

    document.addEventListener('keydown', event => {
        if (event.key === 'Escape' && elements.itemModal && !elements.itemModal.classList.contains('hidden')) {
            closeModal();
        }
    });
}

function showInvalidTableState() {
    elements.loadingState?.classList.add('hidden');
    elements.errorState?.classList.add('hidden');
    elements.menuContent?.classList.add('hidden');
    elements.cartBar?.classList.add('hidden');
    document.querySelector('.search-container')?.classList.add('hidden');
    document.getElementById('category-nav')?.classList.add('hidden');
    elements.invalidTableState?.classList.remove('hidden');
}

let toastTimer;
function showToast(message) {
    if (!elements.toast) return;
    clearTimeout(toastTimer);
    elements.toast.textContent = message;
    elements.toast.classList.remove('hidden');
    requestAnimationFrame(() => elements.toast.classList.add('show'));
    toastTimer = setTimeout(() => {
        elements.toast.classList.remove('show');
        setTimeout(() => elements.toast.classList.add('hidden'), 220);
    }, 2200);
}
