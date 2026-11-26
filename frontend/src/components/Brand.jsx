import { Link } from "react-router-dom";

// Chain-link mark in a purple gradient.
export function LogoMark({ size = 34 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id="ll-grad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#8b5cf6" />
          <stop offset="1" stopColor="#6d28d9" />
        </linearGradient>
      </defs>
      <g fill="none" stroke="url(#ll-grad)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
        <path d="M13.5 18.5a5 5 0 0 0 7 0l4-4a5 5 0 0 0-7-7l-1.2 1.2" />
        <path d="M18.5 13.5a5 5 0 0 0-7 0l-4 4a5 5 0 0 0 7 7l1.2-1.2" />
      </g>
    </svg>
  );
}

export default function Brand({ to = "/", onClick }) {
  return (
    <Link to={to} className="brand" aria-label="LinkLite home" onClick={onClick}>
      <LogoMark />
      <span className="brand-word">
        Link<b>Lite</b>
      </span>
    </Link>
  );
}