const marketCatalog = require('../data/marketCatalog');
const twelveDataService = require('../services/twelveDataService');

const getMarket = async (req, res) => {
  try {
    const stocks = await Promise.all(
      marketCatalog.map(async ({ symbol, companyName }) => {
        const quote = await twelveDataService.fetchQuote(symbol);

        return {
          symbol,
          companyName,
          price: quote.price,
          change: quote.change,
          changePercent: quote.changePercent,
          timestamp: quote.datetime,
          marketStatus: quote.marketStatus,
        };
      })
    );

    return res.status(200).json({
      source: 'Twelve Data',
      asOf: new Date().toISOString(),
      stocks,
    });
  } catch (error) {
    if (Number.isInteger(error.statusCode) && error.statusCode >= 400 && error.statusCode <= 599) {
      return res.status(error.statusCode).json({ message: error.message });
    }

    console.error('Unable to load market data:', error.message);
    return res.status(500).json({ message: 'Unable to load market data.' });
  }
};

const getMarketHistory = async (req, res) => {
  const normalizedSymbol = typeof req.params.symbol === 'string'
    ? req.params.symbol.trim().toUpperCase()
    : '';
  const stock = marketCatalog.find(({ symbol }) => symbol === normalizedSymbol);

  if (!stock) {
    return res.status(400).json({ message: 'The requested stock is not available in the market.' });
  }

  const { range } = req.query;
  if (typeof range !== 'string' || !['1D', '1W', '1M'].includes(range)) {
    return res.status(400).json({ message: 'Range must be one of 1D, 1W, or 1M.' });
  }

  try {
    const history = await twelveDataService.fetchHistoricalData(normalizedSymbol, range);
    const data = history.map(({ datetime, price }) => ({
      timestamp: datetime,
      price,
    }));

    return res.status(200).json({
      symbol: normalizedSymbol,
      range,
      data,
    });
  } catch (error) {
    if (Number.isInteger(error.statusCode) && error.statusCode >= 400 && error.statusCode <= 599) {
      return res.status(error.statusCode).json({ message: error.message });
    }

    console.error('Unable to load market history:', error.message);
    return res.status(500).json({ message: 'Unable to load historical market data.' });
  }
};

module.exports = { getMarket, getMarketHistory };
