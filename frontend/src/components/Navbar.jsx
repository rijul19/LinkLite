import { useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Brand from "./Brand";
import { CloseIcon, MenuIcon } from "./Icons";

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const { pathname, hash } = useLocation();
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);

  const initial = (user?.name || "?").trim().charAt(0).toUpperCase();
  const onHome = pathname === "/";

  const guestLinks = [
    { to: "/", label: "Home", active: onHome && !hash },
    { to: "/#features", label: "Features", active: onHome && hash === "#features" },
    { to: "/#how-it-works", label: "How It Works", active: onHome && hash === "#how-it-works" },
    { to: "/generator", label: "Shorten", active: pathname === "/generator" },
  ];

  const userLinks = [
    { to: "/dashboard", label: "Dashboard" },
    { to: "/history", label: "My Links" },
    { to: "/analytics", label: "Analytics" },
  ];

  return (
    <header className="ll-header">
      <div className="ll-header-inner">
        <Brand onClick={close} />

        <button
          type="button"
          className="nav-toggle"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          aria-controls="site-menu"
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <CloseIcon /> : <MenuIcon />}
        </button>

        <div id="site-menu" className={`ll-menu ${open ? "is-open" : ""}`}>
          <nav className="ll-nav" aria-label="Main navigation">
            {isAuthenticated
              ? userLinks.map(({ to, label }) => (
                  <NavLink key={to} to={to} onClick={close}>
                    {label}
                  </NavLink>
                ))
              : guestLinks.map(({ to, label, active }) => (
                  <Link key={to} to={to} className={active ? "active" : ""} onClick={close}>
                    {label}
                  </Link>
                ))}
          </nav>

          {isAuthenticated ? (
            <div className="ll-auth">
              <span className="avatar" aria-hidden="true">{initial}</span>
              <span className="header-name">{user?.name}</span>
              <button
                type="button"
                className="ll-btn ll-btn-outline"
                onClick={() => {
                  close();
                  logout();
                }}
              >
                Log Out
              </button>
            </div>
          ) : (
            <div className="ll-auth">
              <Link to="/login" className="ll-btn ll-btn-outline" onClick={close}>
                Log In
              </Link>
              <Link to="/signup" className="ll-btn ll-btn-solid" onClick={close}>
                Sign Up
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}