import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import AuthShell from "../components/AuthShell";
import { AlertIcon } from "../components/Icons";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await login(email, password);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      title="Welcome back!"
      subtitle="Log in to manage your shortened links."
      footer={
        <>
          Don&apos;t have an account? <Link to="/signup">Sign up</Link>
        </>
      }
    >
      <form className="form" onSubmit={handleSubmit}>
        <div className="field">
          <label htmlFor="email">Email address</label>
          <input id="email" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required />
        </div>

        <div className="field">
          <label htmlFor="password">Password</label>
          <div className="password-wrap">
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
            />
            <button type="button" className="password-toggle" onClick={() => setShowPassword((v) => !v)} aria-pressed={showPassword}>
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>
        </div>

        {error && (
          <p className="notice notice-error" role="alert">
            <AlertIcon width={16} height={16} /> {error}
          </p>
        )}

        <button type="submit" className="ll-btn ll-btn-solid ll-btn-lg ll-block" disabled={loading}>
          {loading ? "Logging in..." : "Log In"}
        </button>
      </form>
    </AuthShell>
  );
}