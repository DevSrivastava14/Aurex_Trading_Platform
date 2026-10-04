import { portfolioMetrics } from "../data/mockData.js";

function PortfolioOverview() {
    return (
        <section className="overview-grid" aria-label="Portfolio overview">
            {portfolioMetrics.map((metric) => (
                <article className="metric-card" key={metric.label}>
                    <div className="metric-label">{metric.label}</div>
                    <div className={`metric-value${metric.positive ? " positive-text" : ""}`}>{metric.value}</div>
                    <div className="metric-detail">
                        {metric.change && <span className="positive-text">{metric.change}</span>}
                        {metric.note}
                    </div>
                </article>
            ))}
        </section>
    );
}

export default PortfolioOverview;
