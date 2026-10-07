import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar.jsx";
import Sidebar from "../components/Sidebar.jsx";
import api from "../services/api.js";

const formatCurrency = (value) => `$${Number(value).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
})}`;

const isCanceledRequest = (error) => (
    error?.code === "ERR_CANCELED"
    || error?.name === "CanceledError"
    || error?.name === "AbortError"
);

function Watchlist() {
    const [stocks, setStocks] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState("");
    const [loadAttempt, setLoadAttempt] = useState(0);
    const [removeErrorMessage, setRemoveErrorMessage] = useState("");
    const [removeSuccessMessage, setRemoveSuccessMessage] = useState("");
    const [removingSymbol, setRemovingSymbol] = useState("");

    useEffect(() => {
        let isCurrentRequest = true;
        const controller = new AbortController();

        const fetchWatchlist = async () => {
            setIsLoading(true);
            setErrorMessage("");

            try {
                const response = await api.get("/api/watchlist", { signal: controller.signal });
                if (!Array.isArray(response.data?.stocks)) {
                    throw new Error("The watchlist response was not in the expected format.");
                }
                if (isCurrentRequest) {
                    setStocks(response.data.stocks);
                }
            } catch (error) {
                if (isCurrentRequest && !isCanceledRequest(error)) {
                    setErrorMessage(
                        error.response?.data?.message
                            || "Unable to load your watchlist. Please try again."
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
                fetchWatchlist();
            }
        });

        return () => {
            isCurrentRequest = false;
            controller.abort();
        };
    }, [loadAttempt]);

    const handleRemove = async (symbol) => {
        setRemovingSymbol(symbol);
        setRemoveErrorMessage("");
        setRemoveSuccessMessage("");

        try {
            await api.delete(`/api/watchlist/${encodeURIComponent(symbol)}`);
            setStocks((currentStocks) => currentStocks.filter((stock) => stock.symbol !== symbol));
            setRemoveSuccessMessage(`${symbol} was removed from your watchlist.`);
        } catch (error) {
            setRemoveErrorMessage(
                error.response?.data?.message
                    || `Unable to remove ${symbol} from your watchlist. Please try again.`
            );
        } finally {
            setRemovingSymbol("");
        }
    };

    return (
        <div className="app-shell">
            <Sidebar />
            <main className="main-area">
                <Navbar />
                <div className="dashboard-content">
                    <section className="welcome-row">
                        <div>
                            <p className="eyebrow">PAPER TRADING · US MARKETS</p>
                            <h1>Watchlist</h1>
                            <p className="welcome-subtitle">Keep track of stocks you want to follow.</p>
                        </div>
                    </section>

                    <section className="panel" aria-label="Your watchlist">
                        <div className="panel-header">
                            <div>
                                <h2>My Watchlist</h2>
                                <p className="panel-subtitle">Your saved stocks and current prices</p>
                            </div>
                            <span className="table-caption">
                                {isLoading ? "LOADING" : `${stocks.length} ${stocks.length === 1 ? "STOCK" : "STOCKS"}`}
                            </span>
                        </div>

                        {removeErrorMessage && (
                            <p className="order-feedback order-feedback-error" role="alert">
                                {removeErrorMessage}
                            </p>
                        )}
                        {removeSuccessMessage && (
                            <p className="order-feedback order-feedback-success" role="status">
                                {removeSuccessMessage}
                            </p>
                        )}

                        {isLoading ? (
                            <div className="async-state async-state-loading" role="status">
                                <p>Loading your watchlist...</p>
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
                        ) : stocks.length === 0 ? (
                            <div className="async-state async-state-empty">
                                <p>Your watchlist is empty. Browse the market and add stocks to keep their prices close at hand.</p>
                                <Link className="trade-button async-state-action" to="/market">Explore Markets</Link>
                            </div>
                        ) : (
                            <div className="table-scroll">
                                <table className="data-table">
                                    <thead>
                                        <tr>
                                            <th>Symbol</th>
                                            <th>Current Price</th>
                                            <th aria-label="Actions" />
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {stocks.map((stock, index) => (
                                            <tr key={stock.symbol}>
                                                <td>
                                                    <span className={`symbol-mark symbol-mark-${index}`}>{stock.symbol.slice(0, 1)}</span>
                                                    <strong>{stock.symbol}</strong>
                                                </td>
                                                <td>
                                                    {typeof stock.price === "number"
                                                        ? formatCurrency(stock.price)
                                                        : "Price unavailable"}
                                                </td>
                                                <td>
                                                    <button
                                                        className="trade-button table-action-button"
                                                        type="button"
                                                        onClick={() => handleRemove(stock.symbol)}
                                                        disabled={removingSymbol === stock.symbol}
                                                        aria-label={`Remove ${stock.symbol} from watchlist`}
                                                    >
                                                        {removingSymbol === stock.symbol ? "Removing..." : "Remove"}
                                                    </button>
                                                </td>
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

export default Watchlist;
