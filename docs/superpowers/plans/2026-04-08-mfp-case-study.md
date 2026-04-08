# MFP Shopify Case Study Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship a premium long-form "Build Log" case study page for Mission First Pickleball at `hmficmarketing.com/case-studies/mfp`, built as a reusable Astro template that future case studies drop into with no code changes.

**Architecture:** Migrate `hmfic-site` from a single static `index.html` to an Astro project. Preserve the existing `/api/submit.js` serverless function and public assets. Build a content-collection schema (`caseStudies`) where each case study is one MDX file with typed chapter blocks. Render via `/case-studies/[slug].astro` using shared chapter components. Deploy to Vercel as static output (API route stays serverless).

**Tech Stack:** Astro 4.x · TypeScript · MDX content collections · Vercel static adapter · Playwright for smoke tests · Sharp for OG image generation · Zero runtime JS framework (React/Vue) — plain Astro components with small vanilla-JS enhancements for sticky nav and the before/after slider.

**Spec reference:** `docs/superpowers/specs/2026-04-08-mfp-case-study-design.md`

---

## File Structure

After implementation, `hmfic-site/` will contain:

```
hmfic-site/
├── api/
│   └── submit.js                        # UNCHANGED — existing Airtable/Resend endpoint
├── public/
│   ├── assets/                          # MOVED from ./assets
│   ├── fonts/                           # NEW — self-hosted Charter + JetBrains Mono
│   ├── case-studies/mfp/                # NEW — screenshots, before/after pair, Figma exports
│   └── og/                              # NEW — generated OG cards
├── src/
│   ├── content/
│   │   ├── config.ts                    # NEW — caseStudies collection schema
│   │   └── caseStudies/
│   │       └── mfp.mdx                  # NEW — the MFP case study content
│   ├── layouts/
│   │   └── CaseStudyLayout.astro        # NEW — base layout for case study pages
│   ├── components/
│   │   ├── case-study/
│   │   │   ├── Hero.astro               # Chapter 1 — hero
│   │   │   ├── Chapter.astro            # Chapter header (num + title)
│   │   │   ├── TextBlock.astro          # Narrative paragraphs
│   │   │   ├── Callout.astro            # Orange decision callouts
│   │   │   ├── PullQuote.astro          # Large serif pull quotes
│   │   │   ├── BeforeAfter.astro        # Before/after slider (Chapter 4)
│   │   │   ├── ScreenshotGrid.astro     # Screenshot layouts for Chapter 4
│   │   │   ├── IntelSnippet.astro       # Styled intelligence snippet card
│   │   │   ├── IntelLayer.astro         # Chapter 5 wrapper — 3 IntelSnippet cards
│   │   │   ├── ContentSample.astro      # Chapter 6 — sample content card
│   │   │   ├── OfferBlock.astro         # Chapter 8 — CTA block
│   │   │   ├── StickyNav.astro          # Sticky chapter nav
│   │   │   └── Transition.astro         # Chapter-to-chapter transition bar
│   │   └── site/
│   │       ├── Footer.astro             # Shared site footer
│   │       └── MetaHead.astro           # SEO + OG tags
│   ├── pages/
│   │   ├── index.astro                  # Ported from existing index.html
│   │   └── case-studies/
│   │       └── [slug].astro             # Dynamic case study route
│   ├── styles/
│   │   ├── tokens.css                   # Colors, spacing, type scale
│   │   └── global.css                   # Resets, base type, utilities
│   └── scripts/
│       ├── stickyNav.ts                 # Scroll-spy + active chapter
│       └── beforeAfter.ts               # Slider interaction
├── scripts/
│   └── generate-og.mjs                  # Build-time OG card generation via Sharp
├── tests/
│   ├── build.spec.ts                    # Playwright: page loads, CTA present
│   └── og.spec.ts                       # OG tags + image asserts
├── astro.config.mjs                     # NEW
├── tsconfig.json                        # NEW
├── package.json                         # MODIFIED — add Astro deps
├── vercel.json                          # MODIFIED — update for Astro build output
└── .gitignore                           # MODIFIED — add dist/, .astro/
```

**Existing files preserved:**
- `api/submit.js` — left untouched; Vercel still serves it as a serverless function.
- `index.html`, `style.css`, `script.js` — ported into Astro and then deleted from repo root.
- `assets/` — moved to `public/assets/` so paths stay identical (`/assets/...`).
- `CLAUDE.md`, `Decision Log.md` — untouched.

---

## Phase 1 — Astro Scaffold

### Task 1: Install Astro and initialize config

**Files:**
- Modify: `package.json`
- Create: `astro.config.mjs`
- Create: `tsconfig.json`
- Modify: `.gitignore`

- [ ] **Step 1: Install Astro and core dependencies**

Run:
```bash
cd /Users/hmfic/Code/hmfic-site
npm install --save-dev astro@^4.16.0 @astrojs/mdx@^3.1.0 @astrojs/sitemap@^3.2.0 @astrojs/vercel@^7.8.0 typescript@^5.6.0 sharp@^0.33.0
npm install --save-dev @playwright/test@^1.48.0
```

- [ ] **Step 2: Create `astro.config.mjs`**

Write:
```js
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import vercel from '@astrojs/vercel/static';

export default defineConfig({
  site: 'https://hmficmarketing.com',
  output: 'static',
  adapter: vercel({
    webAnalytics: { enabled: false },
    imageService: true,
  }),
  integrations: [mdx(), sitemap()],
  vite: {
    resolve: {
      alias: {
        '@': '/src',
      },
    },
  },
});
```

- [ ] **Step 3: Create `tsconfig.json`**

Write:
```json
{
  "extends": "astro/tsconfigs/strict",
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    }
  },
  "include": [".astro/types.d.ts", "**/*"],
  "exclude": ["dist", "node_modules"]
}
```

- [ ] **Step 4: Update `package.json` scripts**

Replace the `"scripts"` block with:
```json
"scripts": {
  "dev": "astro dev",
  "build": "astro build",
  "preview": "astro preview",
  "astro": "astro",
  "test": "playwright test"
}
```

- [ ] **Step 5: Add Astro outputs to `.gitignore`**

Append to `.gitignore`:
```
# Astro
dist/
.astro/
.vercel/

# Playwright
test-results/
playwright-report/
```

- [ ] **Step 6: Commit**

```bash
git add package.json package-lock.json astro.config.mjs tsconfig.json .gitignore
git commit -m "chore: scaffold Astro in hmfic-site"
```

---

### Task 2: Port existing static site into Astro

**Files:**
- Create: `src/pages/index.astro`
- Create: `public/assets/` (moved)
- Modify: `vercel.json`
- Delete: `index.html`, `style.css`, `script.js`, `assets/` (root)

- [ ] **Step 1: Move existing assets into `public/`**

Run:
```bash
mkdir -p public
mv assets public/assets
```

- [ ] **Step 2: Read the existing index.html**

Run: `cat index.html | head -80`
Note the `<head>` contents, the body markup, and any inline scripts.

- [ ] **Step 3: Create `src/pages/index.astro` mirroring existing markup**

Write the file with this structure:
```astro
---
// src/pages/index.astro
import '../styles/global.css';
---
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>HMFIC Marketing</title>
    <link rel="stylesheet" href="/style.css" />
  </head>
  <body>
    <!-- PASTE the existing <body> content from index.html verbatim here -->
    <script src="/script.js"></script>
  </body>
</html>
```

Move `style.css` and `script.js` into `public/` so the relative paths still work:
```bash
mv style.css public/style.css
mv script.js public/script.js
```

- [ ] **Step 4: Delete the old root index.html**

Run: `rm index.html`

- [ ] **Step 5: Run dev server and verify home page renders**

Run: `npm run dev`
Open `http://localhost:4321` and confirm the existing home page loads identically to before.

- [ ] **Step 6: Update `vercel.json` for Astro build output**

Replace the existing `vercel.json` with:
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "cleanUrls": true,
  "trailingSlash": false,
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        { "key": "X-Content-Type-Options", "value": "nosniff" },
        { "key": "X-Frame-Options", "value": "DENY" },
        { "key": "X-XSS-Protection", "value": "1; mode=block" }
      ]
    },
    {
      "source": "/api/(.*)",
      "headers": [
        { "key": "Access-Control-Allow-Origin", "value": "https://hmficmarketing.com" },
        { "key": "Access-Control-Allow-Methods", "value": "POST, OPTIONS" },
        { "key": "Access-Control-Allow-Headers", "value": "Content-Type" }
      ]
    }
  ]
}
```

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "feat: port static site into Astro, preserve /api/submit.js"
```

---

### Task 3: Create design tokens and global styles

**Files:**
- Create: `src/styles/tokens.css`
- Create: `src/styles/global.css`
- Create: `public/fonts/` (placeholder — fonts added in Task 4)

- [ ] **Step 1: Create `src/styles/tokens.css`**

Write:
```css
:root {
  /* Colors — Editorial Brutalism palette */
  --paper: #f5f0e6;
  --paper-lift: #fffdf7;
  --paper-edge: #e0d8c4;
  --ink: #1a1a1a;
  --ink-2: #2a241c;
  --ink-3: #4a4238;
  --ink-4: #6b6055;
  --muted: #8a6d3b;
  --accent: #d94512;

  /* Type */
  --font-serif: 'Charter', 'Iowan Old Style', 'Palatino', Georgia, serif;
  --font-mono: 'JetBrains Mono', 'SF Mono', ui-monospace, 'Courier New', monospace;
  --font-sans: ui-sans-serif, system-ui, -apple-system, 'Helvetica Neue', sans-serif;

  /* Scale */
  --fs-hero: clamp(40px, 6vw, 68px);
  --fs-chapter: clamp(32px, 4.5vw, 46px);
  --fs-body: 18px;
  --fs-dek: 19px;
  --fs-meta: 10.5px;

  /* Spacing */
  --space-1: 4px;
  --space-2: 8px;
  --space-3: 12px;
  --space-4: 16px;
  --space-5: 24px;
  --space-6: 32px;
  --space-7: 48px;
  --space-8: 64px;
  --space-9: 96px;

  /* Layout */
  --col-narrow: 58ch;
  --col-wide: 880px;
  --col-full: 1120px;
}
```

