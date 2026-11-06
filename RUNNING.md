# Run the updated application

Install Node.js, then run these commands from the repository directory:

```sh
npm install
npm start
```

Open http://localhost:3000. The Express server serves the updated UI from `public/`.
The root HTML files are the original static prototype.

Use `TCS.NS` or `RELIANCE.NS` for NSE symbols. Quotes are polled every 30 seconds
through Yahoo Finance and may be delayed. Upstox/Kite streaming is not yet integrated.

The application includes historical profit-window analysis, generated demo data,
a browser-local watchlist, and CSV export. The Yahoo Finance dependency is an
older unofficial client; provider errors may require upgrading that integration.
