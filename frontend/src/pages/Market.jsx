import { useEffect, useState } from "react";
import Navbar from "../components/Navbar.jsx";
import OrderPanel from "../components/OrderPanel.jsx";
import PriceChart from "../components/PriceChart.jsx";
import Sidebar from "../components/Sidebar.jsx";
import StockDetails from "../components/StockDetails.jsx";
import api from "../services/api.js";

const supportedSymbols = new Set(["AAPL", "MSFT", "GOOGL", "AMZN", "TSLA", "NVDA", "META", "NFLX"]);
const isCanceledRequest = (error) => (
    error?.code === "ERR_CANCELED"
    || error?.name === "CanceledError"
    || error?.name === "AbortError"
);
const formatPrice = (value) => Number.isFinite(value) ? `$${value.toFixed(2)}` : "—";
const formatChange = (value) => Number.isFinite(value)
    ? `${value > 0 ? "+$" : "-$"}${Math.abs(value).toFixed(2)}`
    : "—";
const formatChangePercent = (value) => Number.isFinite(value)
    ? `${value > 0 ? "+" : ""}${value.toFixed(2)}%`
    : "—";

const isValidMarketResponse = (stocks) => (
    Array.isArray(stocks)
    && stocks.length === supportedSymbols.size
    && new Set(stocks.map((stock) => stock?.symbol)).size === supportedSymbols.size
    && stocks.every((stock) => (
        supportedSymbols.has(stock?.symbol)
        && typeof stock.companyName === "string"
        && stock.companyName.trim().length > 0
        && Number.isFinite(stock.price)
        && stock.price > 0
        && (stock.change === null || Number.isFinite(stock.change))
        && (stock.changePercent === null || Number.isFinite(stock.changePercent))
        && (stock.timestamp === null || typeof stock.timestamp === "string")
        && (stock.marketStatus === null || typeof stock.marketStatus === "string")
    ))
);

