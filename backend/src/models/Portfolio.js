const mongoose = require('mongoose');

const positionSchema = new mongoose.Schema(
  {
    symbol: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 0,
    },
    averagePrice: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  { _id: false }
);

const portfolioSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    cashBalance: {
      type: Number,
      required: true,
      default: 100000,
      min: 0,
    },
    positions: {
      type: [positionSchema],
      default: [],
    },
  },
  { timestamps: true }
);

const Portfolio = mongoose.model('Portfolio', portfolioSchema);

module.exports = Portfolio;
