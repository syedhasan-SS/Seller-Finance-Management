# Seller Experience — Q2 Execution Plan

**Window:** May 6 – July 31, 2026 (13 weeks)
**Owner:** Faez (Business & Experience Manager)
**Team:** Tooba, Hamza, Basil
**Primary outcome by July 31:** Seller NPS **+1 → +15** (mid-quarter checkpoint toward +30 by Sep 30); ticket volume **−25% on Information bucket**; FRT P90 **< 5 min** restored.

---

## North star (one paragraph)

For the next 13 weeks, the Seller Experience team stops being a help desk and starts being a system. Every week, every team member ships *something a seller can use without us*. By July 31, the top 10 reasons sellers contact us today are either self-served (via Hub + Concierge), automated (via self-serve UI), or pre-empted (via Proactive Alerts). What's left is the work that actually deserves a human.

---

## The 4 tracks running in parallel

| # | Track | Why it exists | Lead |
|---|---|---|---|
| 1 | **Stop the Bleeding** | FRT collapsed Jan→Apr, volume up 20%. If we don't arrest it now, NPS goes down before it goes up. | Faez |
| 2 | **Deflect the 76%** | 4,333 of 5,718 tickets are Information. Self-serve = the single biggest NPS lever we have. | Tooba + Basil |
| 3 | **Pre-empt + Retain** | Top 5 complaints are status-anxiety (payouts, QC, pickups, refunds, orders). Tell sellers before they ask. | Basil |
| 4 | **Team Transformation** | Without this, none of the above sustains. Each agent owns a system, not a queue. | Faez |

---

## Week 1 — May 6 to May 10: foundation week + Hi-Tea

**Theme:** Get instrumented before we build. We can't improve what we can't see. **Plus:** ship the first detractor face-to-face — the Hi-Tea — pre-Eid, so the post-Eid NPS wave (report 10 Jun) lands on warmer ground.

| Owner | Ship by Friday | Definition of done |
|---|---|---|
| **Faez** | (a) Sponsor alignment meeting on Q2 plan + +30 NPS commitment. (b) Redefine "active seller" in CX/leadership dashboards (current 12,665 → recommended 2,328). (c) MBR delivered to leadership. (d) **Hi-Tea Thu 8 May** facilitated, co-hosted with MP Ops — see [03-hi-tea-may-2026.md](03-hi-tea-may-2026.md). | Sponsor signs off on Q2 plan; new "active" definition in dashboards; MBR shared; Hi-Tea executed with 15–20 high-GMV detractor + passive sellers. |
| **Basil** | Help center analytics instrumented. Page-view, search query, search-with-zero-results, bounce rate, and "was this helpful?" feedback per article. **Plus:** venue + catering for Hi-Tea (Mon). | Weekly help center usage report exists; Hi-Tea logistics confirmed. |
| **Tooba** | Top-3 deflection candidates audited. For Payment Process Information (552 tickets), Bank Account Details Update (513), Payout Details Inquiry (387) — read the actual ticket transcripts, list the 5 most-asked questions per category. **Plus:** Hi-Tea invitations sent Mon; attendee confirmations Tue. | 1-pager per category; 15–20 sellers confirmed for Hi-Tea. |
| **Hamza** | Every Q1+April ticket re-tagged with deflection class: `auto-deflectable` / `human-required` / `proactive-eligible`. Spot-check 200 tickets minimum. **Plus:** ticket-history pre-read per Hi-Tea invitee; capture template ready by Tue EOD. | Tagging file in Sheets; Hi-Tea capture template live. |

**Faez 1:1 cadence kicks off:** 30 min weekly with each team member, focused on what they shipped and what's blocking. **No standups about tickets.**

**Hi-Tea T+1 to T+7 (Fri 9 May → Thu 15 May):** Insight memo (Fri), "You Said / We Did" commitments memo (Mon 12), personal follow-up to every attendee (Tue 13), first commitment shipped (Thu 15). Full schedule in [03-hi-tea-may-2026.md](03-hi-tea-may-2026.md).

