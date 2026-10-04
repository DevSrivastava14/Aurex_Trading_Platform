import { marketWatch } from "../data/mockData.js";

function MarketWatch() {
    return (
        <section className="panel market-panel">
            <div className="panel-header">
                <div>
                    <h2>Market Watch</h2>
                    <p className="panel-subtitle">A snapshot of the market</p>
                </div>
                <span className="table-caption">NSE · MOCK DATA</span>
            </div>
            <div className="market-table-wrap">
                <table className="data-table market-table">
                    <thead><tr><th>Symbol</th><th>Price</th><th>Change</th><th>Change %</th></tr></thead>
                    <tbody>
                {marketWatch.map((stock, index) => (
                    <tr key={stock.symbol}>
                        <td><span className={`symbol-mark symbol-mark-${index}`}>{stock.symbol.slice(0, 1)}</span><strong>{stock.symbol}</strong></td>
                        <td className="table-number">{stock.price}</td>
                        <td className={stock.positive ? "positive-text table-number" : "negative-text table-number"}>{stock.change}</td>
                        <td className={stock.positive ? "positive-text table-number" : "negative-text table-number"}>{stock.changePercent}</td>
                    </tr>
                ))}
                    </tbody>
                </table>
            </div>
            <div className="market-footer"><span className="status-dot" /> Prices shown are illustrative mock data</div>
        </section>
    );
}

export default MarketWatch;
