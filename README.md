# Stock Profit Streak Finder

A stock analysis application with a simple dashboard, historical price charts,
Kadane-based profit-window analysis, demo data, a browser-local watchlist, and CSV export.

## Run locally

Install Node.js, then run:

```sh
npm install
npm start
```

Open http://localhost:3000. If the port is occupied, stop the existing server or
set the `PORT` environment variable before starting.

## Market data

Use Yahoo Finance symbols such as `AAPL`, `TCS.NS`, or `RELIANCE.NS`.
Latest quotes are polled every 30 seconds and may be delayed. Upstox/Kite
streaming is not yet integrated. The existing Yahoo Finance client is an older,
unofficial dependency; provider errors may require upgrading the integration.

## Project structure

- `public/`: HTML, CSS, and browser JavaScript served by Express.
- `server/index.js`: Express server and market-data/analysis endpoints.
- `package.json` and `package-lock.json`: dependencies and start commands.

Analysis is educational and is not investment advice.

Built by Arnav and Team.
