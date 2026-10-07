import Holdings from "../components/Holdings.jsx";
import MarketWatch from "../components/MarketWatch.jsx";
import Navbar from "../components/Navbar.jsx";
import OrderPanel from "../components/OrderPanel.jsx";
import PortfolioOverview from "../components/PortfolioOverview.jsx";
import Sidebar from "../components/Sidebar.jsx";

function Dashboard() {
    return (
        <div className="app-shell">
            <Sidebar />
            <main className="main-area">
                <Navbar />
                <div className="dashboard-content">
                    <section className="welcome-row">
                        <div>
                            <p className="eyebrow">PAPER TRADING · US MARKETS</p>
                            <h1>Dashboard</h1>
                            <p className="welcome-subtitle">Your portfolio and the market, at a glance.</p>
                        </div>
                        <div className="market-pill"><span className="status-dot" /> Market open <span className="market-time">· US Session</span></div>
                    </section>

                    <PortfolioOverview />

                    <div className="dashboard-grid">
                        <MarketWatch />
                        <Holdings />
                    </div>

                    <OrderPanel />

                    <footer className="dashboard-footer">
                        <span>AUREX · PAPER TRADING</span>
                        <span>Paper Trading Execution · Virtual Portfolio</span>
                    </footer>
                </div>
            </main>
        </div>
    );
}

export default Dashboard;
