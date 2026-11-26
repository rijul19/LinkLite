import { useEffect, useState } from "react";

const HISTORY_KEY = "linklite_history";

function readHistory() {
  try {
    return JSON.parse(localStorage.getItem(HISTORY_KEY)) || [];
  } catch {
    return [];
  }
}

export default function useUrlHistory() {
  const [history, setHistory] = useState(readHistory);

  useEffect(() => {
    const syncHistory = () => {
      setHistory(readHistory());
    };

    window.addEventListener("linklite-history-change", syncHistory);

    return () => {
      window.removeEventListener("linklite-history-change", syncHistory);
    };
  }, []);

  const updateHistory = (items) => {
    setHistory(items);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(items));
    window.dispatchEvent(new Event("linklite-history-change"));
  };

  return { history, setHistory, updateHistory, readHistory };
}
