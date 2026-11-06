# Stock Profit Streak Finder

A full-stack stock analysis project with a simple dashboard for exploring historical prices and finding the strongest buy-to-sell window using Kadane’s algorithm.

## Features

- Search stocks and ETFs by company name or symbol.
- Plot historical daily prices with the best trade window highlighted.
- View buy/sell prices, dates, holding period, and percentage return.
- Retrieve the latest available quote every 30 seconds while viewing a live stock.
- Generate demo price data and analyze it without a market-data request.
- Save instruments in a browser-local watchlist.
- Export analysis and prices as CSV.
- Responsive interface for desktop and mobile.

## Technology

| Layer | Tools |
| --- | --- |
| Frontend | HTML, CSS, JavaScript, Chart.js |
| Backend | Node.js, Express, CORS |
| Market data | `yahoo-finance2` |
| Local storage | Browser `localStorage` for the watchlist |

## Getting started

Install Node.js with npm, then clone and start the project:

```sh
git clone https://github.com/Arnav186/Stock-Profit-Streak-Finder.git
cd Stock-Profit-Streak-Finder
npm install
npm start
```

Open [http://localhost:3000](http://localhost:3000). Run the application through Express; opening the HTML file directly will not provide the backend API.

Both `npm start` and `npm run dev` currently start `server/index.js`. Restart the server after changing backend code.

## Usage

1. Choose **Live market** and search for a company or enter its Yahoo Finance symbol.
2. Select the lookback and click **Analyze stock**.
3. Review the highlighted historical window and latest quote.
4. Save the instrument to your watchlist or export the analysis.

For generated data, choose **Demo data**, click **Generate**, then **Find best window**.

### Symbol examples

| Company | Yahoo Finance symbol |
| --- | --- |
| Apple | `AAPL` |
| Microsoft | `MSFT` |
| Nvidia | `NVDA` |
| TCS on NSE | `TCS.NS` |
| TCS on BSE | `TCS.BO` |
| Reliance on NSE | `RELIANCE.NS` |

Indian symbols require the exchange suffix. Enter `TCS.NS` rather than `TCS` for NSE data.

## How the analysis works

The application converts prices into consecutive daily changes, then finds the contiguous sequence with the greatest sum using Kadane’s algorithm. The beginning and end of that sequence identify the historical buy and sell points.

For example, prices `[100, 95, 105, 110]` produce changes `[-5, 10, 5]`. The best window buys at `95` and sells at `110`, a price gain of `15` per share before costs.

The scan takes **O(n)** time. It finds the greatest absolute price gain; the displayed percentage describes that selected window. A window may include falling days. If every change is negative, the current implementation returns the smallest-loss window rather than recommending no trade.

## API routes

| Method | Route | Purpose |
| --- | --- | --- |
| GET | `/api/search?q=apple` | Search symbols; returns up to eight matches |
| GET | `/api/stock/TCS.NS?days=90` | Fetch daily historical prices |
| GET | `/api/quote/TCS.NS` | Fetch the latest available regular-market quote |
| POST | `/api/analyze` | Analyze a JSON price array |

Example analysis request body:

```json
{"prices": [100, 95, 105, 110]}
```

The analysis response includes `maxProfit`, `buyIndex`, `sellIndex`, `streakLength`, and `changes`. Indices are zero-based. The history endpoint accepts a desired observation count between 5 and 365; the provider may return fewer prices.

## Project structure

```text
Stock-Profit-Streak-Finder/
├── public/
│   ├── index.html       # Dashboard markup
│   ├── style.css        # Responsive styling
│   └── script.js        # Charts, controls, quotes, watchlist, export
├── server/
│   └── index.js         # Express server and API routes
├── .gitignore
├── package.json
├── package-lock.json
└── README.md
```

## Troubleshooting

**Port 3000 is occupied:** stop the existing server with Ctrl+C in its terminal, or use another port in PowerShell:

```powershell
$env:PORT=3001
npm start
```

Then open [http://localhost:3001](http://localhost:3001).

**Stock fetch fails:** check the exchange suffix, internet connection, and server terminal output. The installed `yahoo-finance2` v2 dependency is an older unofficial integration and may fail when the upstream service changes.

**Chart does not load:** Chart.js is loaded from a CDN. Check the browser network connection and developer console.

## Current limitations

- Quote polling is not tick-by-tick streaming. Data may be delayed or unavailable according to the provider and exchange.
- Upstox/Kite authentication and WebSocket feeds are not implemented.
- The frontend’s lookback labels are approximate; requests use observation counts, not exact calendar ranges.
- The latest quote updates the last chart point; historical analysis metrics are not recalculated on every quote refresh.
- Watchlists are stored only in the current browser; there is no account system or database.
- Returns exclude brokerage, taxes, slippage, and other trading costs.

Historical results are for educational exploration and do not predict future returns or constitute investment advice.

## Contributors

Arnav and Team.
