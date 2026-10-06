const express = require('express');
const { getTradeHistory } = require('../controllers/tradeController');
const authMiddleware = require('../middlewares/authMiddleware');

const router = express.Router();

router.get('/', authMiddleware, getTradeHistory);

module.exports = router;
