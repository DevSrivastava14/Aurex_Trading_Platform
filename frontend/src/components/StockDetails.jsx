function StockDetails({ stock }) {
    const positive = stock.change >= 0;
    const performanceClass = positive ? "positive-text" : "negative-text";
    const formatPrice = (value) => `$${value.toFixed(2)}`;
    const formatChange = (value) => `${value > 0 ? "+$" : "-$"}${Math.abs(value).toFixed(2)}`;
    const formatPercent = (value) => `${value > 0 ? "+" : ""}${value.toFixed(2)}%`;
    const metrics = [
        { label: "Previous close", value: formatPrice(stock.previousClose) },
        { label: "Day high", value: formatPrice(stock.dayHigh) },
        { label: "Day low", value: formatPrice(stock.dayLow) },
        { label: "Volume", value: stock.volume.toLocaleString("en-US") },
    ];

    return (
        <section className="panel stock-details-panel" aria-label={`${stock.symbol} stock details`}>
            <div className="panel-header">
                <div>
                    <h2>Stock Details</h2>
                    <p className="panel-subtitle">Current market snapshot</p>
                </div>
                <span className="table-caption">DETAILS</span>
            </div>

            <div className="stock-details-heading">
                <div>
                    <h3>{stock.companyName}</h3>
                    <span className="stock-details-symbol">{stock.symbol}</span>
                </div>
                <span className="market-status-badge">
                    <span className="status-dot" />
                    {stock.marketStatus}
                </span>
            </div>

            <div className="stock-details-price">
                <strong className="table-number">{formatPrice(stock.price)}</strong>
                <span className={`stock-performance ${performanceClass}`}>
                    {formatChange(stock.change)} ({formatPercent(stock.changePercent)})
                </span>
            </div>

            <div className="stock-metrics">
                {metrics.map((metric) => (
                    <div className="stock-metric-card" key={metric.label}>
                        <span>{metric.label}</span>
                        <strong className="table-number">{metric.value}</strong>
                    </div>
                ))}
            </div>
        </section>
    );
}

export default StockDetails;
