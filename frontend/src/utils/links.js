// Shared helpers for turning API links into UI-friendly values.

export function mapLink(link) {
  return {
    id: link._id,
    shortURL: link.shortUrl,
    originalURL: link.originalUrl,
    shortCode: link.shortCode,
    clicks: link.clicks || 0,
    createdAt: link.createdAt,
    expiresAt: link.expiresAt || null,
  };
}

export function formatDate(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value || "";
  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

// "http://localhost:5000/abc1234" -> "localhost:5000/abc1234"
export function stripProtocol(url = "") {
  return url.replace(/^https?:\/\//, "");
}

export function hostOf(url = "") {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url || "Unknown";
  }
}

export const EXPIRY_OPTIONS = [
  { value: "never", label: "Never expires" },
  { value: "1", label: "In 24 hours" },
  { value: "7", label: "In 7 days" },
  { value: "30", label: "In 30 days" },
  { value: "90", label: "In 90 days" },
];

export function expiryToISO(value) {
  if (!value || value === "never") return null;
  const date = new Date();
  date.setDate(date.getDate() + Number(value));
  return date.toISOString();
}

export function expiryInfo(expiresAt) {
  if (!expiresAt) return null;
  const date = new Date(expiresAt);
  if (Number.isNaN(date.getTime())) return null;
  if (date <= new Date()) return { label: "Expired", tone: "expired" };
  const days = Math.ceil((date - new Date()) / 86400000);
  return {
    label: days <= 1 ? "Expires today" : `Expires in ${days} days`,
    tone: days <= 3 ? "soon" : "ok",
  };
}

export function greeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

// The day with the most clicks (null when there are none).
export function peakOf(daily) {
  return daily.reduce((best, day) => (day.clicks > (best?.clicks ?? 0) ? day : best), null);
}