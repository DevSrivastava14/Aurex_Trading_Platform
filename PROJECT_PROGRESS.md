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
| Day 6 | Portfolio + P&L + Trade History | ⬜ Not Started / Next |
| Day 7 | Watchlist + Additional Features | ⬜ Pending |We are starting Day 4 of the AUREX MERN paper-trading platform.

Day 1 and Day 2 authentication are complete.
Day 3 trading dashboard UI is complete.

Day 4 goal:

* stocks / market data
* stock selection
* stock details
* interactive price charts

IMPORTANT:
Do not modify, create, delete, or refactor any files yet.

First inspect the existing frontend structure and identify:

1. The current React entry point
2. Existing routing setup
3. Dashboard.jsx
4. Navbar.jsx
5. Sidebar.jsx
6. MarketWatch.jsx
7. OrderPanel.jsx
8. mockData.js
9. Existing CSS files/styles
10. Any existing dependencies in package.json

Then give me:

* the current relevant file structure
* how routing currently works
* where market-related mock data currently lives
* which existing components we can reuse for Day 4
* which new files/components you recommend creating

Do not make any changes yet.
Wait for my next instruction.

| Day 8 | Backend Integration + Validation | ⬜ Pending |
| Day 9 | UI/UX Polish + Error Handling | ⬜ Pending |
| Day 10 | Testing + Deployment + Documentation | ⬜ Pending |

## Current Status

**Day 5 / 10 — Buy/Sell Trading System Complete**

**Next milestone:** Day 6 — Portfolio + P&L + Trade History

**NEXT:** Day 6 — Portfolio + P&L + Trade History

## Current Project State

- AUREX is a MERN paper-trading platform.
- The market universe currently uses US stocks and USD ($).
- Market prices are mock data; order execution prices are controlled by the backend catalog.
- Day 5 trading functionality is complete and validated.
- Day 6 is the next development stage.

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

**Status: ⬜ Not Started / Next**

## Next

- Build portfolio, profit-and-loss, and trade-history features on the existing `Portfolio` and `Trade` models.
- Reuse these models rather than creating duplicate portfolio or trade models.
