# Fleek Seller University — Detailed PRD

**Owner:** Syed Faez Hasan (Seller Experience) · **Reviewer:** Umer Haroon (Head of Department) · **Date:** 13 Jul 2026 · **Status:** Built & live; cutover in progress

> **One line:** We are replacing the Zendesk seller help center with **Fleek Seller University** — an in-product, mobile-first help and learning portal for sellers — powered by a Notion-style content manager that gives the Seller Experience team end-to-end ownership of seller education, with zero engineering dependency for content work.

---

## 1. What are we building?

Two products on one content system:

**A. Fleek University (seller-facing).** A mobile-first portal inside the seller's world — patterned on Daraz University, which our PK-heavy seller base already knows — where a seller can search, browse six job-based topics (*Start Selling · List Products · Ship Orders · Get Paid · Fix a Problem · Grow*), and read visual, step-by-step guides: a plain-language summary card first, numbered steps with screenshots, silent auto-playing demo videos, tables, collapsible FAQs, and embedded PDFs. English and اردو are built into the data model. A help sheet offers relevant articles *before* a seller opens a chat.

**B. Help Center Manager (internal).** A Notion-style authoring tool where SX writes and manages everything: rich-text block editor ("/" block menu, tables, dividers, media embeds), media library (images/video/PDF with size and format rules), drafts → publish → schedule → archive lifecycle, preview-as-seller, announcements, one-paste SOP importer, and role-based access (admin vs editor) on FleekOS's permission system.

**Current state — this is not a proposal:** both products are **built, verified, and live** (portal: fleek-seller-university.vercel.app). All 26 Zendesk "For Sellers" articles were migrated automatically via Zendesk's API, images and videos included. FleekOS registration is done and the platform integration (PR #2565 + registry follow-up) is in the merge pipeline.

## 2. Why are we building it?

1. **The ticket data demands it.** 76% of all seller tickets are *Information* requests (SX baseline, Jan–Apr 2026) — sellers asking questions that documentation should answer. Every one consumes agent capacity and blocks a seller mid-operation.
2. **Self-service is a named driver of the Supplier NPS program** (+1 → +30 in two quarters). We cannot hit the NPS target while the majority ticket category has no self-serve path sellers actually use.
3. **SX must own the seller education loop.** Today content ownership is nominal — the experience, structure, analytics, and distribution are all constrained by a third-party tool. Owning the system turns seller education into an operable program: write → publish → measure → improve, weekly.
4. **The seller base is scaling faster than support headcount can.** Deflection is the only lever that scales sub-linearly with seller count.

## 3. What problems are we trying to solve?

| Problem | Evidence | Who feels it |
|---|---|---|
| Sellers can't self-solve routine questions at the moment they occur | 76% of tickets are Information-type | Sellers (blocked operations), SX agents (repeat answers) |
| Payment/order-blocking questions are answered at agent speed, not seller speed | Highest-severity contact reasons: payouts, bank setup, order processing | Sellers — a blocked payout stops their business |
| We don't know what sellers can't find | Zendesk provides no search/failed-search analytics | SX — content strategy is guesswork |
| Content can't be targeted or sequenced | No region/lifecycle targeting, no learning paths | New sellers get the same wall of text as veterans |
| Education doesn't reach sellers where they work | Help center is an external website; sellers live in the vendor app | Everyone — the content exists and is invisible |

## 4. Current limitations of the Zendesk Help Center

- **Wrong shape for our sellers:** desktop-first, long text pages, English-only — for a mobile-first, PK-heavy, frequently Urdu-first audience.
- **Org-chart structure, not seller jobs:** categories mirror internal teams ("Payments and Finance") instead of seller intents ("Get Paid").
- **No product integration:** not in the vendor app, no contextual deep links, no pre-chat deflection, separate login world.
- **No analytics that matter:** no failed-search reporting, no per-article effectiveness, no deflection measurement — content gaps are invisible.
- **No targeting or learning:** no region/segment visibility, no courses, progress, or sequencing for new sellers.
- **Capability-capped authoring:** no typed content blocks, no per-block translation model, no enforced style — long walls of text are the path of least resistance.
- **Third-party ceiling:** every structural improvement is bounded by what Zendesk permits; differentiated seller-education features are impossible by construction.

## 5. Gaps in the current seller experience

