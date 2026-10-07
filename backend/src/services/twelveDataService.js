const API_BASE_URL = 'https://api.twelvedata.com';
const REQUEST_TIMEOUT_MS = 10000;
const QUOTE_CACHE_TTL_MS = 60 * 1000;
const HISTORICAL_CACHE_TTL_MS = 5 * 60 * 1000;
const PROVIDER_COOLDOWN_MS = 60 * 1000;
const HISTORICAL_RANGES = {
  '1D': { interval: '5min', outputsize: 78 },
  '1W': { interval: '1day', outputsize: 7 },
  '1M': { interval: '1day', outputsize: 22 },
};
const responseCache = new Map();
const inFlightRequests = new Map();
let providerCooldown = null;

class MarketDataError extends Error {
  constructor(message, statusCode = 502) {
    super(message);
    this.name = 'MarketDataError';
    this.statusCode = statusCode;
  }
}

const normalizeSymbol = (symbol) => {
  if (typeof symbol !== 'string' || !/^[A-Za-z0-9][A-Za-z0-9.-]{0,19}$/.test(symbol.trim())) {
    throw new MarketDataError('A valid stock symbol is required.', 400);
  }

  return symbol.trim().toUpperCase();
};

const getNumericValue = (value) => {
  if (value === undefined || value === null || value === '') {
    return null;
  }

  const number = Number(value);
  return Number.isFinite(number) ? number : null;
};

const cloneResponse = (value) => (
  Array.isArray(value)
    ? value.map((item) => ({ ...item }))
    : { ...value }
);

const logDevelopmentEvent = (event, details = {}) => {
  if (process.env.NODE_ENV === 'development') {
    console.info(`[Twelve Data] ${event}`, details);
  }
};

const getProviderCooldownState = () => {
  if (providerCooldown && providerCooldown.expiresAt <= Date.now()) {
    providerCooldown = null;
  }

  return providerCooldown
    ? { ...providerCooldown, active: true }
    : { active: false, triggeredAt: null, expiresAt: null };
};

const activateProviderCooldown = () => {
  const triggeredAt = Date.now();
  providerCooldown = {
    triggeredAt,
    expiresAt: triggeredAt + PROVIDER_COOLDOWN_MS,
  };
  logDevelopmentEvent('provider rate limit received; cooldown started', {
    cooldownMs: PROVIDER_COOLDOWN_MS,
  });
};

const throwIfProviderCooldownActive = () => {
  const cooldown = getProviderCooldownState();
  if (cooldown.active) {
    logDevelopmentEvent('provider cooldown active', {
      remainingMs: cooldown.expiresAt - Date.now(),
    });
    throw new MarketDataError('Twelve Data rate limit reached. Please try again later.', 429);
  }
};

const getCachedResponse = async (key, ttlMs, fetchResponse) => {
  const cached = responseCache.get(key);
  if (cached && cached.expiresAt > Date.now()) {
    logDevelopmentEvent('cache hit', { key });
    return cloneResponse(cached.value);
  }
  if (cached) {
    responseCache.delete(key);
  }
  logDevelopmentEvent('cache miss', { key });

  const inFlightRequest = inFlightRequests.get(key);
  if (inFlightRequest) {
    return cloneResponse(await inFlightRequest);
  }

  throwIfProviderCooldownActive();

  const request = (async () => {
    const response = await fetchResponse();
    responseCache.set(key, {
      value: cloneResponse(response),
      expiresAt: Date.now() + ttlMs,
    });
    return response;
  })();
  inFlightRequests.set(key, request);

  try {
    return cloneResponse(await request);
  } finally {
    if (inFlightRequests.get(key) === request) {
      inFlightRequests.delete(key);
    }
  }
};

const clearCache = () => {
  responseCache.clear();
  inFlightRequests.clear();
  providerCooldown = null;
};

