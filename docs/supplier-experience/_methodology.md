# PRD Methodology — Supplier Experience Program

> **Purpose:** A 1-page calibration doc so author + reviewer agree on *how* every PRD in this program is written before we argue about *what* it says.

---

## Why this hybrid

Most PRDs fail one of two ways:
- **Too inspirational** → engineers can't build it.
- **Too detailed** → no one remembers why we're building it.

NPS recovery is a **trust problem**. If our PRDs are built around features instead of supplier outcomes, we'll ship things suppliers don't value and the NPS won't move. So every PRD has two parts:

| Part | Source | Job |
|---|---|---|
| **A. PR-FAQ** | Amazon "Working Backwards" | Force supplier-centric framing. If a supplier wouldn't celebrate the press release, we don't build it. |
| **B. Spec body** | Lenny / Marty Cagan modern PM template | Make it executable. Engineers, data, and ops can plan from this. |

PR-FAQ stops bad ideas. Spec body ships good ones.

---

## Part A — PR-FAQ structure (≈ 1.5 pages)

**1. Press Release** (≤ 1 page)
- **Headline** — one line, supplier benefit, no jargon. *Bad: "Launching v2 of commission API." Good: "FleekOS suppliers can now see exactly how much they earn on every order — before they accept it."*
- **Sub-head** — one sentence, the so-what.
- **Problem paragraph** — what supplier pain we're fixing, in their words.
- **Solution paragraph** — what we built, in supplier-visible terms (no internal architecture).
- **Quote from a supplier** — fictional but realistic. Stress-test: "would a real supplier say this?"
- **How it works** — 3–5 bullets, supplier-facing.
- **Quote from FleekOS leader** — strategic framing.
- **Call to action / availability** — when, who gets it first.

**2. Internal FAQ** — top 5–10 questions a stakeholder would ask. Examples:
- What does this cost to build?
- What teams are dependencies?
- Why now, not Q3?
- What happens if we don't build it?
- What's the kill-criterion?

**3. External FAQ** — top supplier questions:
- What changes for me?
- What stays the same?
- Do I need to do anything?
- How do I opt out?

---

## Part B — Spec body structure

| § | Section | Length | Purpose |
|---|---|---|---|
| 1 | Problem statement | ≤ ½ page | With **data**, not opinion (NPS deltas, ticket volumes, churn rates) |
| 2 | Goals | 3 bullets | Measurable, time-bound (e.g., "lift NPS detractor → passive conversion by 15pp in 90d") |
| 3 | Non-goals | 3–5 bullets | Explicit cuts. Critical in FleekOS plugin model where scope creep is the default |
| 4 | Users & JTBD | ½ page | Internal users (Supplier Ops, Cat Mgr, Finance) AND supplier segments (high-value / growth / low-perf) |
| 5 | Solution overview | ½ page | Capabilities, not screens. Diagrams welcome |
| 6 | Detailed requirements | 1–2 pages | Functional + non-functional. Acceptance criteria per req |
| 7 | Success metrics | ½ page | **Leading + lagging** indicators with targets. Each metric must say where it's logged (BigQuery table, GraphQL field, Postgres column) |
| 8 | Risks & open questions | ½ page | Honest list. Each risk has a mitigation or owner |
| 9 | Rollout plan | ½ page | Phases, % rollout, kill-criterion. *When do we stop?* |
| 10 | Appendix | as needed | Data model, integration points, alternatives considered |

---

## 4-point readiness check (gate to "dev-ready")

A PRD only leaves planning when:
1. ✅ A real supplier could read the press release and say "yes, I want this."
2. ✅ A senior engineer could read the spec body and give a T-shirt-size estimate.
3. ✅ Every success metric names its data source (no metrics we can't measure).
4. ✅ The rollout has an explicit kill-criterion (when do we stop?).

---

## Tiny worked example (calibration only — not a real program PRD)

**Feature:** A weekly digest email to suppliers summarizing their sales, top SKUs, and a category-level demand tip.

### Press release excerpt (illustrative)
> **FleekOS launches "Monday Brief" — every supplier now starts the week knowing what sold, what's trending, and what to list next.**
>
> Suppliers told us they fly blind between order notifications. Today we're launching Monday Brief, a weekly email that delivers a personalized summary of last week's sales, the SKUs that outperformed, and the one category trend we think they should act on.
>
> *"I used to spend Monday mornings exporting CSVs to figure out what worked. Now FleekOS just tells me — and tells me what's next."* — Adaeze O., supplier on FleekOS since 2024.

### Spec body excerpt (illustrative)
- **Goal:** Increase week-over-week supplier active days by ≥ 8% within 60 days of launch.
- **Non-goal:** Real-time alerts. Forecasting beyond 7-day horizon.
- **Detailed req 3.2:** Digest includes top 3 SKUs by GMV (source: BigQuery `fleek_orders.line_items`, joined to supplier ID via Platform GraphQL).
- **Success metric:** Weekly digest open rate ≥ 35% (source: ESP webhook → Postgres `digest_events`).
- **Kill-criterion:** If 60-day open rate < 15% AND active-days lift < 2pp, sunset the feature.

This example is deliberately small. Real program PRDs (NPS System, Commission Engine, etc.) will be longer in spec body but follow the same shape.

---

## How we'll use this doc

- Every PRD in `/docs/supplier-experience/` follows this structure.
- Section headers are **fixed** — reviewers can find what they need.
- If we ever feel a PRD doesn't fit this shape, we change *the methodology doc first*, then the PRD. Consistency > novelty.
