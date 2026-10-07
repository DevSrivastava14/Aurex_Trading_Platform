import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Sidebar from "../components/Sidebar.jsx";
import Navbar from "../components/Navbar.jsx";
import api from "../services/api.js";

const formatCurrency = (value) => `$${Number(value || 0).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
})}`;

const formatSignedCurrency = (value) => {
    const numericValue = Number(value || 0);
    const prefix = numericValue >= 0 ? "+" : "-";
    return `${prefix}${formatCurrency(Math.abs(numericValue))}`;
};

const formatPercent = (value) => {
    const numericValue = Number(value || 0);
    return `${numericValue >= 0 ? "+" : ""}${numericValue.toFixed(1)}%`;
};

const formatDate = (value) => {
    const date = new Date(value);
    return Number.isNaN(date.getTime())
        ? "Date unavailable"
        : date.toLocaleString("en-US", {
            month: "short",
            day: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
};

const isCanceledRequest = (error) => (
    error?.code === "ERR_CANCELED"
    || error?.name === "CanceledError"
    || error?.name === "AbortError"
);

function Portfolio() {
    const [portfolio, setPortfolio] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState("");
    const [portfolioLoadAttempt, setPortfolioLoadAttempt] = useState(0);
    const [recentTrades, setRecentTrades] = useState([]);
    const [areTradesLoading, setAreTradesLoading] = useState(true);
    const [tradesErrorMessage, setTradesErrorMessage] = useState("");
    const [tradesLoadAttempt, setTradesLoadAttempt] = useState(0);

    useEffect(() => {
        let isCurrentRequest = true;
        const controller = new AbortController();

        const fetchPortfolio = async () => {
            setIsLoading(true);
            setErrorMessage("");

            try {
                const response = await api.get("/api/portfolio", { signal: controller.signal });
                if (isCurrentRequest) {
                    setPortfolio(response.data || null);
                }
            } catch (error) {
                if (isCurrentRequest && !isCanceledRequest(error)) {
                    setErrorMessage(
                        error.response?.data?.message
                            || error.message
                            || "Unable to load portfolio data."
                    );
                }
            } finally {
                if (isCurrentRequest) {
                    setIsLoading(false);
                }
            }
        };

        Promise.resolve().then(() => {
            if (isCurrentRequest) {
                fetchPortfolio();
            }
        });

        return () => {
            isCurrentRequest = false;
            controller.abort();
        };
    }, [portfolioLoadAttempt]);

    useEffect(() => {
        let isCurrentRequest = true;
        const controller = new AbortController();

        const fetchRecentTrades = async () => {
            setAreTradesLoading(true);
            setTradesErrorMessage("");

            try {
                const response = await api.get("/api/trades", { signal: controller.signal });
                if (!Array.isArray(response.data)) {
                    throw new Error("The trade history response was not in the expected format.");
                }

                const latestTrades = [...response.data]
                    .sort((first, second) => new Date(second.createdAt) - new Date(first.createdAt))
                    .slice(0, 5);
                if (isCurrentRequest) {
                    setRecentTrades(latestTrades);
                }
            } catch (error) {
                if (isCurrentRequest && !isCanceledRequest(error)) {
                    setTradesErrorMessage(
                        error.response?.data?.message
                            || "Unable to load recent trades. Please try again."
                    );
                }
            } finally {
                if (isCurrentRequest) {
                    setAreTradesLoading(false);
                }
            }
        };

        Promise.resolve().then(() => {
            if (isCurrentRequest) {
                fetchRecentTrades();
            }
        });

        return () => {
            isCurrentRequest = false;
            controller.abort();
        };
    }, [tradesLoadAttempt]);

    const summaryCards = [
        {
            label: "Cash Balance",
            value: formatCurrency(portfolio?.cashBalance ?? 0),
            note: "Available buying power",
        },
        {
            label: "Invested Value",
            value: formatCurrency(portfolio?.totalInvestedValue ?? 0),
            note: "Total cost basis",
        },
        {
            label: "Current Value",
            value: formatCurrency(portfolio?.totalCurrentValue ?? 0),
            note: "Based on current market prices",
        },
        {
            label: "Unrealized P&L",
            value: formatSignedCurrency(portfolio?.totalUnrealizedPnl ?? 0),
            positive: Number(portfolio?.totalUnrealizedPnl ?? 0) >= 0,
            note: portfolio?.totalInvestedValue
                ? `${formatPercent((Number(portfolio.totalUnrealizedPnl || 0) / Number(portfolio.totalInvestedValue || 1)) * 100)} vs. invested`
                : "No invested value",
        },
    ];

    const holdings = (portfolio?.positions || []).map((position) => {
        const investedValue = Number(position.investedValue || 0);
        const currentValue = Number(position.currentValue || 0);
        const unrealizedPnl = Number(position.unrealizedPnl || 0);

        return {
            symbol: position.symbol,
            quantity: position.quantity,
            avgPrice: formatCurrency(position.averagePrice),
            marketPrice: formatCurrency(position.currentValue ? position.currentValue / (position.quantity || 1) : 0),
            value: formatCurrency(currentValue),
            pnl: formatSignedCurrency(unrealizedPnl),
            positive: unrealizedPnl >= 0,
            investedValue,
            currentValue,
            unrealizedPnl,
        };
    });

    return (
        <div className="app-shell">
            <Sidebar />
            <main className="main-area">
                <Navbar />

                <div className="dashboard-content">
                    <section className="welcome-row">
                        <div>
                            <p className="eyebrow">PORTFOLIO</p>
                            <h1>Portfolio</h1>
                            <p className="welcome-subtitle">Track your paper-trading performance and holdings.</p>
                        </div>
                        <div className="market-pill">
                            <span className="status-dot" /> Market open <span className="market-time">· US Session</span>
                        </div>
                    </section>

                    {isLoading && (
                        <div className="async-state async-state-loading" role="status">
                            <p>Loading your portfolio...</p>
                        </div>
                    )}

                    {!isLoading && errorMessage && (
                        <div className="async-state async-state-error" role="alert">
                            <p>{errorMessage}</p>
                            <button
                                className="trade-button async-state-action"
                                type="button"
                                onClick={() => setPortfolioLoadAttempt((attempt) => attempt + 1)}
                            >
                                Retry
                            </button>
                        </div>
                    )}

                    {!isLoading && !errorMessage && (
                        <>
                            <section className="overview-grid" aria-label="Portfolio summary cards">
                                {summaryCards.map((card) => (
                                    <article className="metric-card" key={card.label}>
                                        <div className="metric-label">{card.label}</div>
                                        <div className={`metric-value${card.positive ? " positive-text" : ""}`}>{card.value}</div>
                                        <div className="metric-detail">
                                            {card.note && (
                                                <span className={card.positive ? "positive-text" : ""}>{card.note}</span>
                                            )}
                                        </div>
                                    </article>
                                ))}
                            </section>

                            <section className="panel holdings-panel" aria-label="Holdings section">
                                <div className="panel-header">
                                    <div>
                                        <h2>Holdings</h2>
                                        <p className="panel-subtitle">Your current positions</p>
                                    </div>
                                    <span className="table-caption">{holdings.length} POSITIONS</span>
                                </div>

                                {holdings.length === 0 ? (
                                    <div className="async-state async-state-empty">
                                        <p>You do not have any holdings yet. Place a paper trade to start building your portfolio.</p>
                                        <Link className="trade-button async-state-action" to="/market">Explore Markets</Link>
                                    </div>
                                ) : (
                                    <>
                                        <div className="table-scroll">
                                            <table className="data-table">
                                                <thead>
                                                    <tr>
                                                        <th>Symbol</th>
                                                        <th>Qty</th>
                                                        <th>Avg. Price</th>
                                                        <th>Market</th>
                                                        <th>Value</th>
                                                        <th>P&amp;L</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {holdings.map((holding, index) => (
                                                        <tr key={holding.symbol}>
                                                            <td>
                                                                <span className={`symbol-mark symbol-mark-${index}`}>{holding.symbol.slice(0, 1)}</span>
                                                                <strong>{holding.symbol}</strong>
                                                            </td>
                                                            <td className="table-number">{holding.quantity}</td>
                                                            <td className="table-number">{holding.avgPrice}</td>
                                                            <td className="table-number">{holding.marketPrice}</td>
                                                            <td className="table-number">{holding.value}</td>
                                                            <td>
                                                                <span className={holding.positive ? "positive-text table-number" : "negative-text table-number"}>{holding.pnl}</span>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>

                                        <div className="holdings-mobile">
                                            {holdings.map((holding, index) => (
                                                <article className="holding-mobile-card" key={holding.symbol}>
                                                    <div className="holding-mobile-heading">
                                                        <div className="holding-company">
                                                            <span className={`symbol-mark symbol-mark-${index}`}>{holding.symbol.slice(0, 1)}</span>
                                                            <strong>{holding.symbol}</strong>
                                                        </div>
                                                        <span className={holding.positive ? "positive-text table-number" : "negative-text table-number"}>{holding.pnl}</span>
                                                    </div>
                                                    <div className="holding-mobile-values">
                                                        <span><small>Quantity</small>{holding.quantity} shares</span>
                                                        <span><small>Avg. price</small>{holding.avgPrice}</span>
                                                        <span><small>Market</small>{holding.marketPrice}</span>
                                                        <span><small>Value</small>{holding.value}</span>
                                                    </div>
                                                </article>
                                            ))}
                                        </div>
                                    </>
                                )}
                            </section>
                        </>
                    )}

                    <section className="panel" aria-label="Recent trades">
                        <div className="panel-header">
                            <div>
                                <h2>Recent Trades</h2>
                                <p className="panel-subtitle">Your latest trading activity</p>
                            </div>
                            <Link className="table-caption" to="/trades">View All</Link>
                        </div>

                        {areTradesLoading ? (
                            <div className="async-state async-state-loading" role="status">
                                <p>Loading recent trades...</p>
                            </div>
                        ) : tradesErrorMessage ? (
                            <div className="async-state async-state-error" role="alert">
                                <p>{tradesErrorMessage}</p>
                                <button
                                    className="trade-button async-state-action"
                                    type="button"
                                    onClick={() => setTradesLoadAttempt((attempt) => attempt + 1)}
                                >
                                    Retry
                                </button>
                            </div>
                        ) : recentTrades.length === 0 ? (
                            <div className="async-state async-state-empty">
                                <p>No trades yet. Your completed paper trades will appear here.</p>
                            </div>
                        ) : (
                            <div className="table-scroll">
                                <table className="data-table">
                                    <thead>
                                        <tr>
                                            <th>Date</th>
                                            <th>Symbol</th>
                                            <th>Side</th>
                                            <th>Quantity</th>
                                            <th>Price</th>
                                            <th>Total Value</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {recentTrades.map((trade, index) => (
                                            <tr key={trade._id || `${trade.symbol}-${trade.createdAt}-${index}`}>
                                                <td>{formatDate(trade.createdAt)}</td>
                                                <td>
                                                    <span className={`symbol-mark symbol-mark-${index}`}>{trade.symbol.slice(0, 1)}</span>
                                                    <strong>{trade.symbol}</strong>
                                                </td>
                                                <td>
                                                    <span className={trade.side === "BUY" ? "positive-text" : "negative-text"}>
                                                        {trade.side}
                                                    </span>
                                                </td>
                                                <td>{Number(trade.quantity).toLocaleString("en-US")}</td>
                                                <td>{formatCurrency(trade.price)}</td>
                                                <td>{formatCurrency(trade.totalValue)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </section>
                </div>
            </main>
        </div>
    );
}

export default Portfolio;
