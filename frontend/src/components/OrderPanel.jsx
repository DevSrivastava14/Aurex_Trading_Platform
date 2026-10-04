import { useState } from "react";
import { marketWatch } from "../data/mockData.js";

function OrderPanel() {
    const [side, setSide] = useState("buy");
    const [symbol, setSymbol] = useState(marketWatch[0].symbol);
    const [quantity, setQuantity] = useState("1");
    const [orderType, setOrderType] = useState("Market");
    const [limitPrice, setLimitPrice] = useState(String(marketWatch[0].priceValue));
    const selectedStock = marketWatch.find((stock) => stock.symbol === symbol);
    const price = orderType === "Market" ? selectedStock.priceValue : Number(limitPrice) || 0;
    const estimatedAmount = (Number(quantity) || 0) * price;
    const adjustQuantity = (amount) => {
        const currentQuantity = Number(quantity);
        if (!Number.isFinite(currentQuantity) || currentQuantity < 1) {
            setQuantity("1");
            return;
        }

        setQuantity(String(Math.max(1, currentQuantity + amount)));
    };
    const formattedEstimate = `₹${estimatedAmount.toLocaleString("en-IN", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    })}`;

    return (
        <section className="panel order-panel">
            <div className="panel-header">
                <div>
                    <h2>Order Panel</h2>
                    <p className="panel-subtitle">Configure a mock order</p>
                </div>
                <span className="table-caption">PREVIEW ONLY</span>
            </div>
            <div className="order-symbol">
                <div className="order-field">
                    <label className="field-label" htmlFor="order-stock">Stock</label>
                    <select
                        id="order-stock"
                        value={symbol}
                        onChange={(event) => {
                            const stock = marketWatch.find((item) => item.symbol === event.target.value);
                            setSymbol(event.target.value);
                            setLimitPrice(String(stock.priceValue));
                        }}
                    >
                        {marketWatch.map((stock) => <option key={stock.symbol} value={stock.symbol}>{stock.symbol}</option>)}
                    </select>
                </div>
                <span className="order-price">{selectedStock.price}</span>
            </div>
            <div className="order-side" aria-label="Order side">
                <button className={`side-option${side === "buy" ? " selected" : ""}`} type="button" aria-pressed={side === "buy"} onClick={() => setSide("buy")}>Buy</button>
                <button className={`side-option${side === "sell" ? " selected" : ""}`} type="button" aria-pressed={side === "sell"} onClick={() => setSide("sell")}>Sell</button>
            </div>
            <div className="order-fields">
                <div className="order-field">
                    <label className="field-label" htmlFor="order-quantity">Quantity</label>
                    <div className="quantity-field">
                        <input id="order-quantity" type="number" min="1" step="1" value={quantity} onChange={(event) => setQuantity(event.target.value)} />
                        <span>Shares</span>
                        <div className="quantity-controls" aria-label="Adjust quantity">
                            <button type="button" aria-label="Increase quantity" onClick={() => adjustQuantity(1)}>+</button>
                            <button type="button" aria-label="Decrease quantity" onClick={() => adjustQuantity(-1)}>-</button>
                        </div>
                    </div>
                </div>
                <div className="order-field">
                    <label className="field-label" htmlFor="order-type">Order type</label>
                    <select id="order-type" value={orderType} onChange={(event) => setOrderType(event.target.value)}><option>Market</option><option>Limit</option></select>
                </div>
                <div className="order-field">
                    <label className="field-label" htmlFor="order-price">Price</label>
                    <input
                        className="order-input"
                        id="order-price"
                        type="number"
                        min="0"
                        step="0.05"
                        value={orderType === "Market" ? selectedStock.priceValue : limitPrice}
                        readOnly={orderType === "Market"}
                        onChange={(event) => setLimitPrice(event.target.value)}
                    />
                </div>
            </div>
            <div className="order-summary">
                <span>Estimated amount</span><strong>{formattedEstimate}</strong>
            </div>
            <button className="trade-button" type="button">Place mock order</button>
            <p className="order-disclaimer">UI preview only · No order will be submitted</p>
        </section>
    );
}

export default OrderPanel;
