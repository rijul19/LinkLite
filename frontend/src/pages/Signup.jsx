import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import AuthShell from "../components/AuthShell";
import { AlertIcon, CheckIcon } from "../components/Icons";

export default function Signup() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [touched, setTouched] = useState({});
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const { signup } = useAuth();
  const navigate = useNavigate();

  // Mirrors the backend rules: name 2-50 characters, password 8-72 characters.
  const problems = {
    name: name.trim().length < 2 ? "Enter your name (at least 2 characters)." : "",
    password: password.length < 8 ? "Use at least 8 characters." : "",
    confirm: confirm !== password ? "Passwords don't match." : "",
  };
  const touch = (field) => setTouched((current) => ({ ...current, [field]: true }));
  const show = (field) => touched[field] && problems[field];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setTouched({ name: true, password: true, confirm: true });
    setError("");

    if (problems.name || problems.password || problems.confirm) return;

    setLoading(true);

    try {
      await signup(name.trim(), email, password);
      setDone(true);
      setTimeout(() => navigate("/dashboard"), 900);
    } catch (err) {
      setError(err.response?.data?.message || "Signup failed. Please try again.");
      setLoading(false);
    }
  };

  return (
    <AuthShell
      title="Create your account"
      subtitle="Free to use. Start tracking your links in under a minute."
      footer={
        <>
          Already have an account? <Link to="/login">Log in</Link>
        </>
      }
    >
      {done ? (
        <p className="notice notice-ok" role="status">
          <CheckIcon width={18} height={18} /> Account created. Taking you to your dashboard…
        </p>
      ) : (
        <form className="form" onSubmit={handleSubmit} noValidate>
          <div className="field">
            <label htmlFor="name">Name</label>
            <input
              id="name"
              type="text"
              autoComplete="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onBlur={() => touch("name")}
              placeholder="Your name"
              aria-invalid={Boolean(show("name"))}
              required
            />
            {show("name") && <p className="field-error">{problems.name}</p>}
          </div>

          <div className="field">
            <label htmlFor="email">Email address</label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
            />
          </div>

          <div className="field">
            <label htmlFor="password">Password</label>
            <div className="password-wrap">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onBlur={() => touch("password")}
                placeholder="At least 8 characters"
                aria-invalid={Boolean(show("password"))}
                required
              />
              <button type="button" className="password-toggle" onClick={() => setShowPassword((v) => !v)} aria-pressed={showPassword}>
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
            {show("password") && <p className="field-error">{problems.password}</p>}
          </div>

          <div className="field">
            <label htmlFor="confirm">Confirm password</label>
            <input
              id="confirm"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              onBlur={() => touch("confirm")}
              placeholder="Repeat your password"
              aria-invalid={Boolean(show("confirm"))}
              required
            />
            {show("confirm") && <p className="field-error">{problems.confirm}</p>}
          </div>

          {error && (
            <p className="notice notice-error" role="alert">
              <AlertIcon width={16} height={16} /> {error}
            </p>
          )}

          <button type="submit" className="btn btn-primary btn-lg btn-block" disabled={loading}>
            {loading ? (
              <>
                <span className="spinner" aria-hidden="true" /> Creating account
              </>
            ) : (
              "Create account"
            )}
          </button>
        </form>
      )}
    </AuthShell>
  );
}