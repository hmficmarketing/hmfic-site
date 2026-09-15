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

## CAPI tracking for /stack leads — CODE SHIPPED (PR #2, 2026-06-15)
Server-side Meta Conversions API **Lead** now fires from `api/stack-optin.js` (`fireCapiLead`, called from `deliverOptin` after a successful `addToKit`). Browser + server share one `event_id` (generated client-side, sent in the POST body + used in `fbq('track','Lead',{eventID})`) so Meta dedupes them. Email hashed SHA-256; `_fbp`/`_fbc` + page URL + client IP/UA forwarded for match quality. Best-effort: never blocks signup, no-ops until env vars set.

**LIVE + VERIFIED 2026-06-18.** Pixel confirmed `318856247215986` = "HMFIC Marketing's Pixel" (business HMFIC Marketing) via `meta ads dataset get`. Env vars `STACK_META_PIXEL_ID` + `STACK_META_CAPI_ACCESS_TOKEN` set in Vercel Production (token piped from clipboard via `pbpaste | vercel env add`, never in chat/repo). Redeployed to hmficmarketing.com. Real opt-in test fired `POST /api/stack-optin 200` with runtime log `CAPI Lead events_received: 1` — server-side Lead confirmed received by Meta.
- [x] Meta CAPI token generated from HMFIC Marketing's Pixel.
- [x] Vercel Production env vars set + redeployed.
- [x] Verified `events_received: 1` in Vercel runtime logs.

Convention note: client-namespaced env vars (`STACK_META_*`) per `reference_agency_capi_pattern.md`. No Supabase proxy here — we own the Vercel endpoint, so the Lead fires inline (simpler than the off-platform proxy pattern those clients needed).

## Deferred to v2
- Social-proof line ("X operators downloaded this") once real download numbers exist.
- A/B test of headline/subhead alternates (in `Opt-in Page Copy v1.md` Section 1).
