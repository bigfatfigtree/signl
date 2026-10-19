# SIGNL Design System v2: Light Premium

Concept page: `design-preview/v2-concept.html` with `design-preview/v2.css`.
Direction set by Jeff (2026-10-19): light premium register. Warm off-white base from the
brand #F4F1EA family, ink #141414 text, the locked gradient
(#006AFC -> #019BFC -> #03C9AB -> #2FE07E) as the accent system only.
Premium is the base register (restraint, disciplined spacing, layered soft shadows);
the fun lives in media and motion (video rail, phone fan, staggered cards, reveal),
never in candy colors or visual noise. Borrowed from reference sites: structure and
proof density only, never their styling.

## Tokens

- Surfaces: `--bg #FAF7F1` (page), `--bg2 #F5F0E7` (tinted bands), `--card #FFFFFF`.
- Ink: `--ink #141414`, `--ink2 #4E4B44`, `--ink3 #8B877B`.
- Hairlines: `--line #E7E0D1`, `--line2 #EFE9DB` (warm gray; light themes live on these).
- Accent: `--grad` (the locked gradient) and `--grad-soft` (10% tint for insets).
- Shadows: three layered levels (`--sh-sm/md/lg`), always warm-tinted rgba(26,23,18,...),
  never gray-blue. Light themes live or die on shadow quality; do not flatten these.
- Radii: 28px panels, 22-26px cards, 16-18px insets, 999px chips/buttons.
- Type: Archivo 800 display (tight, -0.02em), Inter body, Space Grotesk for every number.

## Components and where they port

### `.creator-card` -> app discovery card + public profile header
The flagship component. Anatomy, top to bottom:
1. `.cc-photo` face-forward photo (real profile photo; designed monogram panel when a
   creator has none), tier chip overlaid (`.cc-tier`).
2. `.cc-id`: name in Archivo 800, handle in Space Grotesk, market chip (ink) + city chip.
3. `.cc-local`: the hero stat. LOCAL % as a large gradient number, label, and the source
   line ("Self-reported" / "Verified by Instagram"). The source always prints; the product
   never shows this number without it.
4. `.cc-meta`: stacked audience (total across platforms, never one platform's count)
   and Local Impact Score.
5. `.cc-platforms`: one pill per platform in the creator's stack, icon + count.
6. `.cc-track`: track-record slot. Before visits exist it carries founding language
   ("Founding creator · In the first 100 in {market}. Their track record starts with the
   first booked visits."). After visits it carries delivered visits and on-time %.
   Never invent numbers for this slot.
7. `.cc-link`: route to the live profile.
App mapping: discovery list card (compact variant drops `.cc-track`), `/c/` public
profile hero (full variant), partner dashboard roster rows (data only, same fields).

### `.visit-card` (phone UI pattern, `.pu-*`) -> app visit + booking surfaces
The center phone in the fan is the visit-card pattern: profile head (`.pu-head`),
status chip (`.pu-chip`), one hero stat block (`.pu-local`), stacked fact rows
(`.pu-row`), one gradient action (`.pu-btn`). In the app this becomes: the creator's
offer view (You get / You post / They can / They can't rows), the redemption credential
card (code + QR in the hero block), and the business-side booking card in the dashboard.
One action per card, always gradient, always at the bottom.

### `.business-card` -> business profile + dashboard panels
Not shown as a standalone card on the concept page; its language is set by `.move`,
`.price-panel`, and `.stat-band`: white card, 28px radius, `--sh-md`, a 4px gradient
top rule for live/active states, Space Grotesk for every figure. In the app this becomes:
the business public profile card (name, category, market, review links), the dashboard
summary panels (visits used, posts delivered, ROAS block), and the plan card in billing.
Rule: businesses get the same card geometry as creators, with the ink market chip
replaced by plan state. One system, both sides of the marketplace.

### Supporting components
- `.rail-card`: vertical media card (9:13.4), honest label chip (`.rail-chip`) instead of
  engagement counts; ports to the app content library and post-delivery cards.
- `.phone`: CSS device frame for any app-surface showcase; the screen content is always
  a real component (creator-card or visit-card), never a screenshot.
- `.stat-band`, `.move`, `.price-panel`, `.faq-item`, `.thesis-panel`, `.cta-panel`:
  marketing surfaces; the stat band and move cards port directly into the business
  dashboard and the partner dashboard as summary blocks.

## Rules that do not bend
- Gradient is an accent, never a surface fill (except primary buttons and the CTA ink
  panel's ambient glows). LOCAL % is the one number that always wears it.
- Every stat on a card carries its source or its honest state. No estimated social proof,
  no invented view counts, no visit stats before visits exist.
- Real photography and the real logo file only. The logo is never redrawn or recolored;
  on light it sits on `--bg` untouched.
- Motion: IntersectionObserver reveal, staggered by card position, fully disabled under
  `prefers-reduced-motion`. Fun lives here and in the media, not in the chrome.
