# AUREX — Project Progress

AUREX is a full-stack MERN paper-trading platform built to simulate stock trading using virtual money.

## Project Goal

Build a production-style paper trading platform with:

- User authentication
- Virtual portfolio
- Stock/market data
- Buy and sell orders
- Portfolio tracking
- Profit & loss calculations
- Trading history
- Market charts
- Watchlist
- Backend APIs
- MongoDB persistence
- Responsive trading dashboard

---

# 10-Day Development Roadmap

| Day | Focus | Status |
|---|---|---|
| Day 1 | MERN architecture + MongoDB Atlas | ✅ Completed |
| Day 2 | Authentication + JWT + Protected Routes | ✅ Completed |
| Day 3 | Trading Dashboard UI | ✅ Completed |
| Day 4 | Stocks + Market Data + Charts | ✅ Completed |
| Day 5 | Buy/Sell Trading System | ✅ Completed |
| Day 6 | Portfolio + P&L + Trade History | ✅ Completed |
| Day 7 | Watchlist + Additional Features | ✅ Completed |

Day 1 and Day 2 authentication are complete.
Day 3 trading dashboard UI is complete.

| Day 8 | Backend Integration + Validation | ✅ Completed |
| Day 9 | UI/UX Polish + Error Handling + Provider Resilience | ✅ Completed |
| Day 10 | Testing + Deployment + Documentation | ⬜ NEXT |

## Current Status

**Day 9 / 10 — UI/UX Polish + Error Handling + Provider Resilience Complete**

**Next milestone:** Day 10 — Testing + Deployment + Documentation

## Current Project State

- AUREX is a MERN paper-trading platform.
- The market universe currently uses US stocks and USD ($).
- Professional UI/UX polish across all pages with unified dark fintech aesthetics and typography.
- Visible mock/demo terminology removed; honest product-grade market session and simulated execution indicators.
- Standardized async states (loading with spinner, error with retry action, contextual empty states) across pages and widgets.
- Order and watchlist operations display clear feedback alerts and disabled states.
- Backend Twelve Data service features in-memory quote caching (60s), historical series caching (300s), in-flight request deduplication, and shared HTTP 429 rate-limit cooldown handling.
- When the external Twelve Data rate limit is reached (HTTP 429), AUREX surfaces a graceful, retryable user message and serves cached quotes/charts without breaking or falling back to fake data.
- Paper-trading execution, portfolio valuation, and watchlist pricing continue to use the backend execution catalog.
- Day 9 is fully completed and validated. Day 10 is the final stage.

---

# Day 1 — MERN Foundation

**Status: ✅ Completed**

## Completed

### Project Structure

Created the initial AUREX monorepo:

```text
aurex-trading-platform/
│
├── frontend/
│
├── backend/
│   └── src/
│       ├── config/
│       ├── controllers/
│       ├── models/
│       ├── routes/
│       └── server.js
│
├── .gitignore
├── README.md
└── PROJECT_PROGRESS.md
```

---

# Day 2 — Authentication

**Status: ✅ Completed**

## Completed

- User registration through `POST /api/auth/register`
- Password hashing with bcryptjs and verification with `comparePassword()`
- Login through `POST /api/auth/login`
- JWT generation with `jsonwebtoken`; `JWT_SECRET` is configured in `backend/.env`
- JWT authentication middleware verifies Bearer tokens and populates `req.user` from the decoded payload
- Protected-route testing verified missing and invalid JWTs return HTTP 401, while a valid JWT accesses the route successfully
- Removed the temporary protected test route after verification

---

# Day 3 — Trading Dashboard UI

**Status: ✅ Completed**

## Completed

- Created `src/pages/Dashboard.jsx` as the dashboard page.
- Created reusable components:
  - `src/components/Sidebar.jsx`
  - `src/components/Navbar.jsx`
  - `src/components/PortfolioOverview.jsx`
  - `src/components/MarketWatch.jsx`
  - `src/components/Holdings.jsx`
  - `src/components/OrderPanel.jsx`
- Created `src/data/mockData.js` for dashboard portfolio, market-watch, and holdings data.
- Replaced the Vite starter interface with the AUREX dashboard.
- Established a professional dark fintech visual identity using charcoal panels, restrained gold AUREX accents, and green/red market-performance indicators.
- Added responsive layouts for desktop, tablet, and mobile.
- Added mock portfolio metrics, market-watch data, holdings, and a Buy/Sell order interface.
- Added local quantity increment/decrement controls, removed the browser's native number-input spinner, and kept the quantity minimum at 1.
- Kept the order panel UI-only; no real trades are executed.
- Made no backend changes; existing authentication was left untouched.
- Connected no real market APIs and added no dependencies.

