const express = require('express');
const { getMarket, getMarketHistory } = require('../controllers/marketController');

const router = express.Router();

router.get('/', getMarket);
router.get('/:symbol/history', getMarketHistory);

module.exports = router;
