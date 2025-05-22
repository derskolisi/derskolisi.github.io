document.addEventListener('DOMContentLoaded', function() {
    const mockStocks = [
    { symbol: "KMR", name: "Kumru", price: 60.00, openPrice: 59.00, volume: 4200, historicalData: [50, 52, 54, 55, 56, 57, 58, 59, 59.5, 60] },
    { symbol: "DNR", name: "Döner", price: 60.00, openPrice: 60.00, volume: 6100, historicalData: [50, 51, 53, 55, 57, 58, 59, 59.5, 60, 60] },
    { symbol: "KBB", name: "Kebab", price: 60.00, openPrice: 58.00, volume: 3500, historicalData: [50, 52, 53, 54, 56, 57, 58, 59, 59.5, 60] },
    { symbol: "NGT", name: "Tavuk Nugget", price: 60.00, openPrice: 61.00, volume: 2900, historicalData: [50, 52, 54, 56, 58, 60, 61, 61, 60, 60] },
    { symbol: "KFT", name: "Köfte Ekmek", price: 60.00, openPrice: 60.00, volume: 4700, historicalData: [50, 53, 55, 56, 57, 58, 59, 60, 60, 60] },
    { symbol: "WTR", name: "Pet Su", price: 10.00, openPrice: 10.00, volume: 10000, historicalData: [5, 5, 6, 6, 6.5, 7, 8, 9, 9.5, 10] },
    { symbol: "KST", name: "Kaşarlı Tost", price: 30.00, openPrice: 29.00, volume: 5200, historicalData: [25, 26, 27, 28, 29, 29.5, 30, 30, 30, 30] },
    { symbol: "SCT", name: "Sucuklu Tost", price: 30.00, openPrice: 30.00, volume: 5300, historicalData: [25, 26, 27, 28, 29, 30, 30, 30, 30, 30] },
    { symbol: "MXL", name: "Karışık Tost", price: 40.00, openPrice: 39.00, volume: 4900, historicalData: [30, 32, 34, 36, 38, 39, 40, 40, 40, 40] }
];



    const stockTableBody = document.querySelector('#stock-table tbody');

    const currentStockChartTitle = document.getElementById('current-stock-chart-title');
    const chartPriceSpan = document.getElementById('chart-price');
    const chartChangeSpan = document.getElementById('chart-change');

    // Trading Panel Elements
    const tradeForm = document.getElementById('trade-form');
    const tradeStockSymbolInput = document.getElementById('trade-stock-symbol');
    const tradeQuantityInput = document.getElementById('trade-quantity');
    const estimatedValueSpan = document.getElementById('estimated-value');
    const imagePopupContainer = document.getElementById('image-popup-container');
    const popupImage = document.getElementById('popup-image');
    const closePopupButton = document.getElementById('close-popup-btn');
    // Chart.js instance
    let stockChart;
    const ctx = document.getElementById('stockChartCanvas').getContext('2d');

    function formatPrice(price) {
        return price.toFixed(2);
    }

    function calculateChange(currentPrice, openPrice) {
        const change = currentPrice - openPrice;
        const percentChange = (change / openPrice) * 100;
        return {
            change: change,
            percentChange: percentChange
        };
    }

    function renderStockTable() {
        stockTableBody.innerHTML = ''; // Clear existing rows

        mockStocks.forEach(stock => {
            const stats = calculateChange(stock.price, stock.openPrice);
            const row = stockTableBody.insertRow();

            row.innerHTML = `
                <td>${stock.symbol}</td>
                <td>${stock.name}</td>
                <td class="price">${formatPrice(stock.price)}</td>
                <td class="${stats.change >= 0 ? 'positive' : 'negative'}">${stats.change >= 0 ? '+' : ''}${formatPrice(stats.change)}</td>
                <td class="${stats.percentChange >= 0 ? 'positive' : 'negative'}">${stats.percentChange >= 0 ? '+' : ''}${formatPrice(stats.percentChange)}%</td>
                <td>${stock.volume.toLocaleString()}</td>
            `;

            row.addEventListener('click', () => selectStockForTrading(stock));
        });
    }

    // Kaldırıldı: Rastgele fiyat değişiklikleri yok
    // function simulatePriceChanges() { ... }

    function initOrUpdateChart(stock) {
        const labels = stock.historicalData.map((_, index) => `T-${stock.historicalData.length - index -1}`); // Simple time labels

        const data = {
            labels: labels,
            datasets: [{
                label: `${stock.name} Fiyat Geçmişi`,
                backgroundColor: 'rgba(41, 98, 255, 0.2)',
                borderColor: '#2962FF',
                data: stock.historicalData,
                fill: true,
                tension: 0.1
            }]
        };

        const config = {
            type: 'line',
            data: data,
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: false,
                        ticks: { color: '#d1d4dc' },
                        grid: { color: '#2a2e39' }
                    },
                    x: {
                        ticks: { color: '#d1d4dc' },
                        grid: { color: '#2a2e39' }
                    }
                },
                plugins: {
                    legend: {
                        labels: { color: '#d1d4dc' }
                    }
                }
            }
        };

        if (stockChart) {
            stockChart.destroy();
        }
        stockChart = new Chart(ctx, config);
    }

    function selectStockForTrading(stock) {
        tradeStockSymbolInput.value = stock.symbol; // Update trading panel symbol
        currentStockChartTitle.textContent = `${stock.symbol} - ${stock.name}`;
        updateChartHeader(stock);
        initOrUpdateChart(stock);
        updateEstimatedValue(); // Update estimated value when stock changes
    }

    function updateChartHeader(stock) {
        const stats = calculateChange(stock.price, stock.openPrice);
        chartPriceSpan.textContent = formatPrice(stock.price);
        chartPriceSpan.className = stats.change >= 0 ? 'positive' : 'negative';
        chartChangeSpan.textContent = `${stats.change >= 0 ? '+' : ''}${formatPrice(stats.change)} (${stats.percentChange >= 0 ? '+' : ''}${formatPrice(stats.percentChange)}%)`;
        chartChangeSpan.className = stats.change >= 0 ? 'positive' : 'negative';
    }

    function updateEstimatedValue() {
        const symbol = tradeStockSymbolInput.value;
        const quantity = parseInt(tradeQuantityInput.value) || 0;
        const stock = mockStocks.find(s => s.symbol === symbol);

        if (stock && quantity > 0) {
            const totalValue = stock.price * quantity;
            estimatedValueSpan.textContent = `₺${formatPrice(totalValue)}`;
        } else {
            estimatedValueSpan.textContent = '₺0.00';
        }
    }

    // Event Listeners for Trading Panel
    tradeQuantityInput.addEventListener('input', updateEstimatedValue);

    tradeForm.addEventListener('submit', function(event) {
        event.preventDefault(); // Prevent actual form submission
        const symbol = tradeStockSymbolInput.value;
        const quantity = tradeQuantityInput.value;
        // const stock = mockStocks.find(s => s.symbol === symbol); // Not strictly needed for just showing image

        if (quantity > 0 && symbol) {
            popupImage.src = 'images/bulent.png'; // Buraya kendi fotoğrafınızın yolunu yazın
            imagePopupContainer.style.display = 'flex'; // Show the popup
        } else {
            alert("Lütfen geçerli bir miktar girin.");
        }
    });

    closePopupButton.addEventListener('click', function() {
        imagePopupContainer.style.display = 'none'; // Hide the popup
    });

    // Initial render and start simulation
    if (mockStocks.length > 0) {
        selectStockForTrading(mockStocks[0]); // Select the first stock by default
    }
    renderStockTable();
});
