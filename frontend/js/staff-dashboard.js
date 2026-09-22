/**
 * Staff Dashboard Logic
 * Handles: Auth check, fetching orders, filtering, auto-refresh, status updates,
 *          Today's Summary (real DB data), and XSS-safe UI rendering.
 */

let currentFilter = 'NEW';
let allOrders = [];
let refreshInterval = null;
let ordersRequestInFlight = false;
let currentViewDate = null;

const elements = {
    loading: document.getElementById('dashboard-loading'),
    content: document.getElementById('dashboard-content'),
    staffUsername: document.getElementById('staff-username'),
    logoutBtn: document.getElementById('logout-btn'),
    filterTabs: document.getElementById('filter-tabs'),
    refreshBtn: document.getElementById('refresh-btn'),
    ordersContainer: document.getElementById('orders-container'),
    emptyState: document.getElementById('empty-state'),
    emptyStateTitle: document.getElementById('empty-state-title'),
    countNew: document.getElementById('count-new'),
    countConfirmed: document.getElementById('count-confirmed'),
    countCompleted: document.getElementById('count-completed'),
    countCancelled: document.getElementById('count-cancelled'),
    sumOrders: document.getElementById('sum-orders'),
    sumSales: document.getElementById('sum-sales'),
    sumPending: document.getElementById('sum-pending'),
    sumActive: document.getElementById('sum-active'),
    sumCompleted: document.getElementById('sum-completed')
};

function escapeHtml(text) {
    if (typeof text !== 'string') return '';
    return text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

function formatTime(dateString) {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = date.toLocaleString('en-US', { month: 'short' });
    const year = date.getFullYear();
    const time = date.toLocaleString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
    return `${day} ${month} ${year} ${time}`;
}

function showToast(message) {
    let toast = document.getElementById('dashboard-toast');
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'dashboard-toast';
        toast.className = 'dashboard-toast';
        document.body.appendChild(toast);
    }
    toast.textContent = message;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 3000);
}

// ==========================================
// TODAY'S SUMMARY (real DB data)
// ==========================================

async function loadSummary() {
    try {
        const response = await window.api.getOrdersSummary();
        if (response.success && response.data) {
            const s = response.data;
            elements.sumOrders.textContent = s.orders_today;
            elements.sumSales.textContent = '₹' + Number(s.sales_today).toLocaleString('en-IN');
            elements.sumPending.textContent = s.pending;
            elements.sumActive.textContent = s.active;
            elements.sumCompleted.textContent = s.completed;
        }
    } catch (error) {
        console.error('Failed to load summary:', error);
    }
}

document.addEventListener('DOMContentLoaded', async () => {
    await checkAuth();
    await Promise.all([fetchOrders(false), loadSummary()]);
    setupEventListeners();
    startAutoRefresh();
});

document.addEventListener('pagehide', () => {
    stopAutoRefresh();
});

window.addEventListener('beforeunload', () => {
    stopAutoRefresh();
});

async function checkAuth() {
    try {
        const response = await window.api.getMe();
        if (response.success && response.staff) {
            elements.staffUsername.textContent = response.staff.username;
            elements.loading.classList.add('hidden');
            elements.content.classList.remove('hidden');
        } else {
            redirectToLogin();
        }
    } catch (error) {
        if (error.isAuthError) return redirectToLogin();
        console.error('Auth check failed:', error);
        redirectToLogin();
    }
}

function redirectToLogin() {
    window.location.href = '/staff-login.html';
}

async function fetchOrders(silent = false) {
    if (ordersRequestInFlight) return;
    ordersRequestInFlight = true;

    if (!silent) {
        elements.refreshBtn.disabled = true;
        elements.refreshBtn.textContent = 'Refreshing...';
    }

    currentViewDate = null; // We are fetching today's orders

    try {
        const response = await window.api.getOrders();
        if (response.success) {
            allOrders = response.data || [];
            updateCounts();
            renderOrders();
        }
    } catch (error) {
        if (error.isAuthError) return redirectToLogin();
        console.error('Failed to load orders:', error);
        if (!silent) showToast('Unable to load orders. Please try again.');
    } finally {
        ordersRequestInFlight = false;
        if (!silent) {
            elements.refreshBtn.disabled = false;
            elements.refreshBtn.textContent = '↻ Refresh';
        }
    }
}

