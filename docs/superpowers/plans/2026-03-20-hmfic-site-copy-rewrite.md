# HMFIC Site Copy Rewrite Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rewrite all copy on the HMFIC Marketing site to reposition from generic ads agency to ads-first, system-powered, AI-accelerated — with the Gravity Converter Formula as the differentiator.

**Architecture:** Single-file copy rewrite of `index.html`. No structural/layout changes. No CSS changes. All edits are text replacements within existing HTML elements. One final dash audit pass across the entire file.

**Tech Stack:** HTML (static site), Vercel deployment

**Spec:** `docs/superpowers/specs/2026-03-20-hmfic-site-copy-rewrite-design.md`

**Key rules:**
- No dashes in copy. Use periods, commas, or rewrite the sentence. This includes en dashes (–) and em dashes (—).
- GCF is named. Internal structure (phases, section names, question count) is NOT revealed.
- AI = superpower powered by the system, not a buzzword.
- Ads are the anchor. Content amplifies. Never read as "content agency."

---

### Task 1: Update `<head>` — Title and Meta Description

**Files:**
- Modify: `index.html:6-7`

- [ ] **Step 1: Replace the `<title>` tag**

Replace line 6:
```html
  <title>HMFIC — Facebook, Google & TikTok Ad System for 7-Figure Scaling</title>
```
With:
```html
  <title>HMFIC Marketing | Paid Ads Powered by the Gravity Converter Formula</title>
```

- [ ] **Step 2: Replace the `<meta name="description">`**

Replace line 7:
```html
  <meta name="description" content="The #1 Facebook, Google & TikTok Ad System for Scaling to 7 Figures. Done-for-you ad management with proven 3-5X ROI." />
```
With:
```html
  <meta name="description" content="Done-for-you Facebook, Google, and TikTok ad management powered by the Gravity Converter Formula. A proprietary client intelligence system that makes every ad, every piece of content, and every dollar work harder. Proven 3 to 5X ROI." />
```

- [ ] **Step 3: Commit**

```bash
git add index.html
git commit -m "Update page title and meta description with GCF positioning"
```

---

### Task 2: Update Nav

**Files:**
- Modify: `index.html:25-27`

- [ ] **Step 1: Add "How It Works" link to nav**

Replace lines 25-27:
```html
      <ul class="nav-links" id="navLinks">
        <li><a href="#apply" class="btn btn-nav">Apply Now</a></li>
      </ul>
```
With:
```html
      <ul class="nav-links" id="navLinks">
        <li><a href="#services" class="nav-link">How It Works</a></li>
        <li><a href="#apply" class="btn btn-nav">Apply Now</a></li>
      </ul>
```

- [ ] **Step 2: Commit**

```bash
git add index.html
git commit -m "Add How It Works nav link pointing to services section"
```

---

### Task 3: Rewrite Hero Section

**Files:**
- Modify: `index.html:31-47`

- [ ] **Step 1: Replace the entire hero section inner content**