## Validation

- `npm run build` — passed.
- `npm run lint` — passed.
- Browser verification completed at desktop and mobile widths.
- No horizontal page overflow was detected at the verified widths.
- Quantity increment/decrement controls were verified.

## Architecture / Upcoming Direction

AUREX is expected to grow to include separate frontend pages/routes such as:

- `/dashboard`
- `/market`
- `/portfolio`
- `/orders`
- `/watchlist`
- `/settings`

Planned backend API areas include:

- `/api/auth`
- `/api/market`
- `/api/orders`
- `/api/portfolio`
- `/api/watchlist`

These are planned areas, not routes that are all implemented today. Frontend routes and backend API areas will be introduced progressively during Days 4–8 as the related features are developed.

---

# Day 4 — Stocks + Market Data + Charts

**Status: ✅ Completed**

## Completed

- Added React Router support for `/dashboard` and `/market`, with `/` redirecting to `/dashboard`.
- Added `/market` as a dedicated market page.
- Added mock stock market data in `src/data/marketData.js`.
- Added 8 stocks with symbol, company name, price, daily change, and percentage change.
- Added stock selection with the first stock selected by default.
- Added reusable `src/components/StockDetails.jsx`.
- Added previous close, day high, day low, volume, and market status data.
- Added Recharts as the charting library.
- Added reusable `src/components/PriceChart.jsx`.
- Added mock historical price data for the 1D, 1W, and 1M ranges.
- Added interactive 1D, 1W, and 1M chart ranges.
- Preserved the selected chart range when changing stocks.
- Added responsive chart behavior.
- Added stock search by symbol and company name.
- Added a "No stocks found" state.
- Kept search filtering independent from selected-stock state.
- Added responsive Market page styling.
- Verified desktop and mobile layouts.
- Verified no horizontal overflow at tested mobile widths.
- `npm run build` — passed.
- `npm run lint` — passed.
- The build reports a non-blocking Recharts bundle-size warning; bundle optimization is deferred to a later polish/optimization stage.
- Market prices and historical chart data are mock data; no real stock market API is connected.

---

# Day 5 — Buy/Sell Trading System

**Status: ✅ Completed**

## Completed

- Created the `Portfolio` and `Trade` MongoDB/Mongoose models.
- Added a protected `POST /api/orders` endpoint using the existing JWT authentication middleware.
- Added a server-side mock market catalog for the eight tradable US stocks; execution prices are controlled by the backend.
- Implemented BUY and SELL execution with cash-balance and position updates.
- Implemented weighted average purchase-price calculation for additional BUY orders.
- Added validation for insufficient cash, missing holdings, overselling, unsupported symbols/order types, and invalid quantities.
- Used a MongoDB transaction to keep portfolio updates and trade creation consistent.
- Connected the frontend OrderPanel to the backend order endpoint while retaining the selected market stock.
- Added frontend JWT login, protected routing, and logout.
- Added registration with automatic login using the existing authentication endpoints.
- Standardized monetary values throughout AUREX on USD ($); market prices remain mock values with no exchange-rate conversion.

## Validation

- Frontend lint and production build passed.
- End-to-end API tests passed for registration, login, BUY, additional BUY, partial SELL, invalid orders, auth protection, and portfolio/trade consistency.
- End-to-end browser tests passed for registration, authenticated market access, BUY, SELL, oversell rejection, refresh persistence, logout, and protected-route redirects.
- MongoDB transactions worked during end-to-end API validation.

---

# Day 6 — Portfolio + P&L + Trade History

**Status: ✅ Completed**

## Backend

- Added the Portfolio API using the existing `Portfolio` model.
- Calculated portfolio valuation using current backend market prices.
- Added unrealized P&L calculations.
- Added the protected Trade History API using the existing `Trade` model.
- Protected Portfolio and Trade History endpoints with JWT authentication.
- Validated the APIs in Postman.

## Frontend — Portfolio

- Created `frontend/src/pages/Portfolio.jsx`.
- Connected the page to `GET /api/portfolio`.
- Added Cash Balance, Invested Value, and Current Value summaries.
- Added Unrealized P&L and percentage.
- Displayed real holdings data with loading, error, and empty states.
- Added a responsive holdings layout.
- Added a Recent Trades section showing the latest five trades and a View All link to `/trades`.

## Frontend — Trade History

- Created `frontend/src/pages/TradeHistory.jsx`.
- Connected the page to `GET /api/trades` using the existing Axios client and JWT authentication.
- Displayed Date, Symbol, Side, Quantity, Price, and Total Value.
- Formatted dates and monetary values.
- Applied positive and negative styling to BUY and SELL.
- Added loading, error, and empty states.
- Added a responsive trade-history table.

