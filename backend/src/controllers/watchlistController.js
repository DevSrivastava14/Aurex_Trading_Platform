const Watchlist = require('../models/Watchlist');
const marketData = require('../data/marketData');

const formatWatchlist = (symbols) => ({
  symbols,
  stocks: symbols.map((symbol) => ({
    symbol,
    price: marketData.get(symbol) ?? null,
    change: null,
    changePercent: null,
  })),
});

exports.getWatchlist = async (req, res) => {
  try {
    const watchlist = await Watchlist.findOne({ user: req.user.userId });
    const symbols = watchlist?.symbols || [];

    return res.status(200).json(formatWatchlist(symbols));
  } catch (error) {
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.addToWatchlist = async (req, res) => {
  const { symbol } = req.body || {};

  if (typeof symbol !== 'string' || !symbol.trim()) {
    return res.status(400).json({ message: 'A stock symbol is required.' });
  }

  const normalizedSymbol = symbol.trim().toUpperCase();
  if (!marketData.has(normalizedSymbol)) {
    return res.status(400).json({ message: 'The requested stock is not available for trading.' });
  }

  try {
    const watchlist = await Watchlist.findOneAndUpdate(
      { user: req.user.userId },
      {
        $setOnInsert: { user: req.user.userId },
        $addToSet: { symbols: normalizedSymbol },
      },
      { new: true, upsert: true, runValidators: true }
    );

    return res.status(200).json(formatWatchlist(watchlist.symbols));
  } catch (error) {
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.removeFromWatchlist = async (req, res) => {
  const { symbol } = req.params;

  if (typeof symbol !== 'string' || !symbol.trim()) {
    return res.status(400).json({ message: 'A stock symbol is required.' });
  }

  const normalizedSymbol = symbol.trim().toUpperCase();

  try {
    const watchlist = await Watchlist.findOneAndUpdate(
      { user: req.user.userId },
      { $pull: { symbols: normalizedSymbol } },
      { new: true }
    );

    return res.status(200).json(formatWatchlist(watchlist?.symbols || []));
  } catch (error) {
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};
