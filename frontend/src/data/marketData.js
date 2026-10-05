const rangeLabels = {
    "1D": [
        "09:30", "10:00", "10:30", "11:00", "11:30", "12:00", "12:30", "13:00",
        "13:30", "14:00", "14:30", "15:00", "15:15", "15:30", "15:45", "16:00",
    ],
    "1W": ["Mon", "Tue", "Wed", "Thu", "Fri", "Mon", "Tue", "Today"],
    "1M": [
        "Sep 1", "Sep 3", "Sep 5", "Sep 8", "Sep 10", "Sep 12", "Sep 15", "Sep 17",
        "Sep 19", "Sep 22", "Sep 24", "Sep 26", "Sep 29", "Oct 1", "Oct 2", "Oct 3",
        "Oct 4", "Today",
    ],
};

const dailyNoise = [0, 0.12, -0.08, 0.18, -0.04, 0.1, -0.12, 0.16, -0.06, 0.09, -0.1, 0.13, -0.04, 0.1, -0.08, 0];
const weeklyShape = [-1.25, -0.8, -1.05, -0.35, 0.2, -0.3, 0.12, 0];
const monthlyShape = [-2.2, -1.4, -1.8, -0.9, -1.15, -0.35, 0.25, -0.4, 0.3, 0.8, 0.25, 1.1, 0.55, 1.4, 0.8, 1.15, 0.45, 0];

const createHistoricalData = (price, changePercent) => {
    const volatility = 0.55 + Math.abs(changePercent) * 0.18;
    const direction = changePercent >= 0 ? 1 : -1;
    const dailyData = dailyNoise.map((noise, index) => {
        const progress = index / (dailyNoise.length - 1);
        const offset = -changePercent * (1 - progress) + noise * volatility;
        return {
            time: rangeLabels["1D"][index],
            price: Number((price * (1 + offset / 100)).toFixed(2)),
        };
    });
    const toSeries = (labels, offsets) => labels.map((time, index) => ({
        time,
        price: Number((price * (1 + (offsets[index] * direction * volatility) / 100)).toFixed(2)),
    }));

    return {
        "1D": dailyData,
        "1W": toSeries(rangeLabels["1W"], weeklyShape),
        "1M": toSeries(rangeLabels["1M"], monthlyShape),
    };
};

export const stocks = [
    { symbol: "AAPL", companyName: "Apple Inc.", price: 228.45, change: 2.31, changePercent: 1.02, previousClose: 226.14, dayHigh: 229.12, dayLow: 225.86, volume: 42836120, marketStatus: "Open", historicalData: createHistoricalData(228.45, 1.02) },
    { symbol: "MSFT", companyName: "Microsoft Corporation", price: 512.68, change: -1.84, changePercent: -0.36, previousClose: 514.52, dayHigh: 516.24, dayLow: 510.73, volume: 18254730, marketStatus: "Open", historicalData: createHistoricalData(512.68, -0.36) },
    { symbol: "GOOGL", companyName: "Alphabet Inc.", price: 198.72, change: 1.56, changePercent: 0.79, previousClose: 197.16, dayHigh: 199.48, dayLow: 196.82, volume: 16428350, marketStatus: "Open", historicalData: createHistoricalData(198.72, 0.79) },
    { symbol: "AMZN", companyName: "Amazon.com, Inc.", price: 226.14, change: -2.08, changePercent: -0.91, previousClose: 228.22, dayHigh: 229.05, dayLow: 225.48, volume: 29471640, marketStatus: "Open", historicalData: createHistoricalData(226.14, -0.91) },
    { symbol: "NVDA", companyName: "NVIDIA Corporation", price: 178.36, change: 4.27, changePercent: 2.45, previousClose: 174.09, dayHigh: 179.62, dayLow: 173.84, volume: 98762410, marketStatus: "Open", historicalData: createHistoricalData(178.36, 2.45) },
    { symbol: "TSLA", companyName: "Tesla, Inc.", price: 342.87, change: -6.42, changePercent: -1.84, previousClose: 349.29, dayHigh: 351.74, dayLow: 340.18, volume: 76218450, marketStatus: "Open", historicalData: createHistoricalData(342.87, -1.84) },
    { symbol: "META", companyName: "Meta Platforms, Inc.", price: 731.52, change: 3.88, changePercent: 0.53, previousClose: 727.64, dayHigh: 734.86, dayLow: 726.91, volume: 8236740, marketStatus: "Open", historicalData: createHistoricalData(731.52, 0.53) },
    { symbol: "NFLX", companyName: "Netflix, Inc.", price: 124.63, change: 0.94, changePercent: 0.76, previousClose: 123.69, dayHigh: 125.11, dayLow: 123.28, volume: 5381920, marketStatus: "Open", historicalData: createHistoricalData(124.63, 0.76) },
];