- [ ] **Step 2: Create `src/styles/global.css`**

Write:
```css
@import './tokens.css';

*, *::before, *::after { box-sizing: border-box; }
html, body { margin: 0; padding: 0; }
html { scroll-behavior: smooth; }
body {
  font-family: var(--font-serif);
  font-size: var(--fs-body);
  line-height: 1.65;
  color: var(--ink);
  background: var(--paper);
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

img { max-width: 100%; display: block; }

a { color: inherit; text-decoration-color: var(--accent); text-underline-offset: 3px; }
a:hover { text-decoration-thickness: 2px; }

.mono {
  font-family: var(--font-mono);
  font-size: var(--fs-meta);
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--ink);
}

.container {
  max-width: var(--col-wide);
  margin: 0 auto;
  padding: 0 var(--space-6);
}

.narrow { max-width: var(--col-narrow); }

.rule-hard {
  height: 2px;
  background: var(--ink);
  border: none;
  margin: 0;
}

@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
  html { scroll-behavior: auto; }
}
```

- [ ] **Step 3: Commit**

```bash
git add src/styles/
git commit -m "feat: add design tokens and global styles"
```

---

### Task 4: Self-host fonts

**Files:**
- Create: `public/fonts/charter-regular.woff2`
- Create: `public/fonts/charter-italic.woff2`
- Create: `public/fonts/jetbrains-mono-regular.woff2`
- Create: `public/fonts/jetbrains-mono-bold.woff2`
- Modify: `src/styles/global.css`

- [ ] **Step 1: Download JetBrains Mono from the official GitHub release**

Run:
```bash
mkdir -p public/fonts
curl -L -o /tmp/jbm.zip https://github.com/JetBrains/JetBrainsMono/releases/download/v2.304/JetBrainsMono-2.304.zip
unzip -j /tmp/jbm.zip 'fonts/webfonts/JetBrainsMono-Regular.woff2' -d public/fonts/
unzip -j /tmp/jbm.zip 'fonts/webfonts/JetBrainsMono-Bold.woff2' -d public/fonts/
mv public/fonts/JetBrainsMono-Regular.woff2 public/fonts/jetbrains-mono-regular.woff2
mv public/fonts/JetBrainsMono-Bold.woff2 public/fonts/jetbrains-mono-bold.woff2
```

- [ ] **Step 2: Decide on Charter source**

Charter is bundled with macOS but not freely redistributable in all cases. Use **Source Serif 4** as the open-source stand-in:
```bash
curl -L -o public/fonts/source-serif-regular.woff2 \
  https://fonts.gstatic.com/s/sourceserif4/v8/vEFy2_tTDB4M7-auWDN0ahZJW3IX2ih5nk3AucvUHf6OAVIJmeUDygwjipdqpzXsLS4.woff2
curl -L -o public/fonts/source-serif-italic.woff2 \
  https://fonts.gstatic.com/s/sourceserif4/v8/vEFI2_tTDB4M7-auWDN0ahZJW3IX2ih5nk3AucvUHf6OAVIJmeUDygwjipdqpzXsLSI.woff2
```

(If Matt wants real Charter, swap the files and update `@font-face` names — no other changes needed.)

- [ ] **Step 3: Add `@font-face` declarations to `src/styles/global.css`**

Prepend to `global.css` (before the `@import './tokens.css';` line):
```css
@font-face {
  font-family: 'Charter';
  src: url('/fonts/source-serif-regular.woff2') format('woff2');
  font-weight: 400 500;
  font-style: normal;
  font-display: swap;
}
@font-face {
  font-family: 'Charter';
  src: url('/fonts/source-serif-italic.woff2') format('woff2');
  font-weight: 400 500;
  font-style: italic;
  font-display: swap;
}
@font-face {
  font-family: 'JetBrains Mono';
  src: url('/fonts/jetbrains-mono-regular.woff2') format('woff2');
  font-weight: 400;
  font-style: normal;
  font-display: swap;
}
@font-face {
  font-family: 'JetBrains Mono';
  src: url('/fonts/jetbrains-mono-bold.woff2') format('woff2');
  font-weight: 700;
  font-style: normal;
  font-display: swap;
}
```

- [ ] **Step 4: Verify fonts load in dev**

Run: `npm run dev`
Open DevTools > Network > Fonts tab, reload, confirm all four woff2 files load with 200 status.

- [ ] **Step 5: Commit**

```bash
git add public/fonts/ src/styles/global.css
git commit -m "feat: self-host Source Serif + JetBrains Mono"
```

---

## Phase 2 — Content Schema and Routing

### Task 5: Define `caseStudies` content collection

**Files:**
- Create: `src/content/config.ts`

- [ ] **Step 1: Create the content collection config**

Write `src/content/config.ts`:
```ts
import { defineCollection, z } from 'astro:content';

const chapterSchema = z.discriminatedUnion('type', [
  z.object({
    type: z.literal('hero'),
    eyebrow: z.string(),
    headline: z.string(),
    headlineAccent: z.string().optional(),
    dek: z.string(),
    cta: z.object({ label: z.string(), href: z.string() }),
    skipAnchor: z.string().default('#chapter-2'),
  }),
  z.object({
    type: z.literal('text'),
    chapterNumber: z.string(),
    chapterName: z.string(),
    title: z.string(),
    paragraphs: z.array(z.string()),
    callout: z.object({ label: z.string(), body: z.string() }).optional(),
  }),
  z.object({
    type: z.literal('build'),
    chapterNumber: z.string(),
    chapterName: z.string(),
    title: z.string(),
    paragraphs: z.array(z.string()),
    beforeAfter: z.object({
      before: z.string(),
      after: z.string(),
      beforeAlt: z.string(),
      afterAlt: z.string(),
    }).optional(),
    screenshots: z.array(z.object({
      src: z.string(),
      alt: z.string(),
      caption: z.string().optional(),
    })).default([]),
  }),
  z.object({
    type: z.literal('intelligence'),
    chapterNumber: z.string(),
    chapterName: z.string(),
    title: z.string(),
    paragraphs: z.array(z.string()),
    snippets: z.array(z.object({
      tag: z.string(),
      excerptLabel: z.string(),
      heading: z.string(),
      rows: z.array(z.object({ key: z.string(), value: z.string() })),
      footerLeft: z.string(),
      footerRight: z.string(),
    })).length(3),
    pullQuote: z.object({ body: z.string(), attribution: z.string() }),
  }),
  z.object({
    type: z.literal('engine'),
    chapterNumber: z.string(),
    chapterName: z.string(),
    title: z.string(),
    paragraphs: z.array(z.string()),
    samples: z.array(z.object({
      label: z.string(),
      title: z.string(),
      body: z.string(),
      footnote: z.string().optional(),
    })),
  }),
  z.object({
    type: z.literal('offer'),
    chapterNumber: z.string(),
    chapterName: z.string(),
    title: z.string(),
    body: z.string(),
    cta: z.object({ label: z.string(), href: z.string() }),
  }),
]);

const caseStudies = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    slug: z.string(),
    client: z.string(),
    status: z.enum(['live', 'in-progress', 'draft']),
    eyebrow: z.string(),
    ogImage: z.string(),
    publishDate: z.date(),
    chapters: z.array(chapterSchema),
  }),
});

export const collections = { caseStudies };
```

- [ ] **Step 2: Commit**

```bash
git add src/content/config.ts
git commit -m "feat: define caseStudies content collection schema"
```

---

### Task 6: Build dynamic route `/case-studies/[slug]`

**Files:**
- Create: `src/pages/case-studies/[slug].astro`
- Create: `src/layouts/CaseStudyLayout.astro`

- [ ] **Step 1: Create the layout file (chapter rendering stub)**

Write `src/layouts/CaseStudyLayout.astro`:
```astro
---
import '../styles/global.css';
import MetaHead from '../components/site/MetaHead.astro';
import Footer from '../components/site/Footer.astro';
import StickyNav from '../components/case-study/StickyNav.astro';

interface Props {
  title: string;
  eyebrow: string;
  ogImage: string;
  slug: string;
  chapters: Array<{ type: string; chapterNumber?: string; chapterName?: string }>;
}

const { title, eyebrow, ogImage, slug, chapters } = Astro.props;

const navChapters = chapters
  .filter((c) => c.chapterNumber && c.chapterName)
  .map((c) => ({
    num: c.chapterNumber!,
    name: c.chapterName!,
    anchor: `#chapter-${c.chapterNumber!.replace('/', '')}`,
  }));
---
<html lang="en">
  <head>
    <MetaHead title={title} eyebrow={eyebrow} ogImage={ogImage} slug={slug} />
  </head>
  <body class="case-study">
    <StickyNav chapters={navChapters} />
    <main>
      <slot />
    </main>
    <Footer />
    <script src="/scripts/stickyNav.js" defer></script>
    <script src="/scripts/beforeAfter.js" defer></script>
  </body>
</html>
```

- [ ] **Step 2: Create the dynamic route**

Write `src/pages/case-studies/[slug].astro`:
```astro
---
import { getCollection } from 'astro:content';
import CaseStudyLayout from '../../layouts/CaseStudyLayout.astro';
import Hero from '../../components/case-study/Hero.astro';
import TextBlock from '../../components/case-study/TextBlock.astro';
import Build from '../../components/case-study/Build.astro';
import IntelLayer from '../../components/case-study/IntelLayer.astro';
import Engine from '../../components/case-study/Engine.astro';
import Offer from '../../components/case-study/Offer.astro';

export async function getStaticPaths() {
  const studies = await getCollection('caseStudies');
  return studies.map((study) => ({
    params: { slug: study.data.slug },
    props: { study },
  }));
}

const { study } = Astro.props;
const { data } = study;
---
<CaseStudyLayout
  title={data.title}
  eyebrow={data.eyebrow}
  ogImage={data.ogImage}
  slug={data.slug}
  chapters={data.chapters}
>
  {data.chapters.map((chapter) => {
    if (chapter.type === 'hero') return <Hero {...chapter} />;
    if (chapter.type === 'text') return <TextBlock {...chapter} />;
    if (chapter.type === 'build') return <Build {...chapter} />;
    if (chapter.type === 'intelligence') return <IntelLayer {...chapter} />;
    if (chapter.type === 'engine') return <Engine {...chapter} />;
    if (chapter.type === 'offer') return <Offer {...chapter} />;
    return null;
  })}
