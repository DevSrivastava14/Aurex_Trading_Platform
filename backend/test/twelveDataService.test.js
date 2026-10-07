const assert = require('node:assert/strict');
const { afterEach, beforeEach, test } = require('node:test');
const {
  MarketDataError,
  fetchHistoricalData,
  fetchQuote,
} = require('../src/services/twelveDataService');

const originalFetch = global.fetch;
const originalApiKey = process.env.TWELVE_DATA_API_KEY;

beforeEach(() => {
  process.env.TWELVE_DATA_API_KEY = 'test-api-key';
});

afterEach(() => {
  global.fetch = originalFetch;
  if (originalApiKey === undefined) {
    delete process.env.TWELVE_DATA_API_KEY;
  } else {
    process.env.TWELVE_DATA_API_KEY = originalApiKey;
  }
});

test('fetchQuote normalizes the Twelve Data quote and keeps its key in the backend request', async () => {
  let requestedUrl;
  global.fetch = async (url) => {
    requestedUrl = new URL(url);
    return Response.json({
      symbol: 'AAPL',
      name: 'Apple Inc.',
      currency: 'USD',
      close: '230.25',
      change: '1.25',
      percent_change: '0.55',
      previous_close: '229.00',
      high: '231.00',
      low: '228.50',
      volume: '123456',
      is_market_open: true,
      datetime: '2026-10-07 10:00:00',
    });
  };

  const quote = await fetchQuote(' aapl ');

  assert.equal(requestedUrl.pathname, '/quote');
  assert.equal(requestedUrl.searchParams.get('symbol'), 'AAPL');
  assert.equal(requestedUrl.searchParams.get('apikey'), 'test-api-key');
  assert.deepEqual(quote, {
    symbol: 'AAPL',
    name: 'Apple Inc.',
    currency: 'USD',
    price: 230.25,
    change: 1.25,
    changePercent: 0.55,
    previousClose: 229,
    dayHigh: 231,
    dayLow: 228.5,
    volume: 123456,
    marketStatus: 'Open',
    datetime: '2026-10-07 10:00:00',
  });
});

test('fetchHistoricalData maps chart ranges to suitable intervals and sorts points oldest first', async () => {
  let requestedUrl;
  global.fetch = async (url) => {
    requestedUrl = new URL(url);
    return Response.json({
      status: 'ok',
      values: [
        { datetime: '2026-10-07 10:05:00', close: '231.00' },
        { datetime: '2026-10-07 10:00:00', close: '230.50' },
      ],
    });
  };

  const history = await fetchHistoricalData('AAPL', '1D');

  assert.equal(requestedUrl.pathname, '/time_series');
  assert.equal(requestedUrl.searchParams.get('interval'), '5min');
  assert.equal(requestedUrl.searchParams.get('outputsize'), '78');
  assert.equal(requestedUrl.searchParams.get('timezone'), 'America/New_York');
  assert.deepEqual(history, [
    { time: '10:00', datetime: '2026-10-07 10:00:00', price: 230.5 },
    { time: '10:05', datetime: '2026-10-07 10:05:00', price: 231 },
  ]);

  await fetchHistoricalData('AAPL', '1W');
  assert.equal(requestedUrl.searchParams.get('interval'), '1day');
  assert.equal(requestedUrl.searchParams.get('outputsize'), '7');

  await fetchHistoricalData('AAPL', '1M');
  assert.equal(requestedUrl.searchParams.get('interval'), '1day');
  assert.equal(requestedUrl.searchParams.get('outputsize'), '22');
});

test('requests fail clearly when the API key is missing', async () => {
  delete process.env.TWELVE_DATA_API_KEY;
  global.fetch = async () => {
    throw new Error('fetch must not be called');
  };

  await assert.rejects(fetchQuote('AAPL'), (error) => {
    assert.ok(error instanceof MarketDataError);
    assert.match(error.message, /TWELVE_DATA_API_KEY/);
    assert.equal(error.statusCode, 503);
    return true;
  });
});

test('provider API-key errors are reported without exposing credentials', async () => {
  global.fetch = async () => new Response(
    JSON.stringify({ code: 401, message: 'Invalid API key' }),
    { status: 401, headers: { 'content-type': 'application/json' } }
  );

  await assert.rejects(fetchQuote('AAPL'), (error) => {
    assert.ok(error instanceof MarketDataError);
    assert.equal(error.message, 'Twelve Data API key is invalid or unauthorized.');
    assert.equal(error.statusCode, 502);
    assert.equal(error.message.includes('test-api-key'), false);
    return true;
  });
});

test('unsupported chart ranges are rejected before a provider request', async () => {
  global.fetch = async () => {
    throw new Error('fetch must not be called');
  };

  await assert.rejects(fetchHistoricalData('AAPL', '1Y'), {
    message: 'Range must be one of 1D, 1W, or 1M.',
    statusCode: 400,
  });
});
