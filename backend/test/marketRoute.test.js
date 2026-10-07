const assert = require('node:assert/strict');
const http = require('node:http');
const express = require('express');
const { afterEach, mock, test } = require('node:test');
const marketCatalog = require('../src/data/marketCatalog');
const marketRoutes = require('../src/routes/marketRoutes');
const twelveDataService = require('../src/services/twelveDataService');

const serverClosers = [];
const originalApiKey = process.env.TWELVE_DATA_API_KEY;

afterEach(async () => {
  mock.restoreAll();
  if (originalApiKey === undefined) {
    delete process.env.TWELVE_DATA_API_KEY;
  } else {
    process.env.TWELVE_DATA_API_KEY = originalApiKey;
  }
  await Promise.all(serverClosers.splice(0).map((close) => new Promise((resolve, reject) => {
    close((error) => (error ? reject(error) : resolve()));
  })));
});

const startMarketServer = async (path = '') => {
  const app = express();
  app.use('/api/market', marketRoutes);

  const server = http.createServer(app);
  await new Promise((resolve, reject) => {
    server.once('error', reject);
    server.listen(0, '127.0.0.1', resolve);
  });
  serverClosers.push((callback) => server.close(callback));

  const address = server.address();
  return `http://127.0.0.1:${address.port}/api/market${path}`;
};

const createQuote = (symbol) => ({
  symbol,
  price: 123.45,
  change: 1.25,
  changePercent: 1.02,
  datetime: '2026-10-07 10:00:00',
  marketStatus: 'Open',
});

test('GET /api/market is public and returns the complete supported universe in a stable shape', async () => {
  process.env.TWELVE_DATA_API_KEY = 'backend-only-test-key';
  const requestedSymbols = [];
  mock.method(twelveDataService, 'fetchQuote', async (symbol) => {
    requestedSymbols.push(symbol);
    return createQuote(symbol);
  });

  const response = await fetch(await startMarketServer());
  const bodyText = await response.text();
  const body = JSON.parse(bodyText);

  assert.equal(response.status, 200);
  assert.deepEqual(requestedSymbols, marketCatalog.map(({ symbol }) => symbol));
  assert.deepEqual(body.stocks.map(({ symbol }) => symbol), [
    'AAPL', 'MSFT', 'GOOGL', 'AMZN', 'TSLA', 'NVDA', 'META', 'NFLX',
  ]);
  assert.equal(body.source, 'Twelve Data');
  assert.ok(Number.isFinite(Date.parse(body.asOf)));
  assert.deepEqual(body.stocks[0], {
    symbol: 'AAPL',
    companyName: 'Apple Inc.',
    price: 123.45,
    change: 1.25,
    changePercent: 1.02,
    timestamp: '2026-10-07 10:00:00',
    marketStatus: 'Open',
  });
  assert.equal(bodyText.includes('backend-only-test-key'), false);
  assert.equal(Object.hasOwn(body, 'apiKey'), false);
});

test('GET /api/market returns the service status and message on provider failure', async () => {
  mock.method(twelveDataService, 'fetchQuote', async () => {
    const error = new Error('Twelve Data rate limit reached. Please try again later.');
    error.statusCode = 429;
    throw error;
  });

  const response = await fetch(await startMarketServer());

  assert.equal(response.status, 429);
  assert.deepEqual(await response.json(), {
    message: 'Twelve Data rate limit reached. Please try again later.',
  });
});

test('GET /api/market reports unexpected service failures without leaking details', async () => {
  mock.method(twelveDataService, 'fetchQuote', async () => {
    throw new Error('unexpected internal detail');
  });

  const response = await fetch(await startMarketServer());

  assert.equal(response.status, 500);
  assert.deepEqual(await response.json(), { message: 'Unable to load market data.' });
});

test('GET /api/market/:symbol/history returns chart-ready history for every supported range', async () => {
  const fetchHistoricalData = mock.method(
    twelveDataService,
    'fetchHistoricalData',
    async () => [
      { time: '09:30', datetime: '2026-10-07 09:30:00', price: 230.5 },
      { time: '09:35', datetime: '2026-10-07 09:35:00', price: 231 },
    ]
  );

  for (const range of ['1D', '1W', '1M']) {
    const response = await fetch(await startMarketServer(`/AAPL/history?range=${range}`));

    assert.equal(response.status, 200);
    assert.deepEqual(await response.json(), {
      symbol: 'AAPL',
      range,
      data: [
        { timestamp: '2026-10-07 09:30:00', price: 230.5 },
        { timestamp: '2026-10-07 09:35:00', price: 231 },
      ],
    });
  }

  assert.deepEqual(
    fetchHistoricalData.mock.calls.map(({ arguments: callArguments }) => callArguments),
    [['AAPL', '1D'], ['AAPL', '1W'], ['AAPL', '1M']]
  );
});

test('GET /api/market/:symbol/history rejects symbols outside the AUREX catalog', async () => {
  const fetchHistoricalData = mock.method(twelveDataService, 'fetchHistoricalData');

  const response = await fetch(await startMarketServer('/IBM/history?range=1D'));

  assert.equal(response.status, 400);
  assert.deepEqual(await response.json(), {
    message: 'The requested stock is not available in the market.',
  });
  assert.equal(fetchHistoricalData.mock.calls.length, 0);
});

test('GET /api/market/:symbol/history rejects unsupported or missing ranges', async () => {
  const fetchHistoricalData = mock.method(twelveDataService, 'fetchHistoricalData');

  for (const path of ['/AAPL/history?range=1Y', '/AAPL/history']) {
    const response = await fetch(await startMarketServer(path));

    assert.equal(response.status, 400);
    assert.deepEqual(await response.json(), {
      message: 'Range must be one of 1D, 1W, or 1M.',
    });
  }

  assert.equal(fetchHistoricalData.mock.calls.length, 0);
});

test('GET /api/market/:symbol/history returns provider errors and rate limits cleanly', async () => {
  mock.method(twelveDataService, 'fetchHistoricalData', async () => {
    const error = new Error('Twelve Data rate limit reached. Please try again later.');
    error.statusCode = 429;
    throw error;
  });

  const response = await fetch(await startMarketServer('/AAPL/history?range=1W'));

  assert.equal(response.status, 429);
  assert.deepEqual(await response.json(), {
    message: 'Twelve Data rate limit reached. Please try again later.',
  });
});
