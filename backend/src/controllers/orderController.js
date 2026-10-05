const mongoose = require('mongoose');
const Portfolio = require('../models/Portfolio');
const Trade = require('../models/Trade');
const marketData = require('../data/marketData');

const allowedFields = new Set(['symbol', 'side', 'quantity', 'orderType']);

const createOrderError = (statusCode, message) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

const placeOrder = async (req, res) => {
  const body = req.body;

  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return res.status(400).json({ message: 'A valid order body is required.' });
  }

  const unexpectedFields = Object.keys(body).filter((field) => !allowedFields.has(field));
  if (unexpectedFields.length > 0) {
    return res.status(400).json({
      message: `Unsupported order field(s): ${unexpectedFields.join(', ')}.`,
    });
  }

  const { symbol, side, quantity, orderType } = body;

  if (typeof symbol !== 'string' || !symbol.trim()) {
    return res.status(400).json({ message: 'A stock symbol is required.' });
  }

  const normalizedSymbol = symbol.trim().toUpperCase();
  const executionPrice = marketData.get(normalizedSymbol);

  if (executionPrice === undefined) {
    return res.status(400).json({ message: 'The requested stock is not available for trading.' });
  }

  if (typeof side !== 'string' || !['BUY', 'SELL'].includes(side.trim().toUpperCase())) {
    return res.status(400).json({ message: 'Side must be BUY or SELL.' });
  }

  const normalizedSide = side.trim().toUpperCase();

  if (!Number.isInteger(quantity) || quantity <= 0) {
    return res.status(400).json({ message: 'Quantity must be a positive whole number.' });
  }

  if (typeof orderType !== 'string' || orderType.trim().toUpperCase() !== 'MARKET') {
    return res.status(400).json({ message: 'Only MARKET orders are supported.' });
  }

  const userId = req.user?.userId;
  if (!mongoose.isValidObjectId(userId)) {
    return res.status(401).json({ message: 'Not authorized, user identity is invalid.' });
  }

  const totalValue = Math.round((executionPrice * quantity + Number.EPSILON) * 100) / 100;
  let session;
  let trade;
  let updatedPortfolio;

  try {
    session = await mongoose.startSession();

    await session.withTransaction(async () => {
      let portfolio;

      if (normalizedSide === 'BUY') {
        portfolio = await Portfolio.findOneAndUpdate(
          { user: userId },
          {
            $setOnInsert: {
              user: userId,
              cashBalance: 100000,
              positions: [],
            },
          },
          {
            new: true,
            upsert: true,
            runValidators: true,
            session,
          }
        );

        if (portfolio.cashBalance < totalValue) {
          throw createOrderError(400, 'Insufficient cash balance for this order.');
        }

        const position = portfolio.positions.find((item) => item.symbol === normalizedSymbol);

        if (position) {
          const previousCost = position.quantity * position.averagePrice;
          const newQuantity = position.quantity + quantity;
          position.averagePrice = (previousCost + totalValue) / newQuantity;
          position.quantity = newQuantity;
        } else {
          portfolio.positions.push({
            symbol: normalizedSymbol,
            quantity,
            averagePrice: executionPrice,
          });
        }

        portfolio.cashBalance = Math.round(
          (portfolio.cashBalance - totalValue + Number.EPSILON) * 100
        ) / 100;
      } else {
        portfolio = await Portfolio.findOne({ user: userId }).session(session);

        if (!portfolio) {
          throw createOrderError(404, 'Portfolio not found. Place a BUY order first.');
        }

        const position = portfolio.positions.find((item) => item.symbol === normalizedSymbol);

        if (!position) {
          throw createOrderError(400, 'You do not own this stock.');
        }

        if (quantity > position.quantity) {
          throw createOrderError(400, 'Sell quantity exceeds the shares you own.');
        }

        position.quantity -= quantity;
        portfolio.cashBalance = Math.round(
          (portfolio.cashBalance + totalValue + Number.EPSILON) * 100
        ) / 100;

        if (position.quantity === 0) {
          portfolio.positions = portfolio.positions.filter(
            (item) => item.symbol !== normalizedSymbol
          );
        }
      }

      await portfolio.save({ session });

      [trade] = await Trade.create(
        [{
          user: userId,
          symbol: normalizedSymbol,
          side: normalizedSide,
          quantity,
          price: executionPrice,
          totalValue,
          orderType: 'MARKET',
        }],
        { session }
      );

      updatedPortfolio = portfolio;
    });

    return res.status(201).json({
      message: `${normalizedSide} order placed successfully.`,
      trade,
      portfolio: updatedPortfolio,
    });
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({ message: error.message });
    }

    console.error('Unable to place order:', error.message);
    return res.status(500).json({ message: 'Unable to place order.' });
  } finally {
    if (session) {
      await session.endSession();
    }
  }
};

module.exports = { placeOrder };