</CaseStudyLayout>
```

- [ ] **Step 3: Create placeholder component files so the build doesn't break**

For each of `Hero`, `TextBlock`, `Build`, `IntelLayer`, `Engine`, `Offer`, `StickyNav`, `Transition`, `PullQuote`, `Callout`, `BeforeAfter`, `ScreenshotGrid`, `IntelSnippet`, `ContentSample`, `OfferBlock`, write a minimal stub that accepts any props and renders `<section></section>`:

```bash
mkdir -p src/components/case-study src/components/site
for f in Hero TextBlock Build IntelLayer Engine Offer StickyNav Transition PullQuote Callout BeforeAfter ScreenshotGrid IntelSnippet ContentSample OfferBlock; do
  cat > "src/components/case-study/$f.astro" <<'EOF'
---
const props = Astro.props;
---
<section data-component="__FILE__">{JSON.stringify(props).slice(0, 200)}</section>
EOF
  sed -i '' "s|__FILE__|$f|" "src/components/case-study/$f.astro"
done

for f in Footer MetaHead; do
  cat > "src/components/site/$f.astro" <<'EOF'
---
const props = Astro.props;
---
<section data-component="__FILE__">{JSON.stringify(props).slice(0, 200)}</section>
EOF
  sed -i '' "s|__FILE__|$f|" "src/components/site/$f.astro"
done
```

- [ ] **Step 4: Commit**

```bash
git add src/
git commit -m "feat: dynamic /case-studies/[slug] route + component stubs"
```

---

### Task 7: Create empty MFP content entry to prove routing

**Files:**
- Create: `src/content/caseStudies/mfp.mdx`

- [ ] **Step 1: Write a minimal MFP entry with one hero chapter**

Write `src/content/caseStudies/mfp.mdx`:
```mdx
---
title: "Rebuilding MFP's Shopify from Zero"
slug: "mfp"
client: "Mission First Pickleball"
status: "in-progress"
eyebrow: "Build Log · № 001"
ogImage: "/og/mfp.png"
publishDate: 2026-04-08
chapters:
  - type: hero
    eyebrow: "HMFIC / Build Log · ● Live · № 001"
    headline: "Rebuilding MFP's Shopify"
    headlineAccent: "from zero."
    dek: "A full storefront rebuild and an AI content engine that produces weeks of assets in hours. This is the build log — every decision, every screen, in order."
    cta:
      label: "Read the build log →"
      href: "#chapter-2"
    skipAnchor: "#chapter-4"
---

<!-- MDX body intentionally empty — all content lives in the `chapters` frontmatter array so the template can render it. -->
```

- [ ] **Step 2: Build and verify the route exists**

Run: `npm run build`
Expected: build succeeds, `dist/case-studies/mfp/index.html` exists.

Run: `npm run preview`
Open `http://localhost:4321/case-studies/mfp` — you should see the stub rendering of the hero chapter (raw JSON blob is fine for now).

- [ ] **Step 3: Commit**

```bash
git add src/content/caseStudies/mfp.mdx
git commit -m "feat: MFP case study content stub"
```

---

## Phase 3 — Chapter Components

### Task 8: Implement the `Hero` component

**Files:**
- Modify: `src/components/case-study/Hero.astro`

- [ ] **Step 1: Replace the stub with the real hero**

Write:
```astro
---
interface Props {
  eyebrow: string;
  headline: string;
  headlineAccent?: string;
  dek: string;
  cta: { label: string; href: string };
  skipAnchor: string;
}
const { eyebrow, headline, headlineAccent, dek, cta, skipAnchor } = Astro.props;
---
<section class="hero" id="chapter-1">
  <div class="container">
    <div class="topbar">
      <span class="mono">{eyebrow}</span>
      <span class="mono num">№ 001</span>
    </div>
    <h1 class="headline">
      {headline}{headlineAccent && <> <span class="underline">{headlineAccent}</span></>}
    </h1>
    <p class="dek narrow">{dek}</p>
    <div class="actions">
      <a class="cta-primary" href={cta.href}>{cta.label}</a>
      <a class="cta-skip" href={skipAnchor}>Skip to the work ↓</a>
    </div>
    <div class="hero-footer">
      <span class="mono">Filed Apr 2026 · HMFIC Marketing</span>
    </div>
  </div>
</section>

<style>
  .hero {
    min-height: 92vh;
    display: flex;
    align-items: center;
    padding: var(--space-8) 0 var(--space-7);
    position: relative;
  }
  .topbar {
    display: flex;
    justify-content: space-between;
    padding-bottom: var(--space-4);
    border-bottom: 2px solid var(--ink);
    margin-bottom: var(--space-8);
  }
  .headline {
    font-size: var(--fs-hero);
    line-height: 1.02;
    letter-spacing: -0.025em;
    font-weight: 500;
    max-width: 14ch;
    margin: 0 0 var(--space-6);
  }
  .headline .underline {
    display: inline-block;
    border-bottom: 4px solid var(--accent);
    padding-bottom: 4px;
  }
  .dek {
    font-size: var(--fs-dek);
    color: var(--ink-3);
    line-height: 1.55;
    margin: 0 0 var(--space-7);
  }
  .actions { display: flex; gap: var(--space-5); align-items: center; flex-wrap: wrap; }
  .cta-primary {
    background: var(--ink);
    color: var(--paper);
    padding: 14px 22px;
    text-decoration: none;
    font-family: var(--font-sans);
    font-size: 14px;
    font-weight: 600;
    border-radius: 2px;
    transition: transform .15s;
  }
  .cta-primary:hover { transform: translateY(-1px); }
  .cta-skip {
    font-family: var(--font-mono);
    font-size: 11px;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: var(--ink-4);
    text-decoration: none;
  }
  .cta-skip:hover { color: var(--accent); }
  .hero-footer { position: absolute; left: 0; right: 0; bottom: var(--space-6); padding: 0 var(--space-6); text-align: right; color: var(--ink-4); }
</style>
```

- [ ] **Step 2: Rebuild and verify**

Run: `npm run dev`
Navigate to `http://localhost:4321/case-studies/mfp`. The hero should render with: eyebrow bar, big serif headline with an orange-underlined "from zero.", dek paragraph, primary CTA, skip link, and the bottom "Filed Apr 2026" metadata.

- [ ] **Step 3: Commit**

```bash
git add src/components/case-study/Hero.astro
git commit -m "feat: Hero chapter component"
```

---

### Task 9: Implement the `Chapter` header + `TextBlock` component

**Files:**
- Modify: `src/components/case-study/Chapter.astro`
- Modify: `src/components/case-study/TextBlock.astro`
- Modify: `src/components/case-study/Callout.astro`

- [ ] **Step 1: Create reusable chapter header in `Chapter.astro`**

Write:
```astro
---
interface Props {
  number: string;
  name: string;
  title: string;
}
const { number, name, title } = Astro.props;
const anchor = `chapter-${number.replace('/', '')}`;
---
<header class="chapter-header" id={anchor}>
  <div class="mono">Chapter</div>
  <div class="row">
    <div class="num">{number.replace('/', '')}<span class="slash">/</span></div>
    <div class="meta">
      <div class="label">Now Reading</div>
      <div class="name">{name}</div>
    </div>
  </div>
  <h2 class="title">{title}</h2>
</header>

<style>
  .chapter-header { padding-top: var(--space-8); }
  .row { display: flex; justify-content: space-between; align-items: flex-start; margin-top: var(--space-2); }
  .num {
    font-family: var(--font-mono);
    font-size: clamp(72px, 10vw, 112px);
    font-weight: 700;
    line-height: 0.82;
    letter-spacing: -0.04em;
    color: var(--ink);
  }
  .num .slash { color: var(--accent); }
  .meta { text-align: right; max-width: 14ch; padding-top: 10px; }
  .meta .label {
    font-family: var(--font-mono);
    font-size: 10px;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: var(--ink-4);
    margin-bottom: 6px;
  }
  .meta .name {
    font-family: var(--font-mono);
    font-size: 14px;
    font-weight: 600;
  }
  .title {
    font-size: var(--fs-chapter);
    line-height: 1.05;
    letter-spacing: -0.02em;
    font-weight: 500;
    max-width: 20ch;
    margin: var(--space-2) 0 var(--space-6);
  }
</style>
```

- [ ] **Step 2: Create `Callout.astro`**

Write:
```astro
---
interface Props { label: string; body: string; }
const { label, body } = Astro.props;
---
<aside class="callout">
  <div class="label">{label}</div>
  <div class="body">{body}</div>
</aside>
<style>
  .callout {
    border-left: 4px solid var(--accent);
    padding: var(--space-3) 0 var(--space-3) var(--space-5);
    margin: var(--space-6) 0;
    max-width: 52ch;
    font-family: var(--font-sans);
  }
  .label {
    font-size: 10px;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: var(--accent);
    font-weight: 700;
    margin-bottom: 6px;
  }
  .body { font-size: 14px; line-height: 1.5; color: var(--ink); }
</style>
```

- [ ] **Step 3: Build `TextBlock.astro` — the generic narrative chapter**

Write:
```astro
---
import Chapter from './Chapter.astro';
import Callout from './Callout.astro';

interface Props {
  chapterNumber: string;
  chapterName: string;
  title: string;
  paragraphs: string[];
  callout?: { label: string; body: string };
}
const { chapterNumber, chapterName, title, paragraphs, callout } = Astro.props;
---
<section class="chapter">
  <div class="container">
    <Chapter number={chapterNumber} name={chapterName} title={title} />
    <div class="prose narrow">
      {paragraphs.map((p) => <p>{p}</p>)}
    </div>
    {callout && <Callout label={callout.label} body={callout.body} />}
  </div>
</section>
<style>
  .chapter { padding: var(--space-7) 0 var(--space-8); }
  .prose p {
    font-size: var(--fs-body);
    line-height: 1.65;
    color: var(--ink-2);
    margin: 0 0 var(--space-4);
  }
</style>
```

- [ ] **Step 4: Test rendering**

Run: `npm run dev` and reload `/case-studies/mfp`. The hero still renders; no text chapters yet because MFP content only has the hero. That's expected.

