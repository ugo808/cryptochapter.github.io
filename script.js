document.addEventListener('DOMContentLoaded', () => {
    const hamburger = document.getElementById('hamburger-btn');
    const navMenu = document.getElementById('nav-menu');
    const navLinks = document.querySelectorAll('.nav-link');
    const themeToggle = document.getElementById('theme-toggle');
    const themeIcon = themeToggle.querySelector('.theme-icon');

    // Theme Toggle Logic
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    updateThemeIcon(savedTheme);

    themeToggle.addEventListener('click', () => {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        updateThemeIcon(newTheme);
    });

    function updateThemeIcon(theme) {
        themeIcon.textContent = theme === 'dark' ? '☀️' : '🌙';
    }

    // Toggle Menu
    hamburger.addEventListener('click', () => {
        hamburger.classList.toggle('active');
        navMenu.classList.toggle('active');
        
        // Prevent scrolling when menu is open
        document.body.style.overflow = navMenu.classList.contains('active') ? 'hidden' : 'auto';
    });

    // Close menu when clicking a link
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            hamburger.classList.remove('active');
            navMenu.classList.remove('active');
            document.body.style.overflow = 'auto';
        });
    });

    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
        if (!hamburger.contains(e.target) && !navMenu.contains(e.target) && navMenu.classList.contains('active')) {
            hamburger.classList.remove('active');
            navMenu.classList.remove('active');
            document.body.style.overflow = 'auto';
        }
    });

    // Crypto Ticker
    const tickerContainer = document.getElementById('crypto-ticker');
    
    // Fallback data in case API fails (e.g. CORS on local file)
    const fallbackData = [
        { symbol: 'BTC', priceUsd: '98500.00', changePercent24Hr: '2.5' },
        { symbol: 'ETH', priceUsd: '3800.00', changePercent24Hr: '1.2' },
        { symbol: 'SOL', priceUsd: '145.00', changePercent24Hr: '-0.5' },
        { symbol: 'XRP', priceUsd: '0.65', changePercent24Hr: '0.1' },
        { symbol: 'ADA', priceUsd: '0.45', changePercent24Hr: '-1.2' },
        { symbol: 'DOGE', priceUsd: '0.12', changePercent24Hr: '5.0' },
        { symbol: 'DOT', priceUsd: '7.50', changePercent24Hr: '-2.1' },
        { symbol: 'AVAX', priceUsd: '35.00', changePercent24Hr: '1.5' },
        { symbol: 'LINK', priceUsd: '18.00', changePercent24Hr: '3.2' },
        { symbol: 'MATIC', priceUsd: '0.85', changePercent24Hr: '-0.8' }
    ];

    function renderTicker(coins) {
        tickerContainer.innerHTML = '';
        
        // Create items
        const items = coins.map(coin => {
            const price = parseFloat(coin.priceUsd).toLocaleString('en-US', {
                style: 'currency',
                currency: 'USD',
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            });
            
            const change = parseFloat(coin.changePercent24Hr).toFixed(2);
            const isPositive = parseFloat(coin.changePercent24Hr) >= 0;
            const changeClass = isPositive ? 'positive' : 'negative';
            const changeSign = isPositive ? '+' : '';

            return `
                <div class="ticker-item">
                    <span class="ticker-symbol">${coin.symbol}</span>
                    <span class="ticker-price">${price}</span>
                    <span class="ticker-change ${changeClass}">${changeSign}${change}%</span>
                </div>
            `;
        }).join('');

        // Duplicate content to ensure smooth infinite scroll
        tickerContainer.innerHTML = items + items; 
    }

    async function fetchCryptoPrices() {
        try {
            const response = await fetch('https://api.coincap.io/v2/assets?limit=100');
            if (!response.ok) throw new Error('Network response was not ok');
            const data = await response.json();
            
            if (data.data && data.data.length > 0) {
                renderTicker(data.data);
                renderSidebar(data.data);
            } else {
                throw new Error('No data received');
            }
        } catch (error) {
            console.warn('Error fetching crypto data, using fallback:', error);
            renderTicker(fallbackData);
            renderSidebar(fallbackData);
        }
    }

    function renderSidebar(coins) {
        // 1. Top Gainers & Losers
        const sortedByChange = [...coins].sort((a, b) => parseFloat(b.changePercent24Hr) - parseFloat(a.changePercent24Hr));
        const topGainers = sortedByChange.slice(0, 5);
        const topLosers = sortedByChange.slice(-5).reverse();

        renderCoinList('top-gainers', topGainers);
        renderCoinList('top-losers', topLosers);

        // 2. BTC Dominance (Estimate based on top 100)
        const totalCap = coins.reduce((acc, coin) => acc + parseFloat(coin.marketCapUsd), 0);
        const btcCoin = coins.find(c => c.symbol === 'BTC');
        if (btcCoin) {
            const btcCap = parseFloat(btcCoin.marketCapUsd);
            const btcDominance = ((btcCap / totalCap) * 100).toFixed(1) + '%';
            const btcDomEl = document.getElementById('btc-dominance');
            if (btcDomEl) btcDomEl.textContent = btcDominance;
        }

        // 3. Altcoin Index (Mock/Proxy)
        const altIndexEl = document.getElementById('altcoin-index');
        if (altIndexEl) altIndexEl.textContent = '45/100 (Neutral)';
    }

    function renderCoinList(elementId, coins) {
        const list = document.getElementById(elementId);
        if (!list) return;
        
        list.innerHTML = coins.map(coin => {
            const change = parseFloat(coin.changePercent24Hr).toFixed(2);
            const isPositive = parseFloat(coin.changePercent24Hr) >= 0;
            const changeClass = isPositive ? 'positive' : 'negative';
            const changeSign = isPositive ? '+' : '';
            
            return `
                <li>
                    <div class="coin-info">
                        <span class="coin-symbol">${coin.symbol}</span>
                        <span style="color: var(--text-muted); font-size: 0.8em;">$${parseFloat(coin.priceUsd).toFixed(2)}</span>
                    </div>
                    <span class="coin-change ${changeClass}">${changeSign}${change}%</span>
                </li>
            `;
        }).join('');
    }

    async function fetchFearGreed() {
        try {
            const response = await fetch('https://api.alternative.me/fng/');
            const data = await response.json();
            const fng = data.data[0];
            
            const valueEl = document.getElementById('fg-value');
            const labelEl = document.getElementById('fg-label');
            
            if (valueEl && labelEl) {
                valueEl.textContent = fng.value;
                labelEl.textContent = fng.value_classification;
                
                if (fng.value >= 75) valueEl.style.color = '#10b981';
                else if (fng.value >= 50) valueEl.style.color = '#3b82f6';
                else if (fng.value >= 25) valueEl.style.color = '#f59e0b';
                else valueEl.style.color = '#ef4444';
            }
        } catch (error) {
            console.error('Error fetching Fear & Greed:', error);
            const labelEl = document.getElementById('fg-label');
            if (labelEl) labelEl.textContent = 'Unavailable';
        }
    }

    fetchCryptoPrices();
    fetchFearGreed();
    setInterval(fetchCryptoPrices, 60000);

    // Chatbot Logic
    const chatWidget = document.querySelector('.chat-widget');
    const chatToggle = document.getElementById('chat-toggle');
    const chatInput = document.getElementById('chat-input');
    const chatSend = document.getElementById('chat-send');
    const chatMessages = document.getElementById('chat-messages');

    if (chatToggle) {
        chatToggle.addEventListener('click', () => {
            chatWidget.classList.toggle('active');
        });
    }

    function addMessage(text, sender) {
        const messageDiv = document.createElement('div');
        messageDiv.classList.add('message', sender);
        messageDiv.innerHTML = `<p>${text}</p>`;
        chatMessages.appendChild(messageDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    function handleSend() {
        const text = chatInput.value.trim();
        if (text) {
            addMessage(text, 'user');
            chatInput.value = '';
            
            setTimeout(() => {
                const responses = [
                    "That's interesting! Tell me more.",
                    "I can help you check the latest market trends.",
                    "Have you seen the Bitcoin price today?",
                    "Our support team will contact you shortly.",
                    "To connect your wallet, click the button in the header."
                ];
                const randomResponse = responses[Math.floor(Math.random() * responses.length)];
                addMessage(randomResponse, 'bot');
            }, 1000);
        }
    }

    if (chatSend) {
        chatSend.addEventListener('click', handleSend);
        chatInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') handleSend();
        });
    }

    // Dynamic News Feed
    const newsGrid = document.getElementById('news-grid');
    
    async function fetchNews() {
        if (!newsGrid) return;
        
        try {
            const response = await fetch('https://min-api.cryptocompare.com/data/v2/news/?lang=EN');
            const data = await response.json();
            
            if (data.Data && data.Data.length > 0) {
                renderNews(data.Data.slice(0, 6)); // Show top 6 news items
            } else {
                newsGrid.innerHTML = '<p>No news available at the moment.</p>';
            }
        } catch (error) {
            console.error('Error fetching news:', error);
            newsGrid.innerHTML = '<p>Failed to load news. Please try again later.</p>';
        }
    }

    function renderNews(newsItems) {
        newsGrid.innerHTML = ''; // Clear loading/existing content
        
        newsItems.forEach(item => {
            const date = new Date(item.published_on * 1000);
            const timeAgo = getTimeAgo(date);
            
            const newsCard = document.createElement('article');
            newsCard.className = 'news-card';
            
            newsCard.innerHTML = `
                <div class="card-image" style="background-image: url('${item.imageurl}'); background-size: cover; background-position: center;"></div>
                <div class="card-content">
                    <span class="category">${item.categories.split('|')[0]}</span>
                    <h3><a href="${item.url}" target="_blank" rel="noopener noreferrer">${item.title}</a></h3>
                    <p>${item.body.substring(0, 100)}...</p>
                    <div class="card-meta">
                        <span>${timeAgo}</span>
                        <span>•</span>
                        <span>${item.source_info.name}</span>
                    </div>
                </div>
            `;
            
            newsGrid.appendChild(newsCard);
        });
    }

    function getTimeAgo(date) {
        const seconds = Math.floor((new Date() - date) / 1000);
        
        let interval = seconds / 31536000;
        if (interval > 1) return Math.floor(interval) + " years ago";
        
        interval = seconds / 2592000;
        if (interval > 1) return Math.floor(interval) + " months ago";
        
        interval = seconds / 86400;
        if (interval > 1) return Math.floor(interval) + " days ago";
        
        interval = seconds / 3600;
        if (interval > 1) return Math.floor(interval) + " hours ago";
        
        interval = seconds / 60;
        if (interval > 1) return Math.floor(interval) + " minutes ago";
        
        return Math.floor(seconds) + " seconds ago";
    }

    // Initial fetch
    fetchNews();

    // Refresh news every 60 seconds
    setInterval(fetchNews, 60000);
});
