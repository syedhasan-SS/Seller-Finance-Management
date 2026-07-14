# Seller Experience MBR — April 2026

**Author:** Faez (Business & Experience Manager)
**Audience:** Leadership / Sponsor
**Reporting period:** April 1 – April 30, 2026
**Comparison baseline:** Jan–Mar 2026
**Status:** DRAFT — for sponsor review before publishing

---

## TL;DR

1. **Volume up 20%, FRT collapsed.** April saw 1,674 seller tickets vs ~1,374 monthly avg in Jan–Mar; first-response P70 went from <1 min in Jan to 35 min in April. Cause of the spike is unknown — investigation kicked off Week 1 of May.
2. **76% of seller tickets are Information.** This is a self-service problem, not a staffing problem. Adding agents won't fix it; building systems will.
3. **Q2 plan starts May 6.** Four tracks running in parallel — FRT recovery, deflection of the Information bucket, proactive alerts for top complaints, team transformation. Mid-quarter NPS target: +15 (toward +30 by Sep 30).

---

## Headline metrics

| Metric | Jan | Feb | Mar | **Apr** | Apr vs Jan–Mar avg | Direction |
|---|---|---|---|---|---|---|
| Seller tickets | 1,350 | 1,408 | 1,363 | **1,674** | +20% | 🔴 |
| FRT P50 (min) | 0.27 | — | — | — | — | 🔴 |
| FRT P70 (min) | 0.65 | — | — | **35.45** | 54× degradation | 🔴 |
| FRT P90 (min) | — | — | — | **120.72** | — | 🔴 |
| Resolution P90 (days) | 2.14 | 2.26 | 2.98 | 2.83 | flat-to-worse | 🟡 |
| NPS (latest wave, n=150) | — | — | — | **+1** | (-10 in Q3'25 → +4 in Q4'25 → **+1 in Q1'26**) | 🔴 |

> **Note on "active sellers":** Current dashboards denominate metrics against 12,665 ACTIVE-flagged vendors. Real behavioral active = **2,328** (live listings OR 90-day order). Engaged transacting core = **604**. Recommendation: redefine the "active seller" denominator across all CX dashboards starting May. Several headline metrics will look 5× worse but be honest.

---

## What worked

- **Q4 2025 NPS bump (-10 → +4) was real but accidental.** It rode on the Finance tool launch improving payment processing. No deliberate program. **Implication:** systemic improvements compound; tactical CX fixes don't.
- **Resolution P90 partially recovered in April** (2.98d → 2.83d) despite higher volume — the team absorbed load on the back end even as front-of-funnel slipped.
- **Team is asking for transformation, not protecting the status quo.** Tooba and Basil are voluntarily upskilling on AI tooling. Cultural readiness for the shift is real.

## What broke

- **First-response time degraded every month from Jan onward.** This is the leading indicator that NPS will continue to slide if not arrested. Root cause: same team handling 20% more volume across the same shift hours, with no deflection layer. Action in Week 1 of May.
- **April +20% volume spike has no known cause.** Unique seller count was slightly higher but not 20% higher. Possible causes: a platform change that broke a seller flow, a new seller cohort onboarded without enablement, a process change in QC/refunds. Investigation in Week 1.
- **Help center has zero usage analytics.** We can't tell which articles work or which queries fail. Day-1 May fix.

---

## Volume deep-dive — the 76% finding

| Type | Tickets (Jan–Apr) | Share | Implication |
|---|---|---|---|
| **Information** | 4,333 | **76%** | Self-service problem. Sellers are using support as a search engine. |
| Complaint | 871 | 15% | Real problems. Top: Payment Not Processed (144), Incorrect Refund (85), Pickup Not Aligned (84). |
| Request | 514 | 9% | Boring updates that should be self-serve. Top: Profile Picture (162), Password (77). |

**Top 5 Information categories alone account for 36% of total volume:**
- Payment Process Information — 552
- Bank Account Details Update — 513
- Payout Details Inquiry — 387
- Contact reason not found — 352
- QC hold reason required — 241

These five are the deflection target for May–June.

---

## What sellers are actually telling us (NPS verbatim themes, Q1 2026)

Top detractor themes from the n=150 Google Form NPS wave:

1. **Refund** — disputes, delays, wrong amounts.
2. **Quality Check** — opacity around hold reasons and timelines.
3. **Seller Support** — slow responses, inconsistent answers (matches FRT data).
4. **Sales & Visibility** — *doesn't show up in tickets* — sellers don't raise tickets about it; they quietly underperform and churn. Highest hidden-risk theme.

**Important:** themes 1–3 are addressable in Q2. Theme 4 needs a different motion (Seller Growth Partner outreach to engaged core), planned for Weeks 9–10.

---

## Initiatives — what's launching in May

| Week | Initiative | Why |
|---|---|---|
| W1 (May 6–10) | Help center instrumentation + active-seller redefinition + ticket re-tagging | Foundation. Can't improve what we can't measure. |
| W2 (May 13–17) | First 10 net-new help center articles + auto-reply with article links | Starts deflecting the 76% immediately. |
| W3 (May 20–24) | Self-serve **Profile Picture Update** UI + next 10 articles | Eliminates 162 Request tickets/quarter. |
| W4 (May 27–31) | **Seller Concierge AI v0.1** to 10% of sellers + self-serve **Bank Account Update** | First AI deflection live. |

Full Q2 plan: [01-q2-execution-plan.md](01-q2-execution-plan.md).

---

## Q2 outlook + targets

| Target | By July 31 | By Sep 30 (program end) |
|---|---|---|
| NPS | +15 | **+30** |
| FRT P90 | < 5 min sustained | < 5 min sustained |
| Resolution P90 | < 2 days | < 1.5 days |
| Information ticket volume | −25% vs Apr | −60% vs Apr |
| Concierge AI deflection rate | 60% on routed sessions | 75% |
| Self-serve coverage | Top 6 Request categories live | All Request + top 10 Info live |
| NPS instrumentation | Continuous in-app, weekly review | Same |

---

## Risks (top 3)

1. **April volume spike persists into May** — if true, percentage targets will look flat even if program works. Mitigation: switch to absolute targets, investigate root cause Week 1.
2. **Engineering bandwidth is limited** — several deliverables (self-serve UIs, Proactive Alerts) need backend access. Mitigation: Claude Code + no-code-first, escalate eng asks early and explicitly.
3. **Team transformation pace** — Hamza is least far along on tooling. If he can't grow into the system-builder role in Q2, it bottlenecks ops health. Mitigation: weekly 1:1 + paired work + explicit learning plan.

---

## Asks from leadership

1. **Sponsor sign-off on Q2 plan + +30 NPS commitment by May 10.** Without explicit alignment, we'll lose time defending scope.
2. **Approve the redefinition of "active seller" in CX dashboards** (12,665 → 2,328). Several reported metrics will move noticeably; we need air cover.
3. **Engineering capacity commitment** — even a fractional FE/BE allocation (e.g., 0.5 engineer for Q2) unlocks self-serve UIs and Proactive Alerts. If unavailable, please confirm so we can scope the program at no-code-only delivery.
4. **Cross-functional alignment with Finance, QC, and Ops leads** for Proactive Alerts data sources and refund/QC complaint root-cause work.

---

## Appendix — data sources

- Tickets: SX – Tickets (CX Dashboard, SX-WBR tab), Jan 1 – Apr 30, 2026.
- Seller base sizing: vendor table (status flag) joined with listings + 90d/30d order tables.
- NPS: Google Form, periodic, n=150 latest wave.
- FRT/Resolution: support tool exports (Jan, Apr).
- Help center: `support.joinfleek.com/hc/en-us/sections/42538739832859-For-Sellers` — usage analytics not yet instrumented.
