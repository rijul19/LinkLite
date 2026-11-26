import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Brand from "./Brand";

export default function Footer() {
  const { isAuthenticated } = useAuth();

  return (
    <footer className="site-footer">
      <div className="footer-inner">
        <div className="footer-brand">
          <Brand />
          <p>Short links you can trust, with clicks you can read.</p>
        </div>
        <nav className="footer-nav" aria-label="Footer">
          <Link to="/generator">Shorten a link</Link>
          {isAuthenticated ? (
            <>
              <Link to="/history">My links</Link>
              <Link to="/analytics">Analytics</Link>
            </>
          ) : (
            <>
              <Link to="/login">Log in</Link>
              <Link to="/signup">Create account</Link>
            </>
          )}
        </nav>
      </div>
      <p className="footer-legal">© 2026 LinkLite. Built as a full-stack university project.</p>
    </footer>
  );
}