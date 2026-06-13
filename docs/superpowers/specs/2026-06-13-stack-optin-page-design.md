# /stack Opt-in Page — Design Spec

**Date:** 2026-06-13
**Project:** hmfic-site (Astro, Vercel)
**URL:** hmficmarketing.com/stack
**Status:** Approved, ready for implementation plan

## Purpose

The opt-in page for HMFIC's first owned email list. Captures traffic from the handwritten-prompt carousel content motion and delivers "The 5 Prompts I Use to Run a 7-Figure Spend Agency" PDF in exchange for an email. This is the agency's first real owned list (current $14,350 MRR comes from referrals + outbound + Alejandro warm net). The list unlocks retargeting, ads, and downstream AI-product offers.

Part of the 2026-06-12 agency-focus pivot: full force on HMFIC ($50K → $100K months), VL automations paused.

## Design Direction

**Notebook Hybrid** (chosen over Precision Instrument, Luminous Minimal, and The Artifact in visual brainstorming 2026-06-12). Crisp and clean but distinctive — explicitly NOT brutalist editorial, NOT generic AI-template aesthetic.

Visual language:
- Warm paper background (`#fdfdfb`), alternating with slightly darker section bands (`#f7f6f2`) for rhythm
- Faint ruled lines (`repeating-linear-gradient`, ~32px) on **hero and final CTA only** — not every section, to avoid noise
- Red margin line on hero (`rgba(225,55,40,0.18)`)
- Signal red `#e13728` as the single accent (marker highlight, CTA button, handwritten elements, prompt numbers, checkmarks)
- Handwriting (Caveat font) used in exactly **four places** so it reads as a signature, not a theme: hero annotation ("the actual prompts, not screenshots ↘"), the time chips on prompt cards, the "who this is for" checkmarks. Restraint is the rule.
- Prompt blocks are index cards with slight per-card rotation (±0.3deg) and soft shadow
- Mono font (JetBrains Mono) for prompt numbers (01–05) and any technical labels
- Fonts: Inter (body/headlines), Caveat (handwriting), JetBrains Mono (numbers)

**Mobile-first.** Carousel traffic is 90%+ mobile. Index cards stack, forms go full-width, type scales down. The mockup was shown at desktop width; the build must be responsive.

## Copy

Locked copy v1 verbatim from `Vault/HMFIC Marketing/List Build/Opt-in Page Copy v1.md`. Natural Voice Rules apply (no em dashes, contractions, short+long rhythm, no AI buzzwords). Do not rewrite copy during the build.

## Page Structure (7 sections)

1. **Hero** — ruled paper. Eyebrow "HMFIC Marketing", headline with red marker highlight on "7-figure agency", subhead, handwritten annotation, email form (input + "Yes, send me the prompts." button). No microcopy under form.
2. **What you'll have in 30 minutes** — darker band. Section header + subhead, then 5 prompt index cards (number, title, description, handwritten time chip). Content per copy doc Section 2.
3. **Who this is built for** — paper. Three red handwritten checkmarks + bullets.
4. **Who put this together** — darker band. Photo placeholder (polaroid style, rotated) + 2-paragraph bio. *Photo asset needed — placeholder until Matt supplies.*
5. **Quick questions** — paper. FAQ accordion, 5 items, collapsed by default. Use native `<details>/<summary>` so it works without JS.
6. **Final CTA** — ruled paper, centered. "Download the pack now" + email form (same as hero).
7. **Footer** — dark strip (`#171614`). Kit privacy line + Privacy / home links.

## Components

### `src/pages/stack.astro`
The page. Self-contained Astro component. Two instances of an email opt-in form (hero + final CTA). Both forms POST to `/api/stack-optin`. On success, the submitted form swaps inline to a "Check your inbox." confirmation state (client-side JS, progressive enhancement — form still submits without JS via standard POST as fallback). Turnstile widget + honeypot field on each form.

### `api/stack-optin.js`
New Vercel serverless function, **separate from the existing `api/submit.js`** (the contact form handler). Email-only opt-in should not share the multi-field contact handler.

Flow:
1. CORS preflight handling (mirror `api/submit.js`)
2. Honeypot check (`_gotcha`) — silent 200 reject
3. Turnstile verification via `TURNSTILE_SECRET_KEY`
4. Email validation (required, format check)
5. Fan out with `Promise.allSettled`:
   - **Kit**: add subscriber, apply `stack-pack` tag
   - **Resend**: delivery email to subscriber with PDF download link
   - **Resend**: notify Matt of new opt-in
6. Return success if Resend delivery succeeds. If Kit write fails but delivery succeeds, subscriber still gets the pack; log the Kit error for retry. **Delivery never hostages on the list write.**

### `public/downloads/`
PDF hosted as a static asset so the delivery link is a clean `hmficmarketing.com/downloads/<file>.pdf`. (PDF produced in a separate task — see Launch Gates.)

### `src/pages/privacy.astro`
Minimal real privacy page so the footer link is not a dead placeholder. Plain, honest, ~20 min. Covers: what we collect (email), where it goes (Kit), that we don't sell/share, how to unsubscribe.

## Configuration

- `KIT_API_KEY` (or v4 API secret) → Vercel env
- Kit: create `stack-pack` tag; set form to **single opt-in** so "instant" delivery claim stays true
- Confirm Resend sender domain already verified (it is — used by `api/submit.js`)

## Launch Gates (tracked separately, page can build now)

1. **PDF produced** — prompts drafted in `Vault/.../List Build/Prompt-1..5`; needs handwritten cover + worked examples + Meta AI bonus + compile. Matt's follow-up task (chose option A: page first, PDF right behind).
2. **Kit setup finished** — account exists (2026-06-12), needs API key, tag, single-opt-in confirmation.
3. **Matt photo** for bio section (placeholder until supplied).

## Out of Scope (deliberate)

- **Social-proof line** ("X operators downloaded this") — deferred to v2, added once real download numbers exist. No number to show at launch.
- A/B testing headline/subhead alternates — v2 after baseline data.
- Analytics/pixel beyond what hmfic-site already runs.
- Downstream nurture sequence beyond the single delivery email + the promised "one email a week."

## References

- Copy: `Vault/HMFIC Marketing/List Build/Opt-in Page Copy v1.md`
- Brainstorm origin: `Vault/HMFIC Marketing/List Build/2026-05-21 List Build Brainstorm.md`
- Approved mockup: `.superpowers/brainstorm/86763-1781296500/content/full-page.html`
- Existing form pattern to mirror: `api/submit.js`
