import { useId, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import useUrlValidation from "../hooks/useUrlValidation";
import { EXPIRY_OPTIONS, expiryToISO, hostOf } from "../utils/links";
import CopyButton from "./CopyButton";
import { AlertIcon, CheckIcon, ChartIcon, ExternalIcon, LinkIcon } from "./Icons";

// The one place links get created: used by the home hero, the generator page
// and the dashboard so they all behave identically.
const ScissorsIcon = (p) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...p}>
    <circle cx="6" cy="6" r="3" /><circle cx="6" cy="18" r="3" />
    <path d="M20 4 8.1 15.9M14.5 14.5 20 20M8.1 8.1 12 12" />
  </svg>
);
const QrIcon = (p) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...p}>
    <rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" />
    <path d="M14 14h3v3h-3zM20 14v3M14 20h3M20 20h1" />
  </svg>
);
const ShareIcon = (p) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...p}>
    <circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" />
    <path d="m8.6 13.5 6.8 4M15.4 6.5l-6.8 4" />
  </svg>
);

export default function ShortenForm({ onCreate, variant = "card", showExpiry = true }) {
  const { isAuthenticated } = useAuth();
  const { validateURL } = useUrlValidation();
  const inputId = useId();
  const hintId = useId();

  const [url, setUrl] = useState("");
  const [expiry, setExpiry] = useState("never");
  const [touched, setTouched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);
  const [showQr, setShowQr] = useState(false);

  const trimmed = url.trim();
  const check = trimmed ? validateURL(trimmed) : "";
  const isValid = typeof check === "string" && check.startsWith("http");
  const showInvalid = touched && trimmed && !isValid;

  const submit = async (event) => {
    event.preventDefault();
    setTouched(true);

    if (!isValid) {
      setError(trimmed ? check : "Paste a link to shorten.");
      return;
    }

    setLoading(true);
    setError("");
    setResult(null);

    try {
      const body = { originalUrl: check };
      const expiresAt = expiryToISO(expiry);
      if (expiresAt) body.expiresAt = expiresAt;

      const response = await api.post("/urls", body);
      const data = response.data.data;

      const item = {
        id: data._id,
        originalURL: data.originalUrl,
        shortCode: data.shortCode,
        shortURL: data.shortUrl,
        clicks: data.clicks || 0,
        createdAt: data.createdAt,
        expiresAt: data.expiresAt || null,
      };

      onCreate?.(item);
      setResult(item);
      setShowQr(false);
      setUrl("");
      setTouched(false);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "We couldn't reach the server. Check your connection and try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  const share = async () => {
    if (!result) return;
    try {
      if (navigator.share) await navigator.share({ title: "LinkLite", url: result.shortURL });
      else await navigator.clipboard.writeText(result.shortURL);
    } catch {
      /* user cancelled share */
    }
  };

  return (
    <div className={`sf sf-${variant}`}>
      <form onSubmit={submit} noValidate>
        <label className="sr-only" htmlFor={inputId}>
          Long URL
        </label>
        <div className={`sf-row ${showInvalid ? "is-invalid" : ""} ${isValid ? "is-valid" : ""}`}>
          <div className="sf-input">
            <LinkIcon width={20} height={20} />
            <input
              id={inputId}
              type="text"
              inputMode="url"
              autoComplete="off"
              spellCheck="false"
              value={url}
              placeholder="Paste your long URL here..."
              aria-invalid={showInvalid ? "true" : "false"}
              aria-describedby={hintId}
              onChange={(e) => {
                setUrl(e.target.value);
                setError("");
                setResult(null);
              }}
              onBlur={() => setTouched(true)}
            />
          </div>
          <button type="submit" className="ll-btn ll-btn-solid ll-btn-lg" disabled={loading}>
            {loading ? (
              <>
                <span className="spinner" aria-hidden="true" /> Shortening
              </>
            ) : (
              <>
                <ScissorsIcon /> Shorten URL
              </>
            )}
          </button>
        </div>

        <div className="sf-meta">
          <p id={hintId} className={`field-hint ${error || showInvalid ? "is-error" : isValid ? "is-ok" : ""}`} aria-live="polite">
            {error || showInvalid ? (
              <>
                <AlertIcon width={16} height={16} /> {error || check}
              </>
            ) : isValid ? (
              <>
                <CheckIcon width={16} height={16} /> Looks good. {hostOf(check)} will open from your short link.
              </>
            ) : (
              "Only http and https links can be shortened."
            )}
          </p>

          {showExpiry && (
            <label className="expiry">
              <span>Link expires</span>
              <select value={expiry} onChange={(e) => setExpiry(e.target.value)}>
                {EXPIRY_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
          )}
        </div>
      </form>

      {loading && (
        <div className="sf-result sf-loading" aria-hidden="true">
          <span className="skeleton skeleton-line" />
        </div>
      )}

      {result && (
        <div className="sf-result" role="status" key={result.id}>
          <div className="sf-result-main">
            <span className="sf-ok">
              <CheckIcon width={16} height={16} strokeWidth={3} />
            </span>
            <div className="sf-result-text">
              <strong>Your short link is ready!</strong>
              <a href={result.shortURL} target="_blank" rel="noreferrer">
                {result.shortURL} <ExternalIcon width={16} height={16} />
              </a>
            </div>
            <div className="sf-actions">
              <CopyButton text={result.shortURL} label="Copy" variant="ghost" iconOnly />
              <button type="button" className="ll-iconbtn" aria-label="Show QR code" aria-pressed={showQr} onClick={() => setShowQr((v) => !v)}>
                <QrIcon />
              </button>
              <button type="button" className="ll-iconbtn" aria-label="Share link" onClick={share}>
                <ShareIcon />
              </button>
            </div>
          </div>

          {showQr && (
            <img
              className="sf-qr"
              alt={`QR code for ${result.shortURL}`}
              width="160"
              height="160"
              src={`https://api.qrserver.com/v1/create-qr-code/?size=320x320&margin=8&data=${encodeURIComponent(result.shortURL)}`}
            />
          )}

          {isAuthenticated ? (
            <Link className="sf-note" to={`/history/${result.shortCode}`}>
              <ChartIcon width={16} height={16} /> Track clicks for this link
            </Link>
          ) : (
            <p className="sf-note">
              Guest links can&apos;t be edited or tracked. <Link to="/signup">Create a free account</Link> to see clicks.
            </p>
          )}
        </div>
      )}
    </div>
  );
}