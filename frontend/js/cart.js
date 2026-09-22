/**
 * Customer Cart Logic
 * Handles: Strict table validation, cart rendering, quantity adjustments,
 * notes handling, and secure order submission to the backend.
 */

// State
let cart = [];
let currentTableId = null;
let isSubmitting = false;

// DOM Elements
const elements = {
    tableDisplay: document.getElementById('table-display'),
    backToMenu: document.getElementById('back-to-menu'),
    emptyViewMenuBtn: document.getElementById('empty-view-menu-btn'),
    
    invalidTableState: document.getElementById('invalid-table-state'),
    emptyCartState: document.getElementById('empty-cart-state'),
    cartContent: document.getElementById('cart-content'),
    cartItemsContainer: document.getElementById('cart-items-container'),
    
    orderNotes: document.getElementById('order-notes'),
    charCount: document.getElementById('char-count'),
    
    checkoutFooter: document.getElementById('checkout-footer'),
    footerItemCount: document.getElementById('footer-item-count'),
    footerSubtotal: document.getElementById('footer-subtotal'),
    footerTotal: document.getElementById('footer-total'),
    placeOrderBtn: document.getElementById('place-order-btn'),
    
    toast: document.getElementById('toast')
};


// ADD THIS HELPER AT THE TOP OF THE FILE
function escapeHtml(text) {
    if (typeof text !== 'string') return '';
    return text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}



// ==========================================
// INITIALIZATION
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    const isTableValid = initializeTable();
    if (!isTableValid) return;

    loadCart();
    setupEventListeners();
    renderCart();
});

function initializeTable() {
    const urlParams = new URLSearchParams(window.location.search);
    const tableParam = urlParams.get('table');

    const tableNumber = Number(tableParam);
    if (!tableParam || !Number.isInteger(tableNumber) || tableNumber <= 0 || tableParam !== String(tableNumber)) {
        showInvalidTableState();
        return false;
    }

    currentTableId = tableNumber;
    if (elements.tableDisplay) elements.tableDisplay.textContent = `Table ${currentTableId}`;

    const menuUrl = `menu.html?table=${currentTableId}`;
    
    const handleBackToMenu = (e) => {
        e.preventDefault();
        if (document.referrer.includes('menu.html')) {
            window.history.back();
        } else {
            window.location.replace(menuUrl);
        }
    };

    elements.backToMenu.addEventListener('click', handleBackToMenu);
    elements.emptyViewMenuBtn.addEventListener('click', handleBackToMenu);

    return true;
}

function showInvalidTableState() {
    elements.invalidTableState.classList.remove('hidden');
}

// ==========================================
// CART MANAGEMENT
// ==========================================
function loadCart() {
    const stored = localStorage.getItem(`qr_cart_table_${currentTableId}`);
    if (stored) {
        try {
            cart = JSON.parse(stored);
            if (!Array.isArray(cart)) cart = [];
        } catch (e) {
            console.error('Failed to parse cart', e);
            cart = [];
        }
    }
}

function saveCart() {
    localStorage.setItem(`qr_cart_table_${currentTableId}`, JSON.stringify(cart));
}

function updateQuantity(itemId, change) {
    const itemIndex = cart.findIndex(i => i.id === itemId);
    if (itemIndex === -1) return;

    const next = cart[itemIndex].quantity + change;

    if (next <= 0) {
        cart.splice(itemIndex, 1);
        showToast('Item removed from cart');
    } else if (next > 20) {
        showToast('Maximum quantity is 20.');
        return;
    } else {
        cart[itemIndex].quantity = next;
    }

    saveCart();
    renderCart();
}

