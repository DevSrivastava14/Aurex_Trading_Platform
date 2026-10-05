const stocks = [
  { symbol: 'AAPL', price: 228.45 },
  { symbol: 'MSFT', price: 512.68 },
  { symbol: 'GOOGL', price: 198.72 },
  { symbol: 'AMZN', price: 226.14 },
  { symbol: 'NVDA', price: 178.36 },
  { symbol: 'TSLA', price: 342.87 },
  { symbol: 'META', price: 731.52 },
  { symbol: 'NFLX', price: 124.63 },
];

const marketData = new Map(stocks.map((stock) => [stock.symbol, stock.price]));

module.exports = marketData;
