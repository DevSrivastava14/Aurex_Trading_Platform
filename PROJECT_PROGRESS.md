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
| Day 4 | Stocks + Market Data + Charts | ⬜ Pending |
| Day 5 | Buy/Sell Trading System | ⬜ Pending |
| Day 6 | Portfolio + P&L + Trade History | ⬜ Pending |
| Day 7 | Watchlist + Additional Features | ⬜ Pending |
| Day 8 | Backend Integration + Validation | ⬜ Pending |
| Day 9 | UI/UX Polish + Error Handling | ⬜ Pending |
| Day 10 | Testing + Deployment + Documentation | ⬜ Pending |

## Current Status

**Day 3 / 10 — Trading Dashboard UI Complete ✅**

**Next milestone:** Day 4 — Stocks + Market Data + Charts

**NEXT:** Day 4 — Market Data + Charts

Day 4 will begin turning the static dashboard into a functional market interface with stock data, stock selection/details, and interactive charts.

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
