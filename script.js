document.querySelector('.get-started').addEventListener('click', function() {
    alert('Get Started clicked! This will take you to the next step.');
});

document.querySelector('.watch-video').addEventListener('click', function() {
    alert('Watch Video clicked! This will play a demo video.');
});




// Add wallet status message to header
let walletStatus = document.getElementById('walletStatus');
if (!walletStatus) {
    walletStatus = document.createElement('div');
    walletStatus.id = 'walletStatus';
    walletStatus.style.cssText = 'color:#00ff95;font-size:0.95rem;margin-left:16px;display:inline-block;vertical-align:middle;';
    document.querySelector('header nav').appendChild(walletStatus);
}

// Function to connect to MetaMask with UI feedback
async function connectToMetaMask() {
    walletStatus.textContent = '';
    if (typeof window.ethereum !== 'undefined') {
        try {
            walletStatus.textContent = 'Connecting...';
            const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
            const walletAddress = accounts[0];
            walletStatus.textContent = 'Connected: ' + walletAddress.slice(0,6) + '...' + walletAddress.slice(-4);
            // Optionally, update button text
            // document.querySelector('.connect-wallet').textContent = walletAddress.slice(0,6) + '...' + walletAddress.slice(-4);
            return walletAddress;
        } catch (err) {
            walletStatus.textContent = 'Connection rejected or failed.';
            console.error('MetaMask connection error:', err);
            return null;
        }
    } else {
        walletStatus.textContent = 'MetaMask not installed.';
        console.error('MetaMask or another Ethereum wallet is not installed.');
        return null;
    }
}

document.querySelector('.connect-wallet').addEventListener('click', connectToMetaMask);

// Get DOM elements
const chatToggle = document.querySelector('.chat-bot-toggle');
const chatContainer = document.querySelector('#chatBot');
const closeChat = document.querySelector('.close-chat');
const chatMessages = document.querySelector('#chatMessages');
const chatInput = document.querySelector('#chatInput');
const sendMessage = document.querySelector('#sendMessage');

// Open chat when button is clicked
chatToggle.addEventListener('click', () => {
    chatContainer.classList.add('active');
});

// Close chat when close button is clicked
closeChat.addEventListener('click', () => {
    chatContainer.classList.remove('active');
});

// Send message and get bot response
sendMessage.addEventListener('click', () => {
    const userMessage = chatInput.value.trim();
    if (userMessage) {
        // Display user message
        addMessage('You: ' + userMessage, 'user-message');
        // Get bot response
        const botResponse = getBotResponse(userMessage);
        addMessage('Bosa Bot: ' + botResponse, 'bot-message');
        // Clear input
        chatInput.value = '';
        // Scroll to the latest message
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }
});

// Add message to chat
function addMessage(message, className) {
    const messageElement = document.createElement('p');
    messageElement.textContent = message;
    messageElement.classList.add(className);
    chatMessages.appendChild(messageElement);
}

// Simple bot response logic
function getBotResponse(userMessage) {
    userMessage = userMessage.toLowerCase();
    if (userMessage.includes('hello') || userMessage.includes('hi')) {
        return 'Hello! How can I assist you today?';
    } else if (userMessage.includes('crypto') || userMessage.includes('marketplace')) {
        return 'This is a smart crypto marketplace where you can trade securely!';
    } else if (userMessage.includes('help')) {
        return 'I can help with crypto info. Ask me about crypto or the marketplace!';
    } else {
        return 'Sorry, I didn’t understand. Try asking about crypto or help!';
    }
}


chatInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        sendMessage.click();
    }
});

// --- Crypto Prices & Chart ---
// Load Chart.js dynamically if not present
if (typeof Chart === 'undefined') {
    var script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/chart.js';
    script.onload = function() {
        renderCryptoPricesAndChart();
    };
    document.head.appendChild(script);
} else {
    renderCryptoPricesAndChart();
}

function renderCryptoPricesAndChart() {
    fetchCryptoPrices();
    setupChartSelector();
}

