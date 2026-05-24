/**
 * Wheel Strategy ROI Calculator — IBKR Edition
 * content.js v5.1 (Refactored to Classes)
 */
(function () {
  "use strict";

  // Clean up any orphaned overlay from a previous extension load
  const orphan = document.getElementById("__option-roi-root__");
  if (orphan) orphan.remove();
  const orphanToast = document.getElementById("__option-roi-toast__");
  if (orphanToast) orphanToast.remove();

  // ── Selectors ───────────────────────────────────────────────────────────
  const SEL = {
    symbol: "#cp-ib-app-main-content > div._col.flex.grow.border-start > section > div > div.quote.numeric.insetx-16.after-16.quote-v.before-16 > div > div.quote-symprice > div.flex-fixed > h1 > div.quote-symbol > div",
    stockPrice: "#cp-ib-app-main-content > div._col.flex.grow.border-start > section > div > div.quote.numeric.insetx-16.after-16.quote-v.before-16 > div > div.quote-symprice > div.quote-price.text-semibold.lh-sm.fs2 > span:nth-child(1)",
    bidPut: "#optLblCon > div.opt-lbl-body.numeric > div.opt-lbl-puts > div:nth-child(1) > div.opt-lbl-col-body.border-top.border-bottom > div.isSell.isBidAsk.bg-sell.opt-text-bold > div:nth-child(1)",
    bidCall: "#optLblCon > div.opt-lbl-body.numeric > div.opt-lbl-calls > div:nth-child(1) > div.opt-lbl-col-body.border-top.border-bottom > div.isSell.isBidAsk.bg-sell.opt-text-bold > div:nth-child(1)",
    askPricePut: "#optLblCon > div.opt-lbl-body.numeric > div.opt-lbl-puts > div:nth-child(2) > div.opt-lbl-col-body.border-top.border-bottom > div.isBuy.isBidAsk.bg15-sell.border-sell > div:nth-child(1)",
    askPriceCall: "#optLblCon > div.opt-lbl-body.numeric > div.opt-lbl-calls > div:nth-child(2) > div.opt-lbl-col-body.border-top.border-bottom > div.isBuy.isBidAsk.bg15-sell.border-sell > div:nth-child(1)",
    strikePut: "#optLblCon > div.opt-lbl-body.numeric > div.opt-lbl-strikes.bg-gray10.fs7.text-medium > div > div.opt-bg-put-sell.border-sell.border-start",
    strikeCall: "#optLblCon > div.opt-lbl-body.numeric > div.opt-lbl-strikes.bg-gray10.fs7.text-medium > div > div.opt-bg-call-sell.border-sell.border-end",
    premium: "#orderTicketSellTabPanel > div > div.order-ticket__sidebar > div:nth-child(1) > div > div:nth-child(2) > div > table tr:nth-child(3) > td.numeric.ellipsis",
    iv: "#cp-ib-app-main-content > div:nth-child(1) > div > div:nth-child(2) > div.option-wrapper > section > div > div.ib-row.grow.opt-lbl > div > div.ib-row.opt-lbl-top.fs8.text-center.bg-gray10 > div.bg-gray20.opt-lbl-capt > div.opt-lbl-strike-head.bg-gray20.fg70.fs8.uppercase.insety-4",
    dte: "#cp-ib-app-main-content > div:nth-child(1) > div > div:nth-child(2) > div.option-wrapper > section > div > div.fixed-flex.middle.border-bottom.border-top > div:nth-child(2) > div > div > div > div._ovfm > a._tab.text-center.opt-exp-select__item.insety-4.insetx-0.outsetx-4._taba > div:nth-child(1) > button > div",
    limitQty: ".order-ticket__sidebar--field input[name='quantity']",
  };

  // ── Utils ───────────────────────────────────────────────────────────────
  class Utils {
    static qs(sel) { try { return document.querySelector(sel); } catch (_) { return null; } }
    static txt(el) { return el ? (el.textContent || el.value || "").trim() : null; }
    static nEl(el) { const r = this.txt(el); if (!r) return null; const n = parseFloat(r.replace(/[^0-9.\-]/g, "")); return isNaN(n) ? null : n; }
    static safe(v) { const n = parseFloat(v); return (isNaN(n) || v == null) ? 0 : n; }
    static esc(s) { return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;"); }
    static fmt$(n) { return n == null || isNaN(n) ? "—" : "$" + n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }); }
    static pct(n) { return n == null || isNaN(n) ? "—" : n.toFixed(2) + "%"; }
    static dtStamp() {
      const d = new Date(), p = n => String(n).padStart(2, "0");
      return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}-${p(d.getHours())}${p(d.getMinutes())}${p(d.getSeconds())}`;
    }
  }

  const createStrategy = (type, label, formula, roi2Sub, calcFn, moneyFn) => ({
    type, label, formula, roi2Sub,
    calculate: calcFn,
    getMoneyness: (strike, stockPrice) => {
      if (!strike || !stockPrice) return { status: "—", risk: "", cls: "" };
      const diffPct = Math.abs(strike - stockPrice) / stockPrice;
      if (diffPct <= 0.005) return { status: "ATM", risk: "High Risk", cls: "atm" };
      return moneyFn(strike, stockPrice);
    }
  });

  const strategies = {
    PUT: createStrategy("PUT", "Cash-secured ROI", "bid ÷ strike × 100", "prem ÷ strike",
      (bid, strike, premium, qty, stockPrice) => {
        if (!strike || strike <= 0) return { roi1: 0, roi2: 0, cap: 0 };
        return { roi1: (bid / strike) * 100, roi2: premium / (strike * qty), cap: strike * 100 * qty, qty };
      },
      (strike, stockPrice) => (strike < stockPrice ? { status: "OTM", risk: "Lower Risk", cls: "otm" } : { status: "ITM", risk: "Very High Risk", cls: "itm" })
    ),
    CALL: createStrategy("CALL", "Covered ROI", "bid ÷ stock × 100", "prem ÷ stock",
      (bid, strike, premium, qty, stockPrice) => {
        const sp = stockPrice > 0 ? stockPrice : 0;
        if (!sp || sp <= 0) return { roi1: 0, roi2: 0, cap: 0 };
        return { roi1: (bid / sp) * 100, roi2: premium / (sp * qty), cap: strike * 100 * qty, qty };
      },
      (strike, stockPrice) => (strike > stockPrice ? { status: "OTM", risk: "Lower Risk", cls: "otm" } : { status: "ITM", risk: "Very High Risk", cls: "itm" })
    )
  };

  // ── Settings & State ─────────────────────────────────────────────────────
  class Settings {
    constructor() {
      this.roiGoal = 2.5;
      this.ivGoal = 40;
      this.capital = 10000;
      this.autoScan = true;
      this.optionType = "PUT";
      this.theme = "dark";
      this.etf = "No";
      this.wishlist = [];
      this.pos = { x: null, y: null };
      this.lastValues = { symbol: "", bid: "", strike: "", premium: "0", price: "0", qty: "1", dte: "", stockPrice: "", iv: "", askPrice: "" };
      this.isClosed = false;
      this.isMinimized = false;
      this.csvName = "option_wishlist";
    }

    async load() {
      return new Promise(resolve => {
        if (!this.isContextValid()) { resolve(); return; }
        chrome.storage.local.get(["wsCalcV5", "wsCalcClosed", "wsCalcMin"], res => {
          this.isClosed = !!res.wsCalcClosed;
          this.isMinimized = !!res.wsCalcMin;
          if (res.wsCalcV5) Object.assign(this, res.wsCalcV5);
          resolve();
        });
      });
    }

    persist() {
      if (!this.isContextValid()) return;
      if (this._persistTimer) clearTimeout(this._persistTimer);
      this._persistTimer = setTimeout(() => {
        chrome.storage.local.set({
          wsCalcV5: {
            roiGoal: this.roiGoal, ivGoal: this.ivGoal, capital: this.capital,
            autoScan: this.autoScan, optionType: this.optionType, theme: this.theme, etf: this.etf,
            wishlist: this.wishlist, pos: this.pos, lastValues: this.lastValues,
            csvName: this.csvName, width: this.width,
          }
        });
      }, 500);
    }

    setMinimized(min) {
      this.isMinimized = min;
      if (!this.isContextValid()) return;
      if (min) chrome.storage.local.set({ wsCalcMin: true });
      else chrome.storage.local.remove("wsCalcMin");
    }

    setClosed(closed) {
      this.isClosed = closed;
      if (!this.isContextValid()) return;
      if (closed) chrome.storage.local.set({ wsCalcClosed: true });
      else chrome.storage.local.remove("wsCalcClosed");
    }

    isContextValid() {
      try { return !!(chrome && chrome.runtime && chrome.runtime.id); } catch (e) { return false; }
    }
  }

  // ── Application ─────────────────────────────────────────────────────────
  class OptionWheelApp {
    constructor() {
      this.settings = new Settings();
      this.strategies = strategies;
      this.root = null;
      this.toast = null;
      this.lastCalc = null;
      this._pollIntervals = [];
      this._mutationObserver = null;
    }

    async boot() {
      const existing = document.getElementById("__option-roi-root__");
      if (existing) { existing.classList.remove("oi-hidden"); return; }

      await this.settings.load();
      // Always show on boot — script is only injected via icon click
      this.settings.isClosed = false;
      this.settings.setClosed(false);

      this.inject();
      this.setupObservers();
      this.setupPollers();
      this.setupMessaging();
    }

    inject() {
      this.root = document.createElement("div");
      this.root.id = "__option-roi-root__";
      if (this.settings.theme === "light") this.root.classList.add("oi-light");
      if (this.settings.isMinimized) this.root.classList.add("oi-minimized");
      this.root.innerHTML = this.buildHTML();
      if (this.settings.pos.x != null) {
        this.root.style.cssText += `left:${this.settings.pos.x}px!important;top:${this.settings.pos.y}px!important;right:auto!important;`;
      }
      document.documentElement.appendChild(this.root);

      this.toast = document.createElement("div");
      this.toast.id = "__option-roi-toast__";
      document.documentElement.appendChild(this.toast);

      this.wire();
      this.restoreValues();
      this.renderSettings();
      this.renderWl();
      this.updateCnt();
      this.updateThemeBtn();
      this.updateMinBtn();

      if (this.settings.autoScan) {
        setTimeout(() => this.applyScannedData(this.scanPage()), 200);
      }
    }

    buildHTML() {
      return `
<div class="oi-header" id="oi-drag-handle">
  <div class="oi-logo">$</div>
  <div class="oi-title"><h1>Wheel Strategy</h1><p>IBKR · Sell Put / Sell Call ROI</p></div>
  <div class="oi-hctrl">
    <button class="oi-theme-btn" id="oiThemeBtn" title="Toggle light/dark theme">🌙</button>
    <button class="oi-min-btn" id="oiMinBtn" title="Minimize/Expand">−</button>
    <button class="oi-xbtn" id="oiClose" title="Hide">✕</button>
  </div>
</div>
<div class="oi-tabs">
  <button class="oi-tab oi-tab-calc active" data-tab="calc">Calculator</button>
  <button class="oi-tab oi-tab-wl" data-tab="wl">Wishlist<span class="oi-wl-cnt" id="oiWlCnt"></span></button>
  <button class="oi-tab oi-tab-cfg" data-tab="cfg">Settings</button>
</div>
<div class="oi-panel active" id="oi-tab-calc">
  <div class="oi-infobar oi-hidden" id="oiBanner">
    <span id="oiBannerMsg">Ready</span>
  </div>
  <div class="oi-grid">
    <div class="oi-field oi-field-pair">
      <div class="oi-pair">
        <div class="oi-pair-item">
          <label class="oi-lbl">Symbol</label>
          <input class="oi-inp" type="text" id="oiSymbol" placeholder="" maxlength="8" autocomplete="off"/>
        </div>
        <div class="oi-pair-item">
          <label class="oi-lbl">ETF</label>
          <div class="oi-toggle">
            <button class="oi-tog-etf active" data-etf="No">No</button>
            <button class="oi-tog-etf" data-etf="Yes">Yes</button>
          </div>
        </div>
      </div>
    </div>
    <div class="oi-field">
      <label class="oi-lbl">Stock Price ($)</label>
      <input class="oi-inp" type="number" id="oiStockPrice" placeholder="0.00" step="0.01" min="0"/>
    </div>
    <div class="oi-field">
      <label class="oi-lbl">Option Type</label>
      <div class="oi-toggle">
        <button class="oi-tog active" data-type="PUT">Sell Put</button>
        <button class="oi-tog" data-type="CALL">Sell Call</button>
      </div>
    </div>
    <div class="oi-field">
      <label class="oi-lbl">Implied Volatility (%)</label>
      <input class="oi-inp" type="number" id="oiIV" placeholder="0.00" step="0.1" min="0"/>
    </div>
    <div class="oi-field oi-field-pair">
      <div class="oi-pair">
        <div class="oi-pair-item">
          <label class="oi-lbl">Bid ($)</label>
          <input class="oi-inp" type="number" id="oiBid" placeholder="0.00" step="0.01" min="0"/>
        </div>
        <div class="oi-pair-item">
          <label class="oi-lbl">Ask ($)</label>
          <input class="oi-inp" type="number" id="oiAskPrice" placeholder="0.00" step="0.01" min="0"/>
        </div>
      </div>
    </div>
    <div class="oi-field oi-field-pair">
      <div class="oi-pair">
        <div class="oi-pair-item">
          <label class="oi-lbl">Mid ($)</label>
          <div class="oi-mid-value" id="oiMidPrice">0.00</div>
        </div>
        <div class="oi-pair-item">
          <label class="oi-lbl" style="color:var(--accent);">Strike Price ($)</label>
          <input class="oi-inp oi-strike-inp" type="number" id="oiStrike" placeholder="0.00" step="0.5" min="0"/>
        </div>
      </div>
    </div>
    <div class="oi-field oi-field-pair">
      <div class="oi-pair">
        <div class="oi-pair-item">
          <label class="oi-lbl">DTE <span id="oiDteHint" style="color:var(--accent);text-transform:none;margin-left:2px;"></span></label>
          <input class="oi-inp" type="number" id="oiDte" placeholder="0" step="1" min="0"/>
        </div>
        <div class="oi-pair-item">
          <label class="oi-lbl">Quantity</label>
          <input class="oi-inp" type="number" id="oiQty" placeholder="1" step="1" min="1" value="1"/>
        </div>
      </div>
    </div>
    <div class="oi-field oi-field-pair">
      <div class="oi-pair">
        <div class="oi-pair-item">
          <label class="oi-lbl" style="color:var(--gold);">Sell Price ($)</label>
          <input class="oi-inp" type="number" id="oiPrice" placeholder="0.00" step="0.01" min="0"/>
        </div>
        <div class="oi-pair-item">
          <label class="oi-lbl" style="color:var(--gold);">Premium ($)</label>
          <input class="oi-inp oi-premium-inp" type="number" id="oiPremium" placeholder="0" step="0.01" min="0" value="0"/>
        </div>
      </div>
    </div>
  </div>
  <div class="oi-result">
    <div class="oi-roi-cols">
      <div class="oi-roi-block">
        <div class="oi-roi-num" id="oiRoi1">—</div>
        <div class="oi-roi-lbl" id="oiRoi1Lbl">Cash-secured ROI</div>
        <div class="oi-roi-sub" id="oiRoi1Sub">bid ÷ strike ×100</div>
      </div>
      <div class="oi-roi-divider"></div>
      <div class="oi-roi-block">
        <div class="oi-roi-num oi-roi2" id="oiRoi2">—</div>
        <div class="oi-roi-lbl" id="oiRoi2Lbl">Sell ROI</div>
        <div class="oi-roi-sub" id="oiRoi2Sub">prem ÷ strike</div>
      </div>
    </div>
    <div class="oi-result-rows">
      <div class="oi-rrow"><span class="oi-rk">ROI Goals</span><div class="oi-goals" style="display:flex;gap:4px;flex-wrap:wrap;justify-content:flex-end;"><span class="oi-goal" id="oiGoalInd"></span><span class="oi-goal" id="oiGoalInd2"></span></div></div>
      <div class="oi-rrow"><span class="oi-rk">IV Goal</span><span class="oi-iv-goal-ind" id="oiIvGoalInd"></span></div>
      <div class="oi-rrow"><span class="oi-rk">Moneyness</span><span id="oiMoneyStatus" class="oi-money-badge">—</span></div>
      <div class="oi-rrow"><span class="oi-rk">Spread %</span><span id="oiSpreadInd" class="oi-money-badge">—</span></div>
      <div class="oi-rrow"><span class="oi-rk" id="oiCapLbl">Capital Required</span><span class="oi-rv" id="oiCap">—</span></div>
    </div>
  </div>
  <div class="oi-actions">
    <button class="oi-btn oi-btn-primary" id="oiCalc">Calculate</button>
    <button class="oi-btn oi-btn-success" id="oiAdd">Wishlist</button>
    <button class="oi-btn" id="oiScan">Scan</button>
  </div>
</div>
<div class="oi-panel" id="oi-tab-wl">
  <div class="oi-wl-hdr">
    <h2 class="oi-wl-title">Wishlist <span id="oiWlHdrCnt" style="color:var(--accent);"></span></h2>
    <div class="oi-exp-row">
      <button class="oi-exp-btn" id="oiCsv">CSV</button>
      <button class="oi-exp-btn oi-exp-danger" id="oiClearWl">Clear All</button>
    </div>
  </div>
  <div class="oi-cap-warning" id="oiCapWarn">
    <span class="oi-cap-warning-icon">⚠️</span>
    <span class="oi-cap-warning-txt" id="oiCapWarnTxt">Total Capital required exceeds budget</span>
  </div>
  <div id="oiWlBody"></div>
  <div class="oi-cap-bar">
    <span class="oi-cap-bar-lbl">Capital:</span>
    <span class="oi-cap-bar-val" id="oiCapTotal">—</span>
    <span class="oi-cap-bar-lbl" style="margin-left:12px!important;">Premium:</span>
    <span class="oi-cap-bar-val" id="oiPremTotal">—</span>
    <span class="oi-cap-bar-lbl" style="margin-left:12px!important;">ROI:</span>
    <span class="oi-cap-bar-val" id="oiTotalRoi">—</span>
    <span class="oi-cap-bar-hint" id="oiCapHint">(tick rows)</span>
  </div>
  <div class="oi-legend">
    <div class="oi-legend-item"><div class="oi-legend-dot gold"></div>ROI &amp; IV goals met</div>
    <div class="oi-legend-item"><div class="oi-legend-dot green"></div>ROI goal only</div>
    <div class="oi-legend-item"><div class="oi-legend-dot purple"></div>IV goal only</div>
  </div>
</div>
<div class="oi-panel" id="oi-tab-cfg">
  <div class="oi-cfg-row">
    <div><div class="oi-cfg-lbl">Capital ($)</div><div class="oi-cfg-sub">Budget — warn if total capital required exceeds this</div></div>
    <div class="oi-cfg-ctrl"><div class="oi-inp-wrap"><span>$</span><input class="oi-inp" type="number" id="oiCapCfg" step="1000" min="0"/></div></div>
  </div>
  <div class="oi-cfg-row">
    <div><div class="oi-cfg-lbl">ROI Goal</div><div class="oi-cfg-sub">Highlight rows with Cash-secured ROI ≥ this</div></div>
    <div class="oi-cfg-ctrl"><div class="oi-inp-wrap"><input class="oi-inp" type="number" id="oiGoalCfg" step="0.1" min="0" max="100"/><span>%</span></div></div>
  </div>
  <div class="oi-cfg-row">
    <div><div class="oi-cfg-lbl">IV Goal</div><div class="oi-cfg-sub">Highlight rows with IV ≥ this</div></div>
    <div class="oi-cfg-ctrl"><div class="oi-inp-wrap"><input class="oi-inp" type="number" id="oiIvGoalCfg" step="1" min="0" max="500"/><span>%</span></div></div>
  </div>
  <div class="oi-cfg-row">
    <div><div class="oi-cfg-lbl">Auto-scan</div><div class="oi-cfg-sub">Automatically detect IBKR data. Disable to use Scan button only.</div></div>
    <div class="oi-cfg-ctrl"><label class="oi-chk-lbl"><input class="oi-chk" type="checkbox" id="oiAutoScan"/> Enabled</label></div>
  </div>
  <div class="oi-cfg-row">
    <div><div class="oi-cfg-lbl">Download Filename</div><div class="oi-cfg-sub">Base name for CSV exports</div></div>
    <div class="oi-cfg-ctrl"><div class="oi-inp-wrap"><input class="oi-inp oi-inp-wide" type="text" id="oiCsvNameCfg" placeholder="option_wishlist" maxlength="32"/></div></div>
  </div>
  <div class="oi-cfg-row">
    <div><div class="oi-cfg-lbl">Author</div><div class="oi-cfg-sub">Questions or feedback?</div></div>
    <div class="oi-cfg-ctrl" style="display:flex!important;flex-direction:column!important;align-items:flex-end!important;gap:2px!important;">
      <div style="font-size:12px;font-weight:600;color:var(--text);">V. Zang, Loo</div>
      <a href="mailto:vzangloo@7mayday.com" style="color:var(--accent)!important;text-decoration:underline!important;text-underline-offset:2px!important;font-size:11px!important;font-family:var(--mono)!important;">vzangloo@7mayday.com</a>
    </div>
  </div>
  <div class="oi-cfg-row">
    <div><div class="oi-cfg-lbl">Version</div></div>
    <div class="oi-cfg-ctrl" style="color:var(--muted);font-family:'IBM Plex Mono',monospace;font-size:11px;" id="oiVersion">IBKR Wheel</div>
  </div>
  <div class="oi-formula-note">
    <h3>Formulas</h3>
    <div class="oi-formula-row"><span class="oi-formula-key">Cash-secured ROI (PUT)</span><span class="oi-formula-val">bid ÷ strike × 100 (%)</span></div>
    <div class="oi-formula-row"><span class="oi-formula-key">Covered ROI (CALL)</span><span class="oi-formula-val">bid ÷ stock × 100 (%)</span></div>
    <div class="oi-formula-row"><span class="oi-formula-key">Sell ROI (PUT)</span><span class="oi-formula-val">premium ÷ (strike × qty) (%)</span></div>
    <div class="oi-formula-row"><span class="oi-formula-key">Sell ROI (CALL)</span><span class="oi-formula-val">premium ÷ (stock × qty) (%)</span></div>
    <div class="oi-formula-row"><span class="oi-formula-key">Capital Required</span><span class="oi-formula-val">strike × 100 × qty</span></div>
  </div>
</div>`;
    }

    g(id) { return this.root.querySelector("#" + id); }

    showToast(msg, type = "") {
      if (!this.toast) return;
      this.toast.textContent = msg;
      this.toast.className = "show " + (type || "");
      if (this._toastT) clearTimeout(this._toastT);
      this._toastT = setTimeout(() => { this.toast.className = ""; }, 2400);
    }

    wire() {
      // ── Dragging ────────────────────────────────────────────────────────
      const handle = this.g("oi-drag-handle");
      let dragging = false, ox = 0, oy = 0;
      const startDrag = (cx, cy) => { dragging = true; const r = this.root.getBoundingClientRect(); ox = cx - r.left; oy = cy - r.top; this.root.style.transition = "none"; };
      const moveDrag = (cx, cy) => { if (!dragging) return; const nx = Math.max(0, Math.min(cx - ox, window.innerWidth - this.root.offsetWidth)), ny = Math.max(0, Math.min(cy - oy, window.innerHeight - this.root.offsetHeight)); this.root.style.cssText += `left:${nx}px!important;top:${ny}px!important;right:auto!important;`; };
      const endDrag = () => { if (!dragging) return; dragging = false; this.root.style.transition = ""; const r = this.root.getBoundingClientRect(); this.settings.pos = { x: Math.round(r.left), y: Math.round(r.top) }; this.settings.persist(); };

      handle.addEventListener("mousedown", e => { if (e.target.closest(".oi-xbtn,.oi-theme-btn,.oi-min-btn")) return; startDrag(e.clientX, e.clientY); e.preventDefault(); });

      const resPanel = this.root.querySelector(".oi-result");
      resPanel.addEventListener("mousedown", e => {
        if (!this.root.classList.contains("oi-minimized")) return;
        if (e.target.closest("button, input, a")) return;
        startDrag(e.clientX, e.clientY);
        e.preventDefault();
      });

      document.addEventListener("mousemove", e => moveDrag(e.clientX, e.clientY));
      document.addEventListener("mouseup", endDrag);

      handle.addEventListener("touchstart", e => {
        if (e.target.closest(".oi-xbtn,.oi-theme-btn,.oi-min-btn")) return;
        startDrag(e.touches[0].clientX, e.touches[0].clientY);
        e.preventDefault();
      }, { passive: false });

      resPanel.addEventListener("touchstart", e => {
        if (!this.root.classList.contains("oi-minimized")) return;
        if (e.target.closest("button, input, a")) return;
        startDrag(e.touches[0].clientX, e.touches[0].clientY);
        e.preventDefault();
      }, { passive: false });

      document.addEventListener("touchmove", e => { if (dragging) { moveDrag(e.touches[0].clientX, e.touches[0].clientY); e.preventDefault(); } }, { passive: false });
      document.addEventListener("touchend", endDrag);

      // ── Header Controls ────────────────────────────────────────────────
      this.g("oiClose").addEventListener("click", () => {
        this.settings.setClosed(true);
        if (this.toast) { this.toast.remove(); this.toast = null; }
        this.root.remove();
        this.root = null;
        this._pollIntervals.forEach(id => clearInterval(id));
        this._pollIntervals = [];
        if (this._mutationObserver) { this._mutationObserver.disconnect(); this._mutationObserver = null; }
      });

      this.g("oiThemeBtn").addEventListener("click", () => {
        this.settings.theme = this.settings.theme === "dark" ? "light" : "dark";
        this.root.classList.toggle("oi-light", this.settings.theme === "light");
        this.updateThemeBtn();
        this.settings.persist();
      });

      this.g("oiMinBtn").addEventListener("click", () => {
        const min = !this.root.classList.contains("oi-minimized");
        this.root.classList.toggle("oi-minimized", min);
        this.settings.setMinimized(min);
        this.updateMinBtn();
      });

      // ── Tabs ───────────────────────────────────────────────────────────
      this.root.querySelectorAll(".oi-tab").forEach(btn => btn.addEventListener("click", () => {
        this.root.querySelectorAll(".oi-tab").forEach(b => b.classList.remove("active"));
        this.root.querySelectorAll(".oi-panel").forEach(p => p.classList.remove("active"));
        btn.classList.add("active");
        this.root.querySelector("#oi-tab-" + btn.dataset.tab).classList.add("active");
      }));

      // ── Toggles ────────────────────────────────────────────────────────
      this.root.querySelectorAll(".oi-tog").forEach(btn => btn.addEventListener("click", () => {
        this.root.querySelectorAll(".oi-tog").forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        this.settings.optionType = btn.dataset.type;
        this.saveValues();
        this.calculate();
      }));

      this.root.querySelectorAll(".oi-tog-etf").forEach(btn => btn.addEventListener("click", () => {
        this.root.querySelectorAll(".oi-tog-etf").forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        this.settings.etf = btn.dataset.etf;
        this.settings.persist();
      }));

      // ── Inputs & Calculation ───────────────────────────────────────────
      this.g("oiCalc").addEventListener("click", () => this.calculate());

      const liveInputs = ["oiQty", "oiDte", "oiIV", "oiStockPrice", "oiAskPrice", "oiBid", "oiStrike", "oiSymbol"];
      liveInputs.forEach(id => this.g(id).addEventListener("input", () => {
        if (id === "oiBid" || id === "oiStrike") {
          // Reset premium/price if bid/strike change manually
          this.g("oiPremium").value = "0.00";
          this.g("oiPrice").value = "0.00";
        }
        if (id === "oiBid" || id === "oiAskPrice") {
          this.updateMidPrice();
        }
        this.saveValues();
        this.calculate();
      }));

      this.g("oiPrice").addEventListener("input", () => {
        const price = Utils.safe(this.g("oiPrice").value);
        const qty = Math.max(1, parseInt(this.g("oiQty").value) || 1);
        this.g("oiPremium").value = (price * 100 * qty).toFixed(2);
        this.saveValues();
        this.calculate();
      });

      this.g("oiPremium").addEventListener("input", () => {
        const prem = Utils.safe(this.g("oiPremium").value);
        const qty = Math.max(1, parseInt(this.g("oiQty").value) || 1);
        this.g("oiPrice").value = (prem / (100 * qty)).toFixed(2);
        this.saveValues();
        this.calculate();
      });

      // ── Actions ────────────────────────────────────────────────────────
      this.g("oiAdd").addEventListener("click", () => this.addToWishlist());
      this.g("oiScan").addEventListener("click", () => {
        const d = this.scanPage();
        this.applyScannedData(d);
        this.showToast(d.detected ? "IBKR data detected" : "Scan done", d.detected ? "success" : "");
      });

      this.g("oiCsv").addEventListener("click", () => this.exportCsv());

      // ── Clear Wishlist ─────────────────────────────────────────────────
      let clearPending = false, clearT = null;
      this.g("oiClearWl").addEventListener("click", () => {
        if (!this.settings.wishlist.length) return;
        const btn = this.g("oiClearWl");
        if (!clearPending) {
          clearPending = true;
          btn.textContent = "Confirm?";
          btn.classList.add("confirm");
          btn.style.cssText += "background:rgba(248,81,73,.2)!important;border-color:var(--warn)!important;color:var(--warn)!important;";
          clearT = setTimeout(() => {
            clearPending = false;
            btn.textContent = "Clear All";
            btn.classList.remove("confirm");
            btn.style.cssText = "";
          }, 3000);
        } else {
          clearTimeout(clearT); clearPending = false;
          btn.textContent = "Clear All";
          btn.classList.remove("confirm");
          btn.style.cssText = "";
          this.settings.wishlist = [];
          this.settings.persist(); this.renderWl(); this.updateCnt(); this.showToast("Wishlist cleared", "success");
        }
      });

      // ── Wishlist Events (Delegation) ───────────────────────────────────
      const wlBody = this.root.querySelector("#oiWlBody");
      wlBody.addEventListener("change", e => {
        if (e.target.dataset.chk) {
          const entry = this.settings.wishlist.find(x => x.id === +e.target.dataset.chk);
          if (entry) entry.selected = e.target.checked;
          this.settings.persist();
          this.updateCapBar();
          const chkAll = this.root.querySelector("[data-chkall]");
          if (chkAll) chkAll.checked = this.settings.wishlist.length > 0 && this.settings.wishlist.every(x => x.selected);
        } else if (e.target.dataset.chkall) {
          const checked = e.target.checked;
          this.settings.wishlist.forEach(x => x.selected = checked);
          this.settings.persist(); this.renderWl(); this.updateCnt();
        }
      });

      let rmPendingId = null, rmTimer = null;
      wlBody.addEventListener("click", e => {
        const rmBtn = e.target.closest("[data-rm]");
        if (rmBtn) {
          const id = +rmBtn.dataset.rm;
          if (rmPendingId === id) {
            // Second click — confirmed, delete
            clearTimeout(rmTimer); rmPendingId = null;
            this.settings.wishlist = this.settings.wishlist.filter(x => x.id !== id);
            this.settings.persist(); this.renderWl(); this.updateCnt(); this.showToast("Removed", "");
          } else {
            // First click — show confirm state
            if (rmPendingId != null) {
              const prevBtn = wlBody.querySelector(`[data-rm="${rmPendingId}"]`);
              if (prevBtn) { prevBtn.classList.remove("oi-rm-confirm"); prevBtn.textContent = ""; }
              clearTimeout(rmTimer);
            }
            rmPendingId = id;
            rmBtn.classList.add("oi-rm-confirm");
            rmBtn.textContent = "Confirm?";
            rmTimer = setTimeout(() => {
              rmBtn.classList.remove("oi-rm-confirm");
              rmBtn.textContent = "";
              rmPendingId = null;
            }, 3000);
          }
        }
      });

      // ── Wishlist Drag-to-Scroll ────────────────────────────────────────
      let wlDrag = false, sx = 0, sy = 0, sl = 0, st = 0;
      wlBody.addEventListener("mousedown", e => {
        const wrap = wlBody.querySelector(".oi-tbl-wrap");
        if (!wrap || e.target.closest("button, input")) return;
        wlDrag = true; wrap.classList.add("oi-dragging");
        sx = e.pageX - wrap.offsetLeft; sy = e.pageY - wrap.offsetTop;
        sl = wrap.scrollLeft; st = wrap.scrollTop;
      });
      const stopWlDrag = () => { wlDrag = false; const wrap = wlBody.querySelector(".oi-tbl-wrap"); if (wrap) wrap.classList.remove("oi-dragging"); };
      wlBody.addEventListener("mouseleave", stopWlDrag);
      wlBody.addEventListener("mouseup", stopWlDrag);
      wlBody.addEventListener("mousemove", e => {
        if (!wlDrag) return; e.preventDefault();
        const wrap = wlBody.querySelector(".oi-tbl-wrap");
        const x = e.pageX - wrap.offsetLeft; const y = e.pageY - wrap.offsetTop;
        wrap.scrollLeft = sl - (x - sx) * 1.5; wrap.scrollTop = st - (y - sy) * 1.5;
      });

      // ── Settings Change ────────────────────────────────────────────────
      const cfgIds = ["oiCapCfg", "oiGoalCfg", "oiIvGoalCfg", "oiAutoScan", "oiCsvNameCfg"];
      cfgIds.forEach(id => this.g(id).addEventListener("change", () => {
        this.settings.capital = Utils.safe(this.g("oiCapCfg").value);
        this.settings.roiGoal = Utils.safe(this.g("oiGoalCfg").value);
        this.settings.ivGoal = Utils.safe(this.g("oiIvGoalCfg").value);
        this.settings.autoScan = this.g("oiAutoScan").checked;
        this.settings.csvName = (this.g("oiCsvNameCfg").value || "option_wishlist").trim().replace(/[^a-z0-9_-]/gi, '_');
        this.settings.persist();
        if (this.lastCalc) this.renderResult(this.lastCalc);
        this.renderWl();
      }));
    }

    restoreValues() {
      const v = this.settings.lastValues;
      const fmt2 = val => parseFloat(val || 0).toFixed(2);
      this.g("oiSymbol").value = v.symbol || "";
      this.g("oiBid").value = fmt2(v.bid);
      this.g("oiStrike").value = fmt2(v.strike);
      this.g("oiPremium").value = v.premium ? fmt2(v.premium) : "0.00";
      this.g("oiPrice").value = v.price ? fmt2(v.price) : "0.00";
      this.g("oiQty").value = v.qty || "1";
      this.g("oiStockPrice").value = v.stockPrice ? fmt2(v.stockPrice) : "";
      this.g("oiIV").value = v.iv ? fmt2(v.iv) : "";
      this.g("oiAskPrice").value = fmt2(v.askPrice);
      this.g("oiDte").value = v.dte || "";
      this.root.querySelectorAll(".oi-tog").forEach(b => b.classList.toggle("active", b.dataset.type === this.settings.optionType));
      this.root.querySelectorAll(".oi-tog-etf").forEach(b => b.classList.toggle("active", b.dataset.etf === this.settings.etf));
      this.updateMidPrice();
    }

    saveValues() {
      this.settings.lastValues = {
        symbol: this.g("oiSymbol").value, bid: this.g("oiBid").value, strike: this.g("oiStrike").value,
        premium: this.g("oiPremium").value, price: this.g("oiPrice").value, qty: this.g("oiQty").value,
        stockPrice: this.g("oiStockPrice").value, iv: this.g("oiIV").value, askPrice: this.g("oiAskPrice").value,
        dte: this.g("oiDte").value,
      };
      this.settings.persist();
    }

    renderSettings() {
      this.g("oiCapCfg").value = this.settings.capital;
      this.g("oiGoalCfg").value = this.settings.roiGoal;
      this.g("oiIvGoalCfg").value = this.settings.ivGoal;
      this.g("oiAutoScan").checked = this.settings.autoScan;
      this.g("oiCsvNameCfg").value = this.settings.csvName || "option_wishlist";
      try {
        const ver = chrome.runtime.getManifest().version;
        this.g("oiVersion").textContent = "v" + ver + " · IBKR Wheel";
      } catch (e) {
      }
    }

    calculate() {
      const bid = Utils.safe(this.g("oiBid").value);
      const strike = Utils.safe(this.g("oiStrike").value);
      const premium = Utils.safe(this.g("oiPremium").value);
      const qty = Math.max(1, parseInt(this.g("oiQty").value) || 1);
      const stockPrice = Utils.safe(this.g("oiStockPrice").value);

      const strategy = this.strategies[this.settings.optionType];
      const res = strategy.calculate(bid, strike, premium, qty, stockPrice);

      this.lastCalc = {
        ...res,
        symbol: (this.g("oiSymbol").value || "").toUpperCase().trim(),
        bid, strike, premium, price: Utils.safe(this.g("oiPrice").value)
      };

      this.renderResult(this.lastCalc);
      return this.lastCalc;
    }

    updateMidPrice() {
      const bid = Utils.safe(this.g("oiBid").value);
      const ask = Utils.safe(this.g("oiAskPrice").value);
      const mid = (bid + ask) / 2;
      this.g("oiMidPrice").textContent = mid.toFixed(2);

      // Spread liquidity indicator
      const spread = mid > 0 ? ((ask - bid) / mid) * 100 : 0;
      const ind = this.g("oiSpreadInd");
      if (ind) {
        let label, cls;
        if (mid <= 0 || (bid <= 0 && ask <= 0)) { label = "—"; cls = ""; }
        else if (spread < 5) { label = spread.toFixed(2) + "% · Very Liquid (Good)"; cls = "otm"; }
        else if (spread < 10) { label = spread.toFixed(2) + "% · Okay"; cls = ""; }
        else if (spread < 20) { label = spread.toFixed(2) + "% · Tradable (Careful)"; cls = "atm"; }
        else { label = spread.toFixed(2) + "% · Illiquid (Avoid)"; cls = "itm"; }
        ind.textContent = label;
        ind.className = "oi-money-badge " + cls;
      }
    }

    renderResult(r) {
      const g = id => this.g(id);
      const strategy = this.strategies[this.settings.optionType];
      if (!strategy) return;

      // IV Goal
      const ivVal = parseFloat(g("oiIV").value);
      const ivGind = g("oiIvGoalInd");
      if (!isNaN(ivVal) && ivVal > 0) {
        const ivHit = ivVal >= this.settings.ivGoal;
        ivGind.textContent = ivHit ? "✓ IV ≥" + this.settings.ivGoal + "%" : "✗ IV <" + this.settings.ivGoal + "%";
        ivGind.className = "oi-iv-goal-ind " + (ivHit ? "hit" : "miss");
      } else {
        ivGind.textContent = ""; ivGind.className = "oi-iv-goal-ind";
      }

      // DTE Hint
      const dteVal = parseInt(this.g("oiDte").value);
      const dteHint = g("oiDteHint");
      if (dteHint) {
        if (dteVal >= 7 && dteVal <= 14) dteHint.textContent = "(Fast income)";
        else if (dteVal >= 30 && dteVal <= 45) dteHint.textContent = "(Sweet spot)";
        else if (dteVal >= 60) dteHint.textContent = "(More premium)";
        else dteHint.textContent = "";
      }

      const r1 = g("oiRoi1"), r2 = g("oiRoi2"), cap = g("oiCap"), si = g("oiGoalInd"), si2 = g("oiGoalInd2");
      if (!r) {
        [r1, r2, cap].forEach(el => el.textContent = "—");
        r1.className = "oi-roi-num"; r2.className = "oi-roi-num oi-roi2";
        si.className = si2.className = "oi-goal oi-hidden"; return;
      }

      const hit1 = r.roi1 >= this.settings.roiGoal, hit2 = r.roi2 >= this.settings.roiGoal;
      r1.textContent = Utils.pct(r.roi1); r1.className = "oi-roi-num " + (hit1 ? "hit" : r.roi1 > 0 ? "pos" : "");
      r2.textContent = Utils.pct(r.roi2); r2.className = "oi-roi-num oi-roi2 " + (hit2 ? "hit" : r.roi2 > 0 ? "pos" : "");
      cap.textContent = Utils.fmt$(r.cap);

      const capLbl = g("oiCapLbl");
      if (capLbl) capLbl.textContent = this.settings.optionType === "CALL" ? "Capital Held" : "Capital Required";

      g("oiRoi1Lbl").textContent = strategy.label;
      g("oiRoi1Sub").textContent = strategy.formula;
      g("oiRoi2Sub").textContent = strategy.roi2Sub;

      const shortName1 = this.settings.optionType === "CALL" ? "Cov ROI" : "Cash ROI";
      const show1 = r.bid > 0 && r.strike > 0 && r.roi1 > 0 && isFinite(r.roi1);
      if (show1) {
        si.textContent = (hit1 ? "✓ " : "✗ ") + shortName1 + (hit1 ? " (" + this.settings.roiGoal + "%)" : " −" + Math.abs(this.settings.roiGoal - r.roi1).toFixed(2) + "%");
        si.className = "oi-goal " + (hit1 ? "hit" : "miss");
      } else si.className = "oi-goal oi-hidden";

      const show2 = r.bid > 0 && r.strike > 0 && r.roi2 > 0 && isFinite(r.roi2);
      if (show2) {
        si2.textContent = (hit2 ? "✓ " : "✗ ") + "Act ROI" + (hit2 ? " (" + this.settings.roiGoal + "%)" : " −" + Math.abs(this.settings.roiGoal - r.roi2).toFixed(2) + "%");
        si2.className = "oi-goal " + (hit2 ? "hit" : "miss");
      } else si2.className = "oi-goal oi-hidden";

      // Moneyness
      const ms = g("oiMoneyStatus");
      const sp = Utils.safe(this.g("oiStockPrice").value);
      const money = strategy.getMoneyness(r.strike, sp) || { status: "—", risk: "", cls: "" };
      ms.textContent = money.status + (money.risk ? " · " + money.risk : "");
      ms.className = "oi-money-badge " + (money.cls || "");
    }

    addToWishlist() {
      const r = this.calculate();
      if (!r || !r.strike) { this.showToast("Enter valid strike price", "error"); return; }
      const sym = r.symbol || "";
      if (!sym) { this.showToast("Enter symbol", "error"); return; }

      const entry = {
        id: Date.now(), symbol: sym, etf: this.settings.etf, type: this.settings.optionType,
        bid: r.bid, strike: r.strike, premium: r.premium, price: r.price,
        qty: r.qty, roi1: r.roi1, roi2: r.roi2, cap: r.cap,
        iv: parseFloat(this.g("oiIV").value) || null,
        stockPrice: parseFloat(this.g("oiStockPrice").value) || null,
        askPrice: parseFloat(this.g("oiAskPrice").value) || null,
        midPrice: parseFloat(this.g("oiMidPrice").textContent) || null,
        dte: parseInt(this.g("oiDte").value) || null,
        selected: false, addedAt: new Date().toLocaleDateString(),
      };

      const dup = this.settings.wishlist.find(e => e.symbol === sym && e.strike === r.strike && e.type === this.settings.optionType);
      if (dup) { Object.assign(dup, entry); this.showToast("Updated " + sym, "success"); }
      else { this.settings.wishlist.unshift(entry); this.showToast("Added " + sym, "success"); }

      this.settings.persist(); this.renderWl(); this.updateCnt();
    }

    renderWl() {
      const body = this.root.querySelector("#oiWlBody");
      if (!this.settings.wishlist.length) {
        body.innerHTML = `<div class="oi-empty"><div class="oi-empty-ico">📋</div><div>No entries yet.<br>Calculate and click <strong>Add to Wishlist</strong>.</div></div>`;
        this.updateCapBar(); return;
      }

      let rows = "";
      for (const e of this.settings.wishlist) {
        const roiHit = (+e.roi1) >= this.settings.roiGoal;
        const ivHit = e.iv != null && (+e.iv) >= this.settings.ivGoal;
        const fullHit = roiHit && (e.iv == null || ivHit);
        const rowCls = fullHit ? "oi-hit" : roiHit ? "oi-hit-roi" : ivHit ? "oi-hit-iv" : "";
        const ivBadge = e.iv != null ? `<span class="oi-iv-chip ${ivHit ? "hit" : ""}">${(+e.iv).toFixed(2)}%</span>` : `<span class="oi-iv-chip">—</span>`;

        rows += `<tr class="${rowCls}" data-id="${e.id}">
          <td><input type="checkbox" class="oi-row-chk" data-chk="${e.id}" ${e.selected ? "checked" : ""}></td>
          <td class="oi-sym">${Utils.esc(e.symbol)}</td>
          <td>${e.etf || "No"}</td>
          <td>${e.stockPrice != null ? "$" + (+e.stockPrice).toFixed(2) : "—"}</td>
          <td>${ivBadge}</td>
          <td class="${e.type === "CALL" ? "oi-call" : "oi-put"}">${e.type === "CALL" ? "Call" : "Put"}</td>
          <td class="oi-strike-col">$${(+e.strike).toFixed(2)}</td>
          <td>$${(+e.bid).toFixed(2)}</td>
          <td>${e.askPrice != null ? "$" + (+e.askPrice).toFixed(2) : "—"}</td>
          <td>${e.midPrice != null ? "$" + (+e.midPrice).toFixed(2) : "—"}</td>
          <td class="oi-roi-cell ${roiHit ? "hit" : "miss"}">${(+e.roi1).toFixed(2)}%</td>
          <td>${e.dte != null ? e.dte + "d" : "—"}</td>
          <td>${e.qty != null ? e.qty : 1}</td>
          <td>$${e.price != null ? (+e.price).toFixed(2) : "—"}</td>
          <td class="oi-prem-col">$${(+e.premium).toFixed(2)}</td>
          <td class="oi-roi-cell ${(+e.roi2) >= this.settings.roiGoal ? "hit" : "miss"}">${(+e.roi2).toFixed(2)}%</td>
          <td>${Utils.fmt$(e.cap)}</td>
          <td>${e.addedAt}</td>
          <td><button class="oi-rm" data-rm="${e.id}" title="Remove"></button></td>
        </tr>`;
      }

      const allSelected = this.settings.wishlist.length > 0 && this.settings.wishlist.every(e => e.selected);
      body.innerHTML = `<div class="oi-tbl-wrap"><table class="oi-tbl">
        <thead><tr>
          <th><input type="checkbox" data-chkall="1" ${allSelected ? "checked" : ""}></th>
          <th>Sym</th><th>ETF</th><th>Stock$</th><th>IV</th><th>Type</th><th class="oi-strike-col">Strike</th><th>Bid</th>
          <th>Ask</th><th>Mid</th><th>ROI</th><th>DTE</th><th>Qty</th><th>Sell Price</th><th class="oi-prem-col">Premium</th><th>Sell ROI</th><th>Capital</th><th>Date</th><th></th>
        </tr></thead>
        <tbody>${rows}</tbody>
      </table></div>`;
      this.updateCapBar();
    }

    updateCapBar() {
      const sel = this.settings.wishlist.filter(e => e.selected);
      const total = sel.reduce((sum, e) => sum + Utils.safe(e.cap), 0);
      const totalPrem = sel.reduce((sum, e) => sum + Utils.safe(e.premium), 0);
      const totalRoi = total > 0 ? (totalPrem / total) * 100 : 0;
      const valEl = this.g("oiCapTotal"), warn = this.g("oiCapWarn"), premEl = this.g("oiPremTotal"), roiEl = this.g("oiTotalRoi");
      if (valEl) {
        if (sel.length === 0) {
          valEl.textContent = "—"; warn.classList.remove("show");
          if (premEl) premEl.textContent = "—";
          if (roiEl) roiEl.textContent = "—";
        } else {
          valEl.textContent = Utils.fmt$(total);
          if (premEl) premEl.textContent = Utils.fmt$(totalPrem);
          if (roiEl) roiEl.textContent = totalRoi.toFixed(2) + "%";
          const over = total > this.settings.capital;
          warn.classList.toggle("show", over);
          if (over) this.g("oiCapWarnTxt").textContent = `Total Capital $${total.toLocaleString()} exceeds budget $${this.settings.capital.toLocaleString()} by $${(total - this.settings.capital).toLocaleString()}`;
        }
      }
    }

    updateCnt() {
      const n = this.settings.wishlist.length, s = n ? `(${n})` : "";
      [this.g("oiWlCnt"), this.g("oiWlHdrCnt")].forEach(el => { if (el) el.textContent = s; });
    }

    updateThemeBtn() {
      const btn = this.g("oiThemeBtn");
      if (btn) btn.textContent = this.settings.theme === "dark" ? "☀️" : "🌙";
    }

    updateMinBtn() {
      const btn = this.g("oiMinBtn");
      if (btn) btn.textContent = this.root.classList.contains("oi-minimized") ? "▢" : "−";
    }

    exportCsv() {
      if (!this.settings.wishlist.length) { this.showToast("Wishlist is empty", "error"); return; }
      const rows = this.settings.wishlist.map(e => ({
        "Selected": e.selected ? "Yes" : "No", "Symbol": e.symbol, "ETF": e.etf || "No",
        "Stock Price ($)": (+(e.stockPrice || 0)).toFixed(2),
        "IV (%)": (+(e.iv || 0)).toFixed(2), "Type": e.type,
        "Strike ($)": (+(e.strike || 0)).toFixed(2),
        "Bid ($)": (+(e.bid || 0)).toFixed(2),
        "Ask ($)": (+(e.askPrice || 0)).toFixed(2),
        "Mid ($)": (+(e.midPrice || 0)).toFixed(2),
        "ROI (%)": (+(e.roi1 || 0)).toFixed(2),
        "DTE (Days)": e.dte || "",
        "Qty": e.qty,
        "Sell Price ($)": (+(e.price || 0)).toFixed(2),
        "Premium ($)": (+(e.premium || 0)).toFixed(2),
        "Sell ROI (%)": (+(e.roi2 || 0)).toFixed(2),
        "Capital ($)": (+(e.cap || 0)).toFixed(2),
        "Added": e.addedAt,
      }));
      const h = Object.keys(rows[0]);
      const csv = [h.join(","), ...rows.map(r => h.map(k => { const v = r[k]; return typeof v === "string" && v.includes(",") ? `"${v}"` : v; }).join(","))].join("\n");
      const u = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
      const a = document.createElement("a");
      const name = (this.settings.csvName || "option_wishlist").trim();
      a.href = u; a.download = `${name}_${Utils.dtStamp()}.csv`;
      document.body.appendChild(a); a.click(); URL.revokeObjectURL(u);
      this.showToast("CSV downloaded", "success");
    }

    // ── Scanning Logic ──────────────────────────────────────────────────
    scanPage() {
      const pv = Utils.nEl(Utils.qs(SEL.bidPut)), cv = Utils.nEl(Utils.qs(SEL.bidCall));
      // Respect user's current option type selection
      let type = this.settings.optionType;
      // Only override if one side is clearly missing
      if (pv == null && cv != null) type = "CALL";
      else if (cv == null && pv != null) type = "PUT";

      const strike = type === "CALL" ? Utils.nEl(Utils.qs(SEL.strikeCall)) : Utils.nEl(Utils.qs(SEL.strikePut));
      const askPrice = type === "CALL" ? Utils.nEl(Utils.qs(SEL.askPriceCall)) : Utils.nEl(Utils.qs(SEL.askPricePut));
      const lQtyEl = Utils.qs(SEL.limitQty);

      return {
        detected: !!(Utils.qs(SEL.symbol) || pv || cv || strike),
        symbol: Utils.txt(Utils.qs(SEL.symbol)),
        stockPrice: Utils.nEl(Utils.qs(SEL.stockPrice)),
        bid: (type === "CALL" ? cv : pv),
        type, strike, askPrice,
        premium: this.detectPremium(),
        qty: lQtyEl ? (parseInt(lQtyEl.value) || null) : null,
        iv: this.parseIV(Utils.qs(SEL.iv)),
        dte: this.detectDte(),
        etf: this.detectETF(),
      };
    }

    parseIV(el) {
      const raw = Utils.txt(el); if (!raw) return null;
      const n = parseFloat(raw.replace(/^iv\s*:\s*/i, "").replace(/[^0-9.]/g, ""));
      return isNaN(n) ? null : n;
    }

    detectDte() {
      const extract = el => {
        if (!el) return null;
        const txt = el.textContent.trim();
        // Look for "N Days" first (case-insensitive)
        const mDays = txt.match(/(\d+)\s*Days/i);
        if (mDays) return parseInt(mDays[1]);
        // Fallback to any number >= 0 if "Days" not found
        const m = txt.match(/(\d+)/g);
        if (!m) return null;
        const nums = m.map(Number).filter(n => n >= 0 && n <= 999);
        return nums.length ? Math.min(...nums) : null;
      };
      let d = extract(Utils.qs(SEL.dte)); if (d != null) return d;
      try {
        const sel4 = document.querySelector(".option-wrapper")?.querySelectorAll("[aria-selected='true'],[aria-current='true'],[class*='_taba']");
        if (sel4) for (const el of sel4) { d = extract(el); if (d != null) return d; }
      } catch (e) { }
      return null;
    }

    detectPremium() {
      const read = el => { if (!el) return null; const n = parseFloat(el.textContent.replace(/[^0-9.\-]/g, '')); return (isNaN(n) || n <= 0) ? null : n; };
      const sels = [
        "#orderTicketSellTabPanel table tr:nth-child(3) td.numeric.ellipsis",
        "#orderTicketSellTabPanel table tr:nth-child(4) td.numeric.ellipsis"
      ];
      for (const s of sels) { const v = read(Utils.qs(s)); if (v != null) return v; }
      return null;
    }

    detectETF() {
      try {
        const els = Array.from(document.querySelectorAll("div, span, td, th"));
        for (const el of els) if (el.textContent?.trim() === "Market Cap" && (el.offsetWidth > 0 || el.offsetHeight > 0)) return "No";
      } catch (e) { }
      return "Yes";
    }

    applyScannedData(data) {
      if (!data || !this.root) return;
      if (data.symbol) this.g("oiSymbol").value = data.symbol.toUpperCase();
      if (data.type) {
        this.settings.optionType = data.type;
        this.root.querySelectorAll(".oi-tog").forEach(b => b.classList.toggle("active", b.dataset.type === data.type));
      }
      if (data.etf) {
        this.settings.etf = data.etf;
        this.root.querySelectorAll(".oi-tog-etf").forEach(b => b.classList.toggle("active", b.dataset.etf === data.etf));
      }

      const newBid = data.bid || 0;
      const prevBid = parseFloat(this.g("oiBid").value) || 0;
      this.g("oiBid").value = (+newBid).toFixed(2);
      this.g("oiStrike").value = (+(data.strike || 0)).toFixed(2);
      this.g("oiAskPrice").value = (+(data.askPrice || 0)).toFixed(2);
      this.updateMidPrice();

      if (newBid !== prevBid) {
        this.g("oiPremium").value = "0.00"; this.g("oiPrice").value = "0.00";
      } else if (data.premium != null) {
        this.g("oiPremium").value = (+data.premium).toFixed(2);
        const qty = parseInt(this.g("oiQty").value) || 1;
        this.g("oiPrice").value = (data.premium / (100 * qty)).toFixed(2);
      }

      if (data.qty != null) {
        this.g("oiQty").value = data.qty;
        const p = parseFloat(this.g("oiPremium").value) || 0;
        if (p > 0) this.g("oiPrice").value = (p / (100 * data.qty)).toFixed(2);
      }

      if (data.stockPrice != null) this.g("oiStockPrice").value = (+data.stockPrice).toFixed(2);
      if (data.iv != null) this.g("oiIV").value = (+data.iv).toFixed(2);
      if (data.dte != null) this.g("oiDte").value = data.dte;

      const midVal = this.g("oiMidPrice") ? this.g("oiMidPrice").textContent : "0.00";
      const bidVal = this.g("oiBid") ? parseFloat(this.g("oiBid").value || 0).toFixed(2) : "0.00";
      const askVal = this.g("oiAskPrice") ? parseFloat(this.g("oiAskPrice").value || 0).toFixed(2) : "0.00";
      const parts = [data.symbol, data.stockPrice ? "$" + data.stockPrice.toFixed(2) : "", data.type, data.iv ? "IV " + data.iv.toFixed(2) + "%" : "", "Bid\u00A0$" + bidVal, "Ask\u00A0$" + askVal, "Mid\u00A0$" + midVal].filter(Boolean);
      this.g("oiBannerMsg").textContent = data.detected ? parts.join(" · ") : "No symbol detected.";
      this.g("oiBanner").classList.remove("oi-hidden");

      this.saveValues(); this.calculate();
    }

    setupObservers() {
      let t = null;
      let scanning = false;
      this._mutationObserver = new MutationObserver((mutations) => {
        if (!this.root || !this.settings.autoScan || this.root.classList.contains("oi-hidden")) return;
        // Ignore mutations from our own overlay
        const fromSelf = mutations.every(m => this.root.contains(m.target));
        if (fromSelf) return;
        if (scanning) return;
        clearTimeout(t);
        t = setTimeout(() => {
          if (scanning) return;
          scanning = true;
          try {
            if (Utils.qs(SEL.symbol) || Utils.qs(SEL.bidPut)) this.applyScannedData(this.scanPage());
          } finally {
            scanning = false;
          }
        }, 400);
      });
      this._mutationObserver.observe(document.body, { childList: true, subtree: true });
    }

    setupPollers() {
      // Fast poll (300ms) for bid/strike/askPrice
      this._pollIntervals.push(setInterval(() => {
        if (!this.root || !this.settings.autoScan || this.root.classList.contains("oi-hidden")) return;
        const fpv = Utils.nEl(Utils.qs(SEL.bidPut)), fcv = Utils.nEl(Utils.qs(SEL.bidCall));
        const fBid = (this.settings.optionType === "CALL" ? fcv : fpv);
        const fStrike = (this.settings.optionType === "CALL" ? Utils.nEl(Utils.qs(SEL.strikeCall)) : Utils.nEl(Utils.qs(SEL.strikePut)));
        const fAsk = (this.settings.optionType === "CALL" ? Utils.nEl(Utils.qs(SEL.askPriceCall)) : Utils.nEl(Utils.qs(SEL.askPricePut)));

        // Only update if values actually changed (don't reset to 0)
        if (fBid == null && fStrike == null) return;

        if (fBid != null && fBid !== parseFloat(this.g("oiBid").value)) {
          this.g("oiBid").value = fBid.toFixed(2); this.g("oiPremium").value = "0.00"; this.g("oiPrice").value = "0.00";
          this.updateMidPrice(); this.saveValues(); this.calculate();
        }
        if (fStrike != null && fStrike !== parseFloat(this.g("oiStrike").value)) {
          this.g("oiStrike").value = fStrike.toFixed(2); this.saveValues(); this.calculate();
        }
        if (fAsk != null && fAsk !== parseFloat(this.g("oiAskPrice").value)) {
          this.g("oiAskPrice").value = fAsk.toFixed(2); this.updateMidPrice(); this.saveValues(); this.calculate();
        }
      }, 300));

      // Slow poll (2000ms) for DTE and Qty
      this._pollIntervals.push(setInterval(() => {
        if (!this.root || !this.settings.autoScan || this.root.classList.contains("oi-hidden")) return;
        const days = this.detectDte();
        if (days != null && days !== parseInt(this.g("oiDte").value)) {
          this.g("oiDte").value = days; this.saveValues(); this.calculate();
        }
        const qtyEl = Utils.qs(SEL.limitQty);
        const qty = qtyEl ? (parseInt(qtyEl.value) || null) : null;
        if (qty != null && qty !== parseInt(this.g("oiQty").value)) {
          this.g("oiQty").value = qty; this.saveValues(); this.calculate();
        }
      }, 2000));
    }

    setupMessaging() {
      if (!this.settings.isContextValid()) return;
      chrome.runtime.onMessage.addListener(msg => {
        if (msg.type === "TOGGLE_OVERLAY") {
          this.settings.isClosed = false;
          this.settings.setClosed(false);
          const r = document.getElementById("__option-roi-root__");
          if (r) {
            r.classList.remove("oi-hidden");
          } else {
            this.inject();
            this.setupObservers();
            this.setupPollers();
          }
        }
      });
    }
  }

  // ── Start ───────────────────────────────────────────────────────────────
  const app = new OptionWheelApp();
  app.boot();

})();