Replace lines 31-47:
```html
  <!-- HERO -->
  <section class="hero" id="hero">
    <div class="container hero-inner">
      <div class="hero-badge">Facebook · Google · TikTok Ads</div>
      <h1 class="hero-headline"><span class="word">The</span> <span class="word">#1</span> <span class="word">Ad</span> <span class="word">System</span> <span class="word">for</span> <span class="word">Scaling</span> <span class="word">Your</span> <span class="word">Brand</span> <span class="word">to</span> <span class="word highlight">7&nbsp;Figures</span></h1>
      <p class="hero-sub">Done-for-you Facebook, Google & TikTok ad management that delivers 3–5X ROI — without you touching a single campaign.</p>
      <div class="hero-ctas">
        <a href="#apply" class="btn btn-primary btn-lg">Apply to Work With Us</a>
        <a href="#about" class="btn btn-ghost btn-lg">See How It Works</a>
      </div>
      <div class="hero-proof">
        <span>3–5X Proven ROI</span>
        <span>Hands-Free Management</span>
        <span>Limited Spots Available</span>
      </div>
    </div>
  </section>
```
With:
```html
  <!-- HERO -->
  <section class="hero" id="hero">
    <div class="container hero-inner">
      <div class="hero-badge">Facebook · Google · TikTok Ads</div>
      <h1 class="hero-headline"><span class="word">We</span> <span class="word">Scale</span> <span class="word">Brands</span> <span class="word">With</span> <span class="word">Paid</span> <span class="word">Ads.</span> <span class="word">Powered</span> <span class="word">by</span> <span class="word">the</span> <span class="word highlight">Gravity&nbsp;Converter&nbsp;Formula.</span></h1>
      <p class="hero-sub">The Gravity Converter Formula is our proprietary client intelligence framework. It maps your audience, your messaging, and your content strategy before we spend a single dollar. Then we use AI the right way to accelerate everything the system already knows. Your ads, your content, and your scripts all speak to your audience where they are and move them from attention to action.</p>
      <div class="hero-ctas">
        <a href="#apply" class="btn btn-primary btn-lg">Apply to Work With Us</a>
        <a href="#services" class="btn btn-ghost btn-lg">See How It Works</a>
      </div>
      <div class="hero-proof">
        <span>Proven 3 to 5X ROI</span>
        <span>AI as a Superpower, Not a Shortcut</span>
        <span>Limited Availability</span>
      </div>
    </div>
  </section>
```

- [ ] **Step 2: Commit**

```bash
git add index.html
git commit -m "Rewrite hero section with GCF positioning and AI philosophy"
```

---

### Task 4: Rewrite About Matt Section

**Files:**
- Modify: `index.html:49-72`

- [ ] **Step 1: Replace the about section content**

Replace lines 49-72:
```html
  <!-- ABOUT MATT -->
  <section class="about section-pad" id="about">
    <div class="container about-inner">
      <div class="about-photo">
        <img src="assets/matt-holmes.jpg" alt="Matt Holmes — HMFIC" onerror="this.parentElement.innerHTML='<div class=\'photo-placeholder\'>Matt Holmes</div>'" />
      </div>
      <div class="about-content">
        <div class="section-eyebrow">About</div>
        <h2>I'm <span class="highlight">Matt Holmes</span>, and I Run Ads That Actually Scale</h2>
        <p>I've spent years in the trenches running paid media for 7-figure eCommerce brands, fitness companies, and info product businesses. I've managed millions in ad spend across Facebook, Google, and TikTok — and I know exactly what separates campaigns that scale from ones that bleed money.</p>
        <p>HMFIC isn't an agency with junior account managers. When you work with us, you get direct access to proven systems, battle-tested strategies, and real human oversight on every dollar you spend.</p>
        <div class="about-stats">
          <div class="stat">
            <strong>$10M+</strong>
            <span>Ad Spend Managed</span>
          </div>
          <div class="stat">
            <strong>3–5X</strong>
            <span>Average Client ROI</span>
          </div>
        </div>
      </div>
    </div>
  </section>
```
With:
```html
  <!-- ABOUT MATT -->
  <section class="about section-pad" id="about">
    <div class="container about-inner">
      <div class="about-photo">
        <img src="assets/matt-holmes.jpg" alt="Matt Holmes, HMFIC Marketing" onerror="this.parentElement.innerHTML='<div class=\'photo-placeholder\'>Matt Holmes</div>'" />
      </div>
      <div class="about-content">
        <div class="section-eyebrow">About</div>
        <h2>I'm <span class="highlight">Matt Holmes</span>, and I Built a System Because I Got Tired of Guesswork</h2>
        <p>I started running ads because business owners needed someone working in their ads manager so they could work on their business. That hasn't changed. I've managed millions in ad spend across Facebook, Google, and TikTok for 7-figure eCommerce brands, fitness companies, and info product businesses. I know what separates campaigns that scale from ones that bleed money.</p>
        <p>But the game has expanded. AI is moving fast. Content marketing is exploding. The brands with real money know they need to be leveraging all of it. They just don't have time to figure it out and execute it themselves. That's where I come in.</p>
        <p>I built the Gravity Converter Formula because I was tired of running campaigns based on surface-level info. It's a client intelligence system that maps who your audience is, what they respond to, and why, before we ever build an ad. And now AI accelerates everything the system produces. Not generic output. Real content powered by real intelligence.</p>
        <p>HMFIC isn't an agency with junior account managers. When you work with us, you get direct access to the system, the strategy, and real human oversight on every dollar you spend.</p>
        <div class="about-stats">
          <div class="stat">
            <strong>$10M+</strong>
            <span>Ad Spend Managed</span>
          </div>
          <div class="stat">
            <strong>3 to 5X</strong>
            <span>Average Client ROI</span>
          </div>
        </div>
      </div>
    </div>
  </section>
```

