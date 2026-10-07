import { useEffect, useState } from "react";
import {
    CartesianGrid,
    Line,
    LineChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from "recharts";
import api from "../services/api.js";

const ranges = ["1D", "1W", "1M"];
const rangeDescriptions = {
    "1D": "Intraday price movement",
    "1W": "Price movement over the past week",
    "1M": "Price movement over the past month",
};

function PriceChart({ stock }) {
    const [selectedRange, setSelectedRange] = useState("1D");
    const [chartData, setChartData] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState("");
    const [loadAttempt, setLoadAttempt] = useState(0);
    const lineColor = stock.change >= 0 ? "#5dc29a" : "#df7b7b";

    useEffect(() => {
        let isCurrentRequest = true;

        const fetchHistory = async () => {
            setIsLoading(true);
            setErrorMessage("");
            setChartData([]);

            try {
                const response = await api.get(
                    `/api/market/${encodeURIComponent(stock.symbol)}/history`,
                    { params: { range: selectedRange } }
                );
                const history = response.data;
                if (
                    history?.symbol !== stock.symbol
                    || history?.range !== selectedRange
                    || !Array.isArray(history.data)
                    || history.data.length === 0
                    || history.data.some((point) => (
                        typeof point.timestamp !== "string"
                        || !Number.isFinite(point.price)
                    ))
                ) {
                    throw new Error("The historical market data response was empty or malformed.");
                }

                if (isCurrentRequest) {
                    setChartData(history.data.map((point) => ({
                        time: selectedRange === "1D"
                            ? point.timestamp.split(" ")[1]?.slice(0, 5) || point.timestamp
                            : point.timestamp.split(" ")[0],
                        price: point.price,
                    })));
                }
            } catch (error) {
                if (isCurrentRequest) {
                    setErrorMessage(
                        error.response?.status === 429
                            ? "Market data rate limit reached. Please wait before retrying."
                            : error.response?.data?.message
                                || (error.response
                                    ? "Unable to load historical market data. Please try again."
                                    : "Unable to connect to historical market data. Check that the backend is running and try again.")
                    );
                }
            } finally {
                if (isCurrentRequest) {
                    setIsLoading(false);
                }
            }
        };

        fetchHistory();
        return () => {
            isCurrentRequest = false;
        };
    }, [stock.symbol, selectedRange, loadAttempt]);

    return (
        <section className="panel price-chart-panel" aria-label={`${stock.symbol} price chart`}>
            <div className="panel-header">
                <div>
                    <h2>{stock.symbol} Price Chart</h2>
                    <p className="panel-subtitle">{rangeDescriptions[selectedRange]}</p>
                </div>
                <div className="chart-range-controls" role="group" aria-label="Chart time range">
                    {ranges.map((range) => (
                        <button
                            className={`chart-range-button${selectedRange === range ? " active" : ""}`}
                            type="button"
                            key={range}
                            aria-pressed={selectedRange === range}
                            onClick={() => setSelectedRange(range)}
                        >
                            {range}
                        </button>
                    ))}
                </div>
            </div>
            <div className="price-chart">
                {isLoading ? (
                    <p className="stock-empty-state" role="status">Loading historical prices...</p>
                ) : errorMessage ? (
                    <div>
                        <p className="login-error" role="alert">{errorMessage}</p>
                        <button
                            className="trade-button"
                            type="button"
                            onClick={() => setLoadAttempt((attempt) => attempt + 1)}
                        >
                            Retry
                        </button>
                    </div>
                ) : chartData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={chartData} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
                            <CartesianGrid stroke="#2a2e32" strokeDasharray="3 3" vertical={false} />
                            <XAxis
                                dataKey="time"
                                tick={{ fill: "#7e878c", fontSize: 9 }}
                                tickLine={false}
                                axisLine={{ stroke: "#353a3d" }}
                                minTickGap={24}
                            />
                            <YAxis
                                domain={["dataMin", "dataMax"]}
                                tickFormatter={(value) => `$${value.toFixed(0)}`}
                                tick={{ fill: "#7e878c", fontSize: 9 }}
                                tickLine={false}
                                axisLine={false}
                                width={45}
                            />
                            <Tooltip
                                contentStyle={{
                                    border: "1px solid #353a3d",
                                    borderRadius: "4px",
                                    color: "#e5e7eb",
                                    backgroundColor: "#191c1f",
                                    fontSize: "11px",
                                }}
                                labelStyle={{ color: "#92999f", marginBottom: "4px" }}
                                formatter={(value) => [`$${Number(value).toFixed(2)}`, "Price"]}
                            />
                            <Line
                                type="monotone"
                                dataKey="price"
                                stroke={lineColor}
                                strokeWidth={2}
                                dot={false}
                                activeDot={{ r: 4, fill: lineColor, stroke: "#191c1f", strokeWidth: 2 }}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                ) : (
                    <p className="stock-empty-state" role="status">
                        No historical prices are available for this range.
                    </p>
                )}
            </div>
        </section>
    );
}

export default PriceChart;
