// Stock Profit Streak Finder (Dark Theme + Animated Shaded Highlight)

const stockInput = document.getElementById('stockName');
const daysRange = document.getElementById('daysRange');
const daysLabel = document.getElementById('daysLabel');
const generateBtn = document.getElementById('generateBtn');
const analyzeBtn = document.getElementById('analyzeBtn');
const companyLabel = document.getElementById('companyLabel');
const summary = document.getElementById('summary');
const resultText = document.getElementById('resultText');
const detailsList = document.getElementById('detailsList');

const ctx = document.getElementById('priceChart').getContext('2d');
let chart = null;
let currentPrices = [];
let currentChanges = [];
let highlightRange = null;
let shadeOpacity = 0; // animation state

const STOCKS = ['Reliance', 'Tata', 'Infosys', 'HDFC', 'ICICI', 'Wipro', 'Tesla', 'Apple', 'Amazon', 'Microsoft'];

daysRange.addEventListener('input', () => daysLabel.textContent = daysRange.value);

// Generate random stock prices
function generatePrices(days = 14) {
  const start = Math.round(Math.random() * 4000) + 50;
  const prices = [start];
  for (let i = 1; i < days; i++) {
    const pct = (Math.random() - 0.5) * 0.08;
    const noise = (Math.random() < 0.06) ? (Math.random() - 0.5) * 0.2 : 0;
    const next = Math.max(1, prices[i - 1] * (1 + pct + noise));
    prices.push(Number(next.toFixed(2)));
  }
  return prices;
}

function computeChanges(prices) {
  return prices.slice(1).map((p, i) => Number((p - prices[i]).toFixed(2)));
}

// Kadane’s algorithm for maximum subarray sum
function kadane(arr) {
  let maxSoFar = -Infinity, maxEndingHere = 0;
  let start = 0, s = 0, end = -1;
  for (let i = 0; i < arr.length; i++) {
    if (maxEndingHere <= 0) {
      maxEndingHere = arr[i];
      s = i;
    } else {
      maxEndingHere += arr[i];
    }
    if (maxEndingHere > maxSoFar) {
      maxSoFar = maxEndingHere;
      start = s;
      end = i;
    }
  }
  if (end === -1) return { maxSum: arr[0], startIndex: 0, endIndex: 0 };
  return { maxSum: Number(maxSoFar.toFixed(2)), startIndex: start, endIndex: end };
}

// ✨ Custom plugin with animated glowing shade
const ShadePlugin = {
  id: 'highlightRegion',
  beforeDatasetsDraw(chart) {
    if (!highlightRange) return;
    const { ctx, chartArea: { top, bottom }, scales: { x } } = chart;
    const [s, e] = highlightRange;

    const xStart = x.getPixelForValue(s);
    const xEnd = x.getPixelForValue(e);
    const width = xEnd - xStart;

    ctx.save();
    const grad = ctx.createLinearGradient(xStart, 0, xEnd, 0);
    grad.addColorStop(0, `rgba(110,231,183,${shadeOpacity * 0.05})`);
    grad.addColorStop(0.5, `rgba(110,231,183,${shadeOpacity * 0.15})`);
    grad.addColorStop(1, `rgba(110,231,183,${shadeOpacity * 0.05})`);
    ctx.fillStyle = grad;
    ctx.shadowColor = `rgba(110,231,183,${shadeOpacity * 0.3})`;
    ctx.shadowBlur = 20 * shadeOpacity;
    ctx.fillRect(xStart, top, width, bottom - top);
    ctx.restore();
  }
};

function animateShade() {
  if (shadeOpacity < 1) {
    shadeOpacity += 0.03;
    chart.update();
    requestAnimationFrame(animateShade);
  }
}

// Chart rendering
function drawChart(prices, range) {
  const labels = prices.map((_, i) => `Day ${i + 1}`);
  const baseColor = 'rgba(88,166,255,0.9)';
  const accent = 'rgba(110,231,183,1)';
  highlightRange = range;
  shadeOpacity = 0;

  const main = {
    label: 'Price',
    data: prices,
    borderColor: baseColor,
    borderWidth: 2,
    pointRadius: 3,
    tension: 0.25,
  };

  const highlight = {
    label: 'Best Profit Streak',
    data: prices.map((v, i) => (range && i >= range[0] && i <= range[1]) ? v : null),
    borderColor: accent,
    borderWidth: 4,
    pointRadius: 5,
    pointBackgroundColor: accent,
    tension: 0.25,
    spanGaps: true
  };

  if (chart) chart.destroy();
  chart = new Chart(ctx, {
    type: 'line',
    data: { labels, datasets: [main, highlight] },
    options: {
      plugins: {
        legend: { labels: { color: '#bcd6f7' } },
        tooltip: { mode: 'index', intersect: false }
      },
      scales: {
        x: { ticks: { color: '#9fb3d0' }, grid: { color: 'rgba(255,255,255,0.05)' } },
        y: { ticks: { color: '#9fb3d0' }, grid: { color: 'rgba(255,255,255,0.05)' } }
      }
    },
    plugins: [ShadePlugin]
  });
}

function updateUI(stock, prices, kad) {
  companyLabel.textContent = stock;
  const buy = kad.startIndex, sell = kad.endIndex + 1;
  const profit = kad.maxSum;
  summary.textContent = `Analyzed ${prices.length} days for ${stock}. Best streak shaded below.`;
  resultText.innerHTML = `Best profit streak: <strong>₹${profit.toFixed(2)}</strong> (Day ${buy + 1} → Day ${sell + 1})`;
  detailsList.innerHTML = `
    <li>Buy day: Day ${buy + 1} (₹${prices[buy].toFixed(2)})</li>
    <li>Sell day: Day ${sell + 1} (₹${prices[sell].toFixed(2)})</li>
    <li>Total profit: ₹${profit.toFixed(2)} over ${sell - buy} days</li>`;
}

function generateAndShow() {
  const days = Number(daysRange.value);
  const stock = stockInput.value.trim() || STOCKS[Math.floor(Math.random() * STOCKS.length)];
  const prices = generatePrices(days);
  currentPrices = prices;
  currentChanges = computeChanges(prices);
  companyLabel.textContent = stock;
  summary.textContent = `Generated ${days} days of prices for ${stock}. Click Analyze to find best streak.`;
  drawChart(prices, null);
  resultText.textContent = '—';
  detailsList.innerHTML = `<li>Buy day: —</li><li>Sell day: —</li><li>Total profit: —</li>`;
}

function analyzeCurrent() {
  if (!currentPrices.length) return alert('Generate data first!');
  const kad = kadane(currentChanges);
  const buy = kad.startIndex, sell = kad.endIndex + 1;
  drawChart(currentPrices, [buy, sell]);
  updateUI(companyLabel.textContent, currentPrices, kad);
  requestAnimationFrame(animateShade); // ✨ start glow animation
}

generateBtn.addEventListener('click', generateAndShow);
analyzeBtn.addEventListener('click', analyzeCurrent);

// Auto init
(function init() {
  daysLabel.textContent = daysRange.value;
  generateAndShow();
})();