## Routing / Navigation

- Added protected `/portfolio` and `/trades` routes.
- Added Portfolio and Trade History navigation to the Sidebar.
- Preserved existing routes.

## Validation

- `npm run build` passed throughout Day 6.
- The existing Vite large-chunk warning remained non-blocking.
- Portfolio and Trade History APIs were validated in Postman.
- Portfolio and Trade History pages were manually verified.
- Existing AAPL test trades displayed correctly: BUY 10 AAPL, BUY 5 AAPL, and SELL 4 AAPL.
- Verified the Portfolio → Recent Trades → View All → Trade History flow.
- Verified protected routes and refresh persistence.
- Day 6 is fully completed.

---

# Day 7 — Watchlist + Additional Features

**Status: ✅ Completed**

## Backend

- Created the `Watchlist` MongoDB model with one user-scoped document per user and a normalized symbols array.
- Added the protected `GET /api/watchlist` endpoint.
- Added the protected `POST /api/watchlist` endpoint with symbol validation and duplicate prevention.
- Added the protected `DELETE /api/watchlist/:symbol` endpoint.
- Kept watchlist persistence scoped to the authenticated user.
- Reused the existing backend market catalog for stock prices; no market data is stored in the Watchlist model.

## Frontend — Watchlist

- Created `frontend/src/pages/Watchlist.jsx`.
- Connected the page to the Watchlist API using the existing authenticated Axios client.
- Displayed watched symbols and current prices with loading, error, and empty states.
- Added remove actions with immediate UI updates after successful removal.
- Added a link to the Market page when the watchlist is empty.

## Market Integration

- Connected the Market stock details panel to add and remove the selected stock from the watchlist.
- Displayed whether a stock is already in the watchlist and updated the UI immediately after successful changes.
- Added request loading and error feedback without changing existing Market functionality.

## Routing / Navigation

- Added the protected `/watchlist` route.
- Added Watchlist to the Sidebar navigation with the existing active-state pattern.
- Preserved existing routes and navigation behavior.

## Validation

- Backend Watchlist API validation passed, including authentication protection, duplicate prevention, unsupported-symbol validation, persistence, and user isolation.
- Frontend `npm run lint` passed.
- Frontend `npm run build` passed; the existing non-blocking Vite large-chunk warning remains.
- Manual end-to-end browser testing completed successfully.
- Day 7 is fully completed.

## Market Data

- Watchlist prices continue to come from the existing mock market catalog.
- Live market-data API integration is intentionally planned for Day 8.

---

# Day 8 — Backend Integration + Validation

**Status: ✅ Complete**

## Step 1 — Twelve Data Service

- Added `backend/src/services/twelveDataService.js` with backend-side current quote and historical price fetching.
- Added historical series support for `1D`, `1W`, and `1M`.
- Added clear handling for missing or invalid API keys, request timeouts, malformed responses, provider errors, and rate limits.
- Added `TWELVE_DATA_API_KEY=` to `backend/.env.example`; the key remains backend-only.
- Added service tests using Node's built-in test runner.
- Used Node's native `fetch`; no additional API client dependency was required.

## Step 2 — Backend Live Market Endpoint

- Added a backend market catalog for the supported symbols: AAPL, MSFT, GOOGL, AMZN, TSLA, NVDA, META, and NFLX.
- Added public `GET /api/market`, which fetches current quotes through Twelve Data.
- Kept the API key on the backend; it is never included in frontend responses.
- Provider errors, including HTTP 429 rate limits, are surfaced instead of being replaced with mock data.
- Added route tests for the market response and provider errors.

## Step 3 — Frontend Market Integration

- Updated `frontend/src/pages/Market.jsx` to fetch quotes from `GET /api/market` through the existing Axios client.
- Removed the Market page's dependency on frontend mock quotes.
- Added market loading, error, and retry states; the page does not fall back to mock market data.
- Updated `StockDetails.jsx` to display the backend quote response.
- Updated `PriceChart.jsx` to stop using generated mock chart data while real historical integration was pending.
- Preserved `OrderPanel.jsx` and its Dashboard behavior; the Dashboard's default stock dependency remains unchanged.

## Step 4 — Real Historical Charts

- Added `GET /api/market/:symbol/history?range=1D`.
- Supports exactly `1D`, `1W`, and `1M`, and validates symbols against the backend market catalog.
- Returns `{ symbol, range, data: [{ timestamp, price }] }`.
- Updated `PriceChart.jsx` to fetch historical prices when the selected stock or range changes.
- Added chart loading, error, and retry states. No fake or random fallback chart data is used.
- Live AAPL history returned HTTP 200 with 78 points for `1D`.
- Browser validation confirmed the 1D/1W/1M controls and stock switching load chart data.

