import { useEffect, useMemo, useState } from "react";
import useUrlHistory from "./hooks/useUrlHistory";
import useUrlValidation from "./hooks/useUrlValidation";
import api from "./services/api";
import {
  Routes,
  Route,
  Navigate,
  Link,
  useLocation,
  Outlet,
} from "react-router-dom";
import UrlDetails from "./pages/UrlDetails";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import { useAuth } from "./context/AuthContext";
import "./App.css";
import "./styles/original.css";
import "./styles/generator.css";
import "./styles/history.css";

function Navbar() {
  const location = useLocation();
  const { user, isAuthenticated, logout } = useAuth();

  return (
    <header className="site-header">
      <Link to="/" className="site-logo" aria-label="LinkLite home">
        <img src="/icon.png" alt="" />
        <span>
          LINKLITE
          <span className="logo-period" />
        </span>
      </Link>

      <nav className="site-nav" aria-label="Main navigation">
        <Link className={location.pathname === "/" ? "active" : ""} to="/">
          Home
        </Link>
        <Link
          className={location.pathname === "/history" ? "active" : ""}
          to="/history"
        >
          History
        </Link>
      </nav>

      {isAuthenticated ? (
        <div className="header-auth">
          <span>{user?.name}</span>
          <button className="header-cta" onClick={logout}>
            Log out
          </button>
        </div>
      ) : (
        <div className="header-auth">
          <Link to="/login" className="header-login">
            Log in
          </Link>
          <Link to="/signup" className="header-cta">
            Sign up ↗
          </Link>
        </div>
      )}
    </header>
  );
}

