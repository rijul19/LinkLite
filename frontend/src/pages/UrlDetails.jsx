import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../services/api";
import useRefreshOnReturn from "../hooks/useRefreshOnReturn";
import CopyButton from "../components/CopyButton";
import LinkAnalytics from "../components/LinkAnalytics";
import { ArrowIcon, ExternalIcon } from "../components/Icons";
import { expiryInfo, formatDate, stripProtocol } from "../utils/links";

function UrlDetails() {
  const { shortCode } = useParams();
  const [state, setState] = useState({ code: null, url: null, error: "" });
  const tick = useRefreshOnReturn();

  useEffect(() => {
    let cancelled = false;

    api
      .get(`/urls/${shortCode}/stats`)
      .then((response) => {
        if (!cancelled) setState({ code: shortCode, url: response.data.data, error: "" });
      })
      .catch((err) => {
        if (!cancelled) {
          setState({
            code: shortCode,
            url: null,
            error: err.response?.data?.message || "Unable to load URL details.",
          });
        }
      });

    return () => {
      cancelled = true;
    };
  }, [shortCode, tick]);

  const loading = state.code !== shortCode;
  const { url, error } = state;

  if (loading) {
    return (
      <main className="page" aria-busy="true">
        <div className="skeleton skeleton-row skeleton-row-tall" />
        <div className="skeleton skeleton-chart" />
      </main>
    );
  }

  if (error) {
    return (
      <main className="page">
        <div className="empty empty-lg">
          <h2>{error}</h2>
          <Link to="/history" className="btn btn-primary">
            Back to my links
          </Link>
        </div>
      </main>
    );
  }

  const expiry = expiryInfo(url.expiresAt);

  return (
    <main className="page">
      <Link to="/history" className="back-link">
        <ArrowIcon width={16} height={16} style={{ transform: "rotate(180deg)" }} /> My links
      </Link>

      <header className="details-head">
        <div className="details-main">
          <h1 className="mono">{stripProtocol(url.shortUrl)}</h1>
          <a className="details-original" href={url.originalUrl} target="_blank" rel="noreferrer" title={url.originalUrl}>
            {url.originalUrl}
          </a>
          <p className="link-meta">
            Created {formatDate(url.createdAt)} ·{" "}
            {url.expiresAt ? `Expires ${formatDate(url.expiresAt)}` : "Never expires"}
            {expiry && <span className={`badge badge-${expiry.tone}`}>{expiry.label}</span>}
          </p>
        </div>
        <div className="details-actions">
          <CopyButton text={url.shortUrl} label="Copy link" variant="primary" />
          <a className="btn btn-ghost" href={url.shortUrl} target="_blank" rel="noreferrer">
            <ExternalIcon /> Open
          </a>
        </div>
      </header>

      <LinkAnalytics shortCode={url.shortCode} totalClicks={url.clicks} />
    </main>
  );
}

export default UrlDetails;