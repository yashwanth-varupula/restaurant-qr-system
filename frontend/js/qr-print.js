document.addEventListener('DOMContentLoaded', async () => {
    const grid = document.getElementById('qr-grid');
    const errorState = document.getElementById('error-state');
    const loadingState = document.getElementById('loading-state');

    try {
        const response = await fetch('/api/tables');
        const data = await response.json();

        if (data.success && data.tables.length > 0) {
            loadingState.style.display = 'none';
            grid.innerHTML = '';
            
            data.tables.forEach(table => {
                const card = document.createElement('div');
                card.className = 'qr-card';
                card.innerHTML = `
                    <h2>Flavours Restaurant</h2>
                    <div class="table-number">TABLE ${table.table_number}</div>
                    <img src="/qr/table-${table.table_number}.png" alt="QR Code for Table ${table.table_number}">
                    <div class="scan-text">Scan to Order</div>
                `;
                grid.appendChild(card);
            });
        } else {
            loadingState.style.display = 'none';
            errorState.style.display = 'block';
            errorState.textContent = 'No active tables found.';
        }
    } catch (error) {
        console.error('Failed to load tables:', error);
        loadingState.style.display = 'none';
        errorState.style.display = 'block';
        errorState.textContent = 'Unable to load tables. Please try again.';
    }
});

document.getElementById('print-btn').addEventListener('click', () => {
    window.print();
});