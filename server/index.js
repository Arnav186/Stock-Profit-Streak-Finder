// Stock Profit Finder — Express Backend
const express = require('express');
const cors = require('cors');
const path = require('path');
const yahooFinance = require('yahoo-finance2').default;

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Serve static frontend files
app.use(express.static(path.join(__dirname, '..', 'public')));

// ─── API: Search for stock symbols ───────────────────────────────────────────
app.get('/api/search', async (req, res) => {
  const { q } = req.query;
  if (!q || q.trim().length < 1) {
    return res.status(400).json({ error: 'Query parameter "q" is required.' });
  }

  try {
    const results = await yahooFinance.search(q.trim(), { newsCount: 0 });
    const symbols = (results.quotes || [])
      .filter(r => r.symbol && (r.quoteType === 'EQUITY' || r.quoteType === 'ETF'))
      .slice(0, 8)
      .map(r => ({
        symbol: r.symbol,
        name: r.shortname || r.longname || r.symbol,
        exchange: r.exchDisp || r.exchange || ''
      }));
    res.json({ results: symbols });
  } catch (err) {
    console.error('Search error:', err.message);
    res.status(500).json({ error: 'Failed to search for stocks.' });
  }
});

// ─── API: Get historical stock prices ────────────────────────────────────────
app.get('/api/stock/:symbol', async (req, res) => {
  const { symbol } = req.params;
  const days = Math.min(Math.max(parseInt(req.query.days) || 30, 5), 365);

  try {
    // Fetch enough calendar days to get the desired number of trading days
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - Math.ceil(days * 1.8));

    const result = await yahooFinance.historical(symbol.toUpperCase(), {
      period1: startDate,
      period2: endDate,
      interval: '1d'
    });

    if (!result || result.length === 0) {
      return res.status(404).json({ error: `No data found for symbol "${symbol}".` });
    }

    // Take the last N trading days
    const trimmed = result.slice(-days);

    const prices = trimmed.map(d => ({
      date: d.date.toISOString().split('T')[0],
      open: d.open,
      high: d.high,
      low: d.low,
      close: d.close,
      volume: d.volume
    }));

    // Get quote info for the company name
    let companyName = symbol;
    try {
      const quote = await yahooFinance.quote(symbol.toUpperCase());
      companyName = quote.shortName || quote.longName || symbol;
    } catch (_) { /* fallback to symbol */ }

    res.json({
      symbol: symbol.toUpperCase(),
      name: companyName,
      days: prices.length,
      prices
    });
  } catch (err) {
    console.error('Historical data error:', err.message);
    res.status(500).json({ error: `Failed to fetch data for "${symbol}". Check the symbol and try again.` });
  }
});

// ─── API: Latest quote for the live ticker ──────────────────────────────────
// Yahoo Finance quotes are delayed according to the exchange/provider. The UI
// polls this endpoint only while a user is viewing an instrument.
app.get('/api/quote/:symbol', async (req, res) => {
  const symbol = req.params.symbol.toUpperCase();
  try {
    const quote = await yahooFinance.quote(symbol);
    const price = Number(quote.regularMarketPrice);
    if (!Number.isFinite(price)) {
      return res.status(404).json({ error: `No current quote found for "${symbol}".` });
    }

    res.json({
      symbol,
      name: quote.shortName || quote.longName || symbol,
      price,
      change: Number(quote.regularMarketChange) || 0,
      changePercent: Number(quote.regularMarketChangePercent) || 0,
      marketState: quote.marketState || 'UNKNOWN',
      asOf: quote.regularMarketTime ? new Date(quote.regularMarketTime).toISOString() : new Date().toISOString()
    });
  } catch (err) {
    console.error('Quote error:', err.message);
    res.status(500).json({ error: `Failed to fetch a current quote for "${symbol}".` });
  }
});

// ─── API: Analyze prices with Kadane's algorithm (server-side) ───────────────
app.post('/api/analyze', (req, res) => {
  const { prices } = req.body;

  if (!Array.isArray(prices) || prices.length < 2 || prices.some(price => !Number.isFinite(Number(price)))) {
    return res.status(400).json({ error: 'Need at least 2 price points.' });
  }

  // Compute daily changes
  const changes = [];
  for (let i = 1; i < prices.length; i++) {
    changes.push(Number((prices[i] - prices[i - 1]).toFixed(2)));
  }

  // Kadane's algorithm
  let maxSoFar = -Infinity, maxEndingHere = 0;
  let start = 0, s = 0, end = -1;

  for (let i = 0; i < changes.length; i++) {
    if (maxEndingHere <= 0) {
      maxEndingHere = changes[i];
      s = i;
    } else {
      maxEndingHere += changes[i];
    }
    if (maxEndingHere > maxSoFar) {
      maxSoFar = maxEndingHere;
      start = s;
      end = i;
    }
  }

  if (end === -1) {
    return res.json({
      maxProfit: Number(changes[0].toFixed(2)),
      buyIndex: 0,
      sellIndex: 1,
      streakLength: 1,
      changes
    });
  }

  res.json({
    maxProfit: Number(maxSoFar.toFixed(2)),
    buyIndex: start,
    sellIndex: end + 1,
    streakLength: end - start + 1,
    changes
  });
});

// ─── SPA fallback ────────────────────────────────────────────────────────────
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`\n  🚀 Stock Profit Finder running at http://localhost:${PORT}\n`);
});
