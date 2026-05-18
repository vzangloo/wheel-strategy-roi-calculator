// background.js — Wheel Strategy IBKR
// Toolbar click: show the overlay (inject if needed, always un-hide)
chrome.action.onClicked.addListener((tab) => {
  // First try to send a message to an already-injected overlay
  chrome.tabs.sendMessage(tab.id, { type: "TOGGLE_OVERLAY" }, () => {
    if (chrome.runtime.lastError) {
      // Content script not yet injected — inject it now
      chrome.scripting.insertCSS({ target: { tabId: tab.id }, files: ["overlay.css"] })
        .then(() => chrome.scripting.executeScript({ target: { tabId: tab.id }, files: ["content.js"] }))
        .catch(() => {});
    }
  });
});