- [ ] **Step 2: Commit**

```bash
git add index.html
git commit -m "Rewrite About section with founder story, GCF origin, and AI angle"
```

---

### Task 5: Rewrite Services Section (The Three Engines)

**Files:**
- Modify: `index.html:74-123`

- [ ] **Step 1: Replace the entire services section**

Replace lines 74-123:
```html
  <!-- SERVICES -->
  <section class="services section-pad bg-light" id="services">
    <div class="container">
      <div class="section-header">
        <div class="section-eyebrow">What We Do</div>
        <h2>Full-Stack Ad Management That Scales</h2>
      </div>
      <div class="cards-grid">
        <div class="card">
          <div class="card-icon">
            <svg width="40" height="40" viewBox="0 0 40 40" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round"><circle cx="20" cy="20" r="15"/><circle cx="20" cy="20" r="8"/><circle cx="20" cy="20" r="3" fill="currentColor" stroke="none"/><line x1="20" y1="2" x2="20" y2="9"/><line x1="20" y1="31" x2="20" y2="38"/><line x1="2" y1="20" x2="9" y2="20"/><line x1="31" y1="20" x2="38" y2="20"/></svg>
          </div>
          <h3>Paid Ads That Convert</h3>
          <p>Facebook, Google, and TikTok campaigns built around your customer journey — not vanity metrics. Every ad is designed to convert cold traffic into buyers.</p>
          <ul>
            <li>Full campaign build & launch</li>
            <li>Creative strategy & copy</li>
            <li>Ongoing A/B testing</li>
            <li>Weekly performance reports</li>
          </ul>
        </div>
        <div class="card">
          <div class="card-icon">
            <svg width="40" height="40" viewBox="0 0 40 40" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><polyline points="3,30 13,18 22,23 37,8"/><polyline points="28,8 37,8 37,17"/></svg>
          </div>
          <h3>Brand Growth That Lasts</h3>
          <p>We don't just run ads — we build brand equity. Multi-platform strategies that grow your audience and your revenue at the same time.</p>
          <ul>
            <li>Multi-channel ad strategy</li>
            <li>Audience building & retargeting</li>
            <li>Funnel optimization</li>
            <li>Monthly strategy calls</li>
          </ul>
        </div>
        <div class="card">
          <div class="card-icon">
            <svg width="40" height="40" viewBox="0 0 40 40" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M35 5H5a2 2 0 0 0-2 2.5v20a2.5 2.5 0 0 0 2.5 2.5h10l4.5 5 4.5-5H35a2.5 2.5 0 0 0 2.5-2.5V7.5A2.5 2.5 0 0 0 35 5z"/><line x1="12" y1="15" x2="28" y2="15"/><line x1="12" y1="22" x2="22" y2="22"/></svg>
          </div>
          <h3>SMS Marketing for eCommerce</h3>
          <p>The highest open-rate channel in marketing. We build and manage your SMS list to turn one-time buyers into repeat customers.</p>
          <ul>
            <li>SMS list building</li>
            <li>Automated flow sequences</li>
            <li>Promotional campaign management</li>
            <li>Abandoned cart recovery</li>
          </ul>
        </div>
      </div>
    </div>
  </section>
```
With:
```html
  <!-- SERVICES — THE THREE ENGINES -->
  <section class="services section-pad bg-light" id="services">
    <div class="container">
      <div class="section-header">
        <div class="section-eyebrow">How It Works</div>
        <h2>The System Behind the Results</h2>
      </div>
      <div class="cards-grid">
        <div class="card">
          <div class="card-icon">
            <!-- Crosshair/target = Intelligence -->
            <svg width="40" height="40" viewBox="0 0 40 40" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round"><circle cx="20" cy="20" r="15"/><circle cx="20" cy="20" r="8"/><circle cx="20" cy="20" r="3" fill="currentColor" stroke="none"/><line x1="20" y1="2" x2="20" y2="9"/><line x1="20" y1="31" x2="20" y2="38"/><line x1="2" y1="20" x2="9" y2="20"/><line x1="31" y1="20" x2="38" y2="20"/></svg>
          </div>
          <h3>Intelligence</h3>
          <p>Before any ad runs or any content is created, we map your business, your audience, and your messaging through the Gravity Converter Formula. We figure out what your people respond to, what's holding them back, and what moves them to act at every level. This isn't a questionnaire. It's a client intelligence framework that everything else is built on.</p>
        </div>
        <div class="card">
          <div class="card-icon">
            <!-- Growth chart = Authority Engine -->
            <svg width="40" height="40" viewBox="0 0 40 40" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><polyline points="3,30 13,18 22,23 37,8"/><polyline points="28,8 37,8 37,17"/></svg>
          </div>
          <h3>Authority Engine</h3>
          <p>The intelligence feeds a content system. Ad copy, video scripts, social content, email sequences. All built to speak to your audience where they are. Not generic templates. Content that sounds like you, because it's grounded in real data about your business and your customers. AI accelerates the output. The system is why it hits.</p>
        </div>
        <div class="card">
          <div class="card-icon">
            <!-- Rocket = Acceleration -->
            <svg width="40" height="40" viewBox="0 0 40 40" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M20 4c0 0-12 8-12 22h24C32 12 20 4 20 4z"/><circle cx="20" cy="20" r="3"/><line x1="14" y1="30" x2="10" y2="37"/><line x1="26" y1="30" x2="30" y2="37"/></svg>
          </div>
          <h3>Acceleration</h3>
          <p>This is the core. Facebook, Google, and TikTok ad campaigns built on real intelligence, not guesswork. Every campaign is informed by the same system that drives the content. Ads and content aren't separate channels. They're the same conversation. That's how you compound results instead of just spending money.</p>
        </div>
      </div>
    </div>
  </section>
```