function startAutoRefresh() {
    stopAutoRefresh();
    refreshInterval = setInterval(() => {
        if (!document.hidden && currentFilter !== 'HISTORY' && !currentViewDate && !ordersRequestInFlight) {
            fetchOrders(true);
        }
    }, 3000);
}

function stopAutoRefresh() {
    if (refreshInterval) {
        clearInterval(refreshInterval);
        refreshInterval = null;
    }
}

document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        stopAutoRefresh();
    } else {
        startAutoRefresh();
        fetchOrders(true);
        loadSummary();
    }
});

function updateCounts() {
    const counts = { NEW: 0, CONFIRMED: 0, COMPLETED: 0, CANCELLED: 0 };
    allOrders.forEach(order => {
        if (counts[order.status] !== undefined) counts[order.status]++;
    });

    elements.countNew.textContent = counts.NEW;
    elements.countConfirmed.textContent = counts.CONFIRMED;
    elements.countCompleted.textContent = counts.COMPLETED;
    elements.countCancelled.textContent = counts.CANCELLED;
}

function renderOrders() {
    elements.ordersContainer.innerHTML = '';

    const filteredOrders = currentFilter === 'ALL'
        ? allOrders
        : allOrders.filter(o => o.status === currentFilter);

    if (filteredOrders.length === 0) {
        elements.emptyState.classList.remove('hidden');
        elements.emptyStateTitle.textContent = currentFilter === 'NEW'
            ? 'No new orders'
            : `No ${currentFilter.toLowerCase()} orders found`;
        return;
    }

    elements.emptyState.classList.add('hidden');

    filteredOrders.forEach(order => {
        const card = document.createElement('div');
        card.className = `order-card status-${order.status}`;
        card.dataset.orderId = order.id;

        let itemsHtml = '';
        order.items.forEach(item => {
            itemsHtml += `
                <div class="order-item-row">
                    <span class="order-item-qty">${item.quantity}x</span>
                    <span class="order-item-name">${escapeHtml(item.name)}</span>
                    <span>₹${item.subtotal.toFixed(2)}</span>
                </div>
            `;
        });

        const notesHtml = order.notes
            ? `<div class="order-notes">📝 ${escapeHtml(order.notes)}</div>`
            : '';

        let actionsHtml = '';
        if (order.status === 'NEW') {
            actionsHtml = `
                <button class="btn-action btn-confirm" data-action="confirm" data-id="${order.id}">CONFIRM ORDER</button>
                <button class="btn-action btn-cancel" data-action="cancel" data-id="${order.id}">CANCEL</button>
            `;
        } else if (order.status === 'CONFIRMED') {
            actionsHtml = `
                <button class="btn-action btn-complete" data-action="complete" data-id="${order.id}">MARK COMPLETED</button>
                <button class="btn-action btn-cancel" data-action="cancel" data-id="${order.id}">CANCEL</button>
            `;
        } else {
            actionsHtml = `<span style="font-weight:700; color: var(--text-secondary);">✓ ${order.status}</span>`;
        }

        card.innerHTML = `
            <div class="order-header">
                <span class="order-id">Order #${order.daily_order_number || order.id}</span>
                <span class="order-table">Table ${order.table_number}</span>
            </div>
            <div class="order-meta">
                <span>${formatTime(order.created_at)}</span>
                <span class="status-badge">${order.status}</span>
            </div>
            <div class="order-items">${itemsHtml}</div>
            ${notesHtml}
            <div class="order-footer">
                <span class="order-total">Total: ₹${order.total_amount.toFixed(2)}</span>
            </div>
            <div class="order-actions">${actionsHtml}</div>
        `;

        elements.ordersContainer.appendChild(card);
    });
}

