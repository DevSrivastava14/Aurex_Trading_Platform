# AUREX — Modern Paper Trading Platform

AUREX is a full-stack, fintech-grade paper trading platform designed to provide a real-world market experience without financial risk. Built with the **MERN** stack (MongoDB, Express, React 19, Node.js), AUREX integrates live market feeds from Twelve Data, interactive financial charting, real-time virtual order execution, portfolio management, and a personalized watchlist.

---

## Table of Contents

- [Overview](#overview)
- [Key Features](#key-features)
- [Technology Stack](#technology-stack)
- [System Architecture](#system-architecture)
- [Project Structure](#project-structure)
- [Market Data & Paper Trading Architecture](#market-data--paper-trading-architecture)
- [Security & Resilience](#security--resilience)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Backend Setup](#backend-setup)
  - [Frontend Setup](#frontend-setup)
- [Environment Variables](#environment-variables)
- [Available Scripts & Testing](#available-scripts--testing)
- [API Reference](#api-reference)
- [Deployment Guide](#deployment-guide)
- [Current Limitations & Roadmap](#current-limitations--roadmap)

---

## Overview

AUREX enables traders and developers to track live equity quotes, analyze historical price movements, place simulated BUY/SELL orders, monitor real-time portfolio performance, and maintain custom watchlists in a polished, responsive web application.

---

## Key Features

- **Authentication & Security**: Secure user registration and login using JWTs and salted bcrypt password hashing.
- **Live Market Universe**: Real-time market feed covering 8 core US equities (`AAPL`, `MSFT`, `GOOGL`, `AMZN`, `TSLA`, `NVDA`, `META`, `NFLX`).
- **Interactive Price Charts**: Responsive historical charts powered by Recharts with multi-timeframe switching (`1D`, `1W`, `1M`).
- **Simulated Order Execution**: Instant paper-trading execution with server-side balance verification, position tracking, and cost basis calculation.
- **Portfolio & Holdings Management**: Real-time aggregation of cash balance, invested capital, total portfolio valuation, and unrealized/realized P&L.
- **Trade History**: Complete chronological ledger of executed orders with transaction timestamps and price points.
- **Personalized Watchlists**: Fast symbol tracking with one-click add/remove toggles and quick-trade shortcuts.
- **Premium UI/UX**: Dark-theme fintech design system with smooth micro-animations, standard async states (loading spinners, empty states, error retry banners), and mobile responsiveness.

---

## Technology Stack

### Frontend
- **Framework**: React 19 + Vite 8
- **Routing**: React Router DOM v7
- **Charts**: Recharts
- **HTTP Client**: Axios
- **Styling**: Vanilla CSS Design System with CSS Variables
- **Linter**: Oxlint

### Backend
- **Runtime**: Node.js (CommonJS)
- **Framework**: Express 5
- **Database & ODM**: MongoDB & Mongoose 9
- **Authentication**: JSON Web Tokens (`jsonwebtoken`) & `bcryptjs`
- **CORS & Config**: `cors` & `dotenv`
- **Testing**: Node.js Native Test Runner (`node --test`)

### External Data Provider
- **Market Data**: Twelve Data REST API (`/quote`, `/time_series`)

---

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      Client Layer                           │
│     React 19 SPA (Vite) + React Router + Recharts           │
└──────────────────────────────┬──────────────────────────────┘
                               │ HTTPS / JSON (Bearer JWT)
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                      Backend API Layer                      │
│                  Express 5 REST Service                     │
├──────────────────────────────┬──────────────────────────────┤
│  Middleware                  │  Controllers                 │
│  - Auth (JWT Verification)   │  - Auth (Register/Login)     │
│  - Dynamic CORS Handling     │  - Market (Quotes & History) │
│  - JSON Body Parsing         │  - Orders (Buy/Sell)         │
│                              │  - Portfolio & Trades        │
│                              │  - Watchlist Management      │
├──────────────────────────────┴──────────────────────────────┤
│  Services & Data Layer                                      │
│  - TwelveDataService (Quote Cache, TimeSeries Cache, 429 CD)│
│  - Execution Catalog (Deterministic Paper Execution)        │
└──────────────┬──────────────────────────────┬───────────────┘
               │                              │
               ▼                              ▼
┌──────────────────────────────┐┌─────────────────────────────┐
│       Database Layer         ││     External Provider       │
│       MongoDB Atlas          ││      Twelve Data API        │
│ (Users, Portfolios, Trades,  ││ (Live Quotes, Time Series)  │
│         Watchlists)          ││                             │
└──────────────────────────────┘└─────────────────────────────┘
```

---

## Project Structure

```
aurex-trading-platform/
├── backend/
│   ├── src/
│   │   ├── config/             # Database connection (Mongoose)
│   │   ├── controllers/        # Route logic & request handling
│   │   ├── data/               # Market catalog & execution baseline
│   │   ├── middlewares/        # JWT auth & validation middlewares
│   │   ├── models/             # Mongoose schemas (User, Portfolio, Trade, Watchlist)
│   │   ├── routes/             # Express route declarations
│   │   ├── services/           # Twelve Data integration & caching service
│   │   └── server.js           # Express app bootstrap & CORS configuration
│   ├── test/                   # Node test runner integration test suites
│   ├── .env.example            # Backend environment template
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── assets/             # Logos, branding, and images
│   │   ├── components/         # Reusable UI widgets (PriceChart, OrderPanel, etc.)
│   │   ├── data/               # Static catalog & mock structures
│   │   ├── pages/              # App views (Dashboard, Market, Portfolio, etc.)
│   │   ├── services/           # Axios instance & Auth helpers
│   │   ├── App.jsx             # Router definition & protected layout
│   │   └── index.css           # Global CSS variables & component tokens
│   ├── .env.example            # Frontend environment template
│   ├── vite.config.js          # Vite build configuration
│   └── package.json
│
├── PROJECT_PROGRESS.md         # Daily roadmap & execution milestone logs
└── README.md                   # Project documentation
```

---

## Market Data & Paper Trading Architecture

AUREX separates **Live Market Display** from **Paper-Trading Execution** to ensure stability, safety, and deterministic simulation:

1. **Live Market Display (Twelve Data)**:
   - Real-time stock prices, percent changes, and historical candle series are fetched server-side from Twelve Data.
   - **Quote Caching**: In-memory TTL cache (60 seconds) prevents redundant provider calls for stock overview feeds.
   - **Historical Series Caching**: In-memory TTL cache (300 seconds) scoped by symbol and timeframe (`1D`, `1W`, `1M`).
   - **Request Deduplication**: In-flight promise coalescing aggregates simultaneous requests for the same stock series into a single external network request.
   - **Rate-Limit Resilience (HTTP 429 Cooldown)**: When Twelve Data rate limits are reached, a provider cooldown is triggered, preventing outbound flood while serving valid cached data or returning user-friendly retry notices.

2. **Paper-Trading Execution (Backend Execution Catalog)**:
   - Order placement (`BUY` and `SELL`) executes against the verified backend pricing catalog.
   - Prevents client-side price manipulation or invalid orders caused by third-party network glitches.
   - Maintains portfolio valuation and P&L calculations consistently regardless of third-party API availability.

---

## Security & Resilience

- **Backend-Only Secrets**: The `TWELVE_DATA_API_KEY`, `MONGO_URI`, and `JWT_SECRET` are strictly isolated on the backend. No third-party API keys or sensitive credentials are ever sent to the browser.
- **Sanitized Error Handling**: Upstream provider errors, database failures, and validation errors are intercepted; stack traces and credential details are sanitized before sending responses to the client.
- **Protected Endpoints**: All order, portfolio, trade, and watchlist endpoints require an `Authorization: Bearer <token>` header verified via JWT middleware.
- **Configurable CORS**: Dynamic origin handling supports development (`*` fallback) and secure production origin binding via `CORS_ORIGIN`.

---

## Getting Started

### Prerequisites
- **Node.js**: v18.0.0 or higher (v20+ recommended)
- **MongoDB**: A running local MongoDB instance or a MongoDB Atlas connection string
- **Twelve Data API Key**: Free tier API key from [twelvedata.com](https://twelvedata.com)

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create your `.env` file from the template:
   ```bash
   cp .env.example .env
   ```
4. Fill in the required environment variables in `backend/.env`.
5. Start the backend server:
   ```bash
   # Development (with nodemon)
   npm run dev

   # Production mode
   npm start
   ```
   The backend will start at `http://localhost:5000`.

### Frontend Setup

1. Open a new terminal and navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create your `.env` file from the template:
   ```bash
   cp .env.example .env
   ```
4. Start the Vite development server:
   ```bash
   npm run dev
   ```
   The frontend will be accessible at `http://localhost:5173`.

---

## Environment Variables

### Backend (`backend/.env`)

| Variable | Required | Description | Example |
|---|:---:|---|---|
| `PORT` | No | Port on which the Express server listens (default: `5000`) | `5000` |
| `MONGO_URI` | Yes | MongoDB Atlas or local MongoDB connection URI | `mongodb+srv://user:pass@cluster.mongodb.net/?retryWrites=true&w=majority` |
| `JWT_SECRET` | Yes | Secret key used to sign and verify authentication JWTs | `your_secure_random_jwt_secret` |
| `TWELVE_DATA_API_KEY` | Yes | Twelve Data API key for live market quotes and charts | `your_twelve_data_api_key` |
| `NODE_ENV` | No | Runtime environment (`development` or `production`) | `development` |
| `CORS_ORIGIN` | No | Allowed frontend origin for CORS in production | `http://localhost:5173` |

### Frontend (`frontend/.env`)

| Variable | Required | Description | Example |
|---|:---:|---|---|
| `VITE_API_URL` | No | Base URL of the backend API (default: `http://localhost:5000`) | `http://localhost:5000` |

---

## Available Scripts & Testing

### Backend Scripts
```bash
# Start server in production mode
npm start

# Start server in development mode (hot-reloading)
npm run dev

# Run full backend test suite
npm test
```

### Frontend Scripts
```bash
# Start Vite development server
npm run dev

# Build production bundle to /dist
npm run build

# Run code linter
npm run lint

# Preview production build locally
npm run preview
```

### Verified Test Suite
The backend contains 27 comprehensive tests using Node's built-in test runner (`node --test`), covering public market feeds, symbol constraints, historical chart parameters, rate-limit cooldowns, cache invalidation, and trading consistency:

```text
✔ GET /api/market is public and returns the complete supported universe in a stable shape
✔ GET /api/market returns the service status and message on provider failure
✔ GET /api/market reports unexpected service failures without leaking details
✔ GET /api/market/:symbol/history returns chart-ready history for every supported range
✔ GET /api/market/:symbol/history rejects symbols outside the AUREX catalog
✔ GET /api/market/:symbol/history rejects unsupported or missing ranges
✔ GET /api/market/:symbol/history returns provider errors and rate limits cleanly
✔ every live-market catalog symbol remains supported by the backend execution catalog
✔ BUY and SELL execute at backend catalog prices and preserve portfolio/trade updates
✔ orders reject unsupported symbols, invalid quantities, and client-supplied prices
✔ portfolio valuation continues to use backend execution-catalog prices
✔ trade history continues to return user trades in descending creation order
✔ watchlist continues to return backend catalog prices and validate supported symbols
✔ portfolio, trade-history, watchlist, and order routes remain JWT protected
✔ fetchQuote normalizes the Twelve Data quote and keeps its key in the backend request
✔ fetchHistoricalData maps chart ranges to suitable intervals and sorts points oldest first
✔ requests fail clearly when the API key is missing
✔ provider API-key errors are reported without exposing credentials
✔ unsupported chart ranges are rejected before a provider request
✔ quote cache hits avoid a second provider request and return independent objects
✔ expired quote cache entries trigger a new provider request
✔ historical cache keys distinguish symbol and range
✔ HTTP 429 activates a shared cooldown that blocks quote and history provider requests
✔ successful cached data remains available during provider cooldown
✔ provider cooldown expires and allows a new provider request
✔ ordinary provider failures are not cached and do not activate cooldown
✔ concurrent requests for the same uncached quote share one provider call

Result: 27 passed, 0 failed
```

---

## API Reference

### Health & Status
- `GET /` — Service status check.
- `GET /api/health` — Returns `{ status: "OK", message: "AUREX backend is healthy" }`.

### Authentication
- `POST /api/auth/register` — Register a new user (`name`, `email`, `password`).
- `POST /api/auth/login` — Authenticate user and receive a JWT Bearer token.

### Market Data
- `GET /api/market` — Public live quote universe for all 8 supported symbols.
- `GET /api/market/:symbol/history?range={1D|1W|1M}` — Historical time series data for price charts.

### Orders & Paper Trading *(Protected: Bearer Token)*
- `POST /api/orders` — Place paper trade (`type: 'BUY' | 'SELL'`, `symbol`, `quantity`).

### Portfolio & Trades *(Protected: Bearer Token)*
- `GET /api/portfolio` — Fetch user's cash balance, active holdings, invested total, and net valuation.
- `GET /api/trades` — Chronological history of all executed simulated trades.

### Watchlist *(Protected: Bearer Token)*
- `GET /api/watchlist` — Retrieve user's tracked stocks with prices.
- `POST /api/watchlist` — Add a stock symbol to the user's watchlist.
- `DELETE /api/watchlist/:symbol` — Remove a stock symbol from the user's watchlist.

---

## Deployment Guide

### Deploying the Backend (e.g., Render / Railway / Heroku)
1. Link your GitHub repository to your hosting service.
2. Set the root directory to `backend`.
3. Set the build command to `npm install`.
4. Set the start command to `npm start`.
5. Configure Environment Variables in your dashboard:
   - `MONGO_URI`: Your MongoDB Atlas URI.
   - `JWT_SECRET`: A secure random secret string.
   - `TWELVE_DATA_API_KEY`: Your Twelve Data API token.
   - `NODE_ENV`: `production`
   - `CORS_ORIGIN`: Your deployed frontend URL (e.g., `https://aurex-trading.vercel.app`).
   - `PORT`: Default provided by platform or `5000`.

### Deploying the Frontend (e.g., Vercel / Netlify)
1. Link your GitHub repository to your hosting service.
2. Set the root directory to `frontend`.
3. Set the build command to `npm run build`.
4. Set the output/publish directory to `dist`.
5. Configure Environment Variables:
   - `VITE_API_URL`: Your deployed backend URL (e.g., `https://aurex-backend.onrender.com`).
6. For single-page app (SPA) routing on Vercel/Netlify, ensure rewrites route all traffic to `index.html`.

---

## Current Limitations & Roadmap

- **Supported Asset Universe**: Currently limited to 8 core large-cap US equities (`AAPL`, `MSFT`, `GOOGL`, `AMZN`, `TSLA`, `NVDA`, `META`, `NFLX`). Future versions will support search and custom symbol lookups.
- **Cache Persistence**: Market caches are stored in-memory per Node process. In multi-instance cluster setups, a distributed cache like Redis can be added.
- **Streaming WebSockets**: Market updates currently poll via HTTP REST endpoints. Future roadmap includes WebSockets (Socket.io) for real-time tick streaming.
- **Advanced Order Types**: Current implementation supports Instant Market Orders (`BUY`/`SELL`). Future expansion will introduce Limit, Stop-Loss, and Take-Profit orders.

---

## License

This project is licensed under the ISC License.