function renderCart() {
    if (cart.length === 0) {
        elements.emptyCartState.classList.remove('hidden');
        elements.cartContent.classList.add('hidden');
        elements.checkoutFooter.classList.add('hidden');
        return;
    }

    elements.emptyCartState.classList.add('hidden');
    elements.cartContent.classList.remove('hidden');
    elements.checkoutFooter.classList.remove('hidden');

    elements.cartItemsContainer.innerHTML = '';
    let totalItems = 0;
    let totalPrice = 0;

    cart.forEach(item => {
        const itemTotal = item.price * item.quantity;
        totalItems += item.quantity;
        totalPrice += itemTotal;

        const itemEl = document.createElement('div');
        itemEl.className = 'cart-item';
        
        const safeName = escapeHtml(item.name);

        itemEl.innerHTML = `
            <div class="cart-item-image-wrapper">
                <span class="cart-item-placeholder" aria-hidden="true">✦</span>
            </div>
            <div class="cart-item-details">
                <div class="cart-item-header">
                    <span class="cart-item-name">${safeName}</span>
                    <button class="qty-btn-remove" data-action="remove" data-id="${item.id}" aria-label="Remove ${safeName}">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path></svg>
                    </button>
                </div>
                <div class="cart-item-unit-price">₹${item.price.toFixed(2)}</div>
                
                <div class="cart-item-footer">
                    <div class="qty-controls">
                        <button class="qty-btn" data-action="decrease" data-id="${item.id}" aria-label="Decrease ${safeName}">−</button>
                        <span class="qty-display">${item.quantity}</span>
                        <button class="qty-btn" data-action="increase" data-id="${item.id}" aria-label="Increase ${safeName}">+</button>
                    </div>
                    <span class="item-subtotal">₹${itemTotal.toFixed(2)}</span>
                </div>
            </div>
        `;

        const imageWrapper = itemEl.querySelector('.cart-item-image-wrapper');
        if (item.image_url) {
            const image = document.createElement('img');
            image.className = 'cart-item-image';
            image.alt = item.name || 'Dish';
            image.src = item.image_url;
            image.addEventListener('error', () => {
                image.remove();
                imageWrapper.classList.add('has-fallback');
            }, { once: true });
            imageWrapper.innerHTML = '';
            imageWrapper.appendChild(image);
        }

        elements.cartItemsContainer.appendChild(itemEl);
    });

    elements.footerItemCount.textContent = totalItems;
    elements.footerSubtotal.textContent = `₹${totalPrice.toFixed(2)}`;
    elements.footerTotal.textContent = `₹${totalPrice.toFixed(2)}`;
}

// ==========================================
// EVENT LISTENERS
// ==========================================
function setupEventListeners() {
    elements.cartItemsContainer.addEventListener('click', (e) => {
        const btn = e.target.closest('.qty-btn, .qty-btn-remove');
        if (!btn) return;

        const action = btn.dataset.action;
        const itemId = parseInt(btn.dataset.id, 10);

        if (action === 'increase') {
            updateQuantity(itemId, 1);
        } else if (action === 'decrease') {
            updateQuantity(itemId, -1);
        } else if (action === 'remove') {
            const itemIndex = cart.findIndex(i => i.id === itemId);
            if (itemIndex > -1) {
                cart.splice(itemIndex, 1);
                showToast('Item removed from cart');
                saveCart();
                renderCart();
            }
        }
    });

    elements.orderNotes.addEventListener('input', (e) => {
        elements.charCount.textContent = e.target.value.length;
    });

    elements.placeOrderBtn.addEventListener('click', handlePlaceOrder);
}

// ==========================================
// SECURE ORDER SUBMISSION
// ==========================================
async function handlePlaceOrder() {
    if (isSubmitting || cart.length === 0) return;

    isSubmitting = true;
    elements.placeOrderBtn.disabled = true;
    elements.placeOrderBtn.innerHTML = '<span class="btn-spinner"></span> Placing Order...';

    const orderPayload = {
        table_id: currentTableId,
        items: cart.map(item => ({
            menu_item_id: item.id,
            quantity: item.quantity
        })),
        notes: elements.orderNotes.value.trim().substring(0, 500) || null
    };

    try {
        const response = await window.api.createOrder(orderPayload);

        if (response.success) {
            localStorage.removeItem(`qr_cart_table_${currentTableId}`);
            const orderId = response.data.order_id;
            const confirmToken = response.data.confirm_token;

            const params = new URLSearchParams({
                order: String(orderId),
                table: String(currentTableId)
            });
            if (confirmToken) params.append('token', confirmToken);

            window.location.replace(`order-confirmation.html?${params.toString()}`);
        } else {
            throw new Error(response.error || 'Failed to place order');
        }
    } catch (error) {
        console.error('Order placement failed:', error);
        showToast(error.message || 'Failed to place order. Please try again.');
        
        isSubmitting = false;
        elements.placeOrderBtn.disabled = false;
        elements.placeOrderBtn.textContent = 'PLACE ORDER';
    }
}

// ==========================================
// UTILITIES
// ==========================================
function showToast(message) {
    elements.toast.textContent = message;
    elements.toast.classList.remove('hidden');
    
    elements.toast.style.animation = 'none';
    elements.toast.offsetHeight;
    elements.toast.style.animation = null; 
    
    setTimeout(() => {
        elements.toast.classList.add('hidden');
    }, 2500);
}