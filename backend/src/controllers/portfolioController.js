const Portfolio = require('../models/Portfolio');
const marketData = require('../data/marketData');

exports.getPortfolio = async (req, res) => {
  try {
    const portfolio = await Portfolio.findOne({ user: req.user.userId });

    if (!portfolio) {
      return res.status(404).json({ message: 'Portfolio not found' });
    }

    const portfolioData = portfolio.toObject ? portfolio.toObject() : portfolio;

    const positions = (portfolioData.positions || []).map((position) => {
      const quantity = Number(position.quantity) || 0;
      const averagePrice = Number(position.averagePrice) || 0;
      const currentPrice = marketData.get(position.symbol) ?? 0;
      const investedValue = quantity * averagePrice;
      const currentValue = quantity * currentPrice;
      const unrealizedPnl = currentValue - investedValue;
      const unrealizedPnlPercent = investedValue === 0 ? 0 : (unrealizedPnl / investedValue) * 100;

      return {
        ...position,
        investedValue,
        currentValue,
        unrealizedPnl,
        unrealizedPnlPercent,
      };
    });

    const totalInvestedValue = positions.reduce((sum, position) => sum + position.investedValue, 0);
    const totalCurrentValue = positions.reduce((sum, position) => sum + position.currentValue, 0);
    const totalUnrealizedPnl = totalCurrentValue - totalInvestedValue;

    return res.status(200).json({
      ...portfolioData,
      positions,
      totalInvestedValue,
      totalCurrentValue,
      totalUnrealizedPnl,
    });
  } catch (error) {
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};