1. **Time-of-need gap** — help isn't present at the moment of confusion (bank rejected, order stuck, payout on hold); the seller's only path is a ticket.
2. **Language gap** — a large share of the supply base operates in Urdu; English-only text excludes exactly the sellers who contact support most.
3. **Format gap** — sellers learn from short videos and visual steps (the Daraz precedent proves this at 160k monthly users); we offer long English documents.
4. **Onboarding gap** — no guided journey for new sellers; the first weeks are trial, error, and tickets.
5. **Growth gap** — nothing teaches an established seller how to grow (pricing, ratings, campaigns, sea shipping); education is entirely reactive.
6. **Feedback gap** — sellers can't tell us an article failed them; we can't see what they searched and didn't find.

## 6. The ideal future state

**Now (shipped / cutover this week):** every seller question that dominates ticket volume has a visual, plain-language answer, live in Fleek University; SX publishes and fixes content in minutes with no engineering ticket; agents deflect by sharing deep links; all 26 legacy SOPs migrated; Zendesk seller section retired.

**Next (Q3–Q4 2026, per roadmap):** the portal lives natively in the vendor app (webview + SSO); the help sheet intercepts the contact flow and produces a true deflection metric; analytics (views, searches, failed searches, helpful-%) flow to BigQuery dashboards; Urdu wave 1 covers the top articles; the University layer goes live — learning paths with progress and badges (New Seller Journey), video-first lessons with اردو voice-over.

**Later (2027):** course completion certificates; content-gap loop fully automated (failed searches → article backlog); per-seller contextual help surfaced by lifecycle signals; seller education measurably shifts activation and GMV curves, not just ticket volume.

## 7. Functional requirements

Status: ✅ shipped · 🔜 roadmap

**Seller-facing**
- ✅ Search across published content (logged, incl. zero-result queries client-side; pipeline to BQ 🔜)
- ✅ Six job-based topics; topic pages with ready + upcoming articles
- ✅ Block-rendered articles: summary card, steps + screenshots, tables, callouts, FAQs, quotes, dividers, code blocks
- ✅ Media embedded, not linked: images; silent-demo autoplay videos (muted/loop/inline, reduced-motion fallback); Loom/YouTube embeds; PDFs embedded with open/download fallback
- ✅ Article feedback (👍/👎), related articles, updates/announcements feed
- ✅ Pre-chat help sheet suggesting published articles; chat/WhatsApp escalation always visible
- ✅ EN/اردو toggle with RTL (translations 🔜 wave 1)
- 🔜 Courses: learning paths, per-seller progress, quiz → badge (UI built, gated until real lesson content)
- 🔜 Contextual deep links from vendor-app surfaces

**Manager (internal)**
- ✅ Notion-style editor: rich text (bold/italic/underline/strike/inline code/links), "/" block menu, block reorder/insert/delete, Enter/Backspace block flow
- ✅ Content lifecycle: draft → publish → archive → restore; duplicate; preview-as-seller (mobile rendering incl. drafts)
- ✅ Media library: image ≤4MB, video ≤15MB (H.264 720p guidance), PDF ≤10MB; alt-text; usage counts; delete protection
- ✅ Paste-an-SOP importer (auto-converts pasted docs to blocks); Zendesk bulk import (already executed)
- ✅ Announcements CRUD feeding the seller updates feed
- ✅ Roles: admin (full) vs editor (no destructive actions) on FleekOS auth; production admin accounts via ADMIN_USERS_JSON
- ✅ Export/import backup (JSON)
- 🔜 Scheduling UI, version-history browser (snapshots exist), targeting by region/lifecycle (engine exists, UI pending)