---

## Week 2 — May 13 to May 17: ship the first 10 articles

| Owner | Ship by Friday | Definition of done |
|---|---|---|
| **Tooba** | First 10 net-new help center articles published, written from real ticket language. Cover Payment Process, Bank Account Update, Payout Inquiry, QC Hold, Login Credentials. | Articles live on `support.joinfleek.com`; agents instructed to link in every reply. |
| **Basil** | Auto-reply template overhaul: every common ticket type now triggers an auto-response with the link to the relevant article (before a human replies). | Tested; deployed in support tool; measured. |
| **Hamza** | "Contact reason not found" deep-dive (352 tickets) — what *are* sellers actually trying to ask? This is dark matter we currently route to dead-end. | List of 10 missing categories + recommendations; ticket form gets new options. |
| **Faez** | Concierge AI MVP scoping. Vendor or build? Scope to 5 Information categories first. Decision doc + 1-week build plan. | Decision logged; build kicks off in Week 3. |

**Target by end of Week 2:** measurable drop in Information ticket volume (target: −10% week-over-week on the 5 covered categories).

---

## Week 3 — May 20 to May 24: self-serve UI for the boring stuff

| Owner | Ship by Friday | Definition of done |
|---|---|---|
| **Basil + Faez** | Self-serve **Profile Picture Update** UI live in seller app (kills 162 tickets/quarter). Built with Claude Code if no engineering, otherwise eng. | Sellers can change their profile picture without raising a ticket. |
| **Basil** | Self-serve **Password Reset** flow audited. Identify why 77 sellers/quarter still raise tickets despite this likely existing. Fix the root cause. | Either (a) a working self-serve flow ships, or (b) we know exactly why current one doesn't deflect. |
| **Tooba** | Next 10 articles: Product Listing Information (219), Refund Related (180), Product Approval (179), How to fulfil order (165), How to become a seller (165). | Live; auto-reply linked. |
| **Hamza** | Top-5 complaint deep dive: Payment Not Processed (144), Incorrect Refund (85), Pickup Not Aligned (84), Order Status (82), Payout Not Received (73). What proactive alert would have prevented each? | Spec for Proactive Alerts v1 — drives Track 3 from Week 5 onward. |

---

## Week 4 — May 27 to May 31: Concierge AI v0.1 + Bank Details self-serve

| Owner | Ship by Friday | Definition of done |
|---|---|---|
| **Faez** | **Seller Concierge AI v0.1** soft-launched to 10% of sellers. Scope: Information bucket only — answers from help center + Fleek-specific SOPs. | AI handles 30%+ of routed sessions without escalation; logs every miss. |
| **Basil** | Self-serve **Bank Account Details Update** UI live (kills 56 Request tickets + meaningfully cuts the 513 Information tickets that ask "how do I change my bank?"). | Sellers update bank details without a ticket; backend verification flow intact. |
| **Tooba** | Concierge training data pipeline owned. Every "AI didn't know" → article gap → article shipped within 5 working days. | Loop is live. Tooba is now the Concierge AI's product owner, not a support agent. |
| **Hamza** | Proactive Alerts v1 spec — top 5 alerts (payout date, payout delay, QC hold reason, pickup confirmation, refund processed). Identify data sources (Fleek Platform GraphQL, BigQuery, ops DB). | Spec ready for build in Weeks 5–7. |

**End-of-May checkpoint:** ticket volume tracked daily; expect ~10–15% reduction by May 31 if Weeks 1–4 land.

---

## Weeks 5–8 (June): scale deflection, launch Proactive Alerts

Directional, will tighten week-by-week:

- **Week 5–6:** Concierge AI to 100% of sellers; expand from 5 → 15 Information categories. Self-serve for **Shop Name (34) + BIO (7) + Phone (16) + Email (11)** — kills entire Request bucket for boring updates.
- **Week 7:** **Proactive Alerts v1 LIVE** — payout dates, QC hold reasons, pickup confirmations sent to sellers automatically. Lead with the sellers who complain most.
- **Week 8:** Continuous in-app NPS replaces Google Form. Verbatims auto-tagged. Weekly NPS dashboard live.

