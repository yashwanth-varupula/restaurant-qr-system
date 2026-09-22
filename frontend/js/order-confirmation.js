// frontend/js/order-confirmation.js
// Browser-only JavaScript. DO NOT use require() or exports here.

let currentTableId = null;
let currentOrderId = null;
let currentToken = null;

function escapeHtml(text) {
    if (typeof text !== 'string') return '';

    return text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

document.addEventListener('DOMContentLoaded', () => {
    initializePage();
});

function initializePage() {
    const params = new URLSearchParams(window.location.search);

    const orderParam = params.get('order');
    const tableParam = params.get('table');

    const orderId = Number(orderParam);
    const tableId = Number(tableParam);

    if (
        !orderParam ||
        !tableParam ||
        !Number.isInteger(orderId) ||
        !Number.isInteger(tableId) ||
        orderId <= 0 ||
        tableId <= 0 ||
        orderParam !== String(orderId) ||
        tableParam !== String(tableId)
    ) {
        showInvalidState();
        return;
    }

    currentOrderId = orderId;
    currentTableId = tableId;

    currentToken = params.get('token') || null;

    document.getElementById('retry-order-btn')?.addEventListener('click', () => {
        fetchOrderDetails();
    });

    const menuUrl = `menu.html?table=${currentTableId}`;

    const invalidBackMenu =
        document.getElementById('invalid-back-menu');

    const viewMenuBtn =
        document.getElementById('view-menu-btn');

    const backToMenuBtn =
        document.getElementById('back-to-menu-btn');

    if (invalidBackMenu) {
        invalidBackMenu.href = menuUrl;
    }

    if (viewMenuBtn) {
        viewMenuBtn.href = menuUrl;
    }

    if (backToMenuBtn) {
        backToMenuBtn.href = menuUrl;
    }

    fetchOrderDetails();
}

async function fetchOrderDetails() {
    showLoadingState();

    try {
        if (!window.api || typeof window.api.getOrder !== 'function') {
            throw new Error('Order API is not available.');
        }

        const response = await window.api.getOrder(
            currentOrderId,
            currentTableId,
            currentToken
        );

        if (!response || !response.success || !response.order) {
            throw new Error('Order data is invalid.');
        }

        renderOrder(response.order);

    } catch (error) {
        console.error('Failed to load order:', error);

        if (
            error.message &&
            (
                error.message.includes('404') ||
                error.message.toLowerCase().includes('not found')
            )
        ) {
            showInvalidState();
        } else {
            showErrorState();
        }
    }
}

function renderOrder(order) {
    const loadingState =
        document.getElementById('loading-state');

    const invalidOrderState =
        document.getElementById('invalid-order-state');

    const errorState =
        document.getElementById('error-state');

    const successContent =
        document.getElementById('success-content');

    if (loadingState) {
        loadingState.classList.add('hidden');
    }

    if (invalidOrderState) {
        invalidOrderState.classList.add('hidden');
    }

    if (errorState) {
        errorState.classList.add('hidden');
    }

    if (successContent) {
        successContent.classList.remove('hidden');
    }

    const orderIdElement =
        document.getElementById('order-id');

    const tableNumberElement =
        document.getElementById('table-number');

    const statusElement =
        document.getElementById('order-status');

    const totalElement =
        document.getElementById('order-total');

    const itemsContainer =
        document.getElementById('order-items-container');

    if (orderIdElement) {
        orderIdElement.textContent = `#${order.daily_order_number || order.id}`;
        orderIdElement.classList.add('order-number');
    }

    if (tableNumberElement) {
        tableNumberElement.textContent =
            `Table ${order.table_number}`;
    }

    if (statusElement) {
        statusElement.textContent =
            order.status_text || 'Order Received';
    }

    if (totalElement) {
        const total = Number(order.total_amount) || 0;

        totalElement.textContent =
            `₹${total.toFixed(2)}`;
    }

    if (itemsContainer) {
        itemsContainer.innerHTML = '';

        if (Array.isArray(order.items) && order.items.length > 0) {
            order.items.forEach(item => {
                const itemElement =
                    document.createElement('div');

                itemElement.className = 'summary-item';

                const quantity =
                    Number(item.quantity) || 0;

                const subtotal =
                    Number(item.subtotal) || 0;

                itemElement.innerHTML = `
                    <span class="summary-item-qty">
                        ${quantity}x
                    </span>

                    <span class="summary-item-name">
                        ${escapeHtml(item.name)}
                    </span>

                    <span>
                        ₹${subtotal.toFixed(2)}
                    </span>
                `;

                itemsContainer.appendChild(itemElement);
            });
        } else {
            itemsContainer.innerHTML =
                '<div class="summary-item">No items found</div>';
        }
    }
}

function showLoadingState() {
    const loadingState =
        document.getElementById('loading-state');

    const invalidOrderState =
        document.getElementById('invalid-order-state');

    const errorState =
        document.getElementById('error-state');

    const successContent =
        document.getElementById('success-content');

    if (loadingState) {
        loadingState.classList.remove('hidden');
    }

    if (invalidOrderState) {
        invalidOrderState.classList.add('hidden');
    }

    if (errorState) {
        errorState.classList.add('hidden');
    }

    if (successContent) {
        successContent.classList.add('hidden');
    }
}

function showInvalidState() {
    const loadingState =
        document.getElementById('loading-state');

    const invalidOrderState =
        document.getElementById('invalid-order-state');

    const errorState =
        document.getElementById('error-state');

    const successContent =
        document.getElementById('success-content');

    if (loadingState) {
        loadingState.classList.add('hidden');
    }

    if (errorState) {
        errorState.classList.add('hidden');
    }

    if (successContent) {
        successContent.classList.add('hidden');
    }

    if (invalidOrderState) {
        invalidOrderState.classList.remove('hidden');
    }
}

function showErrorState() {
    const loadingState =
        document.getElementById('loading-state');

    const invalidOrderState =
        document.getElementById('invalid-order-state');

    const errorState =
        document.getElementById('error-state');

    const successContent =
        document.getElementById('success-content');

    if (loadingState) {
        loadingState.classList.add('hidden');
    }

    if (invalidOrderState) {
        invalidOrderState.classList.add('hidden');
    }

    if (successContent) {
        successContent.classList.add('hidden');
    }

    if (errorState) {
        errorState.classList.remove('hidden');
    }
}