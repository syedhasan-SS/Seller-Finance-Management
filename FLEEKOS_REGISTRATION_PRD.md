# PRD — Fleek University & Help Center Manager (FleekOS Tool Registration)

## Summary

We are replacing the Zendesk seller help center with **Fleek University** — an in-product, mobile-first help and learning portal for sellers — powered by the **Help Center Manager**, a Notion-style content tool on FleekOS that gives the Seller Experience team full ownership of content, structure, and publishing with zero engineering involvement. We expect this to deflect a meaningful share of Information tickets (76% of all seller tickets) and directly support the Supplier NPS +30 program.

## Team

| Role | Name |
|------|------|
| PM | Syed Faez Hasan (Seller Experience) |
| Designer | TBD — icon set & mascot ad-hoc; design system defined (SOP Portal language + anti-generic guardrails) |
| Engineers | Built by Faez (Claude-assisted); **platform review owner TBD — needs assignment before FleekOS registration** |

## Context

Fleek's seller base is PK-heavy, mobile-first, and frequently Urdu-first. Seller help content lives today on an external Zendesk site — desktop-shaped, English-only, organized by internal team names, and invisible from the vendor app where sellers actually work. The SX baseline (Jan–Apr 2026) shows 76% of seller tickets are Information questions — agents repeatedly answering things documentation should handle. The Supplier NPS program (+1 → +30 in two quarters) names self-service quality as a key driver. Daraz University proves the education-portal pattern works for exactly this seller demographic (160k monthly users). All 26 Zendesk "For Sellers" articles have already been migrated into the new tool via Zendesk's API; the tool, storage, and seller experience are built and verified on localhost with production infrastructure (Vercel Blob) live.

## Problem

Sellers cannot solve routine questions themselves at the moment they hit them, so they open tickets instead — 76% of all seller tickets are Information requests, consuming SX agent capacity and slowing sellers' operations.

**Hypothesis:** Help content exists but is functionally invisible (external site, separate from the vendor app) and hard to consume for our seller base (long English text pages, no visual/video-first format, org-chart structure instead of seller jobs). Sellers default to the channel that works: asking a human.

**Evidence this is real and worth solving:**
- How many users affected: all active sellers (every seller contacting support; exact MAU available from `fleek_analytics.growth_model` — **to attach before review**)
- Severity (1-10): 8 for payment/order-blocking questions (seller cannot operate until answered); 4–5 for general how-to questions
- 76% of seller tickets are Information type (SX ticket-mix baseline, Jan–Apr 2026)
- Zendesk gives no search/failed-search/effectiveness analytics, so content gaps are invisible today
- Buyer-side precedent: buyer ticket taxonomy showed concentrated, deflectable question clusters (Buyer Help Center Phase 1, approved Jun 2026)

## Impact

| Business impact |
|----------------|
| Agent hours: the majority ticket category (Information, 76%) becomes deflectable, freeing SX capacity without headcount |
| Supplier NPS program: self-service is a named driver of the +30 target |
| SX gains content analytics (searches, failed searches, helpful-%) — a permanent feedback loop for what to write next |

| Customer impact |
|----------------|
| Sellers get answers 24/7 inside the app, in plain language with steps, screenshots and video — no waiting for an agent |
| Payment/order-blocking questions (highest severity) resolve at the moment of need |
| Urdu support (roadmap) makes help genuinely accessible to the core seller base |

## Solution

Two surfaces, one content system:

1. **Fleek University (seller-facing, `/university`)** — mobile-first portal patterned on Daraz University in Fleek's brand: home with search and six job-based topics (Start Selling, List Products, Ship Orders, Get Paid, Fix a Problem, Grow), block-rendered articles (summary card first, numbered steps with screenshots, silent-demo autoplay videos, tables, collapsible FAQs, embedded PDFs), topic pages, updates feed, and a help sheet suggesting articles before chat/WhatsApp escalation. Course/lesson/quiz UI is built but gated off until real lesson content exists.
2. **Help Center Manager (internal, `/tools/help-center`)** — Notion-style authoring: rich-text blocks with slash-menu, tables, dividers, image/video/PDF upload (all embedded), drafts/publish/schedule/archive, preview-as-seller, paste-an-SOP importer, media library, announcements, and export/import backup. Access rides on FleekOS's existing role system (`AdminProtectedRoute`; owner/admin full control, editor tier without destructive actions).

**Architecture:** typed JSON content blocks stored on Vercel Blob via two consolidated serverless functions (public reads serve published-only content, cached; writes require admin JWT); media uploads go browser-direct to Blob/CDN (15MB videos bypass function limits); the manager is local-first with automatic debounced sync, server-wins on boot. Storage sits behind a single interface for a later Supabase migration with zero UI change.