function HeroArt() {
  return (
    <div className="hero-art" aria-label="Illustration of a short link">
      <div className="art-orbit orbit-one" />
      <div className="art-orbit orbit-two" />
      <div className="art-label label-top">LESS LINK. MORE ROOM.</div>
      <div className="link-paper paper-back">
        <span className="paper-dot" />
        <span className="paper-line line-long" />
        <span className="paper-line line-mid" />
      </div>
      <div className="link-paper paper-front">
        <div className="paper-heading">
          <span className="mini-link-icon">↗</span>
          <span>YOUR NEW LINK</span>
          <span className="paper-status">READY</span>
        </div>
        <div className="short-demo">
          linklite<span>.local</span>/<b>abc123</b>
        </div>
        <div className="paper-bottom">
          <span>
            <i /> Demo link created
          </span>
          <span className="copy-glyph">▢</span>
        </div>
      </div>
      <div className="art-stamp">
        <span>GOOD LINKS</span>
        <strong>
          GOOD
          <br />
          THINGS
        </strong>
        <span>START SMALL</span>
      </div>
      <div className="art-label label-bottom">
        MADE TO KEEP THINGS SIMPLE <span>✳</span>
      </div>
    </div>
  );
}
function Footer() {
  return (
    <footer className="site-footer section-wrap">
      <a href="/" className="footer-brand">
        LINKLITE<span>.</span>
      </a>
      <p>Make your links lighter.</p>
      <span>FRONT-END DEMO · 2026</span>
    </footer>
  );
}
function Home({ history }) {
  const { isAuthenticated } = useAuth();

  const [summary, setSummary] = useState(null);
  const [statsLoading, setStatsLoading] = useState(false);
  const [statsError, setStatsError] = useState("");

  useEffect(() => {
    if (!isAuthenticated) {
      setSummary(null);
      return;
    }

    let cancelled = false;

    const loadStats = async () => {
      setStatsLoading(true);
      setStatsError("");

      try {
        const response = await api.get("/urls/summary");

        if (!cancelled) {
          setSummary(response.data.data);
        }
      } catch (error) {
        if (!cancelled) {
          setStatsError(
            error.response?.data?.message || "Unable to load statistics.",
          );
        }
      } finally {
        if (!cancelled) setStatsLoading(false);
      }
    };

    loadStats();

    return () => {
      cancelled = true;
    };
  }, [isAuthenticated]);

  const clicks =
    summary?.totalClicks ??
    history.reduce((sum, link) => sum + (Number(link.clicks) || 0), 0);

  const totalUrls = summary?.totalUrls ?? history.length;

  const averageClicks =
    summary?.averageClicks ?? (history.length ? clicks / history.length : 0);

  return (
    <>
      <main>
        <section className="hero section-wrap">
          <div className="hero-copy">
            <p className="eyebrow">
              <span className="eyebrow-dot" /> A SMALL TOOL FOR BIG LINKS
            </p>
            <h1>
              Make your links
              <br />
              <em>lighter.</em>
            </h1>
            <p className="hero-description">
              Long URLs, meet a simpler life. Create neat demo short links and
              keep your saved links together in one calm, clutter-free space.
            </p>
            <div className="hero-actions">
              <a className="hero-try-button" href="/generator">
                Try Generator <span>↗</span>
              </a>
            </div>
            <p className="hero-note">
              <span>✳</span> Free to try · Saved in this browser · No account
              needed
            </p>
          </div>
          <HeroArt />
        </section>
        <section
          className="feature-strip section-wrap"
          aria-label="LinkLite features"
        >
          <article className="feature-item">
            <span className="feature-symbol">01</span>
            <div>
              <h3>Simple by design</h3>
              <p>Paste a URL and create a demo short link.</p>
            </div>
          </article>
          <article className="feature-item">
            <span className="feature-symbol">02</span>
            <div>
              <h3>Your links, together</h3>
              <p>Keep your saved links in one convenient place.</p>
            </div>
          </article>
          <article className="feature-item">
            <span className="feature-symbol">03</span>
            <div>
              <h3>Saved locally</h3>
              <p>Your browser remembers your demo history.</p>
            </div>
          </article>
        </section>
        <section className="stats-section section-wrap">
          <div className="section-heading">
            <div>
              <p className="eyebrow">YOUR LITTLE LINK LIBRARY</p>
              <h2>
                Everything, <em>at a glance.</em>
              </h2>
            </div>
            <a href="/history" className="text-link">
              Explore history <span>↗</span>
            </a>
          </div>
          {statsLoading && (
            <p className="empty-message">
              Loading your dashboard statistics...
            </p>
          )}

          {statsError && <p className="form-message error">{statsError}</p>}
          <div className="stats-grid">
            <article className="stat-card">
              <span className="stat-label">LINKS CREATED</span>
              <strong>{totalUrls}</strong>
              <span className="stat-foot">Demo links saved here</span>
              <span className="stat-decoration">↗</span>
            </article>
            <article className="stat-card stat-card-olive">
              <span className="stat-label">AVERAGE CLICKS</span>
              <strong>{Number(averageClicks).toFixed(1)}</strong>
              <span className="stat-foot">Average clicks per link</span>
              <span className="stat-decoration">▤</span>
            </article>
            <article className="stat-card stat-card-russet">
              <span className="stat-label">DEMO CLICKS</span>
              <strong>{clicks}</strong>
              <span className="stat-foot">Clicks from history list</span>
              <span className="stat-decoration">⌁</span>
            </article>
          </div>
        </section>
        <section className="recent-section section-wrap">
          <div className="section-heading">
            <div>
              <p className="eyebrow">PICK UP WHERE YOU LEFT OFF</p>
              <h2>
                Your recent <em>links.</em>
              </h2>
            </div>
            <a href="/history" className="text-link">
              View all links <span>↗</span>
            </a>
          </div>
          <div className="recent-links">
            {history.length === 0 ? (
              <p className="empty-recent">
                Your next useful link belongs here.
              </p>
            ) : (
              history.slice(0, 3).map((link) => (
                <article className="recent-link-card" key={link.id}>
                  <div className="recent-link-details">
                    <strong>{link.shortURL}</strong>
                    <p>{link.originalURL}</p>
                    <span>{link.createdAt}</span>
                  </div>
                  <a className="recent-open" href="/history">
                    View
                  </a>
                </article>
              ))
            )}
          </div>
        </section>
        <section id="about" className="about-section section-wrap">
          <div className="about-mark">
            L<span>.</span>
          </div>
          <div>
            <p className="eyebrow">A NOTE ABOUT THIS PROJECT</p>
            <h2>
              Small, useful, <em>and intentionally simple.</em>
            </h2>
            <p>
              LinkLite is a front-end demonstration project. It validates URLs
              and stores demo link records in your browser. Real public short
              links and server-side redirects require a backend service; demo
              links work only in this browser while their saved records remain
              available.
            </p>
          </div>
          <a className="about-cta" href="/generator">
            Try the generator <span>↗</span>
          </a>
        </section>
      </main>
      <Footer />
    </>
  );
}