async function fetchHistory() {
    elements.refreshBtn.disabled = true;
    try {
        const response = await window.api.getOrderHistorySummary();
        if (response.success) {
            renderHistory(response.data);
        }
    } catch (error) {
        console.error('Failed to load history:', error);
        showToast('Failed to load history');
    } finally {
        elements.refreshBtn.disabled = false;
    }
}

function renderHistory(data) {
    const container = document.getElementById('history-container');
    container.innerHTML = '';

    const heading = document.createElement('h2');
    heading.textContent = 'Order History';
    container.appendChild(heading);

    if (data.length === 0) {
        const empty = document.createElement('p');
        empty.textContent = 'No history available.';
        empty.style.padding = '15px 4px';
        empty.style.color = 'var(--text-secondary)';
        container.appendChild(empty);
        return;
    }

    data.forEach(day => {
        const dateStr = new Date(day.business_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
        const row = document.createElement('div');
        row.className = 'history-row';

        const strong = document.createElement('strong');
        strong.textContent = dateStr;

        const count = document.createElement('span');
        count.textContent = `${day.total_orders} orders`;

        row.append(strong, count);
        row.addEventListener('click', () => loadOrdersForDate(day.business_date));

        container.appendChild(row);
    });
}

async function loadOrdersForDate(date) {
    try {
        elements.refreshBtn.disabled = true;
        const response = await window.api.getOrders(null, date);
        if (response.success) {
            currentViewDate = date;
            allOrders = response.data || [];
            document.getElementById('history-container').classList.add('hidden');
            document.getElementById('orders-container').classList.remove('hidden');
            currentFilter = 'ALL';
            document.querySelectorAll('.filter-tab').forEach(t => t.classList.remove('active'));
            document.querySelector('.filter-tab[data-status="ALL"]')?.classList.add('active');
            renderOrders();
        }
    } catch (error) {
        console.error('Failed to load past orders:', error);
        showToast('Failed to load orders for selected date');
    } finally {
        elements.refreshBtn.disabled = false;
    }
}

function setupEventListeners() {
    elements.filterTabs.addEventListener('click', (e) => {
        const tab = e.target.closest('.filter-tab');
        if (!tab) return;
        document.querySelectorAll('.filter-tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        currentFilter = tab.dataset.status;

        if (currentFilter === 'HISTORY') {
            document.getElementById('orders-container').classList.add('hidden');
            document.getElementById('history-container').classList.remove('hidden');
            elements.emptyState.classList.add('hidden');
            fetchHistory();
        } else {
            document.getElementById('history-container').classList.add('hidden');
            document.getElementById('orders-container').classList.remove('hidden');
            fetchOrders(false);
        }
    });

    elements.refreshBtn.addEventListener('click', () => {
        fetchOrders(false);
        loadSummary();
    });

    elements.logoutBtn.addEventListener('click', async () => {
        stopAutoRefresh(); // Stop polling before leaving
        try {
            await window.api.logout();
        } catch (error) {
            console.error('Logout failed:', error);
        } finally {
            redirectToLogin();
        }
    });

    elements.ordersContainer.addEventListener('click', async (e) => {
        const btn = e.target.closest('.btn-action');
        if (!btn || btn.disabled) return;

        const action = btn.dataset.action;
        const orderId = parseInt(btn.dataset.id, 10);
        let newStatus = '';

        if (action === 'confirm') newStatus = 'CONFIRMED';
        else if (action === 'complete') newStatus = 'COMPLETED';
        else if (action === 'cancel') {
            if (!window.confirm('Cancel this order? This action cannot be undone.')) return;
            newStatus = 'CANCELLED';
        }

        if (!newStatus) return;

        btn.disabled = true;
        const originalText = btn.textContent;
        btn.textContent = action === 'confirm' ? 'Confirming...' : action === 'complete' ? 'Completing...' : 'Cancelling...';

        try {
            await window.api.updateOrderStatus(orderId, newStatus);
            await Promise.all([fetchOrders(false), loadSummary()]);
        } catch (error) {
            if (error.isAuthError) return redirectToLogin();
            console.error('Status update failed:', error);
            showToast(error.message || 'Unable to update order. Please try again.');
            btn.disabled = false;
            btn.textContent = originalText;
        }
    });
}