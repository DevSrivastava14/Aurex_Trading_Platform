import { useRef, useState } from "react";
import { stocks } from "../data/marketData.js";
import api from "../services/api.js";

const formatCurrency = (value) => `$${Number(value).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
})}`;

function OrderPanel({ selectedStock = stocks[0], showPriceSourceNote = false }) {
    const [side, setSide] = useState("buy");
    const [quantity, setQuantity] = useState("1");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [successMessage, setSuccessMessage] = useState("");
    const submissionInFlight = useRef(false);
    const estimatedAmount = (Number(quantity) || 0) * selectedStock.price;

    const adjustQuantity = (amount) => {
        const currentQuantity = Number(quantity);
        if (!Number.isFinite(currentQuantity) || currentQuantity < 1) {
            setQuantity("1");
            return;
        }

        setQuantity(String(Math.max(1, currentQuantity + amount)));
    };

    const handleSubmit = async () => {
        if (submissionInFlight.current) {
            return;
        }

        setErrorMessage("");
        setSuccessMessage("");

        const orderQuantity = Number(quantity);
        if (!Number.isInteger(orderQuantity) || orderQuantity <= 0) {
            setErrorMessage("Enter a positive whole-number quantity.");
            return;
        }

        submissionInFlight.current = true;
        setIsSubmitting(true);

        try {
            const response = await api.post("/api/orders", {
                symbol: selectedStock.symbol,
                side: side.toUpperCase(),
                quantity: orderQuantity,
                orderType: "MARKET",
            });
            const trade = response.data?.trade;

            if (!trade) {
                throw new Error("The server response did not include the completed trade.");
            }

            setSuccessMessage(
                `Order placed successfully. ${trade.side} ${trade.quantity} ${trade.symbol} at ${formatCurrency(trade.price)} per share. Total: ${formatCurrency(trade.totalValue)}.`
            );
            setQuantity("1");
        } catch (error) {
            setErrorMessage(
                error.response?.data?.message
                    || error.message
                    || "Unable to place the order. Check your connection and try again."
            );
        } finally {
            submissionInFlight.current = false;
            setIsSubmitting(false);
        }
    };

    return (
        <section className="panel order-panel">
            <div className="panel-header">
                <div>
                    <h2>Order Panel</h2>
                    <p className="panel-subtitle">Configure a market order</p>
                </div>
                <span className="table-caption">MARKET ORDER</span>
            </div>
            <div className="order-symbol">
                <div className="order-field">
                    <span className="field-label">Selected stock</span>
                    <strong>{selectedStock.symbol}</strong>
                    <span>{selectedStock.companyName}</span>
                </div>
                <div className="order-field">
                    <span className="field-label">Current price</span>
                    <span className="order-price">{formatCurrency(selectedStock.price)}</span>
                </div>
            </div>
            {showPriceSourceNote && (
                <p className="price-source-note">
                    Quote shown is live market data; paper orders execute at AUREX&apos;s simulated price.
                </p>
            )}
            <div className="order-side" aria-label="Order side">
                <button className={`side-option${side === "buy" ? " selected" : ""}`} type="button" aria-pressed={side === "buy"} disabled={isSubmitting} onClick={() => { setSide("buy"); setErrorMessage(""); setSuccessMessage(""); }}>Buy</button>
                <button className={`side-option${side === "sell" ? " selected" : ""}`} type="button" aria-pressed={side === "sell"} disabled={isSubmitting} onClick={() => { setSide("sell"); setErrorMessage(""); setSuccessMessage(""); }}>Sell</button>
            </div>
            <div className="order-fields">
                <div className="order-field">
                    <label className="field-label" htmlFor="order-quantity">Quantity</label>
                    <div className="quantity-field">
                        <input id="order-quantity" type="number" min="1" step="1" value={quantity} disabled={isSubmitting} onChange={(event) => { setQuantity(event.target.value); setErrorMessage(""); setSuccessMessage(""); }} />
                        <span>Shares</span>
                        <div className="quantity-controls" aria-label="Adjust quantity">
                            <button type="button" aria-label="Increase quantity" disabled={isSubmitting} onClick={() => { adjustQuantity(1); setErrorMessage(""); setSuccessMessage(""); }}>+</button>
                            <button type="button" aria-label="Decrease quantity" disabled={isSubmitting} onClick={() => { adjustQuantity(-1); setErrorMessage(""); setSuccessMessage(""); }}>-</button>
                        </div>
                    </div>
                </div>
                <div className="order-field">
                    <label className="field-label" htmlFor="order-type">Order type</label>
                    <input className="order-input" id="order-type" value="Market" readOnly />
                </div>
                <div className="order-field">
                    <label className="field-label" htmlFor="order-price">Price</label>
                    <input
                        className="order-input"
                        id="order-price"
                        value={selectedStock.price}
                        readOnly
                    />
                </div>
            </div>
            <div className="order-summary">
                <span>Estimated amount</span><strong>{formatCurrency(estimatedAmount)}</strong>
            </div>
            {errorMessage && <p className="order-feedback order-feedback-error" role="alert">{errorMessage}</p>}
            {successMessage && <p className="order-feedback order-feedback-success" role="status">{successMessage}</p>}
            <button className="trade-button" type="button" onClick={handleSubmit} disabled={isSubmitting} aria-busy={isSubmitting}>
                {isSubmitting ? "Submitting order..." : `Place ${side.toUpperCase()} order`}
            </button>
        </section>
    );
}

export default OrderPanel;
