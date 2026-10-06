const mongoose = require('mongoose');

const watchlistSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    symbols: {
      type: [
        {
          type: String,
          trim: true,
          uppercase: true,
        },
      ],
      default: [],
    },
  },
  { timestamps: true }
);

const Watchlist = mongoose.model('Watchlist', watchlistSchema);

module.exports = Watchlist;
