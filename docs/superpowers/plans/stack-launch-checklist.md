# /stack Launch Checklist (do before publishing)

Code is done and tested. These are the human/config gates that remain:

- [ ] **Produce the real PDF** and replace `public/downloads/5-prompts-pack.pdf` (same filename). Prompts drafted in `Vault/HMFIC Marketing/List Build/Prompt-1..5`. Needs handwritten cover + worked examples + Meta AI bonus + compile.
- [ ] **Kit env vars in Vercel:** `KIT_API_KEY` (from Kit account settings) and `KIT_STACK_TAG_ID` (numeric ID of a tag named `stack-pack` — create the tag in Kit first, then read its ID).
- [ ] **Kit form set to single opt-in** so the "instant, lands in your inbox in 60 seconds" copy is true.
- [ ] **Confirm `RESEND_API_KEY` and `TURNSTILE_SECRET_KEY`** are already in the Vercel project (they power `api/submit.js`, so they should be). NOTE: if `TURNSTILE_SECRET_KEY` is missing, the endpoint silently skips spam verification — make sure it is set in production.
- [ ] **Smoke test on the Vercel preview deploy:** submit a real email, confirm (a) the pack email arrives, (b) the subscriber appears in Kit with the `stack-pack` tag, (c) the Meta pixel logs a Lead event in Events Manager for pixel `318856247215986`.
- [ ] **Optional:** add `/stack` to any nav or link it from the carousel bio.

## Deferred to v2 (not in this build)
- Social-proof line ("X operators downloaded this") once real download numbers exist.
- A/B test of headline/subhead alternates (in `Opt-in Page Copy v1.md` Section 1).