- [ ] **Step 2: Commit**

```bash
git add index.html
git commit -m "Replace services cards with Three Engines: Intelligence, Authority, Acceleration"
```

---

### Task 6: Update Testimonials Section Header

**Files:**
- Modify: `index.html:157-159` (line numbers will shift after prior edits; target the testimonials section-header)

- [ ] **Step 1: Update the section header h2**

Find:
```html
        <h2>What Our Clients Say</h2>
```
Replace with:
```html
        <h2>Results From Real Brands</h2>
```

- [ ] **Step 2: Commit**

```bash
git add index.html
git commit -m "Update testimonials section header"
```

---

### Task 7: Rewrite The Offer Section

**Files:**
- Modify: `index.html` — the `<!-- THE OFFER -->` section

- [ ] **Step 1: Replace the offer section content**

Find the offer section and replace the header, checklist, and scarcity sidebar copy.

Replace the eyebrow + h2:
```html
        <div class="section-eyebrow">Done-For-You</div>
        <h2>Everything We Handle <span class="highlight">So You Don't Have To</span></h2>
```
With:
```html
        <div class="section-eyebrow">Done For You</div>
        <h2>What You Get <span class="highlight">When the System Goes to Work</span></h2>
```

Replace the checklist items:
```html
          <li><span class="check">✓</span> Facebook & Instagram Ads — full setup, creative, and management</li>
          <li><span class="check">✓</span> Google Ads — search, display, and shopping campaigns</li>
          <li><span class="check">✓</span> TikTok Ads — short-form video ad strategy and execution</li>
          <li><span class="check">✓</span> 3–5X ROI Target — performance benchmarks on every account</li>
          <li><span class="check">✓</span> SMS & Retargeting — capture, nurture, and convert</li>
          <li><span class="check">✓</span> Direct Response Conversion — every ad built to generate revenue now</li>
          <li><span class="check">✓</span> Weekly reporting & monthly strategy calls</li>
          <li><span class="check">✓</span> Dedicated account oversight — not handed off to a junior</li>
```
With:
```html
          <li><span class="check">✓</span> A full intelligence profile of your business, audience, and messaging</li>
          <li><span class="check">✓</span> Ad campaigns across Facebook, Google, and TikTok built on real data</li>
          <li><span class="check">✓</span> Content and scripts that speak to your audience at every level</li>
          <li><span class="check">✓</span> AI-accelerated execution powered by your intelligence profile</li>
          <li><span class="check">✓</span> Ongoing optimization driven by performance data, not guesses</li>
          <li><span class="check">✓</span> Direct access. Your account is never handed off to a junior.</li>
          <li><span class="check">✓</span> Weekly reporting and monthly strategy calls</li>
```

