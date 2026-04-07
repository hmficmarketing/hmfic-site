# MFP Shopify Case Study — Design Spec

**Date:** 2026-04-08
**Owner:** Matt Holmes (HMFIC Marketing)
**Status:** Draft — awaiting approval before implementation plan

---

## Goal

Ship a premium, long-form case study page built around HMFIC's Mission First Pickleball (MFP) Shopify rebuild + AI content engine. The page serves as the primary sales asset for HMFIC's Shopify + AI content offering.

**30-day revenue target:** $50K in website builds and projects closed from calls booked via this asset. Window: 2026-04-08 → 2026-05-08.

## Audience

Shopify ecommerce brand owners. Primarily $50K-$500K/mo operators who have been burned by generic agencies and are looking for a serious operator who understands both the storefront craft and the content side. Mixed cold and warm traffic:

- **Warm:** Matt's Facebook network and existing connections (link dropped in DMs, emails, proposals)
- **Cold:** organic social, future ads, shared links. Cold visitors need a top-of-page anchor to jump past the narrative intro.

## Conversion Goal

Single primary CTA: **book a call**. Consultative framing — no pricing on the page. The call qualifies fit and scopes the build. Expected range discussed with Matt: $2,500-$5,000+ per build plus recurring, but this never appears on the page.

No secondary email capture. No lead magnet. One page, one CTA, repeated at natural points (hero, end of each major chapter section, final offer block).

## Visual Direction — "Editorial Brutalism"

