const API_BASE = '/api';

async function fetchAPI(endpoint, options = {}) {
    const url = `${API_BASE}${endpoint}`;
    const config = {
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        ...options
    };

    try {
        const response = await fetch(url, config);
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            const error = new Error(errorData.error || `HTTP error! status: ${response.status}`);
            
            // Flag authentication errors for clean redirection
            if (response.status === 401 || response.status === 403) {
                error.isAuthError = true;
            }
            
            throw error;
        }
        return await response.json();
    } catch (error) {
        console.error('API Error:', error);
        throw error;
    }
}

const api = {
    getMenu: async () => fetchAPI('/menu'),
    getMenuItem: async (id) => fetchAPI(`/menu/${id}`),
    createOrder: async (orderData) => fetchAPI('/orders', {
        method: 'POST',
        body: JSON.stringify(orderData)
    }),
    getOrder: async (orderId, tableId, token) => {
        const params = new URLSearchParams({ table: String(tableId) });
        if (token) params.append('token', token);
        return fetchAPI(`/orders/${orderId}?${params.toString()}`);
    },
    
    login: async (credentials) => fetchAPI('/staff/login', {
        method: 'POST',
        body: JSON.stringify(credentials)
    }),
    logout: async () => fetchAPI('/staff/logout', { method: 'POST' }),
    getMe: async () => fetchAPI('/staff/me'),
    
    getOrders: async (status, date) => {
        const params = new URLSearchParams();
        if (status) params.append('status', status);
        if (date) params.append('date', date);
        const query = params.toString() ? `?${params.toString()}` : '';
        return fetchAPI(`/orders${query}`);
    },
    getOrdersSummary: async () => fetchAPI(`/orders/summary`),
    getOrderHistorySummary: async () => fetchAPI(`/orders/history`),
    updateOrderStatus: async (orderId, status) => fetchAPI(`/orders/${orderId}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status })
    })
};

window.api = api;