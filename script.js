(() => {
  // ----- DOM Elements Cache ----- //
  const els = {
    hamburger: document.querySelector('.hamburger'),
    navbar: document.querySelector('.navbar'),
    navLinks: document.querySelectorAll('.nav-links a'),
    getStarted: document.querySelector('.get-started'),
    watchVideo: document.querySelector('.watch-video'),
    walletStatusContainer: document.querySelector('header nav'),
    connectBtn: document.querySelector('.connect-wallet'),
    chatToggle: document.querySelector('.chat-bot-toggle'),
    chatContainer: document.querySelector('#chatBot'),
    closeChat: document.querySelector('.close-chat'),
    chatMessages: document.querySelector('#chatMessages'),
    chatInput: document.querySelector('#chatInput'),
    sendMessage: document.querySelector('#sendMessage'),
    themeToggle: document.getElementById('themeToggle'),
    newsGrid: document.getElementById('newsGrid'),
    priceTickerInner: document.getElementById('priceTickerInner')
  };

  // ----- Mobile Menu Handling ----- //
  const toggleMenu = () => {
    els.hamburger.classList.toggle('active');
    els.navbar.classList.toggle('active');

    const isExpanded = els.hamburger.classList.contains('active');
    els.hamburger.setAttribute('aria-expanded', isExpanded);
    document.body.style.overflow = isExpanded ? 'hidden' : '';
  };

  if (els.hamburger && els.navbar) {
    els.hamburger.addEventListener('click', toggleMenu);
    els.navLinks.forEach(link => {
      link.addEventListener('click', () => {
        if (els.navbar.classList.contains('active')) toggleMenu();
      });
    });
  }

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && els.navbar.classList.contains('active')) toggleMenu();
  });

  // ----- Button Click Handlers ----- //
  els.getStarted?.addEventListener('click', () => {
    alert('Get Started clicked! This will take you to the next step.');
  });

  els.watchVideo?.addEventListener('click', () => {
    alert('Watch Video clicked! This will play a demo video.');
  });

  // ----- Wallet Status ----- //
  let walletStatus = document.getElementById('walletStatus');
  if (!walletStatus) {
    walletStatus = document.createElement('div');
    walletStatus.id = 'walletStatus';
    walletStatus.classList.add('wallet-status'); // style via CSS
    els.walletStatusContainer?.appendChild(walletStatus);
  }

  async function connectToMetaMask() {
    walletStatus.textContent = '';
    if (typeof window.ethereum === 'undefined') {
      walletStatus.textContent = 'MetaMask not installed.';
      console.error('MetaMask not installed.');
      return null;
    }

    try {
      walletStatus.textContent = 'Connecting...';
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      const walletAddress = accounts[0];
      walletStatus.textContent = `Connected: ${walletAddress.slice(0,6)}...${walletAddress.slice(-4)}`;
      return walletAddress;
    } catch (err) {
      walletStatus.textContent = 'Connection rejected or failed.';
      console.error('MetaMask connection error:', err);
      return null;
    }
  }

  els.connectBtn?.addEventListener('click', connectToMetaMask);

  // ----- Chat Bot ----- //
  const addMessage = (message, className, isHTML = false) => {
    const msg = document.createElement('p');
    if (isHTML) msg.innerHTML = message;
    else msg.textContent = message;
    msg.classList.add(className);
    els.chatMessages.appendChild(msg);
    els.chatMessages.scrollTop = els.chatMessages.scrollHeight;
  };

  const botReply = () => {
    const replyHTML = `
      We are not available right now.<br><br>
      You can contact us through:<br>
      📱 <a href="https://wa.me/1234567890" target="_blank">WhatsApp</a><br>
      💬 <a href="https://t.me/yourhandle" target="_blank">Telegram</a><br>
      📘 <a href="https://facebook.com/yourpage" target="_blank">Facebook</a><br>
      📸 <a href="https://instagram.com/yourhandle" target="_blank">Instagram</a>
    `;
    addMessage(replyHTML, 'bot-message', true);
  };

  els.chatToggle?.addEventListener('click', () => els.chatContainer?.classList.add('active'));
  els.closeChat?.addEventListener('click', () => els.chatContainer?.classList.remove('active'));

  const sendChat = () => {
    const text = els.chatInput.value.trim();
    if (!text) return;
    addMessage(`You: ${text}`, 'user-message');
    els.chatInput.value = '';
    setTimeout(botReply, 500);
  };

  els.sendMessage?.addEventListener('click', sendChat);
  els.chatInput?.addEventListener('keypress', e => {
    if (e.key === 'Enter') sendChat();
  });

  // ----- Crypto Prices Ticker ----- //
  const fetchTickerPrices = async () => {
    if (!els.priceTickerInner) return;
    const ids = ['bitcoin','ethereum','binancecoin','solana','ripple','cardano','dogecoin','tron','polygon','polkadot','litecoin'];
    const url = `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=${ids.join(',')}&order=market_cap_desc&per_page=250&page=1&sparkline=false&price_change_percentage=24h`;
    try {
      const res = await fetch(url);
      const data = await res.json();
      const items = ids.map(id => {
        const coin = data.find(c => c.id === id);
        const name = coin?.name || id.charAt(0).toUpperCase() + id.slice(1);
        const symbol = coin?.symbol?.toUpperCase() || name[0];
        const price = coin?.current_price != null ? Number(coin.current_price).toLocaleString(undefined, {minimumFractionDigits:2, maximumFractionDigits:2}) : '—';
        const changeVal = coin?.price_change_percentage_24h;
        let changeHTML = '';
        if (changeVal != null) {
          const sign = changeVal > 0 ? '+' : '';
          const cls = changeVal > 0 ? 'price-up' : changeVal < 0 ? 'price-down' : 'price-neutral';
          changeHTML = ` <span class="change ${cls}">(${sign}${changeVal.toFixed(2)}%)</span>`;
        }
        return `<span class="price-ticker__item"><span class="symbol">${symbol}</span><span class="pair">${name}</span><span class="price">$${price}</span>${changeHTML}</span>`;
      }).join('');
      els.priceTickerInner.innerHTML = items + items;
    } catch (err) {
      els.priceTickerInner.textContent = 'Failed to load ticker.';
      console.error('Ticker fetch error', err);
    }
  };
  fetchTickerPrices();
  setInterval(fetchTickerPrices, 60 * 1000);

  // ----- Crypto News ----- //
  let newsFetching = false;
  const fetchCryptoNews = async () => {
    if (!els.newsGrid || newsFetching) return;
    newsFetching = true;
    els.newsGrid.innerHTML = '<div class="news-loading">Loading latest crypto news...</div>';
    try {
      const res = await fetch('https://min-api.cryptocompare.com/data/v2/news/?lang=EN');
      const data = await res.json();
      els.newsGrid.innerHTML = '';
      if (data.Data?.length) {
        data.Data.slice(0,20).forEach(news => {
          const newsItem = document.createElement('div');
          newsItem.className = 'news-item';
          newsItem.innerHTML = `<strong>${news.title}</strong><p>${news.body}</p>`;
          els.newsGrid.appendChild(newsItem);
        });
      } else {
        els.newsGrid.innerHTML = '<div class="news-loading">No news available at the moment.</div>';
      }
    } catch (err) {
      console.error('Error fetching news:', err);
      els.newsGrid.innerHTML = '<div class="news-error">⚠️ Unable to load news. Please try again later.</div>';
    } finally {
      newsFetching = false;
    }
  };
  fetchCryptoNews();
  setInterval(fetchCryptoNews, 5 * 60 * 1000);

  // ----- Dark Mode ----- //
  if (els.themeToggle) {
    if (localStorage.getItem('theme') === 'dark') document.body.classList.add('dark-mode');
    els.themeToggle.addEventListener('click', () => {
      document.body.classList.toggle('dark-mode');
      localStorage.setItem('theme', document.body.classList.contains('dark-mode') ? 'dark' : 'light');
    });
  }
})();
