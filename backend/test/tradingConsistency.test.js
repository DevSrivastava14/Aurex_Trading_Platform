const assert = require('node:assert/strict');
const mongoose = require('mongoose');
const { afterEach, mock, test } = require('node:test');
const marketCatalog = require('../src/data/marketCatalog');
const marketData = require('../src/data/marketData');
const orderController = require('../src/controllers/orderController');
const portfolioController = require('../src/controllers/portfolioController');
const tradeController = require('../src/controllers/tradeController');
const watchlistController = require('../src/controllers/watchlistController');
const Portfolio = require('../src/models/Portfolio');
const Trade = require('../src/models/Trade');
const Watchlist = require('../src/models/Watchlist');
const orderRoutes = require('../src/routes/orderRoutes');
const portfolioRoutes = require('../src/routes/portfolioRoutes');
const tradeRoutes = require('../src/routes/tradeRoutes');
const watchlistRoutes = require('../src/routes/watchlistRoutes');

afterEach(() => {
  mock.restoreAll();
});

const createResponse = () => ({
  statusCode: 200,
  body: null,
  status(statusCode) {
    this.statusCode = statusCode;
    return this;
  },
  json(body) {
    this.body = body;
    return this;
  },
});

const createPortfolio = () => ({
  cashBalance: 100000,
  positions: [],
  async save() {},
});

test('every live-market catalog symbol remains supported by the backend execution catalog', () => {
  assert.deepEqual(
    new Set(marketCatalog.map(({ symbol }) => symbol)),
    new Set(marketData.keys())
  );
  assert.ok(marketCatalog.every(({ symbol }) => Number.isFinite(marketData.get(symbol))));
});

test('BUY and SELL execute at backend catalog prices and preserve portfolio/trade updates', async () => {
  const portfolio = createPortfolio();
  const session = {
    async withTransaction(callback) {
      await callback();
    },
    async endSession() {},
  };
  const persistedTrades = [];

  mock.method(mongoose, 'startSession', async () => session);
  mock.method(Portfolio, 'findOneAndUpdate', async () => portfolio);
  mock.method(Portfolio, 'findOne', () => ({
    session: async () => portfolio,
  }));
  mock.method(Trade, 'create', async ([trade]) => {
    const persistedTrade = { ...trade };
    persistedTrades.push(persistedTrade);
    return [persistedTrade];
  });

  const buyResponse = createResponse();
  await orderController.placeOrder(
    {
      body: { symbol: 'AAPL', side: 'BUY', quantity: 2, orderType: 'MARKET' },
      user: { userId: new mongoose.Types.ObjectId().toString() },
    },
    buyResponse
  );

  const executionPrice = marketData.get('AAPL');
  assert.equal(buyResponse.statusCode, 201);
  assert.equal(buyResponse.body.trade.price, executionPrice);
  assert.equal(buyResponse.body.trade.totalValue, executionPrice * 2);
  assert.equal(portfolio.cashBalance, 100000 - executionPrice * 2);
  assert.deepEqual(portfolio.positions, [{
    symbol: 'AAPL',
    quantity: 2,
    averagePrice: executionPrice,
  }]);

  const sellResponse = createResponse();
  await orderController.placeOrder(
    {
      body: { symbol: 'AAPL', side: 'SELL', quantity: 1, orderType: 'MARKET' },
      user: { userId: new mongoose.Types.ObjectId().toString() },
    },
    sellResponse
  );

  assert.equal(sellResponse.statusCode, 201);
  assert.equal(sellResponse.body.trade.price, executionPrice);
  assert.equal(portfolio.cashBalance, 100000 - executionPrice);
  assert.equal(portfolio.positions[0].quantity, 1);
  assert.deepEqual(persistedTrades.map(({ side, price }) => ({ side, price })), [
    { side: 'BUY', price: executionPrice },
    { side: 'SELL', price: executionPrice },
  ]);
});

