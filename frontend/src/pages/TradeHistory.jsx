import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar.jsx";
import Sidebar from "../components/Sidebar.jsx";
import api from "../services/api.js";

const formatCurrency = (value) => `$${Number(value).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
})}`;

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

function TradeHistory() {
    const [trades, setTrades] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState("");
    const [loadAttempt, setLoadAttempt] = useState(0);

    useEffect(() => {
        let isCurrentRequest = true;
        const controller = new AbortController();

        const fetchTrades = async () => {
            setIsLoading(true);
            setErrorMessage("");

            try {
                const response = await api.get("/api/trades", { signal: controller.signal });
                if (!Array.isArray(response.data)) {
                    throw new Error("The trade history response was not in the expected format.");
                }
                if (isCurrentRequest) {
                    setTrades(response.data);
                }
            } catch (error) {
                if (isCurrentRequest && !isCanceledRequest(error)) {
                    setErrorMessage(
                        error.response?.data?.message
                            || "Unable to load trade history. Please try again."
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
                fetchTrades();
            }
        });

        return () => {
            isCurrentRequest = false;
            controller.abort();
        };
    }, [loadAttempt]);

    return (
        <div className="app-shell">
            <Sidebar />
            <main className="main-area">
                <Navbar />

                <div className="dashboard-content">
                    <section className="welcome-row">
                        <div>
                            <p className="eyebrow">ACCOUNT ACTIVITY</p>
                            <h1>Trade History</h1>
                            <p className="welcome-subtitle">Review your recent paper trades.</p>
                        </div>
                        <div className="market-pill">
                            <span className="status-dot" /> Market open <span className="market-time">· US Session</span>
                        </div>
                    </section>

                    <section className="panel" aria-label="Trade history">
                        <div className="panel-header">
                            <div>
                                <h2>Recent Trades</h2>
                                <p className="panel-subtitle">Your latest trading activity</p>
                            </div>
                            <span className="table-caption">
                                {isLoading ? "LOADING" : `${trades.length} TRADES`}
                            </span>
                        </div>

                        {isLoading ? (
                            <div className="async-state async-state-loading" role="status">
                                <p>Loading trade history...</p>
                            </div>
                        ) : errorMessage ? (
                            <div className="async-state async-state-error" role="alert">
                                <p>{errorMessage}</p>
                                <button
                                    className="trade-button async-state-action"
                                    type="button"
                                    onClick={() => setLoadAttempt((attempt) => attempt + 1)}
                                >
                                    Retry
                                </button>
                            </div>
                        ) : trades.length === 0 ? (
                            <div className="async-state async-state-empty">
                                <p>No trades yet. Place a paper trade to see your activity here.</p>
                                <Link className="trade-button async-state-action" to="/market">Explore Markets</Link>
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
                                    {trades.map((trade, index) => (
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

export default TradeHistory;
