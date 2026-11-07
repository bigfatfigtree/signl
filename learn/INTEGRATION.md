# Magpie Learn — how the index and article rails work (read before adding an article)

The Learn index (`index.html`) is a **generated magazine front page**. Do not
hand-edit its article cards, and do not paste new cards into it. It is rebuilt
from the article files themselves by a script.

## Adding a new article (the daily flow)

1. Create the article HTML in this folder exactly as before. It must keep the
   house pattern the generators read:
   - an `<h1>` headline,
   - `datePublished` in its schema (the index sorts and dates by this — no
     schema date, no correct slot),
   - the hero photo band (`<div class="photo-band ..."><img src="../assets/photos/..." alt="...">`)
     — this photo becomes the article's card image everywhere,
   - **ONE ARTICLE, ONE PHOTO (Jeff's rule, 2026-11-06): every article gets its OWN
     hero photo. Never use a photo that is already another article's hero — check
     the other articles before picking one. `build-index.py` enforces this: if two
     articles share a hero image it fails loudly, names the offenders, and refuses
     to build until each one has a different photo,**
   - the audience label (`<span class="label">For creators · Learn</span>` or
     `For businesses · Learn`).
2. Add ONE entry for it in `articles-meta.json` (audience, topic, and a short
   editorial `dek` — the one-line summary shown on its card). Topics:
   `rates-and-pay`, `comped-visits`, `finding-work`, `working-with-creators`,
   `local-marketing`, `the-local-scene`. City guides
   (`find-local-influencers-<city>.html`) take `"cityGuide": true` instead of a
   topic — they appear only in the index's City guides strip.
   If you skip this step the generator still places the article, by inferring
   audience/topic, and prints a WARNING naming the file — treat that warning
   as a to-do, not a pass.
3. Run, from the repo root:
   - `python3 learn/build-index.py` — rebuilds the magazine index (masthead,
     search + filters, lead story = newest article, latest rail, topic
     sections, ItemList schema) and refreshes the city-guide strip.
   - `python3 learn/build-keep-reading.py` — adds the "Keep reading" rail
     (3 related articles) to the new article and refreshes the rails on all
     existing articles. Content outside the rail block is never touched
     (the script asserts byte-equality per file).
   Both scripts are idempotent: running them twice changes nothing the
   second time.
4. Sitemap + IndexNow steps are unchanged — the article URL set is the same
   as before; only the index page's internals changed.

## Article-page standard (for new articles and any redesign)

Every article page carries: the hero photo band with caption, the audience
label, H1, lede, and the byline line (`By Jeff, Founder, Magpie · <date> ·
Magpie Learn hub`). At the foot, the generated "Keep reading" rail links 3
related articles (same topic first, then same audience, then newest). The
rail lives between `<!-- KEEP-READING v1 -->` and `<!-- /KEEP-READING -->`
markers — never hand-edit inside the markers; re-run the script instead.

## What not to do

- Do not edit `learn/index.html` by hand between the `<main>` markers — the
  next generator run will overwrite it. To change the design, edit
  `learn/build-index.py` (CSS/JS/rendering live there) and re-run it.
- Do not rename article files: the index, the rails, `llms.txt` and external
  links all point at the current URLs.
