import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import LinkAnalytics from "../components/LinkAnalytics";
import { hostOf, mapLink, stripProtocol } from "../utils/links";

export default function Analytics() {
  const [state, setState] = useState({ links: null, error: "" });
  const [picked, setPicked] = useState(null);

  useEffect(() => {
    let cancelled = false;

    api
      .get("/urls", { params: { page: 1, limit: 100 } })
      .then((response) => {
        if (!cancelled) setState({ links: (response.data.data || []).map(mapLink), error: "" });
      })
      .catch((err) => {
        if (!cancelled) {
          setState({ links: [], error: err.response?.data?.message || "Unable to load your links." });
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const { links, error } = state;
  const loading = links === null;
  const top = links?.length ? links.reduce((a, b) => (b.clicks > a.clicks ? b : a)) : null;
  const selected = links?.find((link) => link.shortCode === picked) || top;

  return (
    <main className="page">
      <header className="page-head">
        <h1>Analytics</h1>
        <p>See how each short link is performing.</p>
      </header>

      {error && <p className="notice notice-error">{error}</p>}

      {loading ? (
        <div className="skeleton skeleton-chart" aria-hidden="true" />
      ) : links.length === 0 ? (
        <div className="empty empty-lg">
          <h2>Nothing to analyse yet</h2>
          <p>Create a link and share it. Clicks will appear here as people open it.</p>
          <Link to="/generator" className="btn btn-primary">
            Shorten a link
          </Link>
        </div>
      ) : (
        <>
          <div className="picker">
            <label htmlFor="link-picker">Link</label>
            <select id="link-picker" value={selected.shortCode} onChange={(e) => setPicked(e.target.value)}>
              {links.map((link) => (
                <option key={link.id} value={link.shortCode}>
                  {stripProtocol(link.shortURL)} ({link.clicks} clicks)
                </option>
              ))}
            </select>
            <span className="truncate muted" title={selected.originalURL}>
              {hostOf(selected.originalURL)}
            </span>
          </div>

          <LinkAnalytics key={selected.shortCode} shortCode={selected.shortCode} totalClicks={selected.clicks} />

          <section className="panel" aria-labelledby="all-links-title">
            <div className="panel-head">
              <h2 id="all-links-title" className="panel-title">
                All short links
              </h2>
              <span className="muted small">
                {links.length} {links.length === 1 ? "link" : "links"}
              </span>
            </div>
            <div className="table-wrap">
              <table className="table">
                <thead>
                  <tr>
                    <th scope="col">Short link</th>
                    <th scope="col">Destination</th>
                    <th scope="col" className="num">
                      Clicks
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {links.map((link) => (
                    <tr key={link.id} className={link.shortCode === selected.shortCode ? "is-selected" : ""}>
                      <td>
                        <button type="button" className="mono link-button" onClick={() => setPicked(link.shortCode)}>
                          {stripProtocol(link.shortURL)}
                        </button>
                      </td>
                      <td className="cell-url" title={link.originalURL}>
                        {link.originalURL}
                      </td>
                      <td className="num">{link.clicks}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </>
      )}
    </main>
  );
}