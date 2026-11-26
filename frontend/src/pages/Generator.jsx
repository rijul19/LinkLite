import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import ShortenForm from "../components/ShortenForm";
import CopyButton from "../components/CopyButton";
import { ArrowIcon } from "../components/Icons";
import { formatDate, stripProtocol } from "../utils/links";

export default function Generator({ onCreate, history }) {
  const { isAuthenticated } = useAuth();
  const guestRecent = isAuthenticated ? [] : history.slice(0, 5);

  return (
    <main className="page page-narrow">
      <header className="page-head">
        <h1>Shorten a link</h1>
        <p>Paste a long URL, choose when it should expire, and copy the result.</p>
      </header>

      <ShortenForm onCreate={onCreate} variant="card" />

      {isAuthenticated ? (
        <Link to="/history" className="text-link">
          See all your links <ArrowIcon width={16} height={16} />
        </Link>
      ) : (
        guestRecent.length > 0 && (
          <div className="guest-recent">
            <h2>Recent in this browser</h2>
            <ul>
              {guestRecent.map((link) => (
                <li key={link.id}>
                  <div>
                    <a href={link.shortURL} target="_blank" rel="noreferrer" className="mono">
                      {stripProtocol(link.shortURL)}
                    </a>
                    <span className="truncate">{link.originalURL}</span>
                  </div>
                  <span className="muted small">{formatDate(link.createdAt)}</span>
                  <CopyButton text={link.shortURL} label="Copy" iconOnly />
                </li>
              ))}
            </ul>
          </div>
        )
      )}
    </main>
  );
}