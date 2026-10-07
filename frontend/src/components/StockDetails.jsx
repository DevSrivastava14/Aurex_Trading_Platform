function StockDetails({
    stock,
    isInWatchlist,
    isWatchlistLoading,
    isWatchlistUpdating,
    watchlistError,
    watchlistSuccess,
    onWatchlistToggle,
}) {
    const positive = Number.isFinite(stock.change) && stock.change >= 0;
    const performanceClass = positive ? "positive-text" : "negative-text";
    const formatPrice = (value) => Number.isFinite(value) ? `$${value.toFixed(2)}` : "—";
    const formatChange = (value) => Number.isFinite(value)
        ? `${value > 0 ? "+$" : "-$"}${Math.abs(value).toFixed(2)}`
        : "—";
    const formatPercent = (value) => Number.isFinite(value)
        ? `${value > 0 ? "+" : ""}${value.toFixed(2)}%`
        : "—";
    const metrics = [
        { label: "Previous close", value: formatPrice(stock.previousClose) },
        { label: "Day high", value: formatPrice(stock.dayHigh) },
        { label: "Day low", value: formatPrice(stock.dayLow) },
        { label: "Volume", value: Number.isFinite(stock.volume) ? stock.volume.toLocaleString("en-US") : "—" },
    ];

    return (
        <section className="panel stock-details-panel" aria-label={`${stock.symbol} stock details`}>
            <div className="panel-header">
                <div>
                    <h2>Stock Details</h2>
                    <p className="panel-subtitle">
                        {stock.timestamp ? `Quote updated: ${stock.timestamp}` : "Current market snapshot"}
                    </p>
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
                    {stock.marketStatus || "Status unavailable"}
                </span>
            </div>

            <div className="stock-details-price">
                <strong className="table-number">{formatPrice(stock.price)}</strong>
                <span className={`stock-performance${Number.isFinite(stock.change) ? ` ${performanceClass}` : ""}`}>
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

            <div className="stock-details-actions">
                <div className="stock-actions-row">
                    <button
                        className={`trade-button stock-watchlist-button${isInWatchlist ? " in-watchlist" : ""}`}
                        type="button"
                        onClick={onWatchlistToggle}
                        disabled={isWatchlistLoading || isWatchlistUpdating}
                    >
                        {isWatchlistLoading
                            ? "Checking Watchlist..."
                            : isWatchlistUpdating
                                ? (isInWatchlist ? "Removing..." : "Adding...")
                                : isInWatchlist
                                    ? "✓ Remove from Watchlist"
                                    : "+ Add to Watchlist"}
                    </button>
                    {isInWatchlist && (
                        <span className="watchlist-status-badge" role="status">
                            ★ In Watchlist
                        </span>
                    )}
                </div>
                {watchlistError && <p className="order-feedback order-feedback-error" role="alert">{watchlistError}</p>}
                {watchlistSuccess && (
                    <p className="order-feedback order-feedback-success" role="status">
                        {watchlistSuccess}
                    </p>
                )}
            </div>
        </section>
    );
}

export default StockDetails;