- [ ] **Step 5: Commit**

```bash
git add src/components/case-study/
git commit -m "feat: Chapter header + TextBlock + Callout components"
```

---

### Task 10: Implement `IntelSnippet` + `IntelLayer` + `PullQuote` + `Transition`

**Files:**
- Modify: `src/components/case-study/IntelSnippet.astro`
- Modify: `src/components/case-study/IntelLayer.astro`
- Modify: `src/components/case-study/PullQuote.astro`
- Modify: `src/components/case-study/Transition.astro`

- [ ] **Step 1: Write `IntelSnippet.astro`**

Write:
```astro
---
interface Props {
  tag: string;
  excerptLabel: string;
  heading: string;
  rows: Array<{ key: string; value: string }>;
  footerLeft: string;
  footerRight: string;
}
const { tag, excerptLabel, heading, rows, footerLeft, footerRight } = Astro.props;
---
<article class="snippet" data-tag={tag}>
  <div class="excerpt-label">{excerptLabel}</div>
  <h4>{heading}</h4>
  {rows.map((row) => (
    <div class="row">
      <div class="k">{row.key}</div>
      <div class="v">{row.value}</div>
    </div>
  ))}
  <div class="footer-mono">
    <span>{footerLeft}</span>
    <span>{footerRight}</span>
  </div>
</article>
<style>
  .snippet {
    background: var(--paper-lift);
    border: 1px solid var(--paper-edge);
    padding: 26px 24px 22px;
    position: relative;
    box-shadow: 0 1px 0 rgba(0,0,0,.04), 0 10px 24px -14px rgba(0,0,0,.15);
    transition: transform .2s;
  }
  .snippet:hover { transform: translateY(-3px); }
  .snippet::before {
    content: attr(data-tag);
    position: absolute;
    top: -10px;
    left: 18px;
    background: var(--accent);
    color: #fff;
    font-family: var(--font-mono);
    font-size: 9px;
    letter-spacing: 0.14em;
    padding: 4px 10px;
    font-weight: 700;
  }
  .excerpt-label {
    font-family: var(--font-mono);
    font-size: 9.5px;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: var(--muted);
    margin-bottom: 8px;
  }
  h4 {
    font-family: var(--font-serif);
    font-size: 18px;
    line-height: 1.2;
    margin: 0 0 12px;
    font-weight: 500;
  }
  .row { display: flex; gap: 10px; margin: 5px 0; font-size: 12px; }
  .row .k {
    font-family: var(--font-mono);
    font-size: 8.5px;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: var(--muted);
    min-width: 54px;
    padding-top: 2px;
    flex-shrink: 0;
  }
  .row .v {
    color: var(--ink);
    line-height: 1.5;
    font-family: var(--font-serif);
  }
  .footer-mono {
    margin-top: 14px;
    padding-top: 10px;
    border-top: 1px solid var(--paper-edge);
    font-family: var(--font-mono);
    font-size: 8.5px;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: var(--muted);
    display: flex;
    justify-content: space-between;
  }
</style>
```

- [ ] **Step 2: Write `PullQuote.astro`**

Write:
```astro
---
interface Props { body: string; attribution: string; }
const { body, attribution } = Astro.props;
---
<blockquote class="pull">
  <p>{body}</p>
  <cite>— {attribution}</cite>
</blockquote>
<style>
  .pull {
    border-left: 4px solid var(--accent);
    padding: 10px 0 10px 22px;
    margin: var(--space-7) 0;
    max-width: 52ch;
  }
  .pull p {
    font-size: 22px;
    line-height: 1.35;
    font-style: italic;
    color: var(--ink);
    letter-spacing: -0.01em;
    font-weight: 500;
    margin: 0;
  }
  cite {
    display: block;
    margin-top: 12px;
    font-family: var(--font-mono);
    font-size: 11px;
    font-style: normal;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: var(--muted);
  }
</style>
```

- [ ] **Step 3: Write `Transition.astro`**

Write:
```astro
---
interface Props { nextNumber: string; nextName: string; }
const { nextNumber, nextName } = Astro.props;
---
<div class="transition">
  <div>
    <div class="next-label">Next Chapter</div>
    <div class="next-title">{nextNumber} / {nextName}</div>
  </div>
  <div class="arrow">→</div>
</div>
<style>
  .transition {
    margin-top: var(--space-7);
    padding: var(--space-5) 0 0;
    border-top: 2px solid var(--ink);
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  .next-label {
    font-family: var(--font-mono);
    font-size: 10px;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: var(--ink-4);
  }
  .next-title {
    font-family: var(--font-serif);
    font-size: 16px;
    font-weight: 500;
  }
  .arrow {
    font-family: var(--font-mono);
    font-size: 18px;
    color: var(--accent);
  }
</style>
```

- [ ] **Step 4: Write `IntelLayer.astro` wrapping the three snippets**

Write:
```astro
---
import Chapter from './Chapter.astro';
import IntelSnippet from './IntelSnippet.astro';
import PullQuote from './PullQuote.astro';
import Transition from './Transition.astro';

interface Props {
  chapterNumber: string;
  chapterName: string;
  title: string;
  paragraphs: string[];
  snippets: Array<{
    tag: string;
    excerptLabel: string;
    heading: string;
    rows: Array<{ key: string; value: string }>;
    footerLeft: string;
    footerRight: string;
  }>;
  pullQuote: { body: string; attribution: string };
}
const { chapterNumber, chapterName, title, paragraphs, snippets, pullQuote } = Astro.props;
---
<section class="chapter">
  <div class="container">
    <Chapter number={chapterNumber} name={chapterName} title={title} />
    <div class="prose narrow">
      {paragraphs.map((p) => <p>{p}</p>)}
    </div>
    <div class="snippets">
      {snippets.map((s) => <IntelSnippet {...s} />)}
    </div>
    <PullQuote body={pullQuote.body} attribution={pullQuote.attribution} />
    <Transition nextNumber="06" nextName="The Content Engine" />
  </div>
</section>
<style>
  .chapter { padding: var(--space-7) 0 var(--space-8); }
  .prose p { font-size: var(--fs-body); line-height: 1.65; color: var(--ink-2); margin: 0 0 var(--space-4); }
  .snippets {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 18px;
    margin: var(--space-7) 0 var(--space-6);
  }
  @media (max-width: 900px) {
    .snippets { grid-template-columns: 1fr; }
  }
</style>
```

- [ ] **Step 5: Commit**

```bash
git add src/components/case-study/
git commit -m "feat: Intelligence Layer, PullQuote, Transition components"
```

---

### Task 11: Implement `BeforeAfter` slider + `Build` chapter

**Files:**
- Modify: `src/components/case-study/BeforeAfter.astro`
- Modify: `src/components/case-study/ScreenshotGrid.astro`
- Modify: `src/components/case-study/Build.astro`
- Create: `public/scripts/beforeAfter.js`

- [ ] **Step 1: Write `BeforeAfter.astro`**

Write:
```astro
---
interface Props {
  before: string;
  after: string;
  beforeAlt: string;
  afterAlt: string;
}
const { before, after, beforeAlt, afterAlt } = Astro.props;
---
<div class="ba" data-before-after>
  <img class="ba-after" src={after} alt={afterAlt} />
  <div class="ba-before-wrap" data-ba-before-wrap>
    <img class="ba-before" src={before} alt={beforeAlt} />
  </div>
  <input type="range" min="0" max="100" value="50" class="ba-slider" data-ba-slider aria-label="Before/after slider" />
  <div class="ba-handle" data-ba-handle aria-hidden="true"></div>
  <div class="ba-label ba-label-before">Before</div>
  <div class="ba-label ba-label-after">After</div>
</div>
<style>
  .ba {
    position: relative;
    width: 100%;
    max-width: var(--col-full);
    margin: var(--space-6) auto;
    overflow: hidden;
    border: 2px solid var(--ink);
  }
  .ba img { display: block; width: 100%; height: auto; user-select: none; }
  .ba-after { position: relative; z-index: 1; }
  .ba-before-wrap {
    position: absolute;
    inset: 0;
    width: 50%;
    overflow: hidden;
    z-index: 2;
  }
  .ba-before-wrap img { width: 200%; max-width: none; }
  .ba-slider {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    opacity: 0;
    cursor: ew-resize;
    z-index: 4;
  }
  .ba-handle {
    position: absolute;
    top: 0;
    bottom: 0;
    left: 50%;
    width: 3px;
    background: var(--accent);
    z-index: 3;
    pointer-events: none;
  }
  .ba-handle::before,
  .ba-handle::after {
    content: '';
    position: absolute;
    left: 50%;
    top: 50%;
    width: 36px;
    height: 36px;
    background: var(--accent);
    border-radius: 50%;
    transform: translate(-50%, -50%);
  }
  .ba-handle::after {
    background: var(--paper);
    width: 32px;
    height: 32px;
  }
  .ba-label {
    position: absolute;
    top: 12px;
    font-family: var(--font-mono);
    font-size: 10px;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    background: var(--ink);
    color: var(--paper);
    padding: 4px 10px;
    z-index: 3;
  }
  .ba-label-before { left: 12px; }
  .ba-label-after { right: 12px; }
</style>
```

- [ ] **Step 2: Write the slider JS**

Write `public/scripts/beforeAfter.js`:
```js
(function () {
  const containers = document.querySelectorAll('[data-before-after]');
  containers.forEach((c) => {
    const slider = c.querySelector('[data-ba-slider]');
    const wrap = c.querySelector('[data-ba-before-wrap]');
    const handle = c.querySelector('[data-ba-handle]');
    if (!slider || !wrap || !handle) return;
    const update = (val) => {
      wrap.style.width = val + '%';
      handle.style.left = val + '%';
    };
    slider.addEventListener('input', (e) => update(e.target.value));
    update(50);
  });
})();
```

- [ ] **Step 3: Write `ScreenshotGrid.astro`**