Replace the scarcity box paragraphs:
```html
          <p>I only take on a small number of clients at a time. This isn't a marketing gimmick — it's how I guarantee results. Every client gets real attention, real strategy, and real results.</p>
          <p>When we're full, we're full. If you're seeing this page, a spot may still be available.</p>
```
With:
```html
          <p>I only take on a small number of clients at a time. This isn't a marketing gimmick. It's how I guarantee results. Every client gets real attention, real strategy, and real results.</p>
          <p>When we're full, we're full. If you're seeing this page, a spot may still be available.</p>
```

Also replace the scarcity CTA arrow:
```html
          <a href="#apply" class="btn btn-primary btn-block">Check Availability &rarr;</a>
```
With:
```html
          <a href="#apply" class="btn btn-primary btn-block">Check Availability</a>
```

- [ ] **Step 2: Commit**

```bash
git add index.html
git commit -m "Rewrite offer section with system-output framing"
```

---

### Task 8: Rewrite Why Work With Me Section

**Files:**
- Modify: `index.html` — the `<!-- WHY WORK WITH ME -->` section

- [ ] **Step 1: Replace all 4 why-cards**

Replace the section header h2:
```html
        <h2>Why Serious Brands Choose Us</h2>
```
With:
```html
        <h2>Why This Works When Other Agencies Don't</h2>
```

Replace Card 1 (Scalability):
```html
          <h3>Scalability</h3>
          <p>Systems built to scale from $10k/month to $100k/month without breaking. We build for growth from day one.</p>
```
With:
```html
          <h3>System, Not Guesswork</h3>
          <p>Most agencies start running ads on day one based on a 30-minute kickoff call. We start with intelligence. The Gravity Converter Formula maps everything before we spend a dollar. That's why it works.</p>
```

Replace Card 2 (Reliability):
```html
          <h3>Reliability</h3>
          <p>Consistent management, proactive communication, and zero surprises. You'll always know what's happening with your spend.</p>
```
With:
```html
          <h3>AI the Right Way</h3>
          <p>AI is everywhere. Most of it produces generic garbage because there's no system behind it. Ours is powered by real client intelligence. That's why the content sounds like you, not like a robot.</p>
```

Replace Card 3 (ROI-Driven):
```html
          <h3>ROI-Driven</h3>
          <p>We don't optimize for clicks or impressions. Every decision is tied to revenue. Your profit is our performance metric.</p>
```
With:
```html
          <h3>Ads + Content That Compound</h3>
          <p>Your ads and your content aren't separate channels. They're the same conversation powered by the same data. That's how results compound instead of plateauing.</p>
```

