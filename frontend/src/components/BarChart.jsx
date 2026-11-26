import { peakOf } from "../utils/links";

// Dependency-free daily bar chart. Bars are real DOM nodes so they stay
// responsive, keyboard-focusable and readable by screen readers.
function dayLabel(date, long = false) {
  return new Date(`${date}T00:00:00Z`).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    ...(long ? { year: "numeric" } : {}),
    timeZone: "UTC",
  });
}

export default function BarChart({ daily }) {
  const max = Math.max(0, ...daily.map((day) => day.clicks));
  const step = max <= 4 ? 1 : Math.ceil(max / 4);
  const top = step * 4;
  const ticks = [4, 3, 2, 1, 0].map((n) => n * step);
  const peak = peakOf(daily);
  const every = Math.ceil(daily.length / 7);

  return (
    <figure className="chart">
      <div className="chart-body">
        <div className="chart-axis" aria-hidden="true">
          {ticks.map((tick) => (
            <span key={tick}>{tick}</span>
          ))}
        </div>

        <div className="chart-plot">
          <div className="chart-grid" aria-hidden="true">
            {ticks.map((tick) => (
              <i key={tick} />
            ))}
          </div>

          <div className="chart-cols" role="list" style={{ "--cols": daily.length }}>
            {daily.map((day, index) => {
              const isPeak = peak && day.date === peak.date;
              return (
                <div
                  key={day.date}
                  role="listitem"
                  tabIndex={0}
                  className={`chart-col ${isPeak ? "is-peak" : ""}`}
                  aria-label={`${dayLabel(day.date, true)}: ${day.clicks} ${day.clicks === 1 ? "click" : "clicks"}`}
                >
                  <span
                    className={`chart-bar ${day.clicks === 0 ? "is-zero" : ""}`}
                    style={{
                      height: `${(day.clicks / top) * 100}%`,
                      animationDelay: `${Math.min(index * 14, 500)}ms`,
                    }}
                  />
                  <span className="chart-tip" aria-hidden="true">
                    <span>
                      <b>{day.clicks}</b> {day.clicks === 1 ? "click" : "clicks"}
                    </span>
                    <small>{dayLabel(day.date)}</small>
                  </span>
                  {index % every === 0 && (
                    <span className="chart-label" aria-hidden="true">
                      {dayLabel(day.date)}
                    </span>
                  )}
                </div>
              );
            })}
          </div>

          {max === 0 && <p className="chart-empty">No clicks in this period yet.</p>}
        </div>
      </div>
      <figcaption className="chart-caption">Days are counted in UTC.</figcaption>
    </figure>
  );
}