function Market() {
    const [stocks, setStocks] = useState([]);
    const [selectedSymbol, setSelectedSymbol] = useState("");
    const [searchTerm, setSearchTerm] = useState("");
    const [isMarketLoading, setIsMarketLoading] = useState(true);
    const [marketError, setMarketError] = useState("");
    const [marketLoadAttempt, setMarketLoadAttempt] = useState(0);
    const [watchlistSymbols, setWatchlistSymbols] = useState([]);
    const [isWatchlistLoading, setIsWatchlistLoading] = useState(true);
    const [isWatchlistUpdating, setIsWatchlistUpdating] = useState(false);
    const [watchlistError, setWatchlistError] = useState("");
    const [watchlistSuccess, setWatchlistSuccess] = useState("");
    const normalizedSearchTerm = searchTerm.trim().toLowerCase();
    const filteredStocks = stocks.filter((stock) =>
        stock.symbol.toLowerCase().includes(normalizedSearchTerm)
        || stock.companyName.toLowerCase().includes(normalizedSearchTerm)
    );
    const selectedStock = stocks.find((stock) => stock.symbol === selectedSymbol);

    useEffect(() => {
        let isCurrentRequest = true;
        const controller = new AbortController();

        const fetchMarket = async () => {
            setIsMarketLoading(true);
            setMarketError("");

            try {
                const response = await api.get("/api/market", { signal: controller.signal });
                const marketStocks = response.data?.stocks;

                if (!isValidMarketResponse(marketStocks)) {
                    throw new Error("The market data response was empty or malformed.");
                }

                if (isCurrentRequest) {
                    setStocks(marketStocks);
                    setSelectedSymbol((currentSymbol) => (
                        marketStocks.some((stock) => stock.symbol === currentSymbol)
                            ? currentSymbol
                            : marketStocks[0].symbol
                    ));
                }
            } catch (error) {
                if (isCurrentRequest && !isCanceledRequest(error)) {
                    setStocks([]);
                    setMarketError(
                        error.response?.data?.message
                            || (error.response
                                ? "The market data service returned an error. Please try again."
                                : "Unable to connect to the market data service. Check that the backend is running and try again.")
                    );
                }
            } finally {
                if (isCurrentRequest) {
                    setIsMarketLoading(false);
                }
            }
        };

        Promise.resolve().then(() => {
            if (isCurrentRequest) {
                fetchMarket();
            }
        });

        return () => {
            isCurrentRequest = false;
            controller.abort();
        };
    }, [marketLoadAttempt]);

    useEffect(() => {
        let isCurrentRequest = true;
        const controller = new AbortController();

        const fetchWatchlist = async () => {
            setIsWatchlistLoading(true);
            setWatchlistError("");

            try {
                const response = await api.get("/api/watchlist", { signal: controller.signal });
                if (!Array.isArray(response.data?.symbols)) {
                    throw new Error("The watchlist response was not in the expected format.");
                }
                if (isCurrentRequest) {
                    setWatchlistSymbols(response.data.symbols);
                }
            } catch (error) {
                if (isCurrentRequest && !isCanceledRequest(error)) {
                    setWatchlistError(
                        error.response?.data?.message
                            || "Unable to load watchlist status. You can still try adding this stock."
                    );
                }
            } finally {
                if (isCurrentRequest) {
                    setIsWatchlistLoading(false);
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
    }, []);

    const handleWatchlistToggle = async () => {
        if (!selectedStock || isWatchlistUpdating) {
            return;
        }

        const isInWatchlist = watchlistSymbols.includes(selectedStock.symbol);
        const symbol = selectedStock.symbol;
        setIsWatchlistUpdating(true);
        setWatchlistError("");
        setWatchlistSuccess("");

        try {
            const response = isInWatchlist
                ? await api.delete(`/api/watchlist/${encodeURIComponent(symbol)}`)
                : await api.post("/api/watchlist", { symbol });

            if (!Array.isArray(response.data?.symbols)) {
                throw new Error("The watchlist response was not in the expected format.");
            }
            setWatchlistSymbols(response.data.symbols);
            setWatchlistSuccess(
                `${symbol} ${isInWatchlist ? "removed from" : "added to"} your watchlist.`
            );
        } catch (error) {
            setWatchlistError(
                error.response?.data?.message
                    || `Unable to ${isInWatchlist ? "remove" : "add"} ${symbol} ${isInWatchlist ? "from" : "to"} your watchlist. Please try again.`
            );
        } finally {
            setIsWatchlistUpdating(false);
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
                            <h1>Markets</h1>
                            <p className="welcome-subtitle">Explore available stocks and follow their latest prices.</p>
                        </div>
                    </section>

                    {isMarketLoading ? (
                        <div className="async-state async-state-loading" role="status">
                            <p>Loading market data...</p>
                        </div>
                    ) : marketError ? (
                        <div className="async-state async-state-error" role="alert">
                            <p>{marketError}</p>
                            <button
                                className="trade-button async-state-action"
                                type="button"
                                onClick={() => setMarketLoadAttempt((attempt) => attempt + 1)}
                            >
                                Retry
                            </button>
                        </div>
                    ) : selectedStock && (
                    <div className="market-layout">
                        <section className="panel market-stocks-panel">
                            <div className="panel-header">
                                <div>
                                    <h2>Stocks</h2>
                                    <p className="panel-subtitle">Select a stock to continue.</p>
                                </div>
                                <span className="table-caption">{filteredStocks.length} {filteredStocks.length === 1 ? "STOCK" : "STOCKS"}</span>
                            </div>
                            <label className="market-search">
                                <span className="search-icon" aria-hidden="true">⌕</span>
                                <input
                                    type="search"
                                    placeholder="Search stocks..."
                                    aria-label="Search stocks"
                                    value={searchTerm}
                                    onChange={(event) => setSearchTerm(event.target.value)}
                                />
                            </label>
                            <div className="stock-list">
                                {filteredStocks.length > 0 ? (
                                    <>
                                        <div className="stock-list-heading" aria-hidden="true">
                                            <span>Stock</span>
                                            <span>Price</span>
                                            <span>Change</span>
                                            <span>Change %</span>
                                        </div>
                                        {filteredStocks.map((stock) => {
                                    const positive = Number.isFinite(stock.change) && stock.change >= 0;
                                    const changeClass = Number.isFinite(stock.change)
                                        ? (positive ? "positive-text" : "negative-text")
                                        : "";
                                    const changePercentClass = Number.isFinite(stock.changePercent)
                                        ? (stock.changePercent >= 0 ? "positive-text" : "negative-text")
                                        : "";

                                    return (
                                        <button
                                            className={`stock-list-row${selectedSymbol === stock.symbol ? " selected" : ""}`}
                                            type="button"
                                            key={stock.symbol}
                                            aria-pressed={selectedSymbol === stock.symbol}
                                            onClick={() => {
                                                setSelectedSymbol(stock.symbol);
                                                setWatchlistError("");
                                                setWatchlistSuccess("");
                                            }}
                                        >
                                            <span className="stock-identity">
                                                <strong>{stock.symbol}</strong>
                                                <span>{stock.companyName}</span>
                                            </span>
                                            <span className="stock-price table-number">{formatPrice(stock.price)}</span>
                                            <span className={`stock-change stock-change-absolute table-number ${changeClass}`}>{formatChange(stock.change)}</span>
                                            <span className={`stock-change stock-change-percent table-number ${changePercentClass}`}>{formatChangePercent(stock.changePercent)}</span>
                                        </button>
                                    );
                                        })}
                                    </>
                                ) : (
                                    <p className="stock-empty-state">No stocks found</p>
                                )}
                            </div>
                        </section>

                        <div className="market-selected-column">
                            <StockDetails
                                stock={selectedStock}
                                isInWatchlist={watchlistSymbols.includes(selectedSymbol)}
                                isWatchlistLoading={isWatchlistLoading}
                                isWatchlistUpdating={isWatchlistUpdating}
                                watchlistError={watchlistError}
                                watchlistSuccess={watchlistSuccess}
                                onWatchlistToggle={handleWatchlistToggle}
                            />
                            <PriceChart stock={selectedStock} />
                            <OrderPanel selectedStock={selectedStock} showPriceSourceNote />
                        </div>
                    </div>
                    )}
                </div>
            </main>
        </div>
    );
}

export default Market;
