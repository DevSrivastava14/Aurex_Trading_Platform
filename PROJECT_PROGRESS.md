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
| Day 3 | Trading Dashboard UI | ⬜ Pending |
| Day 4 | Stocks + Market Data + Charts | ⬜ Pending |
| Day 5 | Buy/Sell Trading System | ⬜ Pending |
| Day 6 | Portfolio + P&L + Trade History | ⬜ Pending |
| Day 7 | Watchlist + Additional Features | ⬜ Pending |
| Day 8 | Backend Integration + Validation | ⬜ Pending |
| Day 9 | UI/UX Polish + Error Handling | ⬜ Pending |
| Day 10 | Testing + Deployment + Documentation | ⬜ Pending |

## Current Status

**Day 2 / 10 — Authentication Complete ✅**

**Next milestone:** Day 3 — Trading Dashboard UI

**Last Git Commit:** Upcoming Day 2 authentication commit (not yet committed)

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