## Step 5 — Trading-System Compatibility Validation

- Confirmed live market quotes and historical data remain separate from paper-trading execution.
- BUY/SELL execution continues to use backend-controlled execution-catalog prices.
- Client-supplied execution prices remain rejected.
- Portfolio valuation and watchlist pricing remain compatible with the backend execution catalog.
- Trade history remains compatible.
- Existing JWT-protected order, portfolio, trade-history, and watchlist routes remain unchanged.
- Added `backend/test/tradingConsistency.test.js` for database-free compatibility checks.
- Confirmed symbols in the live-market catalog match those in the execution catalog.

## Architecture

AUREX intentionally maintains two market-data paths:

**Live market display**

Twelve Data → Backend market APIs → Frontend Market page / PriceChart

**Paper-trading execution**

Backend execution catalog → Orders / Portfolio / Watchlist

The execution catalog remains a paper-trading price source; it is not a live trading-price system.

## Remaining Mock Data

- The backend execution/portfolio/watchlist price catalog remains in use for existing paper-trading behavior.
- Dashboard static widgets continue to use their existing sample data.
- The Dashboard's default OrderPanel stock continues to use the frontend market catalog.
- These areas were intentionally left unchanged during Day 8.

## Validation

- Backend tests: **19 passed, 0 failed**.
- Frontend lint passed.
- Frontend production build passed; the existing large-bundle warning remains non-blocking.
- `git diff --check` passed.
- Live `GET /api/market` successfully returned all 8 supported symbols during final validation.
- Live historical AAPL data returned successfully.
- Browser chart validation passed for range switching and stock switching.
- Simulated provider HTTP 429 displayed a retryable error without falling back to fake data.
- Existing trading-system compatibility checks passed.

## Day 8 Summary

Day 8 added a backend-owned Twelve Data integration for live market quotes and historical charts, connected the Market page and PriceChart to those APIs, and validated provider failure handling and trading-system compatibility. Live market display now uses Twelve Data through the backend, while paper-trading execution, portfolio valuation, and watchlist pricing intentionally continue to use the backend execution catalog.

---

# Day 9 — UI/UX Polish + Error Handling + Provider Resilience

**Status: ✅ Completed**

## Frontend UI/UX Polish

- **Removed Mock / Demo Terminology**: Replaced all visible `Mock session` badges with professional `US Session` indicators on Dashboard, Portfolio, and Trade History. Updated dashboard captions and footers to reflect honest simulated execution and virtual portfolio tracking. Connected sidebar profile to authenticated user state (`getStoredUser()`).
- **Standardized Async States**: Unified loading, error, and empty states using `.async-state`, `.async-state-loading` (animated spinner), `.async-state-error` (inline retry button), and `.async-state-empty` across Market, Portfolio, Trade History, Watchlist, and PriceChart.
- **Feedback & Interactions**: Standardized feedback banners with `.order-feedback-error` and `.order-feedback-success` across order execution and watchlist management. Added active state styling (`.stock-watchlist-button.in-watchlist`) and `★ In Watchlist` badge in Stock Details. Added proportional table action buttons (`.table-action-button`) in Watchlist.
- **Visual & Responsive Consistency**: Preserved dark fintech styling with gold accents and green/red financial indicators while optimizing tabular alignment, typography, spacing, and mobile/desktop responsive layouts.

## Backend Provider Resilience & Caching

- **Quote Caching**: Added in-memory TTL caching (60 seconds) for real-time market quotes.
- **Historical Data Caching**: Added in-memory TTL caching (300 seconds) scoped by symbol and range (1D, 1W, 1M).
- **In-flight Request Deduplication**: Implemented promise coalescing for concurrent requests targeting the same symbol or historical series.
- **Rate-Limit Resilience (HTTP 429 Cooldown)**: When Twelve Data returns HTTP 429 (rate limit exhausted), a shared provider cooldown activates to protect upstream quotas while still serving valid cached data. A user-friendly retry message is presented rather than raw provider exceptions. The existing chart implementation is preserved.

## Validation

- Backend tests: **27 passed, 0 failed**.
- Frontend lint (`oxlint`): **0 errors, 0 warnings**.
- Frontend production build (`vite build`): **Passed successfully**.
- End-to-end user flows, protected routing, and responsive layouts verified.

## Day 9 Summary

Day 9 polished the entire frontend to look and feel like a mature, cohesive trading platform. Visible mock terminology was replaced with clear product-grade indicators, async states and feedback banners were standardized with retry actions, and backend market data resilience was upgraded with TTL caching, request deduplication, and graceful rate-limit cooldown handling.
