import { useState } from "react";
import {
    CartesianGrid,
    Line,
    LineChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from "recharts";

const ranges = ["1D", "1W", "1M"];
const rangeDescriptions = {
    "1D": "Intraday price movement",
    "1W": "Price movement over the past week",
    "1M": "Price movement over the past month",
};

function PriceChart({ stock }) {
    const [selectedRange, setSelectedRange] = useState("1D");
    const activeRange = stock.historicalData?.[selectedRange] ? selectedRange : "1D";
    const chartData = stock.historicalData?.[activeRange] ?? [];
    const lineColor = stock.change >= 0 ? "#5dc29a" : "#df7b7b";

    return (
        <section className="panel price-chart-panel" aria-label={`${stock.symbol} price chart`}>
            <div className="panel-header">
                <div>
                    <h2>{stock.symbol} Price Chart</h2>
                    <p className="panel-subtitle">{rangeDescriptions[activeRange]}</p>
                </div>
                <div className="chart-range-controls" role="group" aria-label="Chart time range">
                    {ranges.map((range) => (
                        <button
                            className={`chart-range-button${activeRange === range ? " active" : ""}`}
                            type="button"
                            key={range}
                            aria-pressed={activeRange === range}
                            onClick={() => setSelectedRange(range)}
                        >
                            {range}
                        </button>
                    ))}
                </div>
            </div>
            <div className="price-chart">
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
            </div>
        </section>
    );
}

export default PriceChart;
