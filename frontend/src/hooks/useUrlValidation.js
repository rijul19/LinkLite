
export default function useUrlValidation() {
  const validateURL = (value) => {
    const raw = value.trim();

    if (!raw) return "Please enter a URL.";

    let parsed;

    try {
      parsed = new URL(raw);
    } catch {
      return "Please enter a valid URL, including https:// or http://.";
    }

    if (!["http:", "https:"].includes(parsed.protocol)) {
      return "Only HTTP and HTTPS URLs are allowed.";
    }

    if (
      !parsed.hostname.includes(".") ||
      parsed.hostname.startsWith(".") ||
      parsed.hostname.endsWith(".") ||
      parsed.hostname.includes("..")
    ) {
      return "Please enter a valid domain, such as example.com.";
    }

    return parsed.href;
  };

  return { validateURL };
}