Write:
```astro
---
interface Props {
  screenshots: Array<{ src: string; alt: string; caption?: string }>;
}
const { screenshots } = Astro.props;
---
<div class="grid">
  {screenshots.map((s) => (
    <figure>
      <img src={s.src} alt={s.alt} loading="lazy" />
      {s.caption && <figcaption class="mono">{s.caption}</figcaption>}
    </figure>
  ))}
</div>
<style>
  .grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: var(--space-5);
    margin: var(--space-6) 0;
  }
  @media (max-width: 800px) { .grid { grid-template-columns: 1fr; } }
  figure { margin: 0; }
  figure img {
    border: 1px solid var(--paper-edge);
    box-shadow: 0 10px 24px -14px rgba(0,0,0,.15);
    transition: transform .2s;
  }
  figure img:hover { transform: translateY(-2px); }
  figcaption { margin-top: 8px; color: var(--ink-4); }
</style>
```

- [ ] **Step 4: Write `Build.astro`**

Write:
```astro
---
import Chapter from './Chapter.astro';
import BeforeAfter from './BeforeAfter.astro';
import ScreenshotGrid from './ScreenshotGrid.astro';
import Transition from './Transition.astro';

interface Props {
  chapterNumber: string;
  chapterName: string;
  title: string;
  paragraphs: string[];
  beforeAfter?: { before: string; after: string; beforeAlt: string; afterAlt: string };
  screenshots: Array<{ src: string; alt: string; caption?: string }>;
}
const { chapterNumber, chapterName, title, paragraphs, beforeAfter, screenshots } = Astro.props;
---
<section class="chapter">
  <div class="container">
    <Chapter number={chapterNumber} name={chapterName} title={title} />
    <div class="prose narrow">
      {paragraphs.map((p) => <p>{p}</p>)}
    </div>
    {beforeAfter && <BeforeAfter {...beforeAfter} />}
    {screenshots.length > 0 && <ScreenshotGrid screenshots={screenshots} />}
    <Transition nextNumber="05" nextName="The Intelligence Layer" />
  </div>
</section>
<style>
  .chapter { padding: var(--space-7) 0 var(--space-8); }
  .prose p { font-size: var(--fs-body); line-height: 1.65; color: var(--ink-2); margin: 0 0 var(--space-4); }
</style>
```

- [ ] **Step 5: Commit**

```bash
git add src/components/case-study/ public/scripts/beforeAfter.js
git commit -m "feat: BeforeAfter slider + Build chapter + ScreenshotGrid"
```

---

### Task 12: Implement `Engine` chapter + `Offer` block

**Files:**
- Modify: `src/components/case-study/Engine.astro`
- Modify: `src/components/case-study/ContentSample.astro`
- Modify: `src/components/case-study/Offer.astro`

- [ ] **Step 1: Write `ContentSample.astro`**

Write:
```astro
---
interface Props { label: string; title: string; body: string; footnote?: string; }
const { label, title, body, footnote } = Astro.props;
---
<article class="sample">
  <div class="label">{label}</div>
  <h4>{title}</h4>
  <p>{body}</p>
  {footnote && <div class="footnote mono">{footnote}</div>}
</article>
<style>
  .sample {
    background: var(--paper-lift);
    border: 1px solid var(--paper-edge);
    padding: 24px 22px;
    box-shadow: 0 10px 24px -14px rgba(0,0,0,.12);
  }
  .label {
    font-family: var(--font-mono);
    font-size: 9.5px;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: var(--accent);
    margin-bottom: 8px;
    font-weight: 700;
  }
  h4 { font-size: 18px; line-height: 1.25; margin: 0 0 10px; font-weight: 500; }
  p { font-size: 14px; line-height: 1.55; color: var(--ink-2); margin: 0; }
  .footnote { margin-top: 12px; padding-top: 10px; border-top: 1px solid var(--paper-edge); color: var(--muted); }
</style>
```

- [ ] **Step 2: Write `Engine.astro`**

Write:
```astro
---
import Chapter from './Chapter.astro';
import ContentSample from './ContentSample.astro';
import Transition from './Transition.astro';

interface Props {
  chapterNumber: string;
  chapterName: string;
  title: string;
  paragraphs: string[];
  samples: Array<{ label: string; title: string; body: string; footnote?: string }>;
}
const { chapterNumber, chapterName, title, paragraphs, samples } = Astro.props;
---
<section class="chapter">
  <div class="container">
    <Chapter number={chapterNumber} name={chapterName} title={title} />
    <div class="prose narrow">
      {paragraphs.map((p) => <p>{p}</p>)}
    </div>
    <div class="samples">
      {samples.map((s) => <ContentSample {...s} />)}
    </div>
    <Transition nextNumber="07" nextName="What's Next" />
  </div>
</section>
<style>
  .chapter { padding: var(--space-7) 0 var(--space-8); }
  .prose p { font-size: var(--fs-body); line-height: 1.65; color: var(--ink-2); margin: 0 0 var(--space-4); }
  .samples {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: var(--space-5);
    margin: var(--space-7) 0 var(--space-6);
  }
  @media (max-width: 800px) { .samples { grid-template-columns: 1fr; } }
</style>
```

- [ ] **Step 3: Write `Offer.astro`**

Write:
```astro
---
import Chapter from './Chapter.astro';

interface Props {
  chapterNumber: string;
  chapterName: string;
  title: string;
  body: string;
  cta: { label: string; href: string };
}
const { chapterNumber, chapterName, title, body, cta } = Astro.props;
---
<section class="chapter offer">
  <div class="container">
    <Chapter number={chapterNumber} name={chapterName} title={title} />
    <div class="prose narrow">
      <p>{body}</p>
    </div>
    <div class="cta-row">
      <a class="cta" href={cta.href}>{cta.label}</a>
    </div>
  </div>
</section>
<style>
  .chapter { padding: var(--space-7) 0 var(--space-9); }
  .offer .prose p { font-size: 22px; line-height: 1.45; color: var(--ink); margin: 0 0 var(--space-6); }
  .cta-row { margin-top: var(--space-6); }
  .cta {
    display: inline-block;
    background: var(--ink);
    color: var(--paper);
    padding: 18px 32px;
    text-decoration: none;
    font-family: var(--font-sans);
    font-size: 15px;
    font-weight: 600;
    border-radius: 2px;
    transition: transform .15s;
  }
  .cta:hover { transform: translateY(-2px); }
</style>
```

- [ ] **Step 4: Commit**

```bash
git add src/components/case-study/
git commit -m "feat: Engine + Offer + ContentSample components"
```

---

### Task 13: Implement `StickyNav` + `MetaHead` + `Footer`

**Files:**
- Modify: `src/components/case-study/StickyNav.astro`
- Modify: `src/components/site/MetaHead.astro`
- Modify: `src/components/site/Footer.astro`
- Create: `public/scripts/stickyNav.js`

- [ ] **Step 1: Write `StickyNav.astro`**

Write:
```astro
---
interface Props {
  chapters: Array<{ num: string; name: string; anchor: string }>;
}
const { chapters } = Astro.props;
---
<nav class="sticky-nav" data-sticky-nav>
  <div class="sticky-nav-inner">
    <div class="brand mono">HMFIC / Build Log</div>
    <ol class="chapters">
      {chapters.map((c) => (
        <li>
          <a href={c.anchor} data-anchor={c.anchor}>
            <span class="n">{c.num.replace('/', '')}</span>
            <span class="name">{c.name}</span>
          </a>
        </li>
      ))}
    </ol>
    <a class="cta mono" href="#chapter-8">Book a call →</a>
  </div>
</nav>
<style>
  .sticky-nav {
    position: sticky;
    top: 0;
    z-index: 20;
    background: var(--paper);
    border-bottom: 2px solid var(--ink);
    backdrop-filter: saturate(1.2);
  }
  .sticky-nav-inner {
    max-width: var(--col-full);
    margin: 0 auto;
    padding: 14px var(--space-6);
    display: flex;
    align-items: center;
    gap: var(--space-5);
  }
  .brand { color: var(--ink); white-space: nowrap; }
  .chapters {
    list-style: none;
    margin: 0;
    padding: 0;
    display: flex;
    gap: var(--space-5);
    flex: 1;
    overflow-x: auto;
  }
  .chapters li { white-space: nowrap; }
  .chapters a {
    display: flex;
    align-items: baseline;
    gap: 6px;
    font-family: var(--font-mono);
    font-size: 10px;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: var(--ink-4);
    text-decoration: none;
    transition: color .15s;
  }
  .chapters a[aria-current="true"] { color: var(--accent); }
  .chapters a:hover { color: var(--ink); }
  .cta {
    background: var(--ink);
    color: var(--paper);
    padding: 8px 14px;
    text-decoration: none;
    font-size: 10px;
    white-space: nowrap;
  }
  @media (max-width: 800px) {
    .brand, .chapters li .name { display: none; }
  }
</style>
```

- [ ] **Step 2: Write the sticky nav scroll-spy JS**

Write `public/scripts/stickyNav.js`:
```js
(function () {
  const nav = document.querySelector('[data-sticky-nav]');
  if (!nav) return;
  const links = Array.from(nav.querySelectorAll('a[data-anchor]'));
  const targets = links
    .map((l) => {
      const sel = l.getAttribute('data-anchor');
      return sel ? document.querySelector(sel) : null;
    })
    .filter(Boolean);

  if (targets.length === 0) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const id = '#' + entry.target.id;
          links.forEach((l) => {
            l.setAttribute('aria-current', l.getAttribute('data-anchor') === id ? 'true' : 'false');
          });
        }
      });
    },
    { rootMargin: '-40% 0px -50% 0px', threshold: 0 }
  );
  targets.forEach((t) => observer.observe(t));
})();
```

- [ ] **Step 3: Write `MetaHead.astro`**

Write:
```astro
---
interface Props {
  title: string;
  eyebrow: string;
  ogImage: string;
  slug: string;
}
const { title, eyebrow, ogImage, slug } = Astro.props;
const url = `https://hmficmarketing.com/case-studies/${slug}`;
const absoluteOg = ogImage.startsWith('http') ? ogImage : `https://hmficmarketing.com${ogImage}`;
const description = `${eyebrow} — ${title}. A premium case study from HMFIC Marketing.`;
---
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>{title} — HMFIC Marketing</title>
<meta name="description" content={description} />
<link rel="canonical" href={url} />

<meta property="og:type" content="article" />
<meta property="og:title" content={title} />
<meta property="og:description" content={description} />
<meta property="og:url" content={url} />
<meta property="og:image" content={absoluteOg} />
<meta property="og:image:width" content="1200" />
<meta property="og:image:height" content="630" />
<meta property="og:site_name" content="HMFIC Marketing" />

