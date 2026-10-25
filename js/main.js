function renderRecentLinks() {
  const container = document.getElementById("recentLinks");
  if (!container || typeof getHistory !== "function") return;
  const history = getHistory();
  container.replaceChildren();
  if (history.length === 0) {
    const emptyMessage = document.createElement("p");
    emptyMessage.className = "empty-recent";
    emptyMessage.textContent = "Your next useful link belongs here.";
    container.appendChild(emptyMessage);
    return;
  }
  history.slice(0, 3).forEach(function (link) {
    const card = document.createElement("article");
    card.className = "recent-link-card";
    const details = document.createElement("div");
    details.className = "recent-link-details";
    const shortLink = document.createElement("strong");
    shortLink.textContent = link.shortURL || "Demo link";
    const originalLink = document.createElement("p");
    originalLink.textContent = link.originalURL;
    const date = document.createElement("span");
    date.textContent = link.createdAt || "Saved link";
    details.append(shortLink, originalLink, date);
    const openLink = document.createElement("a");
    openLink.href = "pages/history.html";
    openLink.className = "recent-open";
    openLink.textContent = "View";
    openLink.setAttribute("aria-label", "View link history");
    card.append(details, openLink);
    container.appendChild(card);
  });
}
function resolveDemoLink() {
  const match = window.location.hash.match(/^#demo-([A-Za-z0-9]+)$/);

  if (!match || typeof getHistory !== "function") return;

  const code = match[1];

  const link = getHistory().find(item => item.shortCode === code);
  if (link && link.originalURL) window.location.replace(link.originalURL);
  else {
    const message = document.createElement("p");
    message.className = "demo-not-found";
    message.textContent = "This demo link was not found in this browser. Create it again from LinkLite.";
    const main = document.querySelector("main");
    if (main) { message.style.cssText = "margin:20px auto;padding:16px;width:min(1100px,90%);color:#874A2E;background:#eee2d9;border-radius:8px;font-size:13px"; main.prepend(message); }
  }
}
function resolveShortLink() {
  const shortCode = window.location.hash.startsWith("#demo-")
    ? window.location.hash.slice(6)
    : null;

  if (!shortCode || typeof getHistory !== "function") return;

  const history = getHistory();

  const matchingLink = history.find(
    link => link.shortCode === shortCode
  );

  if (matchingLink && matchingLink.originalURL) {
    window.location.replace(matchingLink.originalURL);
  }
}

document.addEventListener("DOMContentLoaded", function () {
  const form = document.getElementById("urlForm");
  const input = document.getElementById("originalUrl");
  const message = document.getElementById("formMessage");

  if (!form || !input) return;

  form.addEventListener("submit", function (event) {
    event.preventDefault();

    const url = input.value.trim();

    if (!url) return;

    // Send the URL through the existing validation logic.
    const generatorForm = document.getElementById("generatorForm");

    if (generatorForm) {
      const generatorInput = document.getElementById("urlInput");

      if (generatorInput) {
        generatorInput.value = url;
        generatorForm.requestSubmit();
        return;
      }
    }

    // If validation exposes a reusable function, connect it here.
    if (message) {
      message.textContent =
        "Please use Get Started to generate this link.";
    }
  });
});

document.addEventListener("DOMContentLoaded", resolveShortLink);
document.addEventListener("DOMContentLoaded", function () { renderRecentLinks(); resolveDemoLink(); });
document.addEventListener("historyChanged", renderRecentLinks);
