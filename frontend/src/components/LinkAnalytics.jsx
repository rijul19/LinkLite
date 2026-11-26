import { useEffect, useState } from "react";
import api from "../services/api";
import useRefreshOnReturn from "../hooks/useRefreshOnReturn";
import { hostOf, peakOf } from "../utils/links";
import BarChart from "./BarChart";

const RANGES = [7, 14, 30, 90];

function dayLabel(date) {
  return new Date(`${date}T00:00:00Z`).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    timeZone: "UTC",
  });
}

// Daily clicks + top referrers for one short link, straight from
// GET /urls/:code/clicks?days=N.
export default function LinkAnalytics({ shortCode, totalClicks }) {
  const [days, setDays] = useState(14);
  const key = `${shortCode}:${days}`;
  const [state, setState] = useState({ key: null, data: null, error: "" });
  const tick = useRefreshOnReturn();

  useEffect(() => {
    let cancelled = false;

    api
      .get(`/urls/${shortCode}/clicks`, { params: { days } })
      .then((response) => {
        if (!cancelled) setState({ key, data: response.data.data, error: "" });
      })
      .catch((err) => {
        if (!cancelled) {
          setState({
            key,
            data: null,
            error: err.response?.data?.message || "Unable to load click analytics.",
          });
        }
      });

    return () => {
      cancelled = true;
    };
  }, [shortCode, days, key, tick]);

  const loading = state.key !== key;
  const data = state.key === key ? state.data : null;
  const peak = data ? peakOf(data.daily) : null;
  const average = data ? (data.totalInRange / data.days).toFixed(1) : "0";
  const topCount = data?.topReferrers?.[0]?.clicks || 1;

  return (
    <section className="analytics" aria-busy={loading}>
      <div className="analytics-head">
        <h2>Click activity</h2>
        <div className="segmented" role="group" aria-label="Date range">
          {RANGES.map((range) => (
            <button
              key={range}
              type="button"
              className={range === days ? "is-active" : ""}
              aria-pressed={range === days}
              onClick={() => setDays(range)}
            >
              {range} days
            </button>
          ))}
        </div>
      </div>

      <div className="tiles tiles-4">
        <article className="tile">
          <span className="tile-label">Total clicks</span>
          <strong>{totalClicks ?? "–"}</strong>
          <span className="tile-foot">All time</span>
        </article>
        <article className="tile">
          <span className="tile-label">Last {days} days</span>
          <strong>{loading ? <i className="skeleton skeleton-num" /> : (data?.totalInRange ?? 0)}</strong>
          <span className="tile-foot">Clicks in range</span>
        </article>
        <article className="tile">
          <span className="tile-label">Daily average</span>
          <strong>{loading ? <i className="skeleton skeleton-num" /> : average}</strong>
          <span className="tile-foot">Clicks per day</span>
        </article>
        <article className="tile tile-sun">
          <span className="tile-label">Best day</span>
          <strong>{loading ? <i className="skeleton skeleton-num" /> : (peak?.clicks ?? 0)}</strong>
          <span className="tile-foot">{peak ? dayLabel(peak.date) : "No clicks yet"}</span>
        </article>
      </div>

      {state.error && !loading ? (
        <p className="notice notice-error">{state.error}</p>
      ) : (
        <div className="panel">
          <h3 className="panel-title">Clicks per day</h3>
          {loading ? <div className="skeleton skeleton-chart" /> : <BarChart daily={data.daily} />}
        </div>
      )}

      <div className="panel">
        <h3 className="panel-title">Where clicks come from</h3>
        {loading ? (
          <div className="skeleton skeleton-line" />
        ) : data?.topReferrers?.length ? (
          <ul className="referrers">
            {data.topReferrers.map((item) => (
              <li key={item.referrer}>
                <div className="referrer-row">
                  <span title={item.referrer}>
                    {item.referrer === "Direct" ? "Direct (no referrer)" : hostOf(item.referrer)}
                  </span>
                  <b>{item.clicks}</b>
                </div>
                <div className="referrer-bar">
                  <i style={{ width: `${(item.clicks / topCount) * 100}%` }} />
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="muted">
            No visits recorded for this period. Share your short link and sources will appear here.
          </p>
        )}
      </div>
    </section>
  );
}