---

## Weeks 9–13 (July): Growth Partner + retention layer

- **Week 9–10:** **Seller Growth Partner program** kicks off for the ~604 engaged transacting core. Weekly outbound from Faez + Basil with sales/listing insights pulled from BigQuery.
- **Week 11:** Detractor recovery loop — operationalized as a continuous program (kickoff already happened via the May 8 Hi-Tea, see [03-hi-tea-may-2026.md](03-hi-tea-may-2026.md)). Every NPS detractor in the post-Eid wave gets a personal follow-up within 48 hours, owned by the team member tagged to the issue category. Hi-Tea cadence becomes monthly (rotating PK Zone / PK Non-Zone / ROW virtual).
- **Week 12:** Retention play 1 — "5–30 day silence" sellers (live listings, no orders) get a re-engagement nudge with category demand data.
- **Week 13:** Q2 wrap, NPS pulse, Q3 plan socialized.

---

## Owners & RACI

| Workstream | Responsible | Accountable | Consulted | Informed |
|---|---|---|---|---|
| FRT recovery + ops health | Hamza | Faez | All | Sponsor |
| Help center / Hub | Tooba | Faez | Basil | Sponsor |
| Concierge AI | Faez | Faez | Tooba | All |
| Self-serve UIs | Basil | Faez | Eng (when available) | All |
| Proactive Alerts | Basil → Hamza | Faez | Eng + Data | All |
| NPS instrumentation | Faez | Faez | All | Sponsor |
| Seller Growth Partner | Faez + Basil | Faez | KAM team | Sponsor |

---

## Definition of done — per track at end of Q2

- **Track 1 (Stop the Bleeding):** FRT P90 < 5 min sustained; resolution P90 < 2 days; ticket volume on Information categories −25% vs Apr baseline.
- **Track 2 (Deflect 76%):** Hub has 50+ articles covering top 95% of Information ticket categories; Concierge AI handles 60%+ of routed sessions without escalation; self-serve UIs live for top 6 Request categories.
- **Track 3 (Pre-empt + Retain):** Proactive Alerts live for top 5 complaint drivers; detractor recovery loop closing within 48h; Growth Partner program reaching all ~600 engaged sellers weekly.
- **Track 4 (Team Transformation):** Tooba owns Concierge AI; Basil owns Self-serve + Alerts; Hamza owns Ops & FRT + ticket intelligence. None of them are "agents" by July 31.

---

## What we're NOT doing in Q2 (explicit non-goals)

- Building a seller-facing portal from scratch (use existing seller app + help center).
- Replacing the support tool / chatbot vendor (work within current stack).
- Commission, pricing, or listing-policy changes (separate commerce track).
- Hiring (zero net-new heads).
- Multi-language support (PK + ROW handled in English/existing setup; localization is Q3+).

---

## Risks (top 3)

1. **April +20% volume spike has unknown cause.** If it continues into May, our deflection numbers will look flat even if the program works. Mitigation: investigate root cause in Week 1 (Hamza); set targets in absolute terms, not percentages.
2. **Engineering bandwidth is limited.** Several deliverables assume Claude Code + no-code tooling. If a self-serve UI requires backend changes (e.g., bank verification), it slips. Mitigation: every spec flags eng dependency upfront; Faez escalates if blocked.
3. **Team capability ramp.** Hamza is least far along on tooling/AI; if he can't grow into the role within Q2, it bottlenecks Tracks 1 and 3. Mitigation: weekly 1:1, paired work with Basil, explicit learning plan in Week 1.

---

## Weekly review cadence

- **Monday 30 min:** Week's commitments per person.
- **Friday 30 min:** Ship review — what landed, what didn't, why.
- **Last Friday of month:** Metrics review + brief to sponsor.