**Platform**
- ✅ Content on Vercel Blob via authenticated API; published-only public reads (cached); drafts never exposed
- ✅ Local-first editing with automatic sync (server-wins boot; multi-editor safe for 2–4 editors)
- ✅ FleekOS registration + bridge app (fleekit PR #2565)
- 🔜 Full port into fleekit monorepo (phase 2); Supabase/Postgres migration path (storage behind one interface)

## 8. Non-functional requirements

- **Performance:** p75 article load < 2s on 3G-class connections; media served from CDN; publish→live latency < 1 min.
- **Reliability:** content store durable and backed up (export snapshots); portal degrades to cached content on API failure.
- **Security:** writes require admin JWT (FleekOS roles); HTML sanitization on all rich text (XSS-safe by construction); upload type/size allow-lists; drafts private.
- **Localization:** per-block translation model; RTL rendering; no layout that breaks under Urdu text lengths.
- **Accessibility:** alt-text required on images; reduced-motion respected for autoplay video; keyboard-operable editor.
- **Compatibility:** modern Android WebView/Chrome and iOS Safari, low-end devices included; PDF embed falls back to open-in-new-tab.
- **Maintainability:** typed block schema as the single content contract; generated/registered via fleekit conventions; no bespoke infrastructure.
- **Scalability:** content volume (100s of articles) and seller traffic well within Blob/CDN limits; editor concurrency acceptable at current team size, row-level merge planned with DB migration.

## 9. Expected outcomes & success metrics

| Metric | Target | Source |
|---|---|---|
| **Information-ticket volume per active seller** (primary) | **−30% by cutover +90 days** | `fleek_hub.cx_dashboard_base` |
| Deflection rate (once contact-flow instrumentation ships) | ≥18% of help-sheet sessions | contact_events |
| Help adoption | ≥40% of active sellers open it monthly | view_events |
| Article helpful-rate | ≥80% (views-weighted) | article_feedback |
| Failed-search rate | ≤15% of queries | search_events |
| **Guardrail** | Chat reachability never degrades (≤1 tap deeper than today); watch CSAT/complaints during ramp | CX channels |

Qualitative outcomes: SX operates content weekly without engineering; agents resolve Information contacts by link instead of typing; new-seller onboarding has a guided path (post-University layer).

## 10. Known limitations & current risks

- **Distribution until the app embed ships:** sellers reach the portal by link (announcement, agent-shared, chat), not a native tab — the Sep–Oct embed closes this.
- **Analytics instrumentation lands in Oct:** launch measurement is directional (ticket-volume trends) rather than per-article.
- **English-only at launch;** Urdu is modeled but untranslated (wave 1 scheduled).
- **Migrated images still Zendesk-hosted** until the polish pass re-uploads them (works today; ownership hygiene item).
- **Concurrent editing is last-write-wins** per document — acceptable at 2–4 editors; proper merge arrives with the DB migration.
- **Bus factor:** single builder/operator today — mitigated by standard infra, docs in repo, and the fleekit port bringing it under platform conventions.
- **Content polish capacity** is the critical path this week: 25 migrated drafts need plain-language titles and cleanup before full publish.

## 11. Rollout status & milestones

| Milestone | Date | Status |
|---|---|---|
| Build complete (both products), 26 SOPs migrated, storage live | 10 Jul | ✅ |
| Production deploy (portal live) | 13 Jul | ✅ |
| FleekOS registration + bridge PR merged | 13 Jul | ✅ (registry follow-up in pipeline) |
| Content polish pass → publish all | 14–15 Jul | in progress |
| Cutover: announcement, agent links, Zendesk stub | 16 Jul | planned |
| Vendor-app embed (webview + SSO) | Sep–Oct | roadmap |
| Deflection metric live (contact-flow events → BQ) | 23 Oct | roadmap |
| University layer (courses/badges) + Urdu wave 1 | 27 Nov | roadmap |
| 90-day metrics review | late Jan 2027 | roadmap |

## 12. Decisions & support needed (for review with Umer Haroon)

1. **Platform review owner** — a named engineer for the FleekOS registration and phase-2 fleekit port.
2. **Vendor-app squad commitment** for the Sep–Oct embed sprint (the single biggest schedule risk on the roadmap).
3. **Urdu translation resourcing** — internal bilingual capacity vs vendor, for wave 1.
4. **Branded domain** — approve `university.joinfleek.com` (one DNS record) to replace the vercel.app URL in seller-facing comms.
5. **Eng Support (near-term):** expedite review/merge of the fleekit registry PR; grant tool permissions (`fleekit.fleek-seller-university.*`) to SX team members once the route is live.

## 13. References

- Live: fleek-seller-university.vercel.app/university (seller) · /tools/help-center (manager)
- Wireframes v3 (design direction, anti-generic guardrails): claude.ai/code artifact "Seller University"
- Companion docs: `SELLER_UNIVERSITY_PRD.md` (engineering plan) · `FLEEKOS_REGISTRATION_PRD.md` (+PDF) · `FLEEK_UNIVERSITY_PRD_NOTION.md` (short narrative)
- Patterns: university.daraz.pk · FleekOS SOP Portal · fleekit PR #2565
- Data: `fleek_hub.cx_dashboard_base` (tickets) · `fleek_analytics.growth_model` (active sellers)
