import { Link, NavLink } from "react-router-dom";

const navigation = [
    { label: "Dashboard", icon: "▦", to: "/dashboard" },
    { label: "Market", icon: "⌁", to: "/market" },
    { label: "Portfolio", icon: "◫", to: "/portfolio" },
    { label: "Trade History", icon: "↺", to: "/trades" },
    { label: "Orders", icon: "⇄" },
    { label: "Watchlist", icon: "☆", to: "/watchlist" },
    { label: "Settings", icon: "⚙" },
];

function Sidebar() {
    return (
        <aside className="sidebar">
            <Link className="brand" to="/dashboard" aria-label="Aurex home">
                <span className="brand-mark">A</span>
                <span className="brand-name">aurex<span>.</span></span>
            </Link>

            <div className="sidebar-label">TRADING</div>
            <nav className="sidebar-nav" aria-label="Main navigation">
                {navigation.map((item) => (
                    item.to ? (
                        <NavLink
                            className={({ isActive }) => `nav-item${isActive ? " active" : ""}`}
                            to={item.to}
                            key={item.label}
                        >
                            <span className="nav-icon" aria-hidden="true">{item.icon}</span>
                            <span>{item.label}</span>
                        </NavLink>
                    ) : (
                        <span className="nav-item" aria-disabled="true" key={item.label}>
                            <span className="nav-icon" aria-hidden="true">{item.icon}</span>
                            <span>{item.label}</span>
                        </span>
                    )
                ))}
            </nav>

            <div className="sidebar-bottom">
                <div className="market-status"><span className="status-dot" /> Market is open</div>
                <div className="sidebar-profile">
                    <div className="avatar avatar-small">AS</div>
                    <div><strong>Alex Sharma</strong><span>Paper trader</span></div>
                    <span className="profile-more" aria-hidden="true">···</span>
                </div>
            </div>
        </aside>
    );
}

export default Sidebar;
