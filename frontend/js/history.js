const HISTORY_KEY = "linklite_history";

function getHistory() {
    try {
        return JSON.parse(localStorage.getItem(HISTORY_KEY)) || [];
    } catch (error) {
        return [];
    }
}

function setHistory(list) {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(list));

    // Tells statistics.js that the history changed
    document.dispatchEvent(
        new CustomEvent("historyChanged", { detail: { history: list } })
    );
}

// Tishya's code calls this after creating a short link
function saveHistory(result) {
    const list = getHistory();

    // Do not save the same short code twice
    const alreadySaved = list.some(function (link) {
        return link.shortCode === result.shortCode;
    });
    if (alreadySaved) return;

    list.unshift({
        id: Date.now(),
        originalURL: result.originalURL,
        shortCode: result.shortCode,
        shortURL: result.shortURL,
        clicks: 0,
        createdAt: new Date().toLocaleDateString("en-IN", {
            day: "numeric", month: "short", year: "numeric"
        })
    });

    setHistory(list);
    renderHistory();
}

function deleteLink(id) {
    const updated = getHistory().filter(function (link) {
        return link.id !== id;
    });
    setHistory(updated);
    renderHistory();
}

function addClick(id) {
    const list = getHistory();
    const link = list.find(function (item) { return item.id === id; });
    if (!link) return 0;
    link.clicks++;
    setHistory(list);
    return link.clicks;
}

function renderHistory() {
    const historyList = document.getElementById("historyList");
    const emptyMessage = document.getElementById("emptyMessage");

    // On the generator page there is no history list, so stop here
    if (!historyList) return;

    const list = getHistory();
    historyList.replaceChildren();

    if (emptyMessage) {
        emptyMessage.style.display = list.length === 0 ? "block" : "none";
    }

    list.forEach(function (link) {
        const item = document.createElement("li");
        item.className = "history-item";

        const info = document.createElement("div");

        const shortLink = document.createElement("a");
        shortLink.href = link.originalURL;
        shortLink.target = "_blank";
        shortLink.rel = "noopener noreferrer";
        shortLink.textContent = link.shortURL;

        const original = document.createElement("div");
        original.className = "original";
        original.textContent = link.originalURL;

        const meta = document.createElement("div");
        meta.className = "meta";
        const clicksText = document.createElement("span");
        clicksText.textContent = "Clicks: " + link.clicks;
        meta.append(clicksText, " | " + link.createdAt);

        shortLink.addEventListener("click", function () {
            clicksText.textContent = "Clicks: " + addClick(link.id);
        });

        info.append(shortLink, original, meta);

        const deleteButton = document.createElement("button");
        deleteButton.type = "button";
        deleteButton.className = "delete-btn";
        deleteButton.textContent = "Delete";
        deleteButton.addEventListener("click", function () {
            deleteLink(link.id);
        });

        item.append(info, deleteButton);
        historyList.appendChild(item);
    });
}

document.addEventListener("DOMContentLoaded", renderHistory);