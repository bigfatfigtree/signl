# Locally Famous — MVP marketing / platform site

Standalone static site (plain HTML/CSS/JS, no build step) for **Locally Famous**, a local creator platform launching first in Hampton Roads, VA. Businesses subscribe; local creators and everyday people visit, get comped a meal/service, and post about it within 48 hours (tracked).

## Structure

```
locallyfamous-site/
├── index.html       Landing: hero ("Get talked about by the people Hampton Roads actually follows"), dual CTAs, how-it-works (3 steps), creator tiers, pricing summary, market proof strip, launch note
├── roster.html      "The Local Bench": the 14 verified Hampton Roads creators (source: ~/workspace/creator-count/hampton-roads-creator-roster-check.md, follower counts verified Oct 2026). Framed honestly as a verified bench — NOT signed-up members; founding roster invitations open at launch
├── creators.html    For creators/everyday people: how it works, comp rules (comp = free meal/service, 48-hour post rule, FTC disclosure required, no-shows lose roster spot), 3 tiers (Neighbors 500–2k / Locals 2k–15k / Creators 15k+), application form
├── businesses.html  Full pricing (Roster $349/mo self-service, Hand-Holder $849/mo managed, 6-month minimums; add-ons: extra collabs $25–49, paid hero campaigns at 20% platform fee, Grand Opening Burst $1,500), category exclusivity, honest FAQ, founding-business application form
├── dashboard.html   SAMPLE business dashboard (clearly labeled "Sample data"): stat cards, CSS bar chart, recent-posts list using roster handles as illustrative sample activity
├── styles.css       Shared styles. Brand: cream #FFF9F1, ink #16130E, vivid orange #FF5A1F, deep green #0E5941; Anton (display) + Inter (body) via Google Fonts; inline SVG icons only; avatars are initials in colored circles (no photos)
├── app.js           Mobile nav toggle + demo form handling (saves submissions to localStorage, shows success state)
└── README.md        This file
```

## Preview locally

```bash
cd ~/workspace/locallyfamous-site
python3 -m http.server 8000
# open http://localhost:8000
```

## Brand-string locations (rename checklist)

The brand name "Locally Famous" is deliberately kept in as few places as practical. To rename, search-and-replace `Locally Famous` (and the lowercase variants below) in these spots:

- **Every page (`index.html`, `roster.html`, `creators.html`, `businesses.html`, `dashboard.html`):**
  - `<title>` tag
  - Header logo text (`Locally Famous.`) and footer logo text
  - Footer tagline line ("Local creator marketing for Hampton Roads…") — tagline text itself doesn't contain the name, but sits under the logo
  - Footer copyright line (`© 2026 Locally Famous.`)
  - `index.html` also has it in the `<meta name="description">`; other pages' meta descriptions vary (check each `<head>`)
- **`README.md`:** title and intro paragraph.
- **`app.js`:** no brand string in copy, but the localStorage key prefix is `lf_` and form keys are `lf_creator_applications` / `lf_business_applications` (`data-lf-form` attributes in `creators.html` / `businesses.html`) — rename the prefix if desired.
- **`styles.css`:** only the top comment mentions the name.
- Tagline "Real locals. Real posts. Real walk-ins." appears in `index.html` (hero), `creators.html` indirectly, and every page footer — change there if the tagline goes with the name.

A quick `grep -rn "Locally Famous" .` in this folder finds every remaining occurrence.

## Backend TODO (not built — MVP is front-end only)

- **Forms are demo-only:** creator and business applications save to the visitor's own `localStorage` and show a success state. Nothing is transmitted. Replace with real endpoints (form backend / API) before launch.
- **Real auth:** business and creator accounts, login-gated dashboards.
- **Payments:** Stripe subscriptions for the $349/$849 tiers (6-month minimum terms), add-on purchases.
- **Platform core:** roster management, offer claiming, visit verification, 48-hour post tracking (social API/manual review), redemption codes, real dashboard data.
- **Deploy:** static hosting on Netlify, same pattern as the owner's other sites (Brackish / Beatwick / Fholio) — publish this folder as-is, no build command.
- **Roster status:** the 14 creators on `roster.html` are verified to exist with the follower counts shown, but are **not members**. Update the page's "bench / invitations open" framing once founding invitations actually go out and creators opt in.

## Content rules baked into the copy (keep them)

- No partner/distribution names anywhere on the site — no signed deals exist to reference.
- Roster page must never claim the listed creators are members until they opt in.
- FAQ guarantees tracked posts/deliverables, never a guaranteed creator headcount.
- Dashboard page must stay labeled "Sample data" until it shows real accounts.
