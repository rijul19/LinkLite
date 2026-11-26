import Brand from "./Brand";
import { CheckIcon } from "./Icons";

const POINTS = ["Track clicks in real time", "See where visitors come from", "Edit or expire any link"];

// Shared layout for login and signup.
export default function AuthShell({ title, subtitle, children, footer }) {
  return (
    <main className="au">
      <aside className="au-aside">
        <Brand />
        <div className="au-pitch">
          <h2>
            Shorten, share &amp; <span>track</span> your links.
          </h2>
          <ul>
            {POINTS.map((p) => (
              <li key={p}>
                <span className="au-tick"><CheckIcon width={14} height={14} strokeWidth={3} /></span> {p}
              </li>
            ))}
          </ul>
        </div>
      </aside>

      <section className="au-main">
        <div className="au-mobile-brand"><Brand /></div>
        <div className="au-card">
          <h1>{title}</h1>
          <p className="au-sub">{subtitle}</p>
          {children}
          <p className="au-switch">{footer}</p>
        </div>
      </section>
    </main>
  );
}