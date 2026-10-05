import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api.js";
import { saveAuthSession } from "../services/auth.js";

function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [errorMessage, setErrorMessage] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (event) => {
        event.preventDefault();
        setErrorMessage("");
        setIsSubmitting(true);

        try {
            const response = await api.post("/api/auth/login", { email, password });
            const { token, user } = response.data;

            if (!token || !user?.id || !user?.name || !user?.email) {
                setErrorMessage("The server returned an invalid login response. Please try again.");
                return;
            }

            saveAuthSession(token, user);
            navigate("/dashboard", { replace: true });
        } catch (error) {
            setErrorMessage(
                error.response?.data?.message
                    || "Unable to log in. Check your connection and try again."
            );
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <main className="login-page">
            <section className="login-card">
                <Link className="login-brand" to="/login" aria-label="AUREX login">
                    <span className="brand-mark">A</span>
                    <span className="brand-name">AUREX<span>.</span></span>
                </Link>
                <p className="eyebrow">PAPER TRADING PLATFORM</p>
                <h1>Welcome back</h1>
                <p className="login-subtitle">Sign in to continue to your trading workspace.</p>

                <form className="login-form" onSubmit={handleSubmit}>
                    <label className="login-field">
                        <span>Email</span>
                        <input
                            type="email"
                            autoComplete="email"
                            value={email}
                            onChange={(event) => setEmail(event.target.value)}
                            required
                        />
                    </label>
                    <label className="login-field">
                        <span>Password</span>
                        <input
                            type="password"
                            autoComplete="current-password"
                            value={password}
                            onChange={(event) => setPassword(event.target.value)}
                            required
                        />
                    </label>
                    {errorMessage && <p className="login-error" role="alert">{errorMessage}</p>}
                    <button className="login-submit" type="submit" disabled={isSubmitting}>
                        {isSubmitting ? "Signing in..." : "Sign in"}
                    </button>
                </form>
                <p className="login-register-prompt">
                    New to AUREX? <Link className="login-register-link" to="/register">Create an account</Link>
                </p>
            </section>
        </main>
    );
}

export default Login;
