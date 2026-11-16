function updateStatistics() {
  const history = typeof getHistory === "function" ? getHistory() : [];
  const totalLinksElement = document.getElementById("totalLinks");
  const savedLinksElement = document.getElementById("savedLinks");
  const totalClicksElement = document.getElementById("totalClicks");
  const totalLinks = history.length;
  const savedLinks = history.length;
  const totalClicks = history.reduce((sum, link) => sum + (Number(link.clicks) || 0), 0);
  if (totalLinksElement) totalLinksElement.textContent = totalLinks;
  if (savedLinksElement) savedLinksElement.textContent = savedLinks;
  if (totalClicksElement) totalClicksElement.textContent = totalClicks;
}
document.addEventListener("DOMContentLoaded", updateStatistics);
document.addEventListener("historyChanged", updateStatistics);
