import { holdings } from "../data/mockData.js";

function Holdings() {
    return (
        <section className="panel holdings-panel">
            <div className="panel-header">
                <div>
                    <h2>Holdings</h2>
                    <p className="panel-subtitle">Your current paper portfolio</p>
                </div>
                <span className="table-caption">4 POSITIONS</span>
            </div>
            <div className="table-scroll">
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>Symbol</th>
                            <th>Qty</th>
                            <th>Avg. Price</th>
                            <th>LTP</th>
                            <th>P&amp;L</th>
                        </tr>
                    </thead>
                    <tbody>
                        {holdings.map((holding, index) => (
                            <tr key={holding.symbol}>
                                <td>
                                    <span className={`symbol-mark symbol-mark-${index}`}>{holding.symbol.slice(0, 1)}</span><strong>{holding.symbol}</strong>
                                </td>
                                <td className="table-number">{holding.quantity}</td>
                                <td className="table-number">{holding.averagePrice}</td>
                                <td className="table-number">{holding.lastPrice}</td>
                                <td><span className={holding.positive ? "positive-text table-number" : "negative-text table-number"}>{holding.pnl}</span></td>
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
                            <span><small>Avg. price</small>{holding.averagePrice}</span>
                            <span><small>LTP</small>{holding.lastPrice}</span>
                        </div>
                    </article>
                ))}
            </div>
        </section>
    );
}

export default Holdings;