<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content={title} />
<meta name="twitter:description" content={description} />
<meta name="twitter:image" content={absoluteOg} />

<link rel="icon" href="/favicon.ico" />
```

- [ ] **Step 4: Write `Footer.astro`**

Write:
```astro
---
---
<footer class="site-footer">
  <div class="container">
    <div class="row">
      <div class="mono">HMFIC Marketing · Build Log</div>
      <div class="mono"><a href="/">← hmficmarketing.com</a></div>
    </div>
    <div class="rule-hard"></div>
    <div class="related">
      <div class="label mono">Related work</div>
      <div class="studies">
        <div class="study placeholder">More case studies coming →</div>
      </div>
    </div>
  </div>
</footer>
<style>
  .site-footer { padding: var(--space-8) 0 var(--space-7); border-top: 2px solid var(--ink); margin-top: var(--space-9); }
  .row { display: flex; justify-content: space-between; padding-bottom: var(--space-5); }
  .row a { color: inherit; text-decoration: none; }
  .related { padding-top: var(--space-6); }
  .label { color: var(--ink-4); margin-bottom: var(--space-4); }
  .studies { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: var(--space-5); }
  @media (max-width: 800px) { .studies { grid-template-columns: 1fr; } }
  .study.placeholder {
    border: 1px dashed var(--paper-edge);
    padding: var(--space-5);
    font-family: var(--font-mono);
    font-size: 11px;
    color: var(--ink-4);
    text-align: center;
  }
</style>
```

- [ ] **Step 5: Commit**

```bash
git add src/components/ public/scripts/
git commit -m "feat: sticky nav, meta head, footer"
```

---

## Phase 4 — MFP Content Assembly

### Task 14: Matt interview session — capture Strategy + What's Next narrative

**Files:**
- Create: `docs/superpowers/interviews/2026-04-08-mfp-interview.md`

- [ ] **Step 1: Draft the interview prompt sheet**

Write `docs/superpowers/interviews/2026-04-08-mfp-interview.md`:
```markdown
# MFP Case Study Interview — 30 min

## Chapter 2: The Brief
1. How did MFP come to you? Who reached out, and what was the initial ask?
2. What state was the Shopify store in when you first saw it?
3. Who is MFP, in your words — not the intelligence brief version, the "explain it to a friend at dinner" version?

## Chapter 3: The Strategy
4. When did you decide to rebuild instead of patch? What was the moment?
5. What was the "twelve months saved" logic? Walk me through it.
6. What did you say no to on purpose?

## Chapter 4: The Build
7. What's the one thing about the new Shopify build you're most proud of?
8. What was hard that nobody would notice?
9. Describe the "before" state in one brutal sentence.

## Chapter 6: The Content Engine
10. What does the engine produce in a typical week for MFP?
11. What's an output that surprised you?
12. How do you know when the engine is "on brand" vs drifting?

## Chapter 7: What's Next
13. What's in flight right now that isn't shipped?
14. What are you watching for in the next 60 days that will tell you it's working?
15. When will you come back to this case study with real numbers?

## Chapter 8: The Offer
16. If an ecom owner reads this page and books a call, what do they get?
17. What's the one thing you want them to NOT assume?
```

- [ ] **Step 2: Run the interview with Matt (session with Claude)**

Matt speaks his answers. Claude transcribes in real time into a second file `docs/superpowers/interviews/2026-04-08-mfp-transcript.md`. No editing during the session — just capture.

- [ ] **Step 3: Commit interview notes**

```bash
git add docs/superpowers/interviews/
git commit -m "docs: MFP case study interview prompt + raw transcript"
```

---

### Task 15: Draft Chapter 2 (Brief) and Chapter 3 (Strategy) into MDX

**Files:**
- Modify: `src/content/caseStudies/mfp.mdx`

- [ ] **Step 1: Pull source material from the Vault**

Read:
- `/Users/hmfic/Code/Vault/HMFIC Marketing/Clients/Mission First Pickleball/Intelligence Brief.md`
- `/Users/hmfic/Code/Vault/HMFIC Marketing/Clients/Mission First Pickleball/Client Status.md`
- `docs/superpowers/interviews/2026-04-08-mfp-transcript.md`

- [ ] **Step 2: Draft Chapter 2 (Brief) and append to the `chapters` array in `mfp.mdx`**

Add after the hero chapter:
```yaml
  - type: text
    chapterNumber: "02/"
    chapterName: "The Brief"
    title: "Who MFP is and what they came to us with."
    paragraphs:
      - "<PARAGRAPH 1 — pulled from Intelligence Brief, trimmed to 2-3 sentences about who MFP is as a brand and founder background.>"
      - "<PARAGRAPH 2 — the state of their Shopify store when they came to us, lifted verbatim from the interview transcript.>"
      - "<PARAGRAPH 3 — what the ask actually was, in Matt's voice.>"
```

Replace the `<PARAGRAPH>` placeholders with real content pulled from the sources above. The paragraphs should read in Matt's voice, not AI voice. If the transcript has a line worth quoting verbatim, use it.

- [ ] **Step 3: Draft Chapter 3 (Strategy) similarly**

Add after Chapter 2:
```yaml
  - type: text
    chapterNumber: "03/"
    chapterName: "The Strategy"
    title: "Rebuild, don't patch."
    paragraphs:
      - "<PARAGRAPH 1 — from interview Q4: the moment Matt decided to rebuild.>"
      - "<PARAGRAPH 2 — from interview Q5: the twelve-months-saved logic.>"
      - "<PARAGRAPH 3 — from interview Q6: what he said no to on purpose.>"
    callout:
      label: "Decision"
      body: "Rebuild the theme instead of patching it. Adds two weeks. Saves twelve months."
```

- [ ] **Step 4: Build and verify**

Run: `npm run dev`
Reload `/case-studies/mfp`. Chapters 1, 2, 3 should render with the Editorial Brutalism styling.

- [ ] **Step 5: Commit**

```bash
git add src/content/caseStudies/mfp.mdx
git commit -m "content: MFP Chapter 2 (Brief) + Chapter 3 (Strategy)"
```

---

### Task 16: Draft Chapter 4 (Build) with screenshot placeholders

**Files:**
- Modify: `src/content/caseStudies/mfp.mdx`
- Create: `public/case-studies/mfp/placeholder-before.png`
- Create: `public/case-studies/mfp/placeholder-after.png`

- [ ] **Step 1: Drop placeholder images while real screenshots are pending**

Use a 1200x800 placeholder generated from `sharp`:
```bash
mkdir -p public/case-studies/mfp
node -e "
const sharp = require('sharp');
const svg = (label, bg) => \`<svg xmlns='http://www.w3.org/2000/svg' width='1200' height='800'><rect width='1200' height='800' fill='\${bg}'/><text x='600' y='400' font-family='monospace' font-size='48' fill='#fff' text-anchor='middle'>\${label}</text></svg>\`;
sharp(Buffer.from(svg('BEFORE', '#555'))).png().toFile('public/case-studies/mfp/placeholder-before.png');
sharp(Buffer.from(svg('AFTER', '#d94512'))).png().toFile('public/case-studies/mfp/placeholder-after.png');
sharp(Buffer.from(svg('HOME', '#1a1a1a'))).png().toFile('public/case-studies/mfp/placeholder-home.png');
sharp(Buffer.from(svg('PDP', '#2a241c'))).png().toFile('public/case-studies/mfp/placeholder-pdp.png');
sharp(Buffer.from(svg('COLLECTION', '#4a4238'))).png().toFile('public/case-studies/mfp/placeholder-collection.png');
sharp(Buffer.from(svg('BLOG', '#6b6055'))).png().toFile('public/case-studies/mfp/placeholder-blog.png');
"
```

- [ ] **Step 2: Append Chapter 4 to `mfp.mdx`**

Add to the `chapters` array:
```yaml
  - type: build
    chapterNumber: "04/"
    chapterName: "The Build"
    title: "From a stalled Shopify theme to a real storefront."
    paragraphs:
      - "<PARAGRAPH 1 — the brutal one-sentence description of the 'before', from interview Q9.>"
      - "<PARAGRAPH 2 — what we actually built. Source: Site Copy/Homepage.md + Product Page.md themes.>"
      - "<PARAGRAPH 3 — the one thing Matt is proud of, from interview Q7.>"
      - "<PARAGRAPH 4 — what was hard that nobody would notice, from interview Q8.>"
    beforeAfter:
      before: "/case-studies/mfp/placeholder-before.png"
      after: "/case-studies/mfp/placeholder-after.png"
      beforeAlt: "MFP Shopify store before the rebuild"
      afterAlt: "MFP Shopify store after the rebuild"
    screenshots:
      - src: "/case-studies/mfp/placeholder-home.png"
        alt: "MFP homepage"
        caption: "Homepage"
      - src: "/case-studies/mfp/placeholder-pdp.png"
        alt: "MFP product page"
        caption: "Product page"
      - src: "/case-studies/mfp/placeholder-collection.png"
        alt: "MFP collection page"
        caption: "Collection page"
      - src: "/case-studies/mfp/placeholder-blog.png"
        alt: "MFP blog post"
        caption: "Blog post"
```

- [ ] **Step 3: Build and verify**

Run: `npm run dev`
Reload `/case-studies/mfp` and scroll to Chapter 4. The before/after slider should be draggable; the 4 screenshots should render in a grid.

- [ ] **Step 4: Commit**

```bash
git add src/content/caseStudies/mfp.mdx public/case-studies/mfp/
git commit -m "content: MFP Chapter 4 (Build) with placeholder screenshots"
```

---

### Task 17: Draft Chapter 5 (Intelligence Layer) with real Vault content

**Files:**
- Modify: `src/content/caseStudies/mfp.mdx`

- [ ] **Step 1: Pull content from Brand Voice Profile, Intelligence Brief, Avatar Map**

Read these files and extract 4 key/value pairs for each snippet card. The pairs should read as *lifts from the real document*, not paraphrases:

- From `Intelligence Brief.md`: Founded, Origin, Market, Edge (or closest equivalent fields)
- From `Brand Voice Profile.md`: Tone, Pacing, Avoid, Use
- From `Avatar Map.md`: Age, Pain, Belief, Trigger (for the primary avatar)

