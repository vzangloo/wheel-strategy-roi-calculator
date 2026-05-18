# Option Wheel Strategy ROI Calculator — Chrome Extension

Instantly calculate **Sell Put / Sell Call** option ROI, manage a Wishlist, and export to CSV.

## Preview

![Extension UI Preview](images/preview.png)

---

## Features

| Feature | Detail |
|---|---|
| **Auto-scan** | Detects bid/strike/symbol from broker pages on popup open |
| **Vector UI** | High-fidelity vector icons for tabs, status banners, and action buttons |
| **Price & Premium** | Split input for **Actual Price ($)** vs. **Total Premium ($)** (Auto-synced) |
| **ROI Calculations** | Cash-secured ROI (PUT), Covered ROI (CALL) & Actual ROI |
| **DTE Hints** | Fast income (7-14d), Sweet spot (30-45d), More premium (60d+) |
| **ROI Goal** | Default 2.5% — customisable in Settings |
| **Wishlist** | Add symbols with full option details |
| **Compact Mode** | Collapse UI to focus on ROI results while maintaining status info |
| **Highlight** | Green highlight for symbols meeting ROI goal |
| **Moneyness** | Displays OTM, ATM, ITM status and trade Risk Level |
| **Export** | Download Wishlist as CSV with customisable filenames |
| **Persistent** | Settings & Wishlist saved via `chrome.storage.local` |

---

## Formulas

```
Cash-secured ROI % (PUT)  = (Bid Price ÷ Strike Price) × 100
Covered ROI % (CALL)      = (Bid Price ÷ Stock Price) × 100
Actual ROI % (PUT)        = Total Premium ÷ (Strike × Qty)
Actual ROI % (CALL)       = Total Premium ÷ (Stock Price × Qty)
Capital Required          = Strike Price × 100 × Qty
```

### Price & Premium Sync
The calculator automatically syncs the per-share price and total dollar amount:
*   **Total Premium** = Actual Price × 100 × Qty
*   **Actual Price** = Total Premium ÷ (100 × Qty)


### Moneyness Logic
| Scenario | OTM (Lower Risk) | ATM (High Risk) | ITM (Very High Risk) |
|---|---|---|---|
| **Sell Put** | Strike < Stock | Difference ≤ 0.5% | Strike > Stock |
| **Sell Call** | Strike > Stock | Difference ≤ 0.5% | Strike < Stock |

**ATM Calculation:**
`ATM Difference % = |Strike Price - Stock Price| ÷ Stock Price × 100`


---

## Installation (Supported Browsers)

This extension works out-of-the-box on **Chrome, Microsoft Edge, Brave, Opera**, and other Chromium-based browsers. 

*(Note: Safari is not directly supported without an Xcode macOS app wrapper).*

1. Open your browser's extensions page:
   - Chrome: `chrome://extensions/`
   - Edge: `edge://extensions/`
   - Brave: `brave://extensions/`
2. Enable **Developer Mode** (usually a toggle in the top-right or bottom-left)
3. Click **Load unpacked**
4. Select the `option-wheel-roi-cal/` folder
5. The extension icon will appear in your toolbar

---

## Supported Broker Pages (Auto-Scan)

- **Interactive Brokers (IBKR)** — interactivebrokers.com

---

## Usage

1. **Navigate** to an option chain on a supported broker
2. **Click** the extension icon — fields auto-fill from the page
3. **Adjust** bid, strike, premium, quantity as needed
4. **Calculate** — ROI and breakdown display instantly
5. **Add to Wishlist** — saves symbol with all details
6. **Wishlist tab** — rows with ROI ≥ goal are highlighted green
7. **Export CSV** — downloads your full Wishlist
8. **Compact Mode** — Click the "−" button to minimize the UI

---

## Settings

| Setting | Default | Description |
|---|---|---|
| Capital ($) | 10000 | Budget — warn if total capital required exceeds this |
| ROI Goal | 2.5% | Highlight rows with Cash-secured/Covered ROI ≥ this |
| IV Goal | 40% | Highlight rows with IV ≥ this |
| Auto-scan on Open | On | Scan active tab when popup opens |
| Download Filename | option_wishlist | Custom base name for CSV exports |

---

## Privacy

This extension operates **100% locally**. All option data, settings, and your Wishlist are stored locally on your machine using `chrome.storage.local`. No data is ever sent to external servers or tracked by third parties.

---

## Support & Feedback

If you encounter any bugs with the IBKR data detection, or have feature requests, please reach out to: **V. Zang, Loo** (vzangloo@7mayday.com).

---

## Recent Updates (v5.1)

- **Architectural Overhaul**: Migrated to a robust Object-Literal strategy pattern for maximum stability and performance.
- **Premium Vector UI**: Integrated vector-based icons for tabs and status indicators.
- **Custom CSV Exports**: Added ability to define custom filenames for wishlist downloads.
- **Formula Optimization**: Corrected ROI calculations for total premium accuracy.
- **Enhanced Compact Mode**: Maintained status info bar visibility even in minimized view.
- **Improved Detection**: Refined DTE detection for same-day expirations (0 days).
