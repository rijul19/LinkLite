import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import ShortenForm from "../components/ShortenForm";
import CopyButton from "../components/CopyButton";
import { ArrowIcon, ChartIcon, DownloadIcon, LinkIcon } from "../components/Icons";
import { greeting, mapLink, stripProtocol } from "../utils/links";

export default function Dashboard({ onCreate }) {
  const { user } = useAuth();
  const [refresh, setRefresh] = useState(0);
  const key = String(refresh);
  const [state, setState] = useState({ key: null, summary: null, recent: [], error: "" });
  const [exportError, setExportError] = useState("");

  useEffect(() => {
    let cancelled = false;

    Promise.all([api.get("/urls/summary"), api.get("/urls", { params: { page: 1, limit: 5 } })])
      .then(([summary, list]) => {
        if (cancelled) return;
        setState({
          key,
          summary: summary.data.data,
          recent: (list.data.data || []).map(mapLink),
          error: "",
        });
      })
      .catch((err) => {
        if (cancelled) return;
        setState({
          key,
          summary: null,
          recent: [],
          error: err.response?.data?.message || "Unable to load your dashboard.",
        });
      });

    return () => {
      cancelled = true;
    };
  }, [key]);

  const loading = state.key !== key;
  const { summary, recent } = state;
  const firstName = (user?.name || "there").split(" ")[0];

  const exportCsv = async () => {
    setExportError("");
    try {
      const response = await api.get("/urls/export", { responseType: "blob" });
      const href = URL.createObjectURL(response.data);
      const anchor = document.createElement("a");
      anchor.href = href;
      anchor.download = "linklite-links.csv";
      anchor.click();
      URL.revokeObjectURL(href);
    } catch {
      setExportError("Export failed. Please try again.");
    }
  };

  return (
    <main className="page">
      <header className="page-head">
        <h1>
          {greeting()}, {firstName}
        </h1>
        <p>Here&apos;s how your links are doing.</p>
      </header>

      {state.error && !loading && <p className="notice notice-error">{state.error}</p>}

      <div className="tiles tiles-3" aria-busy={loading}>
        <article className="tile">
          <span className="tile-label">Total links</span>
          <strong>{loading ? <i className="skeleton skeleton-num" /> : (summary?.totalUrls ?? 0)}</strong>
          <span className="tile-foot">Created by you</span>
        </article>
        <article className="tile tile-sun">
          <span className="tile-label">Total clicks</span>
          <strong>{loading ? <i className="skeleton skeleton-num" /> : (summary?.totalClicks ?? 0)}</strong>
          <span className="tile-foot">Across all links</span>
        </article>
        <article className="tile">
          <span className="tile-label">Average clicks</span>
          <strong>
            {loading ? <i className="skeleton skeleton-num" /> : Number(summary?.averageClicks ?? 0).toFixed(1)}
          </strong>
          <span className="tile-foot">Per link</span>
        </article>
      </div>

      <section className="panel panel-form" aria-labelledby="new-link-title">
        <h2 id="new-link-title" className="panel-title">
          Shorten a new link
        </h2>
        <ShortenForm
          variant="compact"
          onCreate={(item) => {
            onCreate(item);
            setRefresh((value) => value + 1);
          }}
        />
      </section>

      <div className="dash-grid">
        <section className="panel" aria-labelledby="recent-title">
          <div className="panel-head">
            <h2 id="recent-title" className="panel-title">
              Recent links
            </h2>
            <Link to="/history" className="text-link">
              View all <ArrowIcon width={16} height={16} />
            </Link>
          </div>

          {loading ? (
            <div className="skeleton-rows" aria-hidden="true">
              <span className="skeleton skeleton-row" />
              <span className="skeleton skeleton-row" />
              <span className="skeleton skeleton-row" />
            </div>
          ) : recent.length === 0 ? (
            <p className="empty">No links yet. Paste your first long link above to get started.</p>
          ) : (
            <ul className="mini-list">
              {recent.map((link) => (
                <li key={link.id}>
                  <div className="mini-main">
                    <a href={link.shortURL} target="_blank" rel="noreferrer" className="mono">
                      {stripProtocol(link.shortURL)}
                    </a>
                    <span className="truncate" title={link.originalURL}>
                      {link.originalURL}
                    </span>
                  </div>
                  <span className="badge">
                    {link.clicks} {link.clicks === 1 ? "click" : "clicks"}
                  </span>
                  <CopyButton text={link.shortURL} label="Copy" iconOnly />
                  <Link className="btn btn-ghost btn-icon" to={`/history/${link.shortCode}`} aria-label={`Analytics for ${link.shortCode}`} title="Analytics">
                    <ChartIcon />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>

        <aside className="panel quick" aria-labelledby="quick-title">
          <h2 id="quick-title" className="panel-title">
            Quick actions
          </h2>
          <Link to="/history" className="quick-item">
            <LinkIcon /> Manage my links
          </Link>
          <Link to="/analytics" className="quick-item">
            <ChartIcon /> Open analytics
          </Link>
          <button type="button" className="quick-item" onClick={exportCsv}>
            <DownloadIcon /> Export links as CSV
          </button>
          {exportError && <p className="notice notice-error">{exportError}</p>}
        </aside>
      </div>
    </main>
  );
}