import { useEffect, useState } from "react";

// Returns a number that goes up every time the user comes back to this browser
// tab. Add it to a data-loading effect's dependency list to refetch silently
// (clicks on short links happen in another tab, so the page would be stale).
export default function useRefreshOnReturn() {
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const onVisible = () => {
      if (document.visibilityState === "visible") setTick((value) => value + 1);
    };

    document.addEventListener("visibilitychange", onVisible);
    return () => document.removeEventListener("visibilitychange", onVisible);
  }, []);

  return tick;
}