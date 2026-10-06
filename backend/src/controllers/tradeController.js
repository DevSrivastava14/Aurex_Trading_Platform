const Trade = require('../models/Trade');

exports.getTradeHistory = async (req, res) => {
  try {
    const trades = await Trade.find({ user: req.user.userId }).sort({ createdAt: -1 });

    return res.status(200).json(trades);
  } catch (error) {
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};
