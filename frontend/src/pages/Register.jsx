import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api.js";
import { saveAuthSession } from "../services/auth.js";

function Register() {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [errorMessage, setErrorMessage] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (event) => {
        event.preventDefault();
        setErrorMessage("");

        if (password !== confirmPassword) {
            setErrorMessage("Passwords do not match.");
            return;
        }

        setIsSubmitting(true);

        try {
            const registrationResponse = await api.post("/api/auth/register", {
                name,
                email,
                password,
            });
            let { token, user } = registrationResponse.data;

            if (!token) {
                try {
                    const loginResponse = await api.post("/api/auth/login", { email, password });
                    token = loginResponse.data?.token;
                    user = loginResponse.data?.user;
                } catch {
                    setErrorMessage("Your account was created, but automatic sign-in failed. Please log in.");
                    return;
                }
            }

            if (!token || !user?.id || !user?.name || !user?.email) {
                setErrorMessage("Your account was created, but the server returned an invalid login response. Please log in.");
                return;
            }

            saveAuthSession(token, user);
            navigate("/dashboard", { replace: true });
        } catch (error) {
            setErrorMessage(
                error.response?.data?.message
                    || "Unable to create your account. Check your connection and try again."
            );
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <main className="login-page">
            <section className="login-card">
                <Link className="login-brand" to="/register" aria-label="AUREX registration">
                    <span className="brand-mark">A</span>
                    <span className="brand-name">AUREX<span>.</span></span>
                </Link>
                <p className="eyebrow">PAPER TRADING PLATFORM</p>
                <h1>Create your account</h1>
                <p className="login-subtitle">Register to start using your paper trading workspace.</p>

                <form className="login-form" onSubmit={handleSubmit}>
                    <label className="login-field">
                        <span>Name</span>
                        <input
                            type="text"
                            autoComplete="name"
                            value={name}
                            onChange={(event) => setName(event.target.value)}
                            required
                        />
                    </label>
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
                            autoComplete="new-password"
                            value={password}
                            onChange={(event) => setPassword(event.target.value)}
                            required
                        />
                    </label>
                    <label className="login-field">
                        <span>Confirm Password</span>
                        <input
                            type="password"
                            autoComplete="new-password"
                            value={confirmPassword}
                            onChange={(event) => setConfirmPassword(event.target.value)}
                            required
                        />
                    </label>
                    {errorMessage && <p className="login-error" role="alert">{errorMessage}</p>}
                    <button className="login-submit" type="submit" disabled={isSubmitting}>
                        {isSubmitting ? "Creating account..." : "Create account"}
                    </button>
                </form>
                <p className="login-register-prompt">
                    Already have an account? <Link className="login-register-link" to="/login">Sign in</Link>
                </p>
            </section>
        </main>
    );
}

export default Register;
