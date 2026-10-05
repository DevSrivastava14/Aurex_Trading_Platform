import { useEffect, useState } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import Dashboard from "./pages/Dashboard.jsx";
import Login from "./pages/Login.jsx";
import Market from "./pages/Market.jsx";
import Register from "./pages/Register.jsx";
import { AUTH_STATE_CHANGE_EVENT, getAuthToken } from "./services/auth.js";

function ProtectedRoute({ children, isAuthenticated }) {
    return isAuthenticated ? children : <Navigate to="/login" replace />;
}

function LoginRoute({ isAuthenticated }) {
    return isAuthenticated ? <Navigate to="/dashboard" replace /> : <Login />;
}

function RegisterRoute({ isAuthenticated }) {
    return isAuthenticated ? <Navigate to="/dashboard" replace /> : <Register />;
}

function HomeRoute({ isAuthenticated }) {
    return <Navigate to={isAuthenticated ? "/dashboard" : "/login"} replace />;
}

function App() {
    const [isAuthenticated, setIsAuthenticated] = useState(() => Boolean(getAuthToken()));

    useEffect(() => {
        const syncAuthenticationState = () => {
            setIsAuthenticated(Boolean(getAuthToken()));
        };

        window.addEventListener(AUTH_STATE_CHANGE_EVENT, syncAuthenticationState);
        window.addEventListener("storage", syncAuthenticationState);

        return () => {
            window.removeEventListener(AUTH_STATE_CHANGE_EVENT, syncAuthenticationState);
            window.removeEventListener("storage", syncAuthenticationState);
        };
    }, []);

    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<HomeRoute isAuthenticated={isAuthenticated} />} />
                <Route path="/login" element={<LoginRoute isAuthenticated={isAuthenticated} />} />
                <Route path="/register" element={<RegisterRoute isAuthenticated={isAuthenticated} />} />
                <Route path="/dashboard" element={<ProtectedRoute isAuthenticated={isAuthenticated}><Dashboard /></ProtectedRoute>} />
                <Route path="/market" element={<ProtectedRoute isAuthenticated={isAuthenticated}><Market /></ProtectedRoute>} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;
