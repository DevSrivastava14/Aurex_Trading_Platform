import { useNavigate } from "react-router-dom";
import { clearAuthSession, getStoredUser } from "../services/auth.js";

function Navbar() {
    const navigate = useNavigate();
    const user = getStoredUser();
    const userName = user?.name || "Account";
    const userInitials = userName
        .split(/\s+/)
        .filter(Boolean)
        .map((namePart) => namePart[0])
        .join("")
        .slice(0, 2)
        .toUpperCase();

    const handleLogout = () => {
        clearAuthSession();
        navigate("/login", { replace: true });
    };

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
                <div className="profile-area">
                    <span className="profile-name">{userName}</span>
                    <button className="mobile-avatar avatar" type="button" aria-label={`Profile: ${userName}`}>{userInitials}</button>
                    <button className="logout-button" type="button" onClick={handleLogout}>Log out</button>
                </div>
            </div>
        </header>
    );
}

export default Navbar;
