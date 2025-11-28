/* =====================================================
   GLOBAL MARKET DATA (Coingecko)
===================================================== */
async function loadMarketStats() {
  try {
    const res = await fetch("https://api.coingecko.com/api/v3/global");
    const json = await res.json();

    document.getElementById("marketCap").textContent =
      "$" + json.data.total_market_cap.usd.toLocaleString();

    document.getElementById("btcDominance").textContent =
      json.data.market_cap_percentage.btc.toFixed(2) + "%";

  } catch (err) {
    console.error("Market Stats Error:", err);
  }
}

/* =====================================================
   FEAR & GREED INDEX (alternative.me)
===================================================== */
async function loadFearGreed() {
  try {
    const res = await fetch("https://api.alternative.me/fng/?limit=1");
    const json = await res.json();

    const value = json.data[0].value;
    const type = json.data[0].value_classification;

    document.getElementById("fearGreed").textContent = `${value} (${type})`;

  } catch (err) {
    console.error("Fear & Greed Error:", err);
  }
}

/* =====================================================
   GAINERS & LOSERS (Coingecko)
===================================================== */
async function loadGainersLosers() {
  try {
    const res = await fetch(
      "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&per_page=200"
    );
    const data = await res.json();

    const gainers = [...data]
      .sort((a, b) => b.price_change_percentage_24h - a.price_change_percentage_24h)
      .slice(0, 5);

    const losers = [...data]
      .sort((a, b) => a.price_change_percentage_24h - b.price_change_percentage_24h)
      .slice(0, 5);

    const gainersBox = document.getElementById("gainers");
    const losersBox = document.getElementById("losers");

    gainersBox.innerHTML = "";
    losersBox.innerHTML = "";

    gainers.forEach(c => {
      gainersBox.innerHTML += `
        <li>
          <span>${c.name}</span>
          <span style="color:green;">+${c.price_change_percentage_24h.toFixed(2)}%</span>
        </li>`;
    });

    losers.forEach(c => {
      losersBox.innerHTML += `
        <li>
          <span>${c.name}</span>
          <span style="color:red;">${c.price_change_percentage_24h.toFixed(2)}%</</span>
        </li>`;
    });

  } catch (err) {
    console.error("Gainers/Losers Error:", err);
  }
}

/* =====================================================
   INITIALIZE DASHBOARD
===================================================== */
function initMarketDashboard() {
  loadMarketStats();
  loadFearGreed();
  loadGainersLosers();

  // auto refresh every 5 minutes
  setInterval(() => {
    loadMarketStats();
    loadFearGreed();
    loadGainersLosers();
  }, 300000);
}

document.addEventListener("DOMContentLoaded", initMarketDashboard);
