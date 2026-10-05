const mongoose = require('mongoose');

const tradeSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    symbol: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
    },
    side: {
      type: String,
      required: true,
      enum: ['BUY', 'SELL'],
    },
    quantity: {
      type: Number,
      required: true,
      min: 0,
      validate: {
        validator: (value) => value > 0,
        message: 'Quantity must be greater than 0.',
      },
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    totalValue: {
      type: Number,
      required: true,
      min: 0,
    },
    orderType: {
      type: String,
      required: true,
      enum: ['MARKET'],
      default: 'MARKET',
    },
  },
  { timestamps: true }
);

const Trade = mongoose.model('Trade', tradeSchema);

module.exports = Trade;
