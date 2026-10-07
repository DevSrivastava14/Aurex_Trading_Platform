const assert = require('node:assert/strict');
const { afterEach, beforeEach, test } = require('node:test');
const {
  HISTORICAL_CACHE_TTL_MS,
  MarketDataError,
  PROVIDER_COOLDOWN_MS,
  QUOTE_CACHE_TTL_MS,
  clearCache,
  fetchHistoricalData,
  fetchQuote,
  getProviderCooldownState,
} = require('../src/services/twelveDataService');

const originalFetch = global.fetch;
const originalApiKey = process.env.TWELVE_DATA_API_KEY;
const originalDateNow = Date.now;

beforeEach(() => {
  clearCache();
  process.env.TWELVE_DATA_API_KEY = 'test-api-key';
});

afterEach(() => {
  clearCache();
  global.fetch = originalFetch;
  Date.now = originalDateNow;
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

test('quote cache hits avoid a second provider request and return independent objects', async () => {
  let requestCount = 0;
  global.fetch = async () => {
    requestCount += 1;
    return Response.json({ symbol: 'AAPL', close: '230.25' });
  };

  const firstQuote = await fetchQuote('AAPL');
  firstQuote.price = -1;
  const secondQuote = await fetchQuote('AAPL');

  assert.equal(requestCount, 1);
  assert.equal(secondQuote.price, 230.25);
  assert.equal(QUOTE_CACHE_TTL_MS, 60_000);
});

test('expired quote cache entries trigger a new provider request', async () => {
  let requestCount = 0;
  let currentTime = 1000;
  Date.now = () => currentTime;
  global.fetch = async () => {
    requestCount += 1;
    return Response.json({ symbol: 'MSFT', close: String(300 + requestCount) });
  };

  const firstQuote = await fetchQuote('MSFT');
  currentTime += QUOTE_CACHE_TTL_MS;
  const secondQuote = await fetchQuote('MSFT');

  assert.equal(requestCount, 2);
  assert.equal(firstQuote.price, 301);
  assert.equal(secondQuote.price, 302);
});

test('historical cache keys distinguish symbol and range', async () => {
  let requestCount = 0;
  global.fetch = async (url) => {
    requestCount += 1;
    const requestedUrl = new URL(url);
    const offset = requestedUrl.searchParams.get('symbol') === 'AAPL' ? 0 : 10;
    const close = String(200 + offset + requestCount);
    return Response.json({
      values: [{ datetime: '2026-10-07 10:00:00', close }],
    });
  };

  const aaplDaily = await fetchHistoricalData('AAPL', '1D');
  const aaplWeekly = await fetchHistoricalData('AAPL', '1W');
  const msftDaily = await fetchHistoricalData('MSFT', '1D');
  const cachedAaplDaily = await fetchHistoricalData('AAPL', '1D');

  assert.equal(requestCount, 3);
  assert.equal(aaplDaily[0].price, 201);
  assert.equal(aaplWeekly[0].price, 202);
  assert.equal(msftDaily[0].price, 213);
  assert.deepEqual(cachedAaplDaily, aaplDaily);
  assert.equal(HISTORICAL_CACHE_TTL_MS, 300_000);
});

test('HTTP 429 activates a shared cooldown that blocks quote and history provider requests', async () => {
  let requestCount = 0;
  let currentTime = 1000;
  Date.now = () => currentTime;
  global.fetch = async () => {
    requestCount += 1;
    return new Response('Too many requests', { status: 429 });
  };

  await assert.rejects(fetchQuote('NVDA'), {
    message: 'Twelve Data rate limit reached. Please try again later.',
    statusCode: 429,
  });

  assert.equal(getProviderCooldownState().active, true);
  assert.equal(getProviderCooldownState().triggeredAt, currentTime);
  assert.equal(getProviderCooldownState().expiresAt, currentTime + PROVIDER_COOLDOWN_MS);

  await assert.rejects(fetchQuote('AAPL'), { statusCode: 429 });
  await assert.rejects(fetchHistoricalData('AAPL', '1D'), { statusCode: 429 });
  assert.equal(requestCount, 1);
});

test('successful cached data remains available during provider cooldown', async () => {
  let requestCount = 0;
  global.fetch = async (url) => {
    requestCount += 1;
    if (new URL(url).searchParams.get('symbol') === 'MSFT') {
      return new Response(null, { status: 429 });
    }

    return Response.json({ symbol: 'AAPL', close: '230.25' });
  };

  const cachedQuote = await fetchQuote('AAPL');
  await assert.rejects(fetchQuote('MSFT'), { statusCode: 429 });
  const quoteDuringCooldown = await fetchQuote('AAPL');

  assert.equal(requestCount, 2);
  assert.deepEqual(quoteDuringCooldown, cachedQuote);
});

test('provider cooldown expires and allows a new provider request', async () => {
  let requestCount = 0;
  let currentTime = 1000;
  Date.now = () => currentTime;
  global.fetch = async () => {
    requestCount += 1;
    if (requestCount === 1) {
      return new Response(null, { status: 429 });
    }
    return Response.json({ symbol: 'NVDA', close: '140.50' });
  };

  await assert.rejects(fetchQuote('NVDA'), { statusCode: 429 });
  await assert.rejects(fetchHistoricalData('NVDA', '1D'), { statusCode: 429 });
  currentTime += PROVIDER_COOLDOWN_MS;
  const quote = await fetchQuote('NVDA');

  assert.equal(requestCount, 2);
  assert.equal(quote.price, 140.5);
  assert.equal(getProviderCooldownState().active, false);
});

test('ordinary provider failures are not cached and do not activate cooldown', async () => {
  let requestCount = 0;
  global.fetch = async () => {
    requestCount += 1;
    if (requestCount === 1) {
      return new Response(
        JSON.stringify({ code: 500, message: 'Temporary provider failure' }),
        { status: 500, headers: { 'content-type': 'application/json' } }
      );
    }

    return Response.json({ symbol: 'NVDA', close: '140.50' });
  };

  await assert.rejects(fetchQuote('NVDA'), { statusCode: 502 });
  assert.equal(getProviderCooldownState().active, false);
  const quote = await fetchQuote('NVDA');

  assert.equal(requestCount, 2);
  assert.equal(quote.price, 140.5);
});

test('concurrent requests for the same uncached quote share one provider call', async () => {
  let requestCount = 0;
  global.fetch = async () => {
    requestCount += 1;
    await new Promise((resolve) => setTimeout(resolve, 10));
    return Response.json({ symbol: 'GOOGL', close: '180.75' });
  };

  const [firstQuote, secondQuote] = await Promise.all([
    fetchQuote('GOOGL'),
    fetchQuote('GOOGL'),
  ]);

  assert.equal(requestCount, 1);
  assert.deepEqual(firstQuote, secondQuote);
});
