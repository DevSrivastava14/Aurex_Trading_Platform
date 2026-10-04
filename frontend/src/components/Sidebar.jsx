const navigation = [
    { label: "Dashboard", icon: "▦", active: true },
    { label: "Market", icon: "⌁" },
    { label: "Portfolio", icon: "◫" },
    { label: "Orders", icon: "⇄" },
    { label: "Watchlist", icon: "☆" },
    { label: "Settings", icon: "⚙" },
];

function Sidebar() {
    return (
        <aside className="sidebar">
            <a className="brand" href="#" aria-label="Aurex home">
                <span className="brand-mark">A</span>
                <span className="brand-name">aurex<span>.</span></span>
            </a>

            <div className="sidebar-label">TRADING</div>
            <nav className="sidebar-nav" aria-label="Main navigation">
                {navigation.map((item) => (
                    <a
                        className={`nav-item${item.active ? " active" : ""}`}
                        href="#"
                        key={item.label}
                        aria-current={item.active ? "page" : undefined}
                    >
                        <span className="nav-icon" aria-hidden="true">{item.icon}</span>
                        <span>{item.label}</span>
                    </a>
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
