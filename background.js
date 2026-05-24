// background.js — Wheel Strategy IBKR
// Toolbar click: show the overlay (inject if needed, always un-hide)
chrome.action.onClicked.addListener((tab) => {
    // Try to send message to existing content script
    chrome.tabs.sendMessage(tab.id, {type: "TOGGLE_OVERLAY"}, (response) => {
    if (chrome.runtime.lastError) {
        // Content script not responding — inject fresh
        injectOverlay(tab.id);
    }
    });
});

function injectOverlay(tabId) {
    chrome.scripting.insertCSS({target: {tabId: tabId}, files: ["overlay.css"]})
        .then(() => chrome.scripting.executeScript({target: {tabId: tabId}, files: ["content.js"]}))
        .catch(() => {
        });
}