const requestTwelveData = async (endpoint, params) => {
  const apiKey = process.env.TWELVE_DATA_API_KEY?.trim();
  if (!apiKey) {
    throw new MarketDataError(
      'Twelve Data is not configured. Set TWELVE_DATA_API_KEY in the backend environment.',
      503
    );
  }

  const url = new URL(`${API_BASE_URL}/${endpoint}`);
  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, String(value));
  }
  url.searchParams.set('apikey', apiKey);

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    let response;
    logDevelopmentEvent('provider request', {
      endpoint,
      symbol: params.symbol,
    });
    try {
      response = await fetch(url, { signal: controller.signal });
    } catch (error) {
      if (error.name === 'AbortError') {
        throw new MarketDataError('Twelve Data request timed out. Please try again.', 504);
      }
      throw new MarketDataError('Unable to reach Twelve Data. Please try again.', 502);
    }

    if (response.status === 429) {
      activateProviderCooldown();
      throw new MarketDataError('Twelve Data rate limit reached. Please try again later.', 429);
    }

    let data;
    try {
      data = await response.json();
    } catch {
      throw new MarketDataError('Twelve Data returned an invalid response.', 502);
    }

    const providerError = data?.status === 'error'
      || (Number.isFinite(Number(data?.code)) && Number(data.code) >= 400);
    if (!response.ok || providerError) {
      const providerMessage = typeof data?.message === 'string' ? data.message : '';

      if (response.status === 429 || Number(data?.code) === 429) {
        activateProviderCooldown();
        throw new MarketDataError('Twelve Data rate limit reached. Please try again later.', 429);
      }

      if (
        response.status === 401
        || response.status === 403
        || Number(data?.code) === 401
        || Number(data?.code) === 403
        || /api[\s_-]?key|unauthori[sz]ed|authentication/i.test(providerMessage)
      ) {
        throw new MarketDataError('Twelve Data API key is invalid or unauthorized.', 502);
      }

      throw new MarketDataError(
        providerMessage
          ? `Twelve Data request failed: ${providerMessage}`
          : 'Twelve Data request failed. Please try again.',
        502
      );
    }

    return data;
  } finally {
    clearTimeout(timeout);
  }
};

const fetchQuote = async (symbol) => {
  const normalizedSymbol = normalizeSymbol(symbol);
  return getCachedResponse(`quote:${normalizedSymbol}`, QUOTE_CACHE_TTL_MS, async () => {
    const quote = await requestTwelveData('quote', { symbol: normalizedSymbol });
    const price = getNumericValue(quote.close);

    if (price === null || price <= 0) {
      throw new MarketDataError('Twelve Data returned an invalid quote for this symbol.', 502);
    }

    return {
      symbol: quote.symbol || normalizedSymbol,
      name: quote.name || null,
      currency: quote.currency || null,
      price,
      change: getNumericValue(quote.change),
      changePercent: getNumericValue(quote.percent_change),
      previousClose: getNumericValue(quote.previous_close),
      dayHigh: getNumericValue(quote.high),
      dayLow: getNumericValue(quote.low),
      volume: getNumericValue(quote.volume),
      marketStatus: typeof quote.is_market_open === 'boolean'
        ? (quote.is_market_open ? 'Open' : 'Closed')
        : null,
      datetime: quote.datetime || null,
    };
  });
};

const fetchHistoricalData = async (symbol, range = '1D') => {
  const normalizedSymbol = normalizeSymbol(symbol);
  const normalizedRange = typeof range === 'string' ? range.trim().toUpperCase() : '';
  const rangeConfig = HISTORICAL_RANGES[normalizedRange];

  if (!rangeConfig) {
    throw new MarketDataError('Range must be one of 1D, 1W, or 1M.', 400);
  }

  return getCachedResponse(
    `history:${normalizedSymbol}:${normalizedRange}`,
    HISTORICAL_CACHE_TTL_MS,
    async () => {
      const result = await requestTwelveData('time_series', {
        symbol: normalizedSymbol,
        interval: rangeConfig.interval,
        outputsize: rangeConfig.outputsize,
        timezone: 'America/New_York',
      });

      if (!Array.isArray(result.values) || result.values.length === 0) {
        throw new MarketDataError(`Twelve Data returned no historical prices for ${normalizedSymbol}.`, 502);
      }

      return result.values
        .map((value) => {
          const price = getNumericValue(value.close);
          if (typeof value.datetime !== 'string' || price === null || price <= 0) {
            throw new MarketDataError('Twelve Data returned invalid historical price data.', 502);
          }

          return {
            time: normalizedRange === '1D'
              ? value.datetime.split(' ')[1]?.slice(0, 5) || value.datetime
              : value.datetime.split(' ')[0],
            datetime: value.datetime,
            price,
          };
        })
        .sort((first, second) => first.datetime.localeCompare(second.datetime));
    }
  );
};

module.exports = {
  PROVIDER_COOLDOWN_MS,
  MarketDataError,
  QUOTE_CACHE_TTL_MS,
  HISTORICAL_CACHE_TTL_MS,
  clearCache,
  fetchHistoricalData,
  fetchQuote,
  getProviderCooldownState,
};
