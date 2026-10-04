export const portfolioMetrics = [
    { label: "Available Balance", value: "₹1,00,000", note: "Paper trading funds" },
    { label: "Invested", value: "₹25,000", note: "Across 4 holdings" },
    { label: "Current Value", value: "₹27,450", note: "Portfolio market value" },
    { label: "Total P&L", value: "+₹2,450", change: "+9.80%", note: "Unrealized return", positive: true },
];

export const marketWatch = [
    { symbol: "RELIANCE", price: "₹2,941.80", priceValue: 2941.8, change: "+36.10", changePercent: "+1.24%", positive: true },
    { symbol: "TCS", price: "₹3,842.50", priceValue: 3842.5, change: "+32.80", changePercent: "+0.86%", positive: true },
    { symbol: "INFY", price: "₹1,478.25", priceValue: 1478.25, change: "-4.75", changePercent: "-0.32%", positive: false },
    { symbol: "HDFCBANK", price: "₹1,664.90", priceValue: 1664.9, change: "+8.95", changePercent: "+0.54%", positive: true },
    { symbol: "ICICIBANK", price: "₹1,287.40", priceValue: 1287.4, change: "-3.20", changePercent: "-0.25%", positive: false },
];

export const holdings = [
    { symbol: "RELIANCE", quantity: "10", averagePrice: "₹2,810.00", lastPrice: "₹2,941.80", pnl: "+₹1,318.00", positive: true },
    { symbol: "TCS", quantity: "4", averagePrice: "₹3,720.00", lastPrice: "₹3,842.50", pnl: "+₹490.00", positive: true },
    { symbol: "INFY", quantity: "8", averagePrice: "₹1,490.00", lastPrice: "₹1,478.25", pnl: "-₹94.00", positive: false },
    { symbol: "HDFCBANK", quantity: "6", averagePrice: "₹1,628.00", lastPrice: "₹1,664.90", pnl: "+₹221.40", positive: true },
];