- [ ] **Step 2: Append Chapter 5 to `mfp.mdx`**

Add:
```yaml
  - type: intelligence
    chapterNumber: "05/"
    chapterName: "The Intelligence Layer"
    title: "Before any content gets made, here's what we already know."
    paragraphs:
      - "Most agencies start with content. We start with intelligence. Before a single ad, email, or reel gets produced for Mission First Pickleball, we build three documents — the Intelligence Brief, the Brand Voice Profile, and the Avatar Map. Together, they tell us exactly who the brand is, how it sounds, and who it's talking to."
      - "Every piece of content downstream — every headline, every caption, every email subject line — is a direct descendant of these three documents. When the output feels consistent, this is why. When it feels like the brand and not like AI slop, this is why."
    snippets:
      - tag: "INTELLIGENCE BRIEF"
        excerptLabel: "Excerpt · Section 01"
        heading: "Who the brand actually is"
        rows:
          - { key: "Founded", value: "<from Intelligence Brief.md>" }
          - { key: "Origin",  value: "<from Intelligence Brief.md>" }
          - { key: "Market",  value: "<from Intelligence Brief.md>" }
          - { key: "Edge",    value: "<from Intelligence Brief.md>" }
        footerLeft: "§ 01 of 13"
        footerRight: "MFP / 2026"
      - tag: "VOICE PROFILE"
        excerptLabel: "Excerpt · Section 02"
        heading: "Core voice attributes"
        rows:
          - { key: "Tone",   value: "<from Brand Voice Profile.md>" }
          - { key: "Pacing", value: "<from Brand Voice Profile.md>" }
          - { key: "Avoid",  value: "<from Brand Voice Profile.md>" }
          - { key: "Use",    value: "<from Brand Voice Profile.md>" }
        footerLeft: "§ 02 of 09"
        footerRight: "MFP / 2026"
      - tag: "AVATAR MAP"
        excerptLabel: "Primary Avatar · 01"
        heading: "The serious player"
        rows:
          - { key: "Age",     value: "<from Avatar Map.md>" }
          - { key: "Pain",    value: "<from Avatar Map.md>" }
          - { key: "Belief",  value: "<from Avatar Map.md>" }
          - { key: "Trigger", value: "<from Avatar Map.md>" }
        footerLeft: "Avatar 01 of 04"
        footerRight: "MFP / 2026"
    pullQuote:
      body: "This is the part of the work nobody sees. It's also the part that makes everything else work."
      attribution: "The thinking behind the engine"
```

Replace every `<from ...>` placeholder with the actual content from the Vault files, verbatim where possible, trimmed to fit the row.

- [ ] **Step 3: Build and verify**

Run: `npm run dev`
Reload `/case-studies/mfp`. Chapter 5 should render with the three snippet cards matching the mockup we locked in brainstorming.

- [ ] **Step 4: Commit**

```bash
git add src/content/caseStudies/mfp.mdx
git commit -m "content: MFP Chapter 5 (Intelligence Layer) with real vault excerpts"
```

---

### Task 18: Draft Chapter 6 (Content Engine) + Chapter 7 (What's Next) + Chapter 8 (Offer)

**Files:**
- Modify: `src/content/caseStudies/mfp.mdx`

- [ ] **Step 1: Pull sample content from the Vault**

Read and select one standout excerpt from each of:
- `Content Package/Week 1 — Pain + Mechanism.md` → one social post body
- `Content Package/Email Nurture Sequence.md` → one email subject + opening paragraph
- `Content Package/Ad Creative — Brand Story Cold.md` → one ad headline + primary text
- `Content Package/Reel Storyboard — Stop Buying Paddles.md` → scene 1 description

- [ ] **Step 2: Append Chapter 6 to `mfp.mdx`**

Add:
```yaml
  - type: engine
    chapterNumber: "06/"
    chapterName: "The Content Engine"
    title: "What the engine produces because Chapter 5 exists."
    paragraphs:
      - "The Intelligence Layer is the input. The Content Engine is the output. The engine doesn't write content in a vacuum — it writes content that's already anchored to MFP's voice, the serious player's pain, and the brand's earned credibility. That's why the volume doesn't feel like spam."
      - "A sample of what we produced in a typical week for MFP:"
    samples:
      - label: "SOCIAL POST · WEEK 1"
        title: "<headline from Week 1 — Pain + Mechanism>"
        body: "<body excerpt, 2-3 sentences, verbatim>"
        footnote: "Week 1 · Pain + Mechanism track"
      - label: "EMAIL · NURTURE SEQUENCE"
        title: "<subject line from Email Nurture Sequence>"
        body: "<opening paragraph, verbatim>"
        footnote: "Email 01 of 07"
      - label: "META AD · COLD TRAFFIC"
        title: "<headline from Ad Creative — Brand Story Cold>"
        body: "<primary text excerpt, 2-3 sentences>"
        footnote: "Cold traffic · brand story lead"
      - label: "REEL · HOOK"
        title: "Stop buying paddles."
        body: "<scene 1 body>"
        footnote: "Reel storyboard · 15 sec"
```

- [ ] **Step 3: Append Chapter 7 (What's Next) as a text chapter**

Add:
```yaml
  - type: text
    chapterNumber: "07/"
    chapterName: "What's Next"
    title: "What's in flight and what we're watching for."
    paragraphs:
      - "<PARAGRAPH 1 — what's still being built, from interview Q13.>"
      - "<PARAGRAPH 2 — the signals Matt is watching for in the next 60 days, from Q14.>"
      - "<PARAGRAPH 3 — when this case study gets its results update, from Q15.>"
```

- [ ] **Step 4: Append Chapter 8 (Offer)**

Add:
```yaml
  - type: offer
    chapterNumber: "08/"
    chapterName: "The Offer"
    title: "If you run a Shopify store and want work like this done for you."
    body: "We rebuild Shopify stores and stand up AI content engines for ecommerce brands that want a real operator, not a generic agency. Every build is scoped on a call — pricing depends on what you actually need. If this is the kind of work you want, let's talk."
    cta:
      label: "Book a call →"
      href: "https://cal.com/hmficmarketing/intro"
```

(Replace the cal.com URL with the actual Matt booking URL.)

- [ ] **Step 5: Build and verify the full page**

Run: `npm run dev`
Walk the full page at `/case-studies/mfp` from top to bottom. All 8 chapters should render in order.

- [ ] **Step 6: Commit**

```bash
git add src/content/caseStudies/mfp.mdx
git commit -m "content: MFP Chapters 6-8 (Engine, Next, Offer)"
```

---

## Phase 5 — Polish, OG, and SEO

### Task 19: Generate the Open Graph share card

**Files:**
- Create: `scripts/generate-og.mjs`
- Modify: `package.json`
- Create: `public/og/mfp.png`

- [ ] **Step 1: Write the OG generator script**

Write `scripts/generate-og.mjs`:
```js
import sharp from 'sharp';
import fs from 'node:fs';
import path from 'node:path';

const OUT_DIR = path.resolve('public/og');
fs.mkdirSync(OUT_DIR, { recursive: true });

const cards = [
  {
    slug: 'mfp',
    eyebrow: 'HMFIC / BUILD LOG · № 001',
    headline: "Rebuilding MFP's Shopify from zero.",
    footer: 'HMFICMARKETING.COM',
  },
];

const svgTemplate = ({ eyebrow, headline, footer }) => `
<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <rect width="1200" height="630" fill="#f5f0e6"/>
  <rect x="80" y="80" width="1040" height="4" fill="#1a1a1a"/>
  <text x="80" y="140" font-family="JetBrains Mono, monospace" font-size="22" font-weight="700" letter-spacing="3" fill="#1a1a1a">${eyebrow}</text>
  <text x="80" y="320" font-family="Source Serif 4, Georgia, serif" font-size="84" font-weight="500" fill="#1a1a1a">
    <tspan x="80" dy="0">Rebuilding MFP's Shopify</tspan>
    <tspan x="80" dy="92">from <tspan fill="#d94512">zero.</tspan></tspan>
  </text>
  <rect x="80" y="530" width="1040" height="4" fill="#1a1a1a"/>
  <text x="80" y="575" font-family="JetBrains Mono, monospace" font-size="18" font-weight="700" letter-spacing="3" fill="#6b6055">${footer}</text>
  <text x="1120" y="575" font-family="JetBrains Mono, monospace" font-size="18" font-weight="700" letter-spacing="3" fill="#6b6055" text-anchor="end">APR 2026 →</text>
</svg>
`;

for (const card of cards) {
  const svg = svgTemplate(card);
  await sharp(Buffer.from(svg)).png().toFile(path.join(OUT_DIR, `${card.slug}.png`));
  console.log(`Generated og/${card.slug}.png`);
}
```

- [ ] **Step 2: Add an npm script + run it**

Modify `package.json` scripts block to add:
```json
"og": "node scripts/generate-og.mjs",
"prebuild": "npm run og"
```

Run: `npm run og`
Expected: `public/og/mfp.png` is created at 1200x630.

- [ ] **Step 3: Verify the card renders correctly**

Open `public/og/mfp.png` in Preview. Confirm eyebrow, headline with orange "zero.", and footer row are all visible and readable.

- [ ] **Step 4: Commit**

```bash
git add scripts/generate-og.mjs package.json public/og/
git commit -m "feat: OG card generator + MFP share image"
```

---

### Task 20: Write Playwright smoke tests

**Files:**
- Create: `playwright.config.ts`
- Create: `tests/build.spec.ts`
- Create: `tests/og.spec.ts`

- [ ] **Step 1: Initialize Playwright config**

Write `playwright.config.ts`:
```ts
import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  webServer: {
    command: 'npm run preview',
    url: 'http://localhost:4321',
    reuseExistingServer: !process.env.CI,
    timeout: 60_000,
  },
  use: {
    baseURL: 'http://localhost:4321',
    trace: 'on-first-retry',
  },
});
```

- [ ] **Step 2: Write build smoke test**

Write `tests/build.spec.ts`:
```ts
import { test, expect } from '@playwright/test';

test.describe('MFP case study', () => {
  test('loads and contains hero headline', async ({ page }) => {
    await page.goto('/case-studies/mfp');
    await expect(page.locator('h1')).toContainText(/Rebuilding MFP/);
  });

  test('hero has book a call CTA', async ({ page }) => {
    await page.goto('/case-studies/mfp');
    await expect(page.locator('.cta-primary').first()).toBeVisible();
  });

  test('all chapter anchors exist', async ({ page }) => {
    await page.goto('/case-studies/mfp');
    for (const id of ['chapter-1', 'chapter-2', 'chapter-3', 'chapter-4', 'chapter-5', 'chapter-6', 'chapter-7', 'chapter-8']) {
      await expect(page.locator(`#${id}`)).toBeVisible();
    }
  });

  test('intelligence layer renders 3 snippet cards', async ({ page }) => {
    await page.goto('/case-studies/mfp');
    const snippets = page.locator('.snippet');
    await expect(snippets).toHaveCount(3);
  });

  test('before/after slider exists and is interactive', async ({ page }) => {
    await page.goto('/case-studies/mfp');
    const slider = page.locator('[data-ba-slider]');
    await expect(slider).toBeVisible();
    await slider.fill('25');
  });

  test('offer CTA links to booking', async ({ page }) => {
    await page.goto('/case-studies/mfp');
    const offerCta = page.locator('.offer .cta');
    await expect(offerCta).toBeVisible();
    await expect(offerCta).toHaveAttribute('href', /cal\.com|calendly/);
  });
});
```

- [ ] **Step 3: Write OG meta test**

Write `tests/og.spec.ts`:
```ts
import { test, expect } from '@playwright/test';