test('orders reject unsupported symbols, invalid quantities, and client-supplied prices', async () => {
  const startSession = mock.method(mongoose, 'startSession');
  const cases = [
    {
      body: { symbol: 'IBM', side: 'BUY', quantity: 1, orderType: 'MARKET' },
      message: 'The requested stock is not available for trading.',
    },
    {
      body: { symbol: 'AAPL', side: 'BUY', quantity: 0, orderType: 'MARKET' },
      message: 'Quantity must be a positive whole number.',
    },
    {
      body: { symbol: 'AAPL', side: 'BUY', quantity: 1.5, orderType: 'MARKET' },
      message: 'Quantity must be a positive whole number.',
    },
    {
      body: {
        symbol: 'AAPL',
        side: 'BUY',
        quantity: 1,
        orderType: 'MARKET',
        price: 0.01,
      },
      message: 'Unsupported order field(s): price.',
    },
  ];

  for (const { body, message } of cases) {
    const response = createResponse();
    await orderController.placeOrder(
      { body, user: { userId: new mongoose.Types.ObjectId().toString() } },
      response
    );

    assert.equal(response.statusCode, 400);
    assert.equal(response.body.message, message);
  }

  assert.equal(startSession.mock.calls.length, 0);
});

test('portfolio valuation continues to use backend execution-catalog prices', async () => {
  const averagePrice = marketData.get('AAPL') - 10;
  mock.method(Portfolio, 'findOne', async () => ({
    toObject: () => ({
      cashBalance: 99000,
      positions: [{ symbol: 'AAPL', quantity: 2, averagePrice }],
    }),
  }));

  const response = createResponse();
  await portfolioController.getPortfolio({ user: { userId: 'test-user' } }, response);

  assert.equal(response.statusCode, 200);
  assert.equal(response.body.positions[0].currentValue, marketData.get('AAPL') * 2);
  assert.equal(response.body.positions[0].investedValue, averagePrice * 2);
  assert.equal(response.body.totalCurrentValue, marketData.get('AAPL') * 2);
  assert.equal(response.body.totalUnrealizedPnl, 20);
});

test('trade history continues to return user trades in descending creation order', async () => {
  const trades = [{ _id: 'newest' }, { _id: 'older' }];
  const sort = mock.fn(async () => trades);
  mock.method(Trade, 'find', () => ({ sort }));

  const response = createResponse();
  await tradeController.getTradeHistory({ user: { userId: 'test-user' } }, response);

  assert.equal(response.statusCode, 200);
  assert.deepEqual(response.body, trades);
  assert.deepEqual(sort.mock.calls[0].arguments, [{ createdAt: -1 }]);
});

test('watchlist continues to return backend catalog prices and validate supported symbols', async () => {
  mock.method(Watchlist, 'findOne', async () => ({ symbols: ['AAPL'] }));

  const getResponse = createResponse();
  await watchlistController.getWatchlist({ user: { userId: 'test-user' } }, getResponse);

  assert.equal(getResponse.statusCode, 200);
  assert.deepEqual(getResponse.body.stocks, [{
    symbol: 'AAPL',
    price: marketData.get('AAPL'),
    change: null,
    changePercent: null,
  }]);

  const addResponse = createResponse();
  await watchlistController.addToWatchlist({ body: { symbol: 'IBM' } }, addResponse);
  assert.equal(addResponse.statusCode, 400);
  assert.equal(addResponse.body.message, 'The requested stock is not available for trading.');
});

test('portfolio, trade-history, watchlist, and order routes remain JWT protected', () => {
  for (const route of [
    orderRoutes.stack.find(({ route: item }) => item?.path === '/' && item.methods.post),
    portfolioRoutes.stack.find(({ route: item }) => item?.path === '/' && item.methods.get),
    tradeRoutes.stack.find(({ route: item }) => item?.path === '/' && item.methods.get),
    ...watchlistRoutes.stack.filter(({ route: item }) => item),
  ]) {
    assert.ok(route, 'expected protected route to remain registered');
    assert.ok(
      route.route.stack.some(({ name }) => name === 'authMiddleware'),
      `expected ${route.route.path} to keep authMiddleware`
    );
  }
});
