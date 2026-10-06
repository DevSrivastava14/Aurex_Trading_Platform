const express = require('express');
const { getPortfolio } = require('../controllers/portfolioController');
const authMiddleware = require('../middlewares/authMiddleware');

const router = express.Router();

router.get('/', authMiddleware, getPortfolio);

module.exports = router;
