import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar.jsx";
import Sidebar from "../components/Sidebar.jsx";
import api from "../services/api.js";

const formatCurrency = (value) => `$${Number(value).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
})}`;

function Watchlist() {
    const [stocks, setStocks] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState("");
    const [removeErrorMessage, setRemoveErrorMessage] = useState("");
    const [removingSymbol, setRemovingSymbol] = useState("");

    useEffect(() => {
        const fetchWatchlist = async () => {
            try {
                const response = await api.get("/api/watchlist");
                if (!Array.isArray(response.data?.stocks)) {
                    throw new Error("The watchlist response was not in the expected format.");
                }
                setStocks(response.data.stocks);
            } catch (error) {
                setErrorMessage(
                    error.response?.data?.message
                        || "Unable to load your watchlist. Please try again."
                );
            } finally {
                setIsLoading(false);
            }
        };

        fetchWatchlist();
    }, []);

    const handleRemove = async (symbol) => {
        setRemovingSymbol(symbol);
        setRemoveErrorMessage("");

        try {
            await api.delete(`/api/watchlist/${encodeURIComponent(symbol)}`);
            setStocks((currentStocks) => currentStocks.filter((stock) => stock.symbol !== symbol));
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

                        {isLoading ? (
                            <p className="panel-subtitle" role="status">Loading your watchlist...</p>
                        ) : errorMessage ? (
                            <p className="login-error" role="alert">{errorMessage}</p>
                        ) : stocks.length === 0 ? (
                            <div>
                                <p className="panel-subtitle">Your watchlist is empty. Find stocks to follow in the market.</p>
                                <Link className="trade-button" to="/market">Explore Markets</Link>
                            </div>
                        ) : (
                            <>
                                {removeErrorMessage && (
                                    <p className="login-error" role="alert">{removeErrorMessage}</p>
                                )}
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
                                                            className="trade-button"
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
                            </>
                        )}
                    </section>
                </div>
            </main>
        </div>
    );
}

export default Watchlist;
