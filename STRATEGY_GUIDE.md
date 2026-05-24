# Wheel Strategy Guide

A quick-reference guide for evaluating option trades using the Wheel Strategy.

---

## Maximum Profit Checklist

Use this checklist to evaluate whether a Wheel Strategy trade is set up for maximum profit:

| #  | Criteria                     | Ideal                       | Why                                                            |
|----|------------------------------|-----------------------------|----------------------------------------------------------------|
| 1  | **IV Rank / IV Percentile**  | High (IV ≥ 40%)             | Higher IV = fatter premiums. Sell when IV is elevated.         |
| 2  | **DTE (Days to Expiration)** | 30–45 days                  | Sweet spot for theta decay. Best time-value-to-risk ratio.     |
| 3  | **Strike Selection (Put)**   | OTM, delta 0.20–0.30        | Lower assignment risk while still collecting decent premium.   |
| 4  | **Strike Selection (Call)**  | OTM, delta 0.20–0.30        | Keep shares if bullish, collect premium above cost basis.      |
| 5  | **Spread %**                 | < 5% (Very Liquid)          | Tight spreads = better fills, less slippage.                   |
| 6  | **Open Interest**            | ≥ 100 contracts             | High OI = active market, easier to enter/exit positions.       |
| 7  | **Volume**                   | ≥ 50 contracts/day          | High volume = competitive pricing, tighter bid-ask.            |
| 8  | **ROI per Trade**            | ≥ 2.5% per cycle            | Consistent income target. Compounds over time.                 |
| 9  | **Stock Fundamentals**       | Strong company you'd own    | Only wheel stocks you're happy to hold if assigned.            |
| 10 | **No Earnings / Events**     | Avoid earnings week         | Earnings cause unpredictable gaps that can blow past strikes.  |
| 11 | **Moneyness**                | OTM (Lower Risk)            | Avoid ATM/ITM unless intentionally seeking assignment.         |
| 12 | **Position Size**            | ≤ 5% of portfolio per trade | Diversify across multiple underlyings to reduce risk.          |
| 13 | **ETF vs Stock**             | ETFs for stability          | ETFs have less gap risk; stocks offer higher premiums.         |
| 14 | **Exit Strategy**            | Close at 50–75% profit      | Don't hold to expiration. Take profit early, redeploy capital. |

**Rule of thumb:** If a trade meets criteria 1–8 and 11, it's a strong candidate. Criteria 9–10 and 12–14 are risk
management guardrails.

---

## DTE Hints

| DTE Range  | Category     | Notes                                          |
|------------|--------------|------------------------------------------------|
| 7–14 days  | Fast income  | Quick theta burn, but less premium             |
| 30–45 days | Sweet spot   | Best balance of premium vs. time risk          |
| 60+ days   | More premium | Higher premium, but slower decay and more risk |

---

## Moneyness Logic

| Scenario      | OTM (Lower Risk) | ATM (High Risk)   | ITM (Very High Risk) |
|---------------|------------------|-------------------|----------------------|
| **Sell Put**  | Strike < Stock   | Difference ≤ 0.5% | Strike > Stock       |
| **Sell Call** | Strike > Stock   | Difference ≤ 0.5% | Strike < Stock       |

**ATM Calculation:**
`ATM Difference % = |Strike Price - Stock Price| ÷ Stock Price × 100`

---

## Delta Guide

Delta measures the probability of an option expiring in-the-money and how much the option price moves per $1 change in
the stock.

| Delta Range | Meaning                                | Use in Wheel Strategy                                |
|-------------|----------------------------------------|------------------------------------------------------|
| 0.10–0.15   | Very OTM, ~10–15% chance of assignment | Conservative — low premium, high safety              |
| 0.20–0.30   | OTM sweet spot, ~20–30% chance         | **Recommended** — best balance of premium vs. risk   |
| 0.30–0.40   | Slightly OTM, ~30–40% chance           | Aggressive — higher premium, higher assignment risk  |
| 0.40–0.50   | ATM, ~40–50% chance                    | Very aggressive — maximum premium, expect assignment |
| > 0.50      | ITM, likely assignment                 | Avoid for selling unless seeking assignment          |

**Key points:**

- **Sell Put:** Choose delta 0.20–0.30 for income with low assignment probability
- **Sell Call:** Choose delta 0.20–0.30 to keep shares while collecting premium
- Higher delta = more premium but more risk of assignment
- Delta roughly equals the probability of expiring ITM

---

## Spread % Liquidity Guide

The bid-ask spread percentage indicates how liquid an option contract is. Lower spread = better fills.

**Formula:** `Spread % = (Ask - Bid) ÷ Mid Price × 100`

| Spread % | Meaning              | Action                            |
|----------|----------------------|-----------------------------------|
| < 5%     | Very Liquid (good)   | Trade confidently                 |
| 5–10%    | Okay                 | Acceptable, use limit orders      |
| 10–20%   | Tradable but Careful | Use limit orders, expect slippage |
| > 20%    | Illiquid / Avoid     | Skip — poor fills, hard to exit   |

---

## Open Interest & Volume

Open interest and volume indicate how actively an option contract is traded. Higher values mean better liquidity and
easier order fills.

### Open Interest (OI)

The total number of outstanding contracts that haven't been closed or exercised.

| Open Interest | Meaning             | Action                             |
|---------------|---------------------|------------------------------------|
| < 50          | Very low liquidity  | Avoid — wide spreads, hard to fill |
| 50–100        | Low liquidity       | Caution — use limit orders only    |
| 100–500       | Good liquidity      | Acceptable for most trades         |
| 500+          | Excellent liquidity | Trade confidently                  |

### Volume

The number of contracts traded during the current session.

| Volume | Meaning        | Action                     |
|--------|----------------|----------------------------|
| < 10   | Inactive       | Avoid — stale pricing      |
| 10–50  | Light activity | Acceptable if OI is high   |
| 50–200 | Active         | Good for reliable fills    |
| 200+   | Very active    | Best pricing and execution |

**Key points:**

- **OI > Volume** is normal — it means existing positions are being held
- **Volume > OI** signals unusual activity (new positions opening — could indicate smart money)
- Always check both OI and volume together with spread % for a complete liquidity picture
- Low OI + low volume + high spread = illiquid contract, skip it
