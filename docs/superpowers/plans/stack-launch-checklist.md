# /stack Launch Checklist

Page is LIVE on production (hmficmarketing.com/stack). Status of gates:

- [x] **Real PDF** shipped to `public/downloads/5-prompts-pack.pdf` (2026-06-13, 7-page final).
- [x] **Kit env vars in Vercel:** `KIT_API_KEY` + `KIT_STACK_TAG_ID` (= `20323291`) set in Production.
- [x] **Opt-in confirmed:** API adds land subscribers `active` + tagged (no double opt-in to disable). Verified with a test add.
- [x] **`RESEND_API_KEY` and `TURNSTILE_SECRET_KEY`** confirmed present in Production.
- [x] **Deployed wiring smoke-tested:** endpoint live, Turnstile gate enforcing, honeypot works.

## Remaining before driving traffic
- [ ] **Build the Kit welcome automation** — the endpoint now delivers via Kit, not Resend, so the pack ONLY gets sent if this automation exists. Shape: `stack-pack` tag → Email 1 (pack) → wait 1 day → Email Opens condition → No path → Email 2 (FOMO). Copy + click-path in `Vault/HMFIC Marketing/List Build/Welcome Sequence.md`. **Until this is live, opt-ins get tagged but receive no pack email.**
- [ ] **Human happy-path test:** submit a real email on the live page, confirm Email 1 arrives with a working PDF download, and the subscriber is tagged `stack-pack`.
- [ ] **Then** link `/stack` from bio / announce.

## TODO: CAPI tracking for /stack leads
Right now the only Meta signal is the **client-side** pixel `fbq('track','Lead')` (browser-only, lossy: ad blockers, iOS, etc). To track and optimize these leads properly, add a **server-side Meta Conversions API (CAPI) Lead event** from the endpoint.
- Fire it in `api/stack-optin.js` after a successful `addToKit` (a `TODO(CAPI)` marker is already in the code at `deliverOptin`).
- Send `Lead` for pixel `318856247215986` with the subscriber's **hashed email** (sha256), client IP + user agent, and an **`event_id`** that matches a client-side `fbq('track','Lead',{eventID})` so the browser + server events **dedupe**.
- Reuse the **Agency CAPI Pattern** convention (env-prefixed token, one function/handler, audit log). See vault memory `reference_agency_capi_pattern.md` and `feedback_capi_verification_principle.md` (verify via events_received + event name, not just "success").
- Needs: a Meta CAPI access token for the pixel's dataset (`927123400783570` is the older pixel; we're using `318856247215986`), stored as a Vercel env var.

## Deferred to v2
- Social-proof line ("X operators downloaded this") once real download numbers exist.
- A/B test of headline/subhead alternates (in `Opt-in Page Copy v1.md` Section 1).