function Generator({ onCreate }) {
  const { validateURL } = useUrlValidation();

  const [url, setUrl] = useState("");
  const [message, setMessage] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const submit = async (event) => {
    event.preventDefault();

    const checked = validateURL(url);

    if (typeof checked !== "string" || !checked.startsWith("http")) {
      setMessage({ text: checked, type: "error" });
      return;
    }

    setLoading(true);
    setMessage(null);
    setResult(null);

    try {
      const response = await api.post("/urls", {
        originalUrl: checked,
      });

      const data = response.data.data;

      const item = {
        id: data._id,
        originalURL: data.originalUrl,
        shortCode: data.shortCode,
        shortURL: data.shortUrl,
        clicks: data.clicks || 0,
        createdAt: new Date(data.createdAt).toLocaleDateString("en-IN", {
          day: "numeric",
          month: "short",
          year: "numeric",
        }),
      };

      onCreate(item);
      setResult(item);
      setMessage({
        text: "Your real short link was created successfully!",
        type: "success",
      });
      setUrl("");
    } catch (error) {
      setMessage({
        text:
          error.response?.data?.message ||
          "Unable to create your short link. Please try again.",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="generator-container">
      <section className="generator-card">
        <p className="eyebrow">A SMALL TOOL FOR BIG LINKS</p>
        <h1>
          Make your links <em>lighter.</em>
        </h1>
        <p className="description">
          Paste a long URL below. LinkLite will create your real short link.
        </p>

        <form onSubmit={submit}>
          <label htmlFor="originalUrl">Your long URL</label>
          <input
            id="originalUrl"
            type="text"
            value={url}
            onChange={(e) => {
              setUrl(e.target.value);
              setResult(null);
              setMessage(null);
            }}
            placeholder="https://example.com/your/very/long/link"
          />

          <button type="submit" disabled={loading}>
            {loading ? "Creating..." : "Create short link ↗"}
          </button>

          {message && (
            <p className={`form-message ${message.type}`}>{message.text}</p>
          )}
        </form>

        {result && (
          <div className="short-url-result">
            <h2>Your short link is ready!</h2>
            <p className="generated-link">
              <a href={result.shortURL} target="_blank" rel="noreferrer">
                {result.shortURL}
              </a>
            </p>
            <p className="original-label">Original URL: {result.originalURL}</p>
            <button
              className="copy-link-button"
              type="button"
              onClick={() =>
                navigator.clipboard
                  .writeText(result.shortURL)
                  .then(() =>
                    setMessage({
                      text: "Link copied!",
                      type: "success",
                    }),
                  )
                  .catch(() =>
                    setMessage({
                      text: "Please copy the link manually.",
                      type: "error",
                    }),
                  )
              }
            >
              Copy Link
            </button>
          </div>
        )}

        <a className="history-link" href="/history">
          View your saved links ↗
        </a>
      </section>
    </main>
  );
}

function History({
  history,
  onDelete,
  onClick,
  onEdit,
  currentPage,
  totalPages,
  onPageChange,
  historyLoading,
  historyError,
}) {
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [filterBy, setFilterBy] = useState("all");
  const [editingId, setEditingId] = useState(null);
  const [editUrl, setEditUrl] = useState("");
  const [editError, setEditError] = useState("");
  const [saving, setSaving] = useState(false);

  const startEdit = (link) => {
    setEditingId(link.id);
    setEditUrl(link.originalURL);
    setEditError("");
  };

  const saveEdit = async (id) => {
    setSaving(true);
    setEditError("");

    try {
      await onEdit(id, editUrl);
      setEditingId(null);
      setEditUrl("");
    } catch (error) {
      setEditError(error.message || "Unable to update link.");
    } finally {
      setSaving(false);
    }
  };

  const filteredHistory = history
    .filter((link) => {
      const query = search.toLowerCase();
      const matchesSearch =
        (link.shortURL || "").toLowerCase().includes(query) ||
        (link.originalURL || "").toLowerCase().includes(query);

      const matchesFilter =
        filterBy === "all" ||
        (filterBy === "clicked" && Number(link.clicks) > 0);

      return matchesSearch && matchesFilter;
    })
    .sort((a, b) => {
      if (sortBy === "newest")
        return new Date(b.createdAt) - new Date(a.createdAt);
      if (sortBy === "oldest")
        return new Date(a.createdAt) - new Date(b.createdAt);
      if (sortBy === "most")
        return Number(b.clicks || 0) - Number(a.clicks || 0);
      if (sortBy === "least")
        return Number(a.clicks || 0) - Number(b.clicks || 0);
      return 0;
    });

  return (
    <main className="history-container">
      <section className="history-card">
        <a href="/" className="back-link">
          ← Back to LinkLite
        </a>
        <p className="eyebrow">YOUR LITTLE LINK LIBRARY</p>
        <h1>Your saved links.</h1>
        <p className="description">
          All your saved links, together in one place.
        </p>

        <div className="history-controls">
          <input
            type="search"
            placeholder="Search your links..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
            <option value="newest">Newest first</option>
            <option value="oldest">Oldest first</option>
            <option value="most">Most clicks</option>
            <option value="least">Least clicks</option>
          </select>

          <select
            value={filterBy}
            onChange={(e) => setFilterBy(e.target.value)}
          >
            <option value="all">All links</option>
            <option value="clicked">Clicked links</option>
          </select>
        </div>

        {historyLoading ? (
          <p className="empty-message">Loading your links...</p>
        ) : historyError ? (
          <p className="empty-message">{historyError}</p>
        ) : filteredHistory.length === 0 ? (
          <p className="empty-message">
            {history.length === 0
              ? "No links saved yet. Create your first short link!"
              : "No links match your search or filter."}
          </p>
        ) : (
          <ul className="history-list">
            {filteredHistory.map((link) => (
              <li className="history-item" key={link.id}>
                {editingId === link.id ? (
                  <div className="edit-form">
                    <input
                      type="url"
                      value={editUrl}
                      onChange={(e) => setEditUrl(e.target.value)}
                    />

                    {editError && (
                      <p className="form-message error">{editError}</p>
                    )}

                    <button onClick={() => saveEdit(link.id)} disabled={saving}>
                      {saving ? "Saving..." : "Save"}
                    </button>

                    <button onClick={() => setEditingId(null)}>Cancel</button>
                  </div>
                ) : (
                  <div>
                    <a href={link.shortURL} onClick={() => onClick(link.id)}>
                      {link.shortURL}
                    </a>
                    <div className="original">{link.originalURL}</div>
                    <div className="meta">
                      Clicks: {link.clicks || 0} | {link.createdAt}
                    </div>
                  </div>
                )}

                {editingId !== link.id && (
                  <div className="history-actions">
                    <button onClick={() => startEdit(link)}>Edit</button>
                    <button
                      className="delete-btn"
                      onClick={() => onDelete(link.id)}
                    >
                      Delete
                    </button>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}

        {!historyLoading && totalPages > 1 && (
          <div className="pagination-controls">
            <button
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage === 1}
            >
              Previous
            </button>

            <span>
              Page {currentPage} of {totalPages}
            </span>

            <button
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              Next
            </button>
          </div>
        )}
      </section>
    </main>
  );
}

function ProtectedRoute({ children }) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) return <p>Loading...</p>;

  return isAuthenticated ? children : <Navigate to="/login" replace />;
}

export default function App() {
  const { isAuthenticated, isLoading } = useAuth();
  const { validateURL } = useUrlValidation();
  const { history, setHistory, updateHistory, readHistory } = useUrlHistory();
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyError, setHistoryError] = useState("");

  useEffect(() => {
    if (isLoading) return;

    let cancelled = false;

    const loadHistory = async () => {
      if (!isAuthenticated) {
        setHistory(readHistory());
        setTotalPages(1);
        setHistoryLoading(false);
        return;
      }

      try {
        setHistoryLoading(true);
        setHistoryError("");

        const response = await api.get(`/urls?page=${currentPage}&limit=10`);

        const items = (response.data.data || []).map((link) => ({
          id: link._id,
          shortURL: link.shortUrl,
          originalURL: link.originalUrl,
          shortCode: link.shortCode,
          clicks: link.clicks || 0,
          createdAt: link.createdAt,
        }));

        if (!cancelled) {
          setHistory(items);
          setTotalPages(response.data.pagination?.totalPages || 1);
        }
      } catch (error) {
        console.error("Could not load history:", error);

        if (!cancelled) {
          setHistory([]);
          setTotalPages(1);
          setHistoryError(
            error.response?.data?.message ||
              "Unable to load your links. Please try again.",
          );
        }
      } finally {
        if (!cancelled) setHistoryLoading(false);
      }
    };

    loadHistory();

    return () => {
      cancelled = true;
    };
  }, [isAuthenticated, isLoading, currentPage]);

  const create = async (item) => {
    if (isAuthenticated) {
      try {
        const response = await api.get("/urls?page=1&limit=100");

        const items = (response.data.data || []).map((link) => ({
          id: link._id,
          shortURL: link.shortUrl,
          originalURL: link.originalUrl,
          shortCode: link.shortCode,
          clicks: link.clicks || 0,
          createdAt: new Date(link.createdAt).toLocaleDateString("en-IN"),
        }));

        setHistory(items);
      } catch (error) {
        console.error("Could not refresh history:", error);
      }
      return;
    }

    updateHistory([
      item,
      ...readHistory().filter((link) => link.shortCode !== item.shortCode),
    ]);
  };

  const remove = async (id) => {
    if (isAuthenticated) {
      const item = history.find((link) => link.id === id);
      if (!item) return;

      try {
        await api.delete(`/urls/${item.shortCode}`);
        setHistory((current) => current.filter((link) => link.id !== id));
      } catch (error) {
        console.error("Could not delete link:", error);
      }
      return;
    }

    updateHistory(readHistory().filter((link) => link.id !== id));
  };

  const countClick = (id) => {
    if (isAuthenticated) return;

    const next = history.map((link) =>
      link.id === id
        ? { ...link, clicks: (Number(link.clicks) || 0) + 1 }
        : link,
    );

    updateHistory(next);
  };

  const edit = async (id, originalUrl) => {
    const checked = validateURL(originalUrl);

    if (!checked.startsWith("http")) {
      throw new Error(checked);
    }

    const item = history.find((link) => link.id === id);
    if (!item) throw new Error("Link not found.");

    if (isAuthenticated) {
      const response = await api.put(`/urls/${item.shortCode}`, {
        originalUrl: checked,
      });

      const data = response.data.data;

      const updated = {
        ...item,
        originalURL: data.originalUrl,
        shortURL: data.shortUrl,
        clicks: data.clicks || 0,
      };

      setHistory((current) =>
        current.map((link) => (link.id === id ? updated : link)),
      );

      return updated;
    }

    const updated = { ...item, originalURL: checked };

    updateHistory(history.map((link) => (link.id === id ? updated : link)));

    return updated;
  };

  if (isLoading) return <p>Loading LinkLite...</p>;

  return (
    <>
      <Navbar />

      <Routes>
        <Route path="/" element={<Home history={history} />} />

        <Route path="/generator" element={<Generator onCreate={create} />} />

        <Route
          path="/history"
          element={
            <ProtectedRoute>
              <Outlet />
            </ProtectedRoute>
          }
        >
          <Route
            index
            element={
              <History
                history={history}
                onDelete={remove}
                onClick={countClick}
                onEdit={edit}
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
                historyLoading={historyLoading}
                historyError={historyError}
              />
            }
          />

          <Route path=":shortCode" element={<UrlDetails />} />
        </Route>

        <Route path="/login" element={<Login />} />

        <Route path="/signup" element={<Signup />} />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Home history={history} />
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}
