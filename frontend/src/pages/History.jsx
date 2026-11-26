import { useState } from "react";
import { Link } from "react-router-dom";
import CopyButton from "../components/CopyButton";
import { ChartIcon, EditIcon, SearchIcon, TrashIcon } from "../components/Icons";
import { expiryInfo, formatDate, stripProtocol } from "../utils/links";

function SkeletonRows() {
  return (
    <div className="skeleton-rows" aria-hidden="true">
      <span className="skeleton skeleton-row skeleton-row-tall" />
      <span className="skeleton skeleton-row skeleton-row-tall" />
      <span className="skeleton skeleton-row skeleton-row-tall" />
    </div>
  );
}

export default function History({
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
  const [confirmId, setConfirmId] = useState(null);

  const startEdit = (link) => {
    setEditingId(link.id);
    setEditUrl(link.originalURL);
    setEditError("");
    setConfirmId(null);
  };

  const saveEdit = async (id) => {
    setSaving(true);
    setEditError("");

    try {
      await onEdit(id, editUrl);
      setEditingId(null);
      setEditUrl("");
    } catch (error) {
      setEditError(error.response?.data?.message || error.message || "Unable to update link.");
    } finally {
      setSaving(false);
    }
  };

  const query = search.trim().toLowerCase();

  const filteredHistory = history
    .filter((link) => {
      const matchesSearch =
        (link.shortURL || "").toLowerCase().includes(query) ||
        (link.originalURL || "").toLowerCase().includes(query);
      const matchesFilter = filterBy === "all" || (filterBy === "clicked" && Number(link.clicks) > 0);
      return matchesSearch && matchesFilter;
    })
    .sort((a, b) => {
      if (sortBy === "newest") return new Date(b.createdAt) - new Date(a.createdAt);
      if (sortBy === "oldest") return new Date(a.createdAt) - new Date(b.createdAt);
      if (sortBy === "most") return Number(b.clicks || 0) - Number(a.clicks || 0);
      if (sortBy === "least") return Number(a.clicks || 0) - Number(b.clicks || 0);
      return 0;
    });

  return (
    <main className="page">
      <header className="page-head page-head-row">
        <div>
          <h1>My links</h1>
          <p>Search, edit, copy or open analytics for any link.</p>
        </div>
        <Link to="/generator" className="btn btn-primary">
          New link
        </Link>
      </header>

      <div className="toolbar">
        <label className="search">
          <SearchIcon />
          <span className="sr-only">Search your links</span>
          <input
            type="search"
            placeholder="Search by short link or destination"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </label>

        <label className="select">
          <span className="sr-only">Sort links</span>
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
            <option value="newest">Newest first</option>
            <option value="oldest">Oldest first</option>
            <option value="most">Most clicks</option>
            <option value="least">Least clicks</option>
          </select>
        </label>

        <label className="select">
          <span className="sr-only">Filter links</span>
          <select value={filterBy} onChange={(e) => setFilterBy(e.target.value)}>
            <option value="all">All links</option>
            <option value="clicked">Clicked links</option>
          </select>
        </label>
      </div>

      {historyLoading ? (
        <SkeletonRows />
      ) : historyError ? (
        <p className="notice notice-error">{historyError}</p>
      ) : filteredHistory.length === 0 ? (
        <div className="empty empty-lg">
          <h2>{history.length === 0 ? "No links yet" : "No matches"}</h2>
          <p>
            {history.length === 0
              ? "Shorten your first link and it will show up here."
              : "Nothing on this page matches your search or filter."}
          </p>
          {history.length === 0 && (
            <Link to="/generator" className="btn btn-primary">
              Shorten a link
            </Link>
          )}
        </div>
      ) : (
        <ul className="link-list">
          {filteredHistory.map((link) => {
            const expiry = expiryInfo(link.expiresAt);
            const editing = editingId === link.id;

            return (
              <li className="link-row" key={link.id}>
                {editing ? (
                  <div className="edit-form">
                    <label htmlFor={`edit-${link.id}`}>
                      Destination for <span className="mono">{stripProtocol(link.shortURL)}</span>
                    </label>
                    <input
                      id={`edit-${link.id}`}
                      type="url"
                      value={editUrl}
                      autoFocus
                      onChange={(e) => setEditUrl(e.target.value)}
                    />
                    {editError && <p className="notice notice-error">{editError}</p>}
                    <div className="edit-actions">
                      <button className="btn btn-primary btn-sm" onClick={() => saveEdit(link.id)} disabled={saving}>
                        {saving ? "Saving" : "Save changes"}
                      </button>
                      <button className="btn btn-ghost btn-sm" onClick={() => setEditingId(null)}>
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="link-main">
                      <div className="link-short">
                        <a href={link.shortURL} className="mono" target="_blank" rel="noreferrer" onClick={() => onClick(link.id)}>
                          {stripProtocol(link.shortURL)}
                        </a>
                        {expiry && <span className={`badge badge-${expiry.tone}`}>{expiry.label}</span>}
                      </div>
                      <p className="link-original" title={link.originalURL}>
                        {link.originalURL}
                      </p>
                      <p className="link-meta">Created {formatDate(link.createdAt)}</p>
                    </div>

                    <div className="link-clicks">
                      <strong>{link.clicks || 0}</strong>
                      <span>{Number(link.clicks) === 1 ? "click" : "clicks"}</span>
                    </div>

                    {confirmId === link.id ? (
                      <div className="link-actions link-confirm" role="alert">
                        <span>Delete this link?</span>
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => {
                            setConfirmId(null);
                            onDelete(link.id);
                          }}
                        >
                          Delete
                        </button>
                        <button className="btn btn-ghost btn-sm" onClick={() => setConfirmId(null)}>
                          Keep
                        </button>
                      </div>
                    ) : (
                      <div className="link-actions">
                        <CopyButton text={link.shortURL} label="Copy" iconOnly />
                        <Link className="btn btn-ghost btn-icon" to={`/history/${link.shortCode}`} aria-label={`Analytics for ${link.shortCode}`} title="Analytics">
                          <ChartIcon />
                        </Link>
                        <button className="btn btn-ghost btn-icon" onClick={() => startEdit(link)} aria-label={`Edit ${link.shortCode}`} title="Edit">
                          <EditIcon />
                        </button>
                        <button className="btn btn-ghost btn-icon btn-danger-text" onClick={() => setConfirmId(link.id)} aria-label={`Delete ${link.shortCode}`} title="Delete">
                          <TrashIcon />
                        </button>
                      </div>
                    )}
                  </>
                )}
              </li>
            );
          })}
        </ul>
      )}

      {!historyLoading && totalPages > 1 && (
        <nav className="pagination" aria-label="Pagination">
          <button className="btn btn-ghost" onClick={() => onPageChange(currentPage - 1)} disabled={currentPage === 1}>
            Previous
          </button>
          <span>
            Page {currentPage} of {totalPages}
          </span>
          <button className="btn btn-ghost" onClick={() => onPageChange(currentPage + 1)} disabled={currentPage === totalPages}>
            Next
          </button>
        </nav>
      )}
    </main>
  );
}