Replace Card 4 (Automation):
```html
          <h3>Automation</h3>
          <p>SMS flows, retargeting sequences, and follow-up automations that work around the clock to maximize every dollar spent.</p>
```
With:
```html
          <h3>You Stay Focused on Your Business</h3>
          <p>Marketing is moving fast. AI, content, ads, platforms. Keeping up is a full-time job. You don't have to. That's what we're here for.</p>
```

- [ ] **Step 2: Commit**

```bash
git add index.html
git commit -m "Rewrite Why section with system-powered differentiators"
```

---

### Task 9: Update Apply Form Section

**Files:**
- Modify: `index.html` — the `<!-- APPLY / CONTACT FORM -->` section

- [ ] **Step 1: Replace the tagline pill**

Find:
```html
        <div class="apply-tagline-pill">Let's Build a Customer Acquisition Machine That Runs on Autopilot</div>
```
Replace with:
```html
        <div class="apply-tagline-pill">Let's See if We're the Right Fit to Build Your Growth Engine</div>
```

- [ ] **Step 2: Commit**

```bash
git add index.html
git commit -m "Update apply section tagline"
```

---

### Task 10: Fix Footer Copyright

**Files:**
- Modify: `index.html` — the `<footer>` section

- [ ] **Step 1: Update copyright year**

Find:
```html
      <p class="footer-copy">&copy; 2025 HMFIC. All rights reserved.</p>
```
Replace with:
```html
      <p class="footer-copy">&copy; 2026 HMFIC. All rights reserved.</p>
```

- [ ] **Step 2: Commit**

```bash
git add index.html
git commit -m "Update copyright year to 2026"
```

---

### Task 11: Full Dash Audit

**Files:**
- Modify: `index.html` (entire file)

Scan the entire file for any remaining dashes (en dashes `–`, em dashes `—`, and hyphens used as dashes) in visible copy. Hyphens in compound words (e.g., "full-time") and HTML attributes are fine. The target is dashes used as punctuation in prose.

- [ ] **Step 1: Search for remaining dashes in copy**

Run: `grep -n '[–—]' index.html`

Check each match. Items in HTML attributes, CSS, or JS are fine. Items in visible copy text need to be rewritten.

Known locations to check after all prior edits:
- Success message (line ~400): "24–48 hours" and "5–10 minutes"
- Form field hint (line ~381): "(Be real – the more we understand, the better we can help.)"
- Any testimonial quotes that may contain dashes
- The `alt` attribute on Matt's photo if it still has a dash

- [ ] **Step 2: Fix any remaining dashes in visible copy**

Replace "24–48 hours" with "24 to 48 hours".
Replace "5–10 minutes" with "5 to 10 minutes".
Replace "(Be real – the more we understand, the better we can help.)" with "(Be real. The more we understand, the better we can help.)"
Replace `alt="Matt Holmes — HMFIC"` with `alt="Matt Holmes, HMFIC Marketing"` (already handled in Task 4, verify).

Fix any other dashes found in Step 1.

- [ ] **Step 3: Commit**

```bash
git add index.html
git commit -m "Audit and remove all dashes from visible copy"
```

---

### Task 12: Visual Verification

- [ ] **Step 1: Run local dev server**

```bash
cd /Users/hmfic/Code/hmfic-site && npx vercel dev
```

- [ ] **Step 2: Open in browser and verify each section**

Check:
- Hero headline renders correctly with the GCF name
- "See How It Works" scrolls to the services section, not about
- About section reads naturally with the 4-paragraph structure
- Three engine cards display properly without bullet lists
- Testimonials header updated
- Offer checklist has 7 items (down from 8)
- Why cards show new titles and copy
- Apply tagline updated
- Footer shows 2026
- Nav has both "How It Works" and "Apply Now"

- [ ] **Step 3: Stop dev server and commit any fixes**
