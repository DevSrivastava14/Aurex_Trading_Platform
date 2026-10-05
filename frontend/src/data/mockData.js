export const portfolioMetrics = [
    { label: "Available Balance", value: "$100,000", note: "Paper trading funds" },
    { label: "Invested", value: "$25,000", note: "Across 4 holdings" },
    { label: "Current Value", value: "$27,450", note: "Portfolio market value" },
    { label: "Total P&L", value: "+$2,450", change: "+9.80%", note: "Unrealized return", positive: true },
];

export const marketWatch = [
    { symbol: "AAPL", price: "$228.45", priceValue: 228.45, change: "+$2.84", changePercent: "+1.24%", positive: true },
    { symbol: "MSFT", price: "$512.68", priceValue: 512.68, change: "+$4.41", changePercent: "+0.86%", positive: true },
    { symbol: "GOOGL", price: "$198.72", priceValue: 198.72, change: "-$0.64", changePercent: "-0.32%", positive: false },
    { symbol: "AMZN", price: "$226.14", priceValue: 226.14, change: "+$1.22", changePercent: "+0.54%", positive: true },
    { symbol: "NVDA", price: "$178.36", priceValue: 178.36, change: "-$0.45", changePercent: "-0.25%", positive: false },
];

export const holdings = [
    { symbol: "AAPL", quantity: "10", averagePrice: "$220.00", lastPrice: "$228.45", pnl: "+$84.50", positive: true },
    { symbol: "MSFT", quantity: "4", averagePrice: "$515.00", lastPrice: "$512.68", pnl: "-$9.28", positive: false },
    { symbol: "GOOGL", quantity: "8", averagePrice: "$195.00", lastPrice: "$198.72", pnl: "+$29.76", positive: true },
    { symbol: "AMZN", quantity: "6", averagePrice: "$230.00", lastPrice: "$226.14", pnl: "-$23.16", positive: false },
];