test('MFP page exposes correct OG meta', async ({ page }) => {
  await page.goto('/case-studies/mfp');
  await expect(page.locator('meta[property="og:title"]')).toHaveAttribute('content', /Rebuilding MFP/);
  await expect(page.locator('meta[property="og:image"]')).toHaveAttribute('content', /\/og\/mfp\.png/);
  await expect(page.locator('meta[property="og:type"]')).toHaveAttribute('content', 'article');
  await expect(page.locator('meta[name="twitter:card"]')).toHaveAttribute('content', 'summary_large_image');
});

test('OG image is reachable', async ({ request }) => {
  const res = await request.get('/og/mfp.png');
  expect(res.status()).toBe(200);
  expect(res.headers()['content-type']).toContain('image/png');
});
```

- [ ] **Step 4: Run tests**

Run: `npx playwright install chromium && npm run build && npm test`
Expected: all tests pass.

- [ ] **Step 5: Commit**

```bash
git add playwright.config.ts tests/
git commit -m "test: Playwright smoke tests for MFP case study"
```

---

### Task 21: Capture real screenshots and replace placeholders

**Files:**
- Modify: `public/case-studies/mfp/*.png` (replaced)
- Modify: `src/content/caseStudies/mfp.mdx` (updated alt + captions)

- [ ] **Step 1: Open the live MFP Shopify store**

Run: `open https://missionfirstpickleball.com`
(Or the actual URL from `mfp-shopify` repo `.env`.)

- [ ] **Step 2: Capture screenshots at 1440x900 desktop width**

Use macOS Shift+Cmd+4 or a dedicated tool to capture:
- `home.png` — homepage full-fold
- `pdp.png` — one product page, full-fold
- `collection.png` — collection/shop page
- `blog.png` — one blog post reading view
- `after.png` — a clean overview of the homepage for the before/after

Save all to `/Users/hmfic/Code/hmfic-site/public/case-studies/mfp/` overwriting the placeholders.

- [ ] **Step 3: Capture the "before" state from Shopify admin**

Log into MFP's Shopify admin. Switch to the pre-rebuild theme in the theme library (don't publish it — just preview). Capture the same homepage view. Save as `before.png`.

- [ ] **Step 4: Optimize all PNGs**

Run:
```bash
cd /Users/hmfic/Code/hmfic-site/public/case-studies/mfp
for f in *.png; do
  node -e "
    const sharp = require('sharp');
    sharp('$f').resize({ width: 1600, withoutEnlargement: true }).png({ quality: 80, compressionLevel: 9 }).toBuffer().then(b => require('fs').writeFileSync('$f', b));
  "
done
```

- [ ] **Step 5: Update `mfp.mdx` to reference the real filenames**

Replace every `placeholder-*.png` reference in `src/content/caseStudies/mfp.mdx` with the real filename (`home.png`, `pdp.png`, `collection.png`, `blog.png`, `before.png`, `after.png`). Update `alt` and `caption` text to match the real screenshots.

- [ ] **Step 6: Build and verify**

Run: `npm run build && npm run preview`
Open `/case-studies/mfp` and verify every screenshot renders correctly and the before/after slider shows the real before and after.

- [ ] **Step 7: Commit**

```bash
git add public/case-studies/mfp/ src/content/caseStudies/mfp.mdx
git commit -m "feat: real MFP screenshots replace placeholders"
```

---

### Task 22: Scroll reveal animations and polish pass

**Files:**
- Create: `public/scripts/scrollReveal.js`
- Modify: `src/layouts/CaseStudyLayout.astro`
- Modify: `src/styles/global.css`

- [ ] **Step 1: Write the scroll reveal script**

Write `public/scripts/scrollReveal.js`:
```js
(function () {
  const els = document.querySelectorAll('.chapter, .hero');
  if (!('IntersectionObserver' in window)) {
    els.forEach((el) => el.classList.add('is-visible'));
    return;
  }
  const obs = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add('is-visible');
          obs.unobserve(e.target);
        }
      });
    },
    { rootMargin: '0px 0px -10% 0px', threshold: 0.05 }
  );
  els.forEach((el) => obs.observe(el));
})();
```

- [ ] **Step 2: Add reveal styles to `global.css`**

Append:
```css
.chapter, .hero {
  opacity: 0;
  transform: translateY(24px);
  transition: opacity .7s ease-out, transform .7s ease-out;
}
.chapter.is-visible, .hero.is-visible {
  opacity: 1;
  transform: translateY(0);
}
@media (prefers-reduced-motion: reduce) {
  .chapter, .hero { opacity: 1; transform: none; transition: none; }
}
```

- [ ] **Step 3: Reference the script from the layout**

In `src/layouts/CaseStudyLayout.astro`, add before the closing `</body>`:
```html
<script src="/scripts/scrollReveal.js" defer></script>
```

- [ ] **Step 4: Verify in browser**

Run: `npm run dev`
Scroll the page. Chapters should fade in as they enter the viewport. If prefers-reduced-motion is on at the OS level, they should render immediately without animation.

- [ ] **Step 5: Commit**

```bash
git add public/scripts/scrollReveal.js src/layouts/CaseStudyLayout.astro src/styles/global.css
git commit -m "feat: scroll reveal animation with reduced-motion fallback"
```

---

## Phase 6 — Deploy

### Task 23: Deploy to Vercel and verify production

**Files:**
- None (deploys existing commits)

- [ ] **Step 1: Run the build locally one more time**

Run: `npm run build`
Expected: `dist/` is generated with `case-studies/mfp/index.html`, no errors.

- [ ] **Step 2: Run all tests against the preview**

Run: `npm test`
Expected: all Playwright tests pass.

- [ ] **Step 3: Push to main and trigger Vercel deploy**

Run:
```bash
git push origin main
```

Wait for the Vercel deploy to finish (check the Vercel dashboard or the CLI).

- [ ] **Step 4: Verify the production URL**

Open `https://hmficmarketing.com/case-studies/mfp` and walk the page top to bottom. Confirm:
- Hero headline and CTA render
- All 8 chapters are present
- Before/after slider works
- Intelligence snippets render correctly
- Offer CTA links to booking
- Fonts load (check DevTools > Network)
- Sticky nav scroll-spy highlights the current chapter

- [ ] **Step 5: OG card smoke test in the wild**

Paste `https://hmficmarketing.com/case-studies/mfp` into:
- Slack DM to yourself — confirm the OG card renders
- iMessage to yourself — confirm the OG card renders
- LinkedIn post preview — confirm
- Facebook Sharing Debugger (`https://developers.facebook.com/tools/debug/`) — confirm

If any of them fail to render, check:
- `og:image` URL is absolute (starts with `https://`)
- The image is reachable publicly
- The `og:image:width` and `og:image:height` are set

- [ ] **Step 6: Send MFP the courtesy preview message**

Matt sends a short message to MFP:
> "Hey — wanted to share the case study page we built from the Shopify + content work. It's live at [URL]. Take a look when you get a sec and let me know if anything needs to come off."

- [ ] **Step 7: Final commit (deploy marker)**

Run:
```bash
git commit --allow-empty -m "ship: MFP case study live at hmficmarketing.com/case-studies/mfp"
git push origin main
```

---

## Phase 7 — Follow-on (out of scope for initial ship, documented here)

These are intentionally NOT part of the initial plan but are likely the next pieces of work:

- **Case study #2** (Loft Medspa, Katie Sampayo, Vigilant Life, etc.) — drops in as a new MDX file in `src/content/caseStudies/`, zero code changes
- **Results update chapter** — added to `mfp.mdx` when real MFP metrics land (60-day window)
- **Home page rebuild** — migrate the current `src/pages/index.astro` from the ported static markup into a proper Astro home that links to case studies
- **Case study index page** — `/case-studies/index.astro` listing all published case studies
- **Analytics** — Vercel Web Analytics or Plausible once the page is shipped

---

## Success Criteria Traceability

| Spec criterion | Plan coverage |
|---|---|
| Ships within 2 weeks of spec approval | Phases 1-6, 23 tasks, each bite-sized |
| Template reusable for next case study with no code changes | Task 5 (schema) + Task 6 (dynamic route) |
| Page loads under 1.5s desktop, 2.5s mobile | Astro static output + self-hosted fonts (Task 4) + lazy images (Task 11) |
| OG share card renders correctly in Slack, iMessage, LinkedIn | Task 19 (generator) + Task 13 (MetaHead) + Task 20 (test) + Task 23 Step 5 (manual verification) |
| Matt feels confident dropping the link in a DM | Tasks 14-18 (real content from interview + Vault) + Task 21 (real screenshots) + Task 22 (polish) |
| $50K closed in 30 days | Served by Task 23 (ship) + the page itself |