A hybrid locked during brainstorming. The page body reads like Stripe Press — calm, serif, editorial, premium-longform. The *moments between sections* hit like brutalist editorial — oversized monospace chapter numerals, surgical use of an orange accent (#d94512), hard black rules between chapters.

**Typography:**
- **Body / narrative:** Charter or Iowan Old Style (serif), ~18px, generous line height (1.55-1.7)
- **Eyebrows / labels / chapter markers / metadata:** JetBrains Mono (monospace), 10-11px, .14em letter-spacing, uppercase
- **Section titles:** serif, 38-46px, -0.02em letter-spacing, weight 500
- **Chapter numerals:** JetBrains Mono, 96px+, weight 700, orange slash accent

**Color palette:**
- Cream paper: `#f5f0e6` (primary background)
- Ink: `#1a1a1a` (primary text)
- Warm secondary: `#4a4238`, `#6b6055` (metadata, captions)
- Accent: `#d94512` (orange — used surgically on chapter numerals, callout rules, decision markers, and one underline on the hero headline; never on the hero headline itself)
- Rules: `#1a1a1a` at 2px for chapter breaks

**Motion (the "Direction 3" polish Matt liked):**
- Sticky chapter navigation that activates on scroll
- Scroll-triggered fade/reveal on each section as it enters viewport
- Subtle parallax on hero-level screenshots
- One before/after slider in "The Build" chapter (old MFP store vs. new)
- Hover states on every screenshot (slight lift, subtle shadow)

**What we DO NOT borrow from the full interactive direction:** aggressive page transitions, SPA feel, pinned-scroll animations. Those fight the premium longform vibe and bloat build time.

## Page Structure — 9 Chapter Build Log

1. **Hero** — Eyebrow ("HMFIC / Build Log · ● Live · № 001"), serif headline with one orange-underlined phrase, serif dek paragraph, primary CTA ("Read the build log →"), and a secondary quiet anchor link ("Skip to the work ↓") for cold traffic. Bottom bar with "Filed Apr 2026 · HMFIC Marketing" in monospace.
2. **The Brief** — Who MFP is, what they sell (pickleball paddles + apparel), the state they came to us in. Sets the stakes. Pulled from `Intelligence Brief.md`.
3. **The Strategy** — The core decision: rebuild the Shopify store from scratch instead of patching the existing theme. The "adds two weeks, saves twelve months" logic. This chapter establishes Matt as an operator, not a vendor.
4. **The Build** — The Shopify rebuild itself. Before/after slider (old theme → new). Screenshots of homepage, product page, collection page, about, blog. Key decisions called out in orange callout blocks. Sourced from `Site Copy/*` and screenshots of `mfp-shopify` repo.
5. **The Intelligence Layer** — *The moat.* How HMFIC uses the GCF (Gravity Converter Formula) + Brand Voice Profile + Avatar Map to understand the brand before producing any content. Styled snippets of the actual MFP Intelligence Brief, Brand Voice Profile, and Avatar Map (lightly redacted). Frames what follows: "every piece of content the engine produces is downstream of *this*."
6. **The Content Engine** — What the engine produces *because* Chapter 5 exists. Sample outputs: a week of the content package, an ad creative variant, a reel storyboard, an email from the nurture sequence, a blog post. The volume story (weeks of assets in hours) and the consistency story (everything reads like MFP, not like AI).
7. **What's Next** — Honest, forward-looking. What's still in flight, what we're watching for, a soft promise of a "results update" chapter later once metrics land. Builds credibility by *not* overclaiming.
8. **The Offer** — Calm, consultative. One paragraph: "If you run a Shopify store and this is the kind of work you want done for you, let's talk." Single CTA button. No price. No tiers.
9. **Footer** — Credits, related case studies (placeholders — first slots for the next ones), contact link.

## Content Sourcing

All narrative content already exists in the Vault at `HMFIC Marketing/Clients/Mission First Pickleball/`. The work is **selection, sequencing, and styling** — not generation.

| Chapter | Primary sources |
|---|---|
| Brief | `Intelligence Brief.md`, `Client Status.md` |
| Strategy | Matt interview (30-min session, see below), `Edit Notes.md` |
| Build | `Site Copy/Homepage.md`, `Site Copy/Product Page.md`, `Site Copy/Collection Page.md`, `Site Copy/About Us.md`, screenshots of `mfp-shopify` repo |
| Intelligence Layer | `Intelligence Brief.md`, `Brand Voice Profile.md`, `Avatar Map.md`, `Visual Style Profile.md` |
| Content Engine | `Content Package/Week 1-4 *.md`, `Content Package/Email Nurture Sequence.md`, `Content Package/Reel Storyboard — *.md`, `Content Package/Meta Ads — Direct Response *.md`, `Content Package/Ad Creative — *.md`, `Site Copy/Blog Posts/*` |
| What's Next | Matt interview, `Content Matrix.md`, `Split Strategy.md` |

## Copy Process

Copy is co-written via a 30-minute interview session before the Build chapter ships. Matt talks through the MFP project in his own voice; I record/transcribe (using the existing `story-bank-interview` skill), draft chapter copy from the transcript, Matt rewrites to his voice. This avoids AI-generated copy that would cancel the premium positioning.

## Tech Stack

- **Framework:** Astro — converting `hmfic-site` from its current static HTML/CSS/JS setup to Astro. Astro is the long-term direction for HMFIC agency properties.
- **Routing:** `/case-studies/[slug]` with MFP as the first slug (`mfp`). Chapters stored as structured content (MDX or JSON-driven) so future case studies drop in.
- **Hosting:** Vercel (existing deployment target for `hmfic-site`).
- **Existing site preservation:** The current `index.html`, `style.css`, `script.js`, `api/`, and `vercel.json` port cleanly into Astro. Existing Airtable + Resend API routes become Astro endpoints or stay as serverless functions — whichever the implementation plan determines is cleanest.

## Templating Strategy

Built as a reusable case study template from day one, not a one-off page. Each case study = one content entry with:

- Frontmatter/metadata (title, slug, client, date, status, eyebrow text, OG image)
- An ordered list of chapters, each chapter typed (hero, text, before-after, callout, gallery, quote, offer, footer)
- The Astro template renders any case study that conforms to the schema

This means case study #2 (Loft Medspa, Katie Sampayo, Vigilant Life, etc.) is a content drop, not a rebuild.

## Visual Assets Required

The one real gap. Deliverables for this phase:

- **Shopify screenshots:** clean Chrome captures of the live `mfp-shopify` storefront — homepage, product page, collection page, about, blog — at desktop and mobile widths. Consistent device frames.
- **Before/after pair:** one screenshot of the pre-rebuild theme alongside the new build for the Build chapter slider.
- **Intelligence Layer snippets:** styled (not raw) screenshots or rendered facsimiles of the Intelligence Brief, Brand Voice Profile, and Avatar Map. Lightly redacted where needed. These get treated as design objects, not dumps.
- **Content Engine samples:** styled mockups of one week of the content package, one reel storyboard, one ad creative, one email. Not screenshots of markdown — composed visuals.
- **Figma compositions:** one or two custom Figma layouts for hero-level visual anchors.
- **OG share image:** 1200x630 Open Graph card designed in Figma. Serif headline, brutalist monospace metadata, one orange accent. This is the first impression in any Slack/iMessage/email share.
- **Favicon / meta:** standard set, consistent with HMFIC brand.

Budget estimate: ~half a day of screenshot + Figma work, done after the copy is locked.

## SEO

Light SEO pass, not the primary driver. Target terms: *shopify case study*, *shopify ai content*, *shopify rebuild agency*, *pickleball shopify store*. Proper meta tags, structured data (Article schema), OG + Twitter cards, sitemap entry.

## Success Criteria

- Page ships within 2 weeks of spec approval (deployable draft on `hmfic.com/case-studies/mfp`)
- Case study template reusable for the next case study with no code changes, only content
- Page loads under 1.5s on desktop, under 2.5s on mobile (static Astro output)
- OG share card renders correctly in Slack, iMessage, Facebook, LinkedIn previews
- Matt feels confident dropping the link in a DM to a premium prospect without hedging
- **Business:** $50K closed in builds and projects in the 30 days following ship

## Out of Scope

- Hard metrics/results for MFP (will be added as a follow-up chapter when data lands)
- Pricing display on the page
- Email capture / lead magnet flow
- Multiple offer tiers or comparison blocks
- A "team" or "about HMFIC" section on this page
- Migrating other pages of `hmfic-site` to Astro beyond what's needed to host this case study cleanly
- Building case studies for other clients in this phase (templating supports it, but only MFP ships now)

## Open Questions

1. Is the existing `mfp-shopify` Shopify theme far enough along to screenshot for the Build chapter, or do we need to finish specific pages first?
2. Is there a pre-rebuild "before" state we can still capture (live URL, Wayback Machine, old screenshots)? If not, the before/after slider may need to become a "decision log" instead.
3. Do we have client (MFP) approval to publish the Intelligence Brief / Brand Voice Profile / Avatar Map as styled snippets, even redacted? If no, Chapter 5 needs a different visual treatment.
4. Does `hmfic-site` have active production traffic or any SEO equity we need to preserve during the Astro migration?
