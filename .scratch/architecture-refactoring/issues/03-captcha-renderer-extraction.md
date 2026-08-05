# 03 — Captcha renderer extraction

**What to build:** Extract 200+ lines of SVG rendering from the Captcha transport handler into a pure function `renderCaptcha(code: string) → string`.

**Blocked by:** None — can start immediately.

**Status:** ready-for-agent

- [ ] Create `features/captcha/renderer.ts` with `renderCaptcha(code: string): string`
- [ ] Move SVG rendering logic (wavy lines, noise dots, blobs, characters) from `get-captcha.server.tsx` to renderer
- [ ] Make renderer deterministic (same code → same SVG, no Math.random)
- [ ] Refactor transport handler to ~30 lines: generate → sign → set cookie → render
- [ ] Add tests: `renderCaptcha` returns valid SVG
- [ ] Add tests: `renderCaptcha` is deterministic (same input → same output)
- [ ] Add tests: SVG contains the provided code characters
- [ ] Verify captcha still works end-to-end
