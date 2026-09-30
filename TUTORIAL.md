# Beginner Tutorial — How to Use the Wheel Calculator

A step-by-step guide to reading the calculator panel and deciding which option to sell. No experience needed.

> The calculator only does the maths. It never tells you what to buy or sell — you decide.

**What you'll learn**

1. [The Wheel in one minute](#part-1--the-wheel-in-one-minute)
2. [Words you'll see](#part-2--words-youll-see)
3. [Selling a put, step by step](#part-3--selling-a-put-step-by-step)
4. [After you get the shares: selling a call](#part-4--after-you-get-the-shares-selling-a-call)
5. [Plan your money with the Wishlist](#part-5--plan-your-money-with-the-wishlist)
6. [Quick checklist](#part-6--quick-checklist-before-you-sell)
7. [Common mistakes](#part-7--common-beginner-mistakes)

---

## Part 1 — The Wheel in One Minute

Think of the Wheel as **getting paid to wait**.

1. **Sell a put.** You promise: *"If this stock drops to \$50, I'll buy 100 shares at \$50."*
   You get paid money today for that promise. That money is the **premium**.
2. **If the stock ends below \$50** on the deadline, you keep your promise and buy the shares. This is being
   **assigned**.
3. **Sell a call.** Now you own shares, so you promise: *"If the stock rises to \$52, I'll sell my shares at \$52."*
   You get paid a premium again.
4. **If the stock ends above \$52**, your shares are sold. You're back to cash — start again at step 1.

You collect money at every step.

---

## Part 2 — Words You'll See

You don't need to memorise these — each one is explained again when it appears in Part 3.

| Word             | In plain English                                                        |
|------------------|-------------------------------------------------------------------------|
| **Strike**       | The price in your promise (e.g. \$50)                                    |
| **Premium**      | The money you get paid for the promise                                  |
| **DTE**          | Days left until the promise ends                                        |
| **Spread**       | The gap between buyer and seller prices. Small gap = easy to trade      |
| **ROC**          | How much you earn for every \$1 you set aside                           |
| **Breakeven**    | The "no win, no loss" stock price                                       |
| **Cushion**      | How far the stock can fall before it hits breakeven                     |
| **Typical move** | How far this stock usually moves by the deadline                        |
| **Cost**         | What you paid for your shares (used when selling a call)                |

**Colours on the panel:** ✓ **green** or **purple** = good sign · **gold** = ROI goal met, or ⚠ take care ·
✗ **red** = warning, take a closer look.

---

## Part 3 — Selling a Put, Step by Step

**The story:** A stock costs **\$52** today. You'd be happy to own it at **\$50**. The deadline is **37 days** away.

### Step 1 — Open the panel and click a strike

Open the option chain on IBKR, click the extension icon, then click the **\$50** strike. The panel fills in by itself.

### Step 2 — Check the basics

| You see                          | What it means                                                  |
|----------------------------------|----------------------------------------------------------------|
| DTE **37 (Sweet spot)**          | A good length of time — not too short, not too long            |
| IV Goal **✓ IV ≥40%**            | The stock moves enough to pay a decent premium                 |
| Moneyness **OTM · Lower Risk**   | \$50 is below today's price — you're on the safe side          |
| **Cash-secured ROI 3.57%** (big number, left) | A **quick check** at today's bid, scaled to a 30-day block so different deadlines are easier to compare |
| ROI Goals **✓ Cash ROI (2.5%)**  | That quick check meets your target                             |

> **Two ROI numbers?** Cash-secured ROI is only a quick filter while you click through strikes — it's **not** what you
> earn. Your real return is **ROC**, which stays 0.00% until you type your Sell Price in Step 4.

### Step 3 — Is it easy to trade? (Spread)

The **spread** is the gap between what buyers pay and sellers ask. A small gap means you get a fair price.

| Spread       | Meaning                                                  |
|--------------|----------------------------------------------------------|
| Under 10%    | OK to trade (under 5% is easiest)                        |
| 10–20% (gold)| Careful — you may get a slightly worse price             |
| 20%+ (red)   | Avoid                                                    |

Our \$50 strike (Bid \$1.10, Ask \$1.20) shows Spread % **8.70% · Okay** → fine to trade.

### Step 4 — Type your price and see what you earn

You decide to sell at **\$1.12** per share. Type it into **Sell Price**. The panel shows **Premium \$112.00** — what
you'll be paid (100 shares × \$1.12).

| You see                          | What it means                                                  |
|----------------------------------|----------------------------------------------------------------|
| **ROC 2.24%**                    | You earn \$112 for keeping \$5,000 aside. This is your real return |
| **Capital Required \$5,000.00**  | Keep this much cash in your account                            |

#### What is ROC for?

**ROC tells you how much you earn for every \$1 you set aside.** It stops you from thinking *"this one pays more
dollars, so it must be better."*

| Trade | Premium | Cash set aside | ROC      |
|-------|---------|----------------|----------|
| A     | \$500   | \$20,000       | 2.5%     |
| B     | \$300   | \$10,000       | **3.0%** |

A pays more dollars, but B makes your money work harder. With the same \$20,000 you could do two trades like B and
earn \$600 instead of \$500.

**How to use it**

- **Compare different stocks fairly.** \$5 per share on a \$200 strike = 2.5%. \$2 per share on a \$50 strike = 4.0%.
  The \$2 premium earns more for each dollar you set aside. That alone doesn't make it the better trade — check the
  stock and the cushion too.
- **Spot lazy money.** \$150 on \$30,000 is only 0.5%. \$450 on \$15,000 is 3.0%. The first one ties up twice the
  cash for a third of the pay.
- **Use it for calls too.** After you get shares, ROC shows what you earn on the money in those shares (Part 4).

> **Compare ROC only with the same deadline (DTE).** A longer deadline pays a bigger premium, so its ROC looks higher
> just because you wait longer.

> **Higher ROC is not automatically better.** A very high ROC often means the market thinks the stock could drop a
> lot. Check in this order:
>
> 1. Would I be happy to own this stock?
> 2. Is it safe enough? (Cushion — Step 5)
> 3. Is the ROC worth it?
> 4. Can I afford it? (Wishlist — Part 5)

### Step 5 — How safe is it? (Breakeven, Cushion, Typical move)

The panel shows three numbers that answer *"How far can the stock fall before I lose money?"*

```
        2.24%                 …
         ROC                  Cushion   ✗ Thin 6.00% (move 14.3%)
  Breakeven $48.88            …
```

**Breakeven** sits under the ROC number. **Cushion** is a row in the list on the right.

**① Breakeven — the "no win, no loss" price**

```
Breakeven = Strike − Premium per share = $50.00 − $1.12 = $48.88
```

Stock **at or above** \$48.88 on the deadline → you're OK. **Below** → you're losing money.

**② Cushion — your safety room**

```
Cushion % = (Stock today − Breakeven) ÷ Stock today × 100
          = ($52.00 − $48.88) ÷ $52.00 × 100 = 6.00%
```

```
Stock today   $52.00   ← you are here
                 │
                 │  can fall 6% and you're still OK   ← this 6% is the cushion
                 ▼
Breakeven     $48.88   ← at or above: OK · below: losing money
```

**③ Typical move — how far this stock usually moves**

The panel works it out from IV and DTE. Here it's **14.3%**: by the deadline, this stock often moves about 14% up or
down.

**④ Compare the two to decide**

| Compare                        | What it means                                                                     | Panel shows                       |
|--------------------------------|-----------------------------------------------------------------------------------|-----------------------------------|
| **Typical move % > Cushion %** | **Risky.** High chance you get assigned *and* end up losing money                 | 🟡 **⚠ Moderate** or 🔴 **✗ Thin** |
| **Typical move % ≤ Cushion %** | **Safe.** The stock usually doesn't fall that far — you're unlikely to lose money | 🟢 **✓ Safe**                     |

**⚠ Moderate** = some risk (the cushion covers at least half the typical move). **✗ Thin** = high risk.
**✗ Below** = the stock is already under breakeven.

**Our \$50 strike:** 14.3% > 6.00% → **✗ Thin** (risky). The 6% cushion *sounds* safe, but this stock often moves more
than that.

> **Good to know:** "Safe" means unlikely to *lose money*. You can still be assigned if the stock ends just below
> your strike — you'd be above breakeven, so you're still OK.

> **Tip:** Avoid selling right before **earnings**. Earnings surprises aren't included in the typical move, so the
> colour can look safer than it really is.

### Step 6 — Compare other strikes

Click a lower strike to see how the numbers change:

|                                   | \$50 strike   | \$48 strike   | \$44 strike   |
|-----------------------------------|---------------|---------------|---------------|
| Bid → Cash-secured ROI            | \$1.10 → 3.57% ✓ | \$0.60 → 2.03% ✗ | \$0.18 → 0.66% ✗ |
| Sell Price → Premium              | \$1.12 → \$112 | \$0.62 → \$62 | \$0.20 → \$20 |
| ROC                               | **2.24%**     | 1.29%         | 0.45%         |
| Breakeven                         | \$48.88       | \$47.38       | \$43.80       |
| Cushion (typical move 14.3%)      | ✗ Thin 6.00% | ⚠ Moderate 8.88% | **✓ Safe 15.77%** |
| Typical move vs. cushion          | 14.3% > 6.00% | 14.3% > 8.88% | 14.3% ≤ 15.77% |
| Cash needed                       | \$5,000       | \$4,800       | \$4,400       |

All three have the same deadline (37 days), so comparing their ROC is fair.

**So which one?**

- **Want more money?** → \$50 earns the most, but it's risky.
- **Want a balance?** → \$48 earns less but gives the stock more room to fall.
- **Want it safe?** → \$44 is the only **✓ Safe** one, but you'll earn much less.

There's no wrong answer. More money usually means more risk — the panel shows you the trade-off in a few clicks.

### Step 7 — Save it

Click **Wishlist** to save the strike you like. You'll use this in Part 5.

> **Tip — scan faster with compact mode.** Click the **−** button at the top of the panel. It shrinks to a small
> floating box so you can see more of the option chain, and still shows what you need to pick a strike:
>
> ```
> NASA · $52.00 · PUT $50.00 · 37d · IV 45.00% ✓ ·
> Bid $1.10 · Ask $1.20 · Mid $1.15
>
>   3.57%              0.00%
> CASH-SECURED ROI      ROC        ← ROC stays 0.00% until you type a Sell Price
>
> ROI Goals          ✓ Cash ROI (2.5%)
> Moneyness          OTM · Lower Risk
> Spread %           8.70% · Okay
> Cushion            ✗ Thin 6.00% (move 14.3%)
> Capital Required   $5,000.00
> ```
>
> The first line always tells you **which strike** the numbers are for. The buttons and the **▢** button appear when
> you hover over the box — click **▢** to go back to the full view.

---

## Part 4 — After You Get the Shares: Selling a Call

**The story continues:** On the deadline the stock was **\$49**, below your \$50 promise. So you bought
**100 shares at \$50**. Today the stock is **\$48.50**.

### Step 1 — Switch to Sell Call

Click **Sell Call**. The panel finds what you paid from your IBKR trade history and shows it above the ROI:

```
Cost $50.00 · 100 sh
```

> This is only what you paid for the shares. The \$112 premium you earned from the put is not counted here.

### Step 2 — Pick a strike above your cost

Click the **\$52** strike and sell at **\$0.85** (premium \$85).

| You see                          | What it means                                                         |
|----------------------------------|-----------------------------------------------------------------------|
| **ROC 1.70%**                    | You earn \$85 on the \$5,000 of shares you hold                       |
| **If Called \$285.00 (5.70%)**   | If your shares get sold at \$52: \$200 profit on shares + \$85 premium |

### Step 3 — Check the cushion

For a call, breakeven is your cost minus the premium: \$50.00 − \$0.85 = **\$49.15**.

```
Breakeven $49.15              ← under the ROC number
Cushion   ✗ Below -1.34% (move …)   ← red, in the list on the right
```

The stock (\$48.50) is already **below** breakeven, so the cushion is negative — you're losing money on paper right
now. That's normal right after being assigned. Every premium you collect helps make up the difference.

> For a call, the cushion is about protecting your shares from a further drop — not about being called away.
> It needs your cost basis, so if the panel doesn't show **Cost \$… · 100 sh**, the Cushion row is hidden.

### Step 4 — Watch out for strikes below your cost

Click the **\$47** strike and sell at **\$1.95** (premium \$195). The cost label above the ROI turns red, and a red
**⚠** warning line appears under the results:

```
⚠ Cost $50.00 · 100 sh                                           ← above the ROI
⚠ Strike $47.00 below cost $50.00 · Net if called −$105.00 ▸     ← under the results
```

**Click the line** (or hover over it) to see the full breakdown:

```
⚠ Strike $47.00 below cost $50.00 · Net if called −$105.00 ▾
Share loss            −$300.00
Premium               +$195.00
Net if called         −$105.00
Breakeven strike      ≥ $48.05
Calls to offset gap   ~2 calls at $1.95 premium
Consider a strike ≥ breakeven. Calls to offset assumes the same premium each cycle.
```

> While this warning shows, the **If Called** row is hidden — the warning line already shows the same amount.

**In plain words:**

- If your shares get sold at \$47, you lose \$300 on them. The \$195 premium helps, but you still **lose \$105**.
- To avoid a loss, pick a strike of **\$48.05 or higher**.
- Or, you'd need about **2 more calls** like this to earn it back.

The bigger premium looks tempting, but it can turn a paper loss into a real one.

---

## Part 5 — Plan Your Money with the Wishlist

1. On each strike you like, click **Wishlist** to save it.
2. Open the **Wishlist** tab and tick the ones you plan to trade.
3. Look at the totals at the bottom:

| Total             | Meaning                                                        |
|-------------------|----------------------------------------------------------------|
| **Cash Required** | Money you need for your puts. Calls need no new money          |
| **Premium**       | Money you'll be paid (puts and calls)                          |
| **ROI**           | Premium ÷ Cash Required                                        |

- A **red warning** means you've picked more than your budget (set in **Settings → Capital**).
- **"(1 row without premium)"** means you haven't typed a Sell Price for that row yet.

---

## Part 6 — Quick Checklist Before You Sell

Go down the panel from top to bottom:

- ✓ DTE says **Sweet spot**
- ✓ IV Goal shows a **tick**
- ✓ ROI Goals shows a **tick**
- ✓ Moneyness says **OTM · Lower Risk**
- ✓ Spread is **under 10%**
- ✓ Cushion shows **✓ Safe** (Typical move % ≤ Cushion %) — or you accept the risk if it's **⚠ Moderate**
- ✓ Selling a call? **No ⚠ warning line** under the results
- ✓ Wishlist shows **no budget warning**

---

## Part 7 — Common Beginner Mistakes

- **Chasing the biggest premium.** Bigger premium usually means a smaller cushion. Check Typical move % vs. Cushion %.
- **Picking the highest ROC without checking the stock.** A very high ROC can mean the stock is risky.
- **Thinking the first ROI is what you'll earn.** It's a quick check. **ROC** is your real return.
- **Trading when the spread is red.** You may get a bad price and struggle to get out.
- **Selling right before earnings.** The stock can jump far more than the typical move.
- **Selling a call below what you paid.** The ⚠ warning line will tell you — click it for the full breakdown.
- **Picking more trades than you can afford.** The Wishlist warns you.
- **Forgetting to type your Sell Price.** ROC stays at 0.00% until you do.

---

**Want to go deeper?**

- Detailed ranges (cushion ratings, spread, delta, open interest): [Strategy Guide](STRATEGY_GUIDE.md)
- All formulas: [README → Formulas](README.md#formulas)
