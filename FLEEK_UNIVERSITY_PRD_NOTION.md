# Fleek University — Why We're Replacing the Zendesk Help Center

**Owner:** Syed Faez Hasan (Seller Experience) · **Status:** Build complete, cutover Jul 16 2026 · **Doc date:** 10 Jul 2026

> **TL;DR** — We are moving the seller help center off Zendesk into **Fleek University**: a seller-facing learning portal inside our own product, powered by a Notion-style content manager that the SX team fully owns. All 26 Zendesk articles are already migrated. Cutover is this week.

---

## 1. Why (the problem)

- **76% of all seller tickets are Information questions** (SX baseline, Jan–Apr 2026). Sellers ask us things a good self-service experience should answer — every one of those tickets is agent time spent repeating documentation.
- **Zendesk gives us a documentation site; our sellers need a learning experience.** Our supply base is PK-heavy, mobile-first, and often Urdu-first. Zendesk's seller section is desktop-shaped, English-only, and organized like our org chart ("Payments and Finance") instead of seller jobs ("Get Paid").
- **SX doesn't control the experience.** Structure changes, targeting, in-app placement, video-first formats — all constrained by Zendesk. And we have zero analytics on what sellers search for and fail to find.
- **It's invisible where sellers actually are.** Sellers live in the vendor app; the help center lives on an external website they never visit.
- This directly serves the **Supplier NPS program (+30 in 2 quarters)** — self-service quality is a named driver, and Information-ticket deflection is the biggest lever we own.

## 2. What (the solution)

Two products, one content system:

**a) Fleek University (seller-facing, in-app)** — patterned on Daraz University, which our PK sellers already know and trust: home with search + "continue learning", six job-based topics (Start Selling, List Products, Ship Orders, Get Paid, Fix a Problem, Grow), visual block-based articles (summary card first, steps with screenshots, silent-demo autoplay videos, collapsible FAQs), learning paths with progress and badges, English + اردو, and a deflection sheet that offers answers before a seller opens a chat.

**b) Help Center Manager (internal, FleekOS)** — a Notion-style authoring portal where SX creates, edits, publishes, schedules, and measures every piece of content with **zero engineering involvement**. Admin/editor rights ride on FleekOS's existing role system.

**Already done (ahead of plan):** all 26 Zendesk "For Sellers" articles auto-migrated with images and videos, production storage live (content saves to our own cloud, drafts private, published content served to sellers), admin rights enforced, and the full editor built.

## 3. What's different — Zendesk vs Fleek University

| | Zendesk Help Center | Fleek University |
|---|---|---|
| **Where sellers meet it** | External website, separate login | Inside the vendor app they use daily |
| **Structure** | Internal-team categories | Seller jobs-to-be-done ("Get Paid", "Fix a Problem") |
| **Format** | Long text pages | Blocks: summary-first, steps, screenshots, autoplay video, tables, FAQs, PDFs |
| **Language** | English only | English + اردو (per-block translation, RTL) |
| **Learning** | None | Courses, progress, quizzes, badges (Daraz pattern) |
| **Authoring** | Zendesk's editor, vendor-controlled | Notion-style editor we own: slash-menu blocks, rich text, drag ordering |
| **Targeting** | Everyone sees everything | Per-region / lifecycle / segment visibility (existing FleekOS conditions engine) |
| **Support integration** | None | Deflection sheet before chat; agents share deep links; every search and 👎 is logged |
| **Analytics** | Page views at best | Searches, failed searches, helpful-%, deflection funnel, course completion |
| **Ownership** | Engineering-independent but capability-capped | SX owns content **and** experience; engineering owns only the platform |
| **Cost** | Zendesk seat/plan costs | Runs on our existing Vercel infra |

**What stays on Zendesk:** the buyer help center — deliberately unchanged.

## 4. The authoring experience (why writers will actually use it)

Writing an article feels like Notion, but every block is typed — which is what keeps articles rendering perfectly on a 360px phone and makes Urdu translation per-block possible:

- **Rich text** — bold / italic / underline / strikethrough / inline code / links, toolbar on focus
- **Blocks via "/" menu or palette** — text, headings, sections, bulleted & numbered lists, steps, callouts, **tables** (add/remove rows & columns), quotes, **dividers**, code blocks, FAQs, chips
- **Media, embedded not linked** — image, video (uploaded MP4 plays inline, autoplay-muted like a GIF; Loom/YouTube embeds also supported), and **PDF attachments rendered inline** with an "Open full PDF" action
- **Section movement** — every block moves up/down, inserts below, deletes; Enter creates the next block, Backspace on empty removes it
- **Safety rails** — publish/draft/schedule/archive, preview-as-seller before publishing, version snapshots with restore, HTML sanitization, upload size limits (images ≤4MB, video ≤15MB, PDF ≤10MB)
- **One-paste migration** — the "Paste an SOP" importer converts any copied document into blocks automatically (this is how Zendesk came over)

## 5. How it works (for the technically curious)

- Content lives as **typed JSON blocks** in cloud storage on our Vercel account; media files upload browser-direct to CDN-served storage.
- The manager portal is **local-first**: writes save instantly in-browser and sync up ~1.5s later, merged by freshness — two editors can work simultaneously.
- Sellers receive **published content only**, cached at the edge; drafts are never exposed.
- Writes require FleekOS **admin/owner JWT**; sellers authenticate with vendor login.
- The storage layer sits behind one interface — moving to Supabase/Postgres later (per the full PRD) changes zero screens.

## 6. Timeline

| Milestone | Owner | ETA | Status |
|---|---|---|---|
| Zendesk content migrated (26 articles, images, videos) | Claude | Jul 10 | ✅ Done |
| Notion-style editor + admin rights + media (image/video/PDF) | Claude | Jul 10 | ✅ Done |
| Production storage + sync, verified end-to-end | Claude | Jul 10 | ✅ Done |
| Preview deploy + upload QA | Claude | Mon Jul 13 | Next |
| Content polish pass (25 drafts → published) | SX | Tue Jul 14 EOD | **Critical path** |
| Production deploy + phone QA | Claude + SX | Wed Jul 15 | |
| **Cutover** (announcement, agent links, Zendesk stubbed) | SX | **Thu Jul 16** | |

**On the roadmap after cutover (full PRD):** vendor-app native embed (Sep–Oct), deflection metric GA (Oct 23), University layer + Urdu wave 1 (Nov 27), analytics dashboard, 90-day metrics review (Jan 2027).

## 7. How we'll know it worked

- **Deflection ≥18%** of help-sheet sessions (measured at the contact flow, honestly: sheet opens = denominator)
- **Information tickets −30%** per active seller by GA+90d
- Helpful-% ≥80 weighted by views · failed searches ≤15% · ≥40% of active sellers open Help monthly

## 8. Deliberately not in this cutover

Public/SEO site (app-only by decision) · native vendor-app embed (release-train dependent; web link via vendor login until then) · approval workflows (2–4 editors don't need them yet) · certificates & webinars (2027) · buyer help center changes.

---

*Prototype: `/university` (seller) and `/tools/help-center` (manager) · Wireframes: claude.ai/code artifact "Seller University" · Full engineering PRD: `SELLER_UNIVERSITY_PRD.md`*
