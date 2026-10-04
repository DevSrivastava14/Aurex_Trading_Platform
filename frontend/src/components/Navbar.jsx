function Navbar() {
    return (
        <header className="topbar">
            <div className="breadcrumb"><span>Workspace</span><span className="breadcrumb-separator">/</span><strong>Dashboard</strong></div>
            <div className="topbar-actions">
                <label className="search-box">
                    <span className="search-icon" aria-hidden="true">⌕</span>
                    <input type="search" placeholder="Search stocks..." aria-label="Search stocks" />
                    <kbd>⌘ K</kbd>
                </label>
                <button className="icon-button notification-button" type="button" aria-label="Notifications">
                    <span aria-hidden="true">♧</span><i />
                </button>
                <div className="profile-area"><span className="profile-name">Alex Sharma</span>
                <button className="mobile-avatar avatar" type="button" aria-label="Profile">AS</button>
                </div>
            </div>
        </header>
    );
}

export default Navbar;
