import { useState } from "react";
import Navbar from "../components/Navbar.jsx";
import PriceChart from "../components/PriceChart.jsx";
import Sidebar from "../components/Sidebar.jsx";
import StockDetails from "../components/StockDetails.jsx";
import { stocks } from "../data/marketData.js";

const formatPrice = (value) => `$${value.toFixed(2)}`;
const formatChange = (value) => `${value > 0 ? "+" : ""}${value.toFixed(2)}`;
const formatChangePercent = (value) => `${value > 0 ? "+" : ""}${value.toFixed(2)}%`;

function Market() {
    const [selectedSymbol, setSelectedSymbol] = useState(stocks[0].symbol);
    const [searchTerm, setSearchTerm] = useState("");
    const normalizedSearchTerm = searchTerm.trim().toLowerCase();
    const filteredStocks = stocks.filter((stock) =>
        stock.symbol.toLowerCase().includes(normalizedSearchTerm)
        || stock.companyName.toLowerCase().includes(normalizedSearchTerm)
    );
    const selectedStock = stocks.find((stock) => stock.symbol === selectedSymbol);

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
                                    const positive = stock.change >= 0;

                                    return (
                                        <button
                                            className={`stock-list-row${selectedSymbol === stock.symbol ? " selected" : ""}`}
                                            type="button"
                                            key={stock.symbol}
                                            aria-pressed={selectedSymbol === stock.symbol}
                                            onClick={() => setSelectedSymbol(stock.symbol)}
                                        >
                                            <span className="stock-identity">
                                                <strong>{stock.symbol}</strong>
                                                <span>{stock.companyName}</span>
                                            </span>
                                            <span className="stock-price table-number">{formatPrice(stock.price)}</span>
                                            <span className={`stock-change stock-change-absolute table-number${positive ? " positive-text" : " negative-text"}`}>{formatChange(stock.change)}</span>
                                            <span className={`stock-change stock-change-percent table-number${positive ? " positive-text" : " negative-text"}`}>{formatChangePercent(stock.changePercent)}</span>
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
                            <StockDetails stock={selectedStock} />
                            <PriceChart stock={selectedStock} />
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}

export default Market;
