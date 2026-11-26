import { useEffect, useRef, useState } from "react";
import { Routes, Route, Navigate, Outlet, useLocation } from "react-router-dom";
import useUrlHistory from "./hooks/useUrlHistory";
import useUrlValidation from "./hooks/useUrlValidation";
import api from "./services/api";
import { useAuth } from "./context/AuthContext";
import { mapLink } from "./utils/links";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Generator from "./pages/Generator";
import Dashboard from "./pages/Dashboard";
import History from "./pages/History";
import Analytics from "./pages/Analytics";
import UrlDetails from "./pages/UrlDetails";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import "./App.css";
import "./styles/original.css";
import "./styles/generator.css";
import "./styles/history.css";

function ProtectedRoute({ children }) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) return <p className="page-loading">Loading…</p>;

  return isAuthenticated ? children : <Navigate to="/login" replace />;
}

export default function App() {
  const location = useLocation();
  const { isAuthenticated, isLoading } = useAuth();
  const { validateURL } = useUrlValidation();
  const { history, setHistory, updateHistory, readHistory } = useUrlHistory();
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyError, setHistoryError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);
  const silentReload = useRef(false);

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
        if (!silentReload.current) setHistoryLoading(true);
        silentReload.current = false;
        setHistoryError("");

        const response = await api.get(`/urls?page=${currentPage}&limit=10`);

        if (!cancelled) {
          setHistory((response.data.data || []).map(mapLink));
          setTotalPages(response.data.pagination?.totalPages || 1);
        }
      } catch (error) {
        console.error("Could not load history:", error);

        if (!cancelled) {
          setHistory([]);
          setTotalPages(1);
          setHistoryError(
            error.response?.data?.message || "Unable to load your links. Please try again.",
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
    // setHistory/readHistory are recreated every render by the hook; the values
    // that should trigger a reload are listed here.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, isLoading, currentPage, reloadKey]);

  // Refresh counts when the user returns to this tab (clicks happen in another tab).
  useEffect(() => {
    if (!isAuthenticated) return;

    const refresh = () => {
      if (document.visibilityState === "visible") {
        silentReload.current = true;
        setReloadKey((key) => key + 1);
      }
    };

    document.addEventListener("visibilitychange", refresh);
    return () => document.removeEventListener("visibilitychange", refresh);
  }, [isAuthenticated]);

  const create = (item) => {
    if (isAuthenticated) {
      // Reload the first page so the new link shows up at the top.
      setCurrentPage(1);
      setReloadKey((key) => key + 1);
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
        if (history.length === 1 && currentPage > 1) {
          setCurrentPage((page) => page - 1);
        } else {
          setReloadKey((key) => key + 1);
        }
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
      link.id === id ? { ...link, clicks: (Number(link.clicks) || 0) + 1 } : link,
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

      const updated = { ...item, ...mapLink(response.data.data) };

      setHistory((current) => current.map((link) => (link.id === id ? updated : link)));

      return updated;
    }

    const updated = { ...item, originalURL: checked };

    updateHistory(history.map((link) => (link.id === id ? updated : link)));

    return updated;
  };

  if (isLoading) return <p className="page-loading">Loading LinkLite…</p>;

  const isAuthPage = ["/login", "/signup"].includes(location.pathname);

  return (
    <>
      {!isAuthPage && <Navbar />}

      {/* Keyed on the path so each page gets a short entrance transition. */}
      <div className="route" key={location.pathname}>
        <Routes location={location}>
          <Route path="/" element={<Home history={history} onCreate={create} />} />

          <Route path="/generator" element={<Generator onCreate={create} history={history} />} />

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

          <Route
            path="/analytics"
            element={
              <ProtectedRoute>
                <Analytics />
              </ProtectedRoute>
            }
          />

          <Route path="/login" element={<Login />} />

          <Route path="/signup" element={<Signup />} />

          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard onCreate={create} />
              </ProtectedRoute>
            }
          />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </>
  );
}