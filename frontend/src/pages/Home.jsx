import { useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Footer from "../components/Footer";
import ShortenForm from "../components/ShortenForm";
import CopyButton from "../components/CopyButton";
import { BoltIcon, ChartIcon, EditIcon, LinkIcon, ShieldIcon } from "../components/Icons";
import { formatDate, stripProtocol } from "../utils/links";

const FEATURES = [
  { icon: BoltIcon, tone: "violet", title: "Super Fast", text: "Create short links in seconds." },
  { icon: ChartIcon, tone: "pink", title: "Track Performance", text: "Get real-time clicks and insights." },
  { icon: ShieldIcon, tone: "green", title: "Secure & Reliable", text: "Your links are encrypted and always accessible." },
  { icon: EditIcon, tone: "amber", title: "Manage Easily", text: "Edit, delete, and organize your links anytime." },
];

const STEPS = [
  { icon: LinkIcon, title: "Paste Your URL", text: "Add the long link you want to shorten." },
  { icon: BoltIcon, title: "Get a Short Link", text: "We create a compact, shareable link instantly." },
  { icon: ChartIcon, title: "Track & Manage", text: "Monitor clicks, view analytics, and manage all your links in one place." },
];

function DashboardMock() {
  return (
    <div className="mock" aria-hidden="true">
      <div className="mock-glow" />
      <div className="mock-card">
        <aside>
          <span className="mock-logo"><LinkIcon width={16} height={16} /> Link<b>Lite</b></span>
          <i className="on">Dashboard</i>
          <i>My Links</i>
          <i>Analytics</i>
          <i>Settings</i>
        </aside>
        <div className="mock-body">
          <div className="mock-stats">
            <div>
              <span className="mock-ico"><LinkIcon width={18} height={18} /></span>
              <small>Total Links</small>
              <b>124</b>
            </div>
            <div>
              <span className="mock-ico amber"><ChartIcon width={18} height={18} /></span>
              <small>Total Clicks</small>
              <b>8.4K</b>
            </div>
          </div>
          <svg viewBox="0 0 300 110" className="mock-chart" preserveAspectRatio="none">
            <defs>
              <linearGradient id="mg" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor="#8b5cf6" stopOpacity=".35" />
                <stop offset="1" stopColor="#8b5cf6" stopOpacity="0" />
              </linearGradient>
            </defs>
            <path d="M0 100 L40 78 L75 82 L115 56 L150 66 L195 38 L240 42 L300 8 L300 110 L0 110Z" fill="url(#mg)" />
            <path d="M0 100 L40 78 L75 82 L115 56 L150 66 L195 38 L240 42 L300 8" fill="none" stroke="#7c3aed" strokeWidth="2.5" strokeLinejoin="round" />
          </svg>
        </div>
      </div>
      <span className="mock-float"><LinkIcon width={34} height={34} /></span>
    </div>
  );
}

export default function Home({ history, onCreate }) {
  const { isAuthenticated } = useAuth();
  const { hash } = useLocation();
  const guestRecent = isAuthenticated ? [] : history.slice(0, 3);

  // Smooth-scroll to #features / #how-it-works when the navbar asks for it.
  useEffect(() => {
    if (!hash) return;
    document.getElementById(hash.slice(1))?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [hash]);

  return (
    <>
      <main className="lp">
        <section className="lp-hero">
          <div className="lp-hero-copy">
            <span className="lp-pill">
              <BoltIcon width={14} height={14} /> Fast • Secure • Analytics
            </span>
            <h1>
              Shorten, Share &amp; Track <span>Your Links</span>
            </h1>
            <p>
              Turn long, messy URLs into short, branded links. Share them anywhere and track their
              performance with real-time analytics.
            </p>

            <ShortenForm onCreate={onCreate} variant="hero" />

            {guestRecent.length > 0 && (
              <div className="guest-recent">
                <h2>Recent in this browser</h2>
                <ul>
                  {guestRecent.map((link) => (
                    <li key={link.id}>
                      <div>
                        <a href={link.shortURL} target="_blank" rel="noreferrer" className="mono">
                          {stripProtocol(link.shortURL)}
                        </a>
                        <span className="truncate">{link.originalURL}</span>
                      </div>
                      <span className="muted small">{formatDate(link.createdAt)}</span>
                      <CopyButton text={link.shortURL} label="Copy" iconOnly />
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <DashboardMock />
        </section>

        <section id="features" className="lp-features" aria-label="Features">
          {FEATURES.map(({ icon: Icon, tone, title, text }) => (
            <article key={title} className="lp-feature">
              <span className={`lp-ico ${tone}`}><Icon width={24} height={24} /></span>
              <div>
                <h3>{title}</h3>
                <p>{text}</p>
              </div>
            </article>
          ))}
        </section>

        <section id="how-it-works" className="lp-how">
          <h2>
            <i /> How <span>LinkLite</span> Works <i />
          </h2>
          <ol>
            {STEPS.map(({ icon: Icon, title, text }, n) => (
              <li key={title}>
                <span className="lp-ico violet"><Icon width={26} height={26} /></span>
                <div>
                  <span className="lp-n">{n + 1}</span>
                  <h3>{title}</h3>
                  <p>{text}</p>
                </div>
              </li>
            ))}
          </ol>

          <div className="lp-cta">
            <div>
              <h2>Ready to lighten your links?</h2>
              <p>Make your first short link in seconds. No credit card, no setup.</p>
            </div>
            <Link to={isAuthenticated ? "/dashboard" : "/signup"} className="ll-btn ll-btn-white ll-btn-lg">
              {isAuthenticated ? "Open Dashboard" : "Create Free Account"}
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}