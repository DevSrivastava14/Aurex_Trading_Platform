const API_BASE_URL = 'https://api.twelvedata.com';
const REQUEST_TIMEOUT_MS = 10000;
const HISTORICAL_RANGES = {
  '1D': { interval: '5min', outputsize: 78 },
  '1W': { interval: '1day', outputsize: 7 },
  '1M': { interval: '1day', outputsize: 22 },
};

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
    try {
      response = await fetch(url, { signal: controller.signal });
    } catch (error) {
      if (error.name === 'AbortError') {
        throw new MarketDataError('Twelve Data request timed out. Please try again.', 504);
      }
      throw new MarketDataError('Unable to reach Twelve Data. Please try again.', 502);
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

      if (
        response.status === 401
        || response.status === 403
        || Number(data?.code) === 401
        || Number(data?.code) === 403
        || /api[\s_-]?key|unauthori[sz]ed|authentication/i.test(providerMessage)
      ) {
        throw new MarketDataError('Twelve Data API key is invalid or unauthorized.', 502);
      }

      if (response.status === 429 || Number(data?.code) === 429) {
        throw new MarketDataError('Twelve Data rate limit reached. Please try again later.', 429);
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
};

const fetchHistoricalData = async (symbol, range = '1D') => {
  const normalizedSymbol = normalizeSymbol(symbol);
  const normalizedRange = typeof range === 'string' ? range.trim().toUpperCase() : '';
  const rangeConfig = HISTORICAL_RANGES[normalizedRange];

  if (!rangeConfig) {
    throw new MarketDataError('Range must be one of 1D, 1W, or 1M.', 400);
  }

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
};

module.exports = {
  MarketDataError,
  fetchHistoricalData,
  fetchQuote,
};
