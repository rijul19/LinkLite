import { useEffect, useRef, useState } from "react";
import { CheckIcon, CopyIcon } from "./Icons";

// The async Clipboard API needs a secure context (https or localhost). When it
// is unavailable, such as opening the dev server over a LAN IP on a phone, fall
// back to the older selection-based copy.
async function writeClipboard(text) {
  if (navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      return;
    } catch {
      // fall through to the legacy approach
    }
  }

  const area = document.createElement("textarea");
  area.value = text;
  area.setAttribute("readonly", "");
  area.style.cssText = "position:fixed;top:0;left:0;opacity:0";
  document.body.appendChild(area);
  area.select();
  const copied = document.execCommand("copy");
  area.remove();
  if (!copied) throw new Error("Copy failed");
}

// Copies text to the clipboard and confirms inline for a moment.
export default function CopyButton({ text, label = "Copy", variant = "ghost", iconOnly = false }) {
  const [state, setState] = useState("idle");
  const timer = useRef(null);

  useEffect(() => () => clearTimeout(timer.current), []);

  const copy = async () => {
    try {
      await writeClipboard(text);
      setState("copied");
    } catch {
      setState("failed");
    }
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setState("idle"), 1800);
  };

  const copied = state === "copied";
  const text_ = copied ? "Copied" : state === "failed" ? "Copy failed" : label;

  return (
    <button
      type="button"
      className={`btn btn-${variant} copy-btn ${copied ? "is-copied" : ""} ${iconOnly ? "btn-icon" : ""}`}
      onClick={copy}
      aria-label={iconOnly ? `${label} short link` : undefined}
      title={iconOnly ? text_ : undefined}
    >
      {copied ? <CheckIcon /> : <CopyIcon />}
      {!iconOnly && <span>{text_}</span>}
      <span className="sr-only" role="status">
        {copied ? "Link copied to clipboard" : ""}
      </span>
    </button>
  );
}