// Fetch top crypto prices (BTC, ETH, USDT, BNB, SOL, XRP, ADA, DOGE, TRX, MATIC, DOT, LTC)
function fetchCryptoPrices() {
    const pricesContainer = document.getElementById('pricesContainer');
    pricesContainer.innerHTML = '<p>Loading prices...</p>';
    fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,tether,binancecoin,solana,ripple,cardano,dogecoin,tron,polygon,polkadot,litecoin&vs_currencies=usd')
        .then(res => res.json())
        .then(data => {
            pricesContainer.innerHTML = `
                <div class="price-row"><strong>Bitcoin (BTC):</strong> $${data.bitcoin.usd}</div>
                <div class="price-row"><strong>Ethereum (ETH):</strong> $${data.ethereum.usd}</div>
                <div class="price-row"><strong>Tether (USDT):</strong> $${data.tether.usd}</div>
                <div class="price-row"><strong>BNB:</strong> $${data.binancecoin.usd}</div>
                <div class="price-row"><strong>Solana (SOL):</strong> $${data.solana.usd}</div>
                <div class="price-row"><strong>XRP:</strong> $${data.ripple.usd}</div>
                <div class="price-row"><strong>Cardano (ADA):</strong> $${data.cardano.usd}</div>
                <div class="price-row"><strong>Dogecoin (DOGE):</strong> $${data.dogecoin.usd}</div>
                <div class="price-row"><strong>TRON (TRX):</strong> $${data.tron.usd}</div>
                <div class="price-row"><strong>Polygon (MATIC):</strong> $${data.polygon.usd}</div>
                <div class="price-row"><strong>Polkadot (DOT):</strong> $${data.polkadot.usd}</div>
                <div class="price-row"><strong>Litecoin (LTC):</strong> $${data.litecoin.usd}</div>
            `;
        })
        .catch(() => {
            pricesContainer.innerHTML = '<p>Failed to load prices.</p>';
        });
}

// Chart selector logic
function setupChartSelector() {
    const select = document.getElementById('coinSelect');
    if (!select) return;
    // Initial chart
    fetchAndRenderChart(select.value);
    select.addEventListener('change', function() {
        fetchAndRenderChart(this.value);
    });
}

function fetchAndRenderChart(coinId) {
    const chartTitle = document.getElementById('chartTitle');
    const coinNames = {
        bitcoin: 'Bitcoin',
        ethereum: 'Ethereum',
        binancecoin: 'BNB',
        solana: 'Solana',
        ripple: 'XRP',
        cardano: 'Cardano (ADA)',
        dogecoin: 'Dogecoin (DOGE)',
        tron: 'TRON (TRX)',
        polygon: 'Polygon (MATIC)',
        polkadot: 'Polkadot (DOT)',
        litecoin: 'Litecoin (LTC)'
    };
    chartTitle.textContent = `${coinNames[coinId] || coinId} Price Chart (7d)`;
    fetch(`https://api.coingecko.com/api/v3/coins/${coinId}/market_chart?vs_currency=usd&days=7`)
        .then(res => res.json())
        .then(data => {
            const prices = data.prices.map(p => p[1]);
            const labels = data.prices.map(p => {
                const d = new Date(p[0]);
                return `${d.getMonth()+1}/${d.getDate()}`;
            });
            renderCryptoChart(labels, prices, coinNames[coinId] || coinId);
        })
        .catch(() => {
            const ctx = document.getElementById('cryptoChart').getContext('2d');
            ctx.font = '16px Arial';
            ctx.fillText('Failed to load chart.', 50, 100);
        });
}

function renderCryptoChart(labels, prices, label) {
    const ctx = document.getElementById('cryptoChart').getContext('2d');
    if (window.cryptoChartInstance) window.cryptoChartInstance.destroy();
    window.cryptoChartInstance = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: `${label} Price (USD)`,
                data: prices,
                borderColor: '#00ff95',
                backgroundColor: 'rgba(0,255,149,0.08)',
                tension: 0.3,
                pointRadius: 2,
                fill: true
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: { display: false }
            },
            scales: {
                x: { display: true },
                y: { display: true }
            }
        }
    });
}
const newsToggle = document.querySelector('.news-toggle');
const newsPopup = document.getElementById('newsPopup');
const closeNews = document.querySelector('.close-news');
const newsContent = document.getElementById('newsContent');

// Show news popup
newsToggle.addEventListener('click', () => {
    newsPopup.classList.add('active');
    fetchCryptoNews();
});

// Hide news popup
closeNews.addEventListener('click', () => {
    newsPopup.classList.remove('active');
});

// Fetch real crypto news from a public API
function fetchCryptoNews() {
    newsContent.innerHTML = '<p>Loading news...</p>';
    // Using CryptoCompare News API (no API key required for basic usage)
    fetch('https://min-api.cryptocompare.com/data/v2/news/?lang=EN')
        .then(response => response.json())
        .then(data => {
            if (data.Data && data.Data.length > 0) {
                newsContent.innerHTML = '';
                data.Data.slice(0, 5).forEach(news => {
                    const newsItem = document.createElement('div');
                    newsItem.className = 'news-item';
                    newsItem.innerHTML = `
                        <a href="${news.url}" target="_blank"><strong>${news.title}</strong></a>
                        <p>${news.body.substring(0, 100)}...</p>
                    `;
                    newsContent.appendChild(newsItem);
                });
            } else {
                newsContent.innerHTML = '<p>No news found.</p>';
            }
        })
        .catch(() => {
            newsContent.innerHTML = '<p>Failed to load news. Please try again later.</p>';
        });
}