## Roll out plan

| Stage | When | What |
|---|---|---|
| Production deploy | Mon 13 Jul | `vercel deploy --prod` → seller-finance-management.vercel.app (or joinfleek.com subdomain); admin login smoke test |
| Content publish | 13–14 Jul | SX polish pass on the 25 migrated drafts (rename to plain language, In-short cards, strip Zendesk cruft) → publish |
| Cutover | Thu 16 Jul | Seller announcement (in-app + WhatsApp), agents switch to new links, Zendesk For-Sellers section stubbed to redirect |
| Vendor-app embed | Sep–Oct | Webview + SSO in the vendor app (release-train dependency) |
| Deflection integration | Oct | Help sheet wired into the real contact flow; deflection metric goes live |
| University layer + Urdu wave 1 | Nov | Real course content, progress, quiz/badges; top-10 articles in اردو |

## Success metrics

| Primary metric |
|---------------|
| Information-ticket volume per active seller: **−30% by cutover + 90 days** (source: `fleek_hub.cx_dashboard_base`) |

| Secondary metric |
|-----------------|
| Help adoption ≥40% of active sellers opening Fleek University monthly; article helpful-rate (👍 share) ≥80% weighted by views |

| Balancing metric(s) |
|--------------------|
| Chat accessibility must not degrade — contact path stays ≤1 tap deeper than today; watch seller CSAT/complaints about "can't reach support" during ramp. Failed-search rate ≤15% (watched so self-serve isn't a dead end) |

## Known limitations

- Until the vendor-app embed ships, sellers access via web link with vendor login (no native entry point)
- Migrated images are still Zendesk-hosted (`src` URLs) until re-uploaded to our media library during polish
- English-only at launch; Urdu is per-block-ready in the data model but untranslated
- Analytics event capture (views, searches, feedback → BigQuery) is designed but **not yet wired** — at launch, effectiveness is qualitative; instrumentation lands with the Oct deflection phase
- Inline PDF rendering varies by mobile browser (an "Open full PDF" fallback always shows)
- Rich-text internals use browser-native editing commands (deprecated but universal); planned swap to TipTap without changing stored content
- Vercel Hobby plan: 12-function cap (currently at 11) and no team seats — plan upgrade needed when a second engineer joins

## Risks

- **Content polish capacity (highest):** 25 drafts must be publish-quality by Jul 14; mitigations — importer already did the structural work, ~15 min/article, fallback is launching with the top subset covering most ticket volume
- **Single-builder bus factor:** one person built and operates this; mitigation — architecture notes in repo docs, standard Vercel primitives, platform review owner to be assigned at registration
- **Deflection unmeasurable at launch:** the primary metric reads from ticket volume trends until contact-flow instrumentation ships in Oct; interim measurement is directional
- **Concurrent editing:** last-write-wins per content document; two admins editing the same article simultaneously can overwrite each other (acceptable at 2–4 editors; row-level merge comes with Supabase)
- **Domain/brand:** launching on a vercel.app URL if a joinfleek.com subdomain isn't assigned by Monday

## Out of scope

Buyer help center (stays on Zendesk) · public/SEO site (app-only by decision) · approval workflows and audit logs (2–4 editors) · certificates/webinars (2027) · AI answers/chatbot · per-seller personalization beyond the existing conditions engine.

## Milestones

| Milestone | Date |
|-----------|------|
| Build complete: portal, editor, storage, auth, 26 articles migrated | 10 Jul 2026 ✅ |
| Production deploy | 13 Jul 2026 |
| All content published (polish pass done) | 14 Jul 2026 |
| Cutover from Zendesk | 16 Jul 2026 |
| Vendor-app embed | Sep–Oct 2026 |
| Deflection metric live | 23 Oct 2026 |
| University layer + Urdu wave 1 | 27 Nov 2026 |
| 90-day metrics review | late Jan 2027 |

## Helpful resources

- Engineering PRD: `SELLER_UNIVERSITY_PRD.md` (repo root) · Stakeholder narrative: `FLEEK_UNIVERSITY_PRD_NOTION.md`
- Wireframes v3 (design system + guardrails): claude.ai/code artifact "Seller University"
- Code: `src/components/university/` (both surfaces), `api/help-center/`, `api/_lib/help-center/`
- Old help center: support.joinfleek.com → For Sellers (26 articles, migrated 10 Jul via public API)
- Pattern reference: university.daraz.pk · Internal design language: FleekOS SOP Portal
- Data sources for metrics: `fleek_hub.cx_dashboard_base` (tickets), `fleek_analytics.growth_model` (active sellers)
