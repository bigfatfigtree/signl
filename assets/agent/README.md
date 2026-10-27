# Sig · SIGNL homepage guide agent

A guided showcase agent for the joinsignl.com homepage: a "Meet Sig" section
(placed after the hero overlap cards, before "The Problem, Solved") plus a
floating "Ask Sig" button that opens the same conversation in a bottom sheet
on mobile / card on desktop. One panel, reparented between the two homes, so
the conversation is never duplicated or lost.

## Rename in one word

The name lives in ONE place: `window.SIG_CONFIG` at the top of
`sig-agent.js` (`name: "Sig"`, plus `role` and all outbound links). On load
the script stamps the config name into every `[data-sig-name]` /
`[data-sig-initial]` slot in the page (section headline, FAB, sheet header,
panel). To rename: change `name` in SIG_CONFIG. The literal "Sig" text in
index.html is only the no-JS / pre-load fallback and is overwritten on init.

## Design choice (locked for v1)

GUIDED, not open chat. Scripted flows + tappable chips; free-text input
resolves by keyword against the same locked answer set, with a graceful
"here's what I can show you" fallback to the two doors. An open LLM mouth on
the public homepage could misspeak on price or rights; this cannot.

## Flow maps

Business door (5 steps, each with an embedded app-pattern card):
0. Discover ranked by local reach → sample ranking card (labeled Preview)
1. A creator profile → sample creator card (Jordan Ellis, labeled Preview)
2. The two-tap invite → offer dock card (post + story, tracked code)
3. Visit tracked to the post → tracking card (Visit Guarantee)
4. Founding plans card ($199/$349/$699, first-month $99/$249/$599)
   → CTAs: businesses.html#apply, pricing.html

Creator door (5 steps):
0. Claiming, in three steps (claim → tier → finish profile)
1. What you get (comped OR paid at your rate, keep 97%)
2. The two lanes card (comped = 1 post + 1 story sharing it; paid = your
   rate + one 90-day license included)
3. Momentum card (+20 on-time post, +25 license approval, +10 approval,
   +3 invite joins; 48h standard, 1 week deadline)
4. Founding enrollment + Nashville priority → CTAs: app claim link
   (app.joinsignl.com/?src=home-sig), cities.html

Question chips / free-text answers: cost, rights and ads, comp deliverable,
deadline, no-show, cities (37 founding markets), local reach, size to join,
Momentum, who runs it. All drawn from the ANSWERS set in sig-agent.js only.

## Answer-set canon source

Locked product facts, Jeff 2026-10-26 pricing + rights lock, matching the
homepage FAQ and pricing page: founding rates $199/$349/$699 with the $100
first-month founding credit, 3-month minimum, unused visits roll into the
next month then expire; comped visits are native share only; paid bookings
include one standard 90-day license (repost + paid ad); licensing a comped
post is at the creator's listed fee, creator keeps 97%; comp visit = 1 post
+ 1 story that shares the post; 48h standard / 1-week hard deadline; Visit
Guarantee = visit replaced, credits not cash; tiers Neighbors 500-2k,
Locals 2k-15k, Headliners 15k+ by stacked audience; paid rate floor $50;
37 founding markets; Nashville is the priority market; claims matching
outreach records are decided automatically (stated plainly, no AI-vetting
claims). No competitor names. No em dashes. SIGNL is "built and rolling
out," never "building." Sample data is labeled Preview wherever it appears.

## Files

- `sig-agent.js` — config, answer set, flows, panel/sheet engine (no deps)
- `sig-agent.css` — all classes `.sigx-` prefixed; uses site tokens with
  fallbacks; reduced-motion respected
- `mount-snippet.html` — the three index.html insertions, human-readable
- `index-mount.patch` — the exact index.html diff as integrated (the same
  commit also carries Jeff's locked 2026-10-27 headline: H1 "Local
  businesses book local creators.", grad on "book", and the locked subhead)

## Mount (3 insertions, nothing else)

1. `<head>`: stylesheet link after styles-v2.css.
2. After the `.hs-overlap` block: the `#meet-sig` section with the
   `[data-sig-panel]` mount point and a no-JS fallback (the fallback is
   removed by JS once the live panel mounts).
3. Before `</body>`: FAB, sheet shell, and the deferred script tag.

The agent is inert on any page without `[data-sig-panel]`.
