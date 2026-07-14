# PRD — Fleek Seller University & Help Center Management Tool

| | |
|---|---|
| **Owner** | Syed Faez Hasan (SX) |
| **Status** | Draft v1 for sign-off |
| **Date** | 10 Jul 2026 |
| **Target GA** | 23 Oct 2026 (help center) · 27 Nov 2026 (University layer) |
| **Artifacts** | [Wireframes v3](https://claude.ai/code/artifact/df2e1e5a-f7c5-434e-95f3-2b8e079d53f0) · Prototype: `/university` (this repo) · Reference UI: FleekOS SOP Portal, university.daraz.pk |

---

## 1. Press release (internal, working backwards)

> **Fleek launches Seller University — sellers now solve problems and learn to grow without raising a ticket.**
>
> Every Fleek seller now has, inside the vendor app, a help experience built the way they already learn on Daraz: search that answers in plain language, step-by-step visual guides with silent demo videos, learning paths with progress and badges, and Urdu throughout. Behind it, the Seller Experience team runs a block-based content tool in FleekOS and ships or fixes an article in minutes — no engineering ticket, no Zendesk. In the first quarter, sellers deflected one in five would-be support contacts, and Information tickets — 76% of all seller tickets — fell by a third.

## 2. FAQ (the questions that decide the project)

**Why build instead of staying on Zendesk?** SX needs full editorial control, seller-segment targeting, Urdu-per-block, and in-app deflection instrumentation. Zendesk gives none of these well; the differentiated layer (block articles, courses, deflection sheet) has to be custom regardless. Decision locked 09 Jul.

**Why vendor-app only?** Sellers live in the app; contextual deep links and personalization need auth. Accepted costs (explicit): no SEO, no pre-signup education, agent-shared links require login. Buyer help stays on Zendesk.

**What makes this a "University" and not a help center with a new name?** The course layer: ordered lessons (each lesson = an article whose first block is a video), per-seller progress, quizzes and badges — the Daraz pattern our PK sellers already know. One CMS powers both wings.

**What is the single riskiest assumption?** That SX can produce 25 launch-quality articles + 10 silent-demo videos in 4 weeks. Content, not code, is the critical path — the timeline below treats it that way.

**How will we know it worked?** Deflection is measured at the contact flow, not inferred from page views: sheet opens = denominator; sessions that open a suggestion and don't start a chat within 24h = numerator.

## 3. Problem & evidence

- **76% of seller tickets are Information** (SX baseline, Jan–Apr 2026) — sellers ask questions the product should answer.
- Current Zendesk help center is desktop-shaped, English-only, org-chart structured, and invisible inside the vendor app where sellers actually are.
- Supplier NPS program targets **+30 in 2 quarters**; self-service quality is a named driver.
- SX team owns content but cannot ship or restructure it without friction; no analytics on what sellers search and fail to find.

## 4. Goals & success metrics

| Metric | Baseline | Target (GA+90d) | Source |
|---|---|---|---|
| **Deflection rate** (north star) | n/a (not measurable today) | ≥ 18% of help-sheet sessions | `contact_events` |
| Information-ticket volume / active seller | index 100 | ≤ 70 | `cx_dashboard_base` |
| Article helpful-% (👍 share) | n/a | ≥ 80% weighted by views | `article_feedback` |
| Failed-search rate | n/a | ≤ 15% of queries | `search_events` |
| Help adoption (active sellers opening Help / month) | n/a | ≥ 40% | `view_events` |
| Course completion (New Seller Journey, new cohorts) | n/a | ≥ 35% reach quiz | `seller_progress` |

**Guardrails:** chat entry must never be >1 tap deeper than today (NPS risk); article publish→live latency <1 min; p75 article load <2s on 3G.

## 5. Non-goals (launch scope)

- Public/SEO site, pre-signup education (decision: app-only).
- Approval workflows, audit logs, granular roles (2 roles only; revisit at >4 editors).
- Certificates & webinars (2027 Q1 candidates).
- Full library migration **at GA** — top 25 articles at GA, remainder in weekly waves until 18 Dec.
- Buyer help center changes (stays on Zendesk).

## 6. Users & jobs

1. **Seller (PK-heavy, mobile, often non-native English or Urdu-first):** "Fix my problem now" (payout, order, bank) · "Teach me to sell more" (new seller, growth).
2. **SX editor (2–4 people):** write, restructure, target, and measure content without engineering.
3. **SX agent:** paste one deep link in chat/WhatsApp instead of typing an explanation.

## 7. Solution (built & validated)

- **Seller side (mobile, Daraz-University pattern, Fleek branding):** University home (hero+search, continue-learning, 6 job topics, learning paths), topic pages, block-rendered articles (in-short card, steps+screenshots, silent-demo autoplay video, callouts, FAQ, feedback), lesson player with progress, quiz→badge, updates feed, deflection sheet intercepting "Contact support" (chat + WhatsApp). EN/اردو per-block.
- **Management tool (FleekOS, SOP-Portal sibling):** articles table with performance columns, block editor (10 typed blocks — the schema *is* the style guide), drafts/scheduled/published/archived, snapshot versioning + restore, media library (Supabase Storage), visibility via existing `AppearanceConditions`, courses tab, analytics tab.
- **Design system:** S4 anti-generic kit (swing tags, stamps, marker strokes, grade-stack, hard shadows) — implemented in `src/components/university/kit.tsx` + `tokens.ts`.

Prototype (mock data) proves all seller screens today at `/university`.

## 8. Phased plan with timelines

> Working assumptions: Faez as PM/builder (Claude-assisted) ~60%; 0.5 backend engineer (infra review, Supabase, security); 2 SX writers @ 50% from Phase 2; designer ad-hoc (icon set, mascot); vendor-app squad for 1 sprint (booked by 8 Aug — see Dependencies). ~15% buffer is inside each phase. Dates are end-of-phase ETAs.

| Phase | Dates (2026) | Deliverables | Owner | Exit criteria |
|---|---|---|---|---|
| **W0 — Sign-off & data** | Jul 10–17 | PRD signed; seller ticket L2 taxonomy pulled from BigQuery → ranked top-25 article list; audit of existing Zendesk seller articles; editor count confirmed | Faez | Top-25 list agreed with SX |
| **P0 — Foundations** | Jul 20–31 | Supabase schema (articles, versions, media, categories, courses, progress, events, feedback) + Storage buckets; migrate in-memory admin-store; 2 roles (admin/editor); event pipeline to BigQuery | Faez + BE eng | Content written in staging survives cold starts; events land in BQ |
| **P1 — Manager core** | Aug 3–21 | Block editor (10 blocks), media library w/ video upload rules (≤15MB, poster required), drafts/publish/schedule, snapshot versioning+restore, preview-as-seller, articles table | Faez | SX writes & publishes a real article end-to-end unaided |
| **P2 — Content sprint** *(critical path)* | Aug 10–Sep 11 | Style guide + article templates (wk 1); top 25 articles EN written to Sea-Shipping standard; 10 silent-demo videos; 6-topic IA populated | SX writers + Faez | 25 published; each passes preview-as-seller + peer read |
| **P3 — Seller experience production** | Aug 24–Sep 18 | Prototype wired to real API; Postgres full-text search; view/search/feedback events; announcements + homepage Learning Center fed from new store; perf pass (3G budget) | Faez + BE eng | All seller screens on live data; zero mock imports |
| **P4 — Vendor app pilot** | Sep 21–Oct 9 | Webview embed + SSO token handoff in vendor app; internal dogfood (Sep 21); pilot to ~100 sellers (Sep 28, mixed lifecycle, PK-weighted); weekly iteration | Vendor-app squad + Faez | Pilot gate: crash-free ≥99.5%, helpful ≥75%, events verified |
| **P5 — GA + deflection** | Oct 12–30 | Deflection sheet replaces "Contact support" in-app; WhatsApp deep-link logging; staged ramp 25→100% (**GA Oct 23**); Zendesk seller section redirected Oct 30 | Faez + vendor-app | Deflection metric reporting daily; no chat-access regression |
| **P6 — University layer + Urdu wave 1** | Nov 2–27 | Lesson player + `seller_progress` live; New Seller Journey (7 lessons) + quiz/badge; Urdu for top 10 articles (per-block) + RTL QA; **University GA Nov 27** | Faez + SX + designer | Course completable end-to-end; Urdu toggle sticky & correct |
| **Waves (parallel)** | Nov 2–Dec 18 | Remaining library migrated in weekly waves; failed-search report drives net-new articles | SX writers | Zendesk seller content fully sunset by Dec 18 |
| **2027 Q1 (roadmap)** | Jan–Mar | Certificates; Grow-your-GMV path; analytics dashboard v2 (deflection by article); Urdu wave 2; approval workflow *if* editor team >4; evaluate standalone-repo move per supplier-portal architecture | — | — |

**Milestone summary:** first real article published **Aug 21** · pilot in sellers' hands **Sep 28** · help center GA **Oct 23** · Information-ticket impact readable **late Nov** · University GA **Nov 27** · full migration done **Dec 18** · Q1 review with 90-day metrics **late Jan 2027**.

## 9. Dependencies (dated, with owners)

| Dependency | Needed by | Owner | Risk if missed |
|---|---|---|---|
| Vendor-app squad sprint commitment (webview + SSO handoff) | booked by **Aug 8**, build Sep 21 | Eng lead | P4 slips week-for-week; single biggest schedule risk |
| Supabase project + Storage provisioning (prod) | Jul 20 | BE eng | P0 blocked |
| In-app chat event hooks (chat_started w/ source tag) | Sep 18 | CX platform | Deflection metric degraded to proxy |
| Seller ticket L2 taxonomy access (BigQuery) | Jul 15 | Data | Top-25 list becomes guesswork |
| Custom icon set + mascot illustrations (6 topics) | Sep 11 | Designer | Launch with Lucide placeholders (acceptable, not ideal) |
| Urdu translation resource (SX bilingual or vendor) | Oct 26 | SX lead | P6 Urdu slips to wave 2 |

## 10. Risks & mitigations

1. **Content sprint underruns (highest likelihood).** Mitigation: taxonomy-ranked list caps scope at 25; block editor makes articles assembly not authorship; GA gate counts *published articles*, not calendar. Fallback: GA with 20 if the top-20 cover ≥75% of Information volume.
2. **Vendor-app sprint not secured.** Mitigation: escalate for Aug 8 commitment at sign-off; fallback is FleekOS-web pilot via link-out (worse UX, keeps dates).
3. **Deflection sheet perceived as chat-blocking → NPS hit.** Mitigation: chat visible without scrolling, SLA promise shown, guardrail metric monitored daily during ramp; instant rollback flag.
4. **Webview auth/session bugs on low-end Android.** Mitigation: dogfood week targets bottom-decile devices; p75 3G perf budget in P3 exit.
5. **Urdu RTL breakage.** Mitigation: RTL handled at block-renderer level (already proven in prototype); dedicated QA pass in P6.
6. **Solo-builder bus factor.** Mitigation: BE engineer reviews all P0/P3 infra; runbook in `docs/`; nothing bespoke in hosting.

## 11. Instrumentation spec (built in P0, non-negotiable)

`view_events` (article, seller, **source**: search|browse|deep-link|agent-link|contact-flow) · `search_events` (query, result_count, clicked_slug) · `article_feedback` (👍/👎 + reason) · `faq_expand` · `contact_events` (sheet_open, suggestion_opened, chat_started, whatsapp_started — the deflection funnel) · `seller_progress` (lesson_completed, quiz_submitted). All exported to BigQuery daily; deflection dashboard in Metabase by P5.

## 12. Open questions (answers needed at sign-off)

1. Confirm editor count (locks the 2-role decision).
2. Pilot cohort criteria — propose 100 sellers: 60 PK, mixed lifecycle, incl. 20 recent ticket-raisers.
3. Who owns Urdu translation (internal bilingual vs vendor) and budget?
4. Vendor-app sprint: which release train covers Sep 21–Oct 9?

---

*Appendix — repo map: prototype `src/components/university/` · tokens `src/lib/university/tokens.ts` · block contract `src/components/university/data.ts` (becomes Supabase JSONB schema in P0) · design guardrails: wireframes S4 (binding).*
