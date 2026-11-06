#!/usr/bin/env python3
"""SIGNL Learn magazine index generator.

Rebuilds learn/index.html from the article files themselves + articles-meta.json.
Run after adding any article:
    python3 learn/build-index.py
See INTEGRATION.md in this folder for the full daily-article flow.

What it does:
- Scans every learn/*.html article (except index.html) and reads its real
  metadata: H1 headline, datePublished (schema), hero photo + alt, byline label,
  and word count inside <main> (for reading time).
- Merges articles-meta.json (audience, topic, dek, cityGuide, startHere).
  Articles missing from the meta file get inferred audience/topic and a loud
  WARNING in the output — add an explicit entry for them in articles-meta.json.
- Regenerates <main> of index.html (masthead, search + filters, lead story,
  latest rail, start-here picks, topic section fronts, city-guide strip, CTA)
  and the ItemList schema in <head>. Everything outside <main> is preserved
  byte-for-byte, except the index's own <style> block and the ItemList JSON.
"""
import glob, html, json, math, os, re, sys
from datetime import date

HERE = os.path.dirname(os.path.abspath(__file__))
INDEX = os.path.join(HERE, "index.html")
META = os.path.join(HERE, "articles-meta.json")

TOPICS = [
    ("rates-and-pay", "Rates & getting paid",
     "What to charge, what things cost, and how to make sure the money actually lands."),
    ("comped-visits", "Comped visits",
     "The comped lane, explained honestly: what a comp is, how to earn one, and the rules that keep it fair."),
    ("finding-work", "Finding work",
     "Brand deals and bookings for small, local creators, from the first pitch to a regular gig."),
    ("working-with-creators", "Working with creators",
     "For businesses: how to pick creators, brief them well, and handle it when things go sideways."),
    ("local-marketing", "Local marketing",
     "Creator visits as a local marketing habit: reviews, seasons, regulars, and proof it worked."),
    ("the-local-scene", "The local scene",
     "The ideas under SIGNL: local reach, Momentum, the cities where this is taking off, and the words we use."),
]
TOPIC_NAME = {slug: name for slug, name, _ in TOPICS}
START_HERE_ORDER = [
    "what-is-a-comped-creator-visit.html",
    "how-much-should-a-small-creator-charge.html",
    "what-is-local-reach.html",
]
AUD_LABEL = {"creators": "For creators", "businesses": "For businesses", "both": "For creators & businesses"}
GRAD = "linear-gradient(90deg,#006AFC,#019BFC,#03C9AB,#2FE07E)"

KEYWORD_TOPICS = [
    ("rates-and-pay", ["charge", "cost", "price", "rate", "paid", "pay", "taxable", "net-90", "invoice"]),
    ("comped-visits", ["comped", "comp", "free food", "free meal", "disclosure", "ftc"]),
    ("finding-work", ["brand deals", "pitch", "booked", "followers", "start", "campus"]),
    ("working-with-creators", ["brief", "brands look for", "red flags", "never posted", "ugc", "creator night"]),
    ("local-marketing", ["reviews", "roi", "black friday", "seasonal", "regulars", "calendar"]),
    ("the-local-scene", ["cities", "local reach", "momentum", "glossary", "legit"]),
]

def esc(t):
    return html.escape(t or "", quote=True)

def fmt_date(iso, long=False):
    y, m, d = (int(x) for x in iso.split("-"))
    dt = date(y, m, d)
    return dt.strftime("%B %-d, %Y") if long else dt.strftime("%b %-d, %Y")

BLOCK_RE = re.compile(r"<!-- KEEP-READING v1.*?<!-- /KEEP-READING -->\n?", re.S)

def scan(path):
    s = BLOCK_RE.sub("", open(path, encoding="utf-8").read())
    h1 = re.search(r"<h1[^>]*>(.*?)</h1>", s, re.S)
    title = re.sub(r"\s+", " ", re.sub(r"<[^>]+>", "", h1.group(1))).strip() if h1 else ""
    dp = re.search(r'"datePublished":\s*"(\d{4}-\d{2}-\d{2})', s)
    band = re.search(r'class="photo-band[^"]*">\s*<img src="([^"]+)" alt="([^"]*)"', s)
    label = re.search(r"<span class=\"label\">(For (?:creators|businesses)[^<]*)</span>", s)
    main = re.search(r"<main.*?</main>", s, re.S)
    words = 0
    if main:
        text = re.sub(r"<script.*?</script>|<style.*?</style>", " ", main.group(0), flags=re.S)
        words = len(re.sub(r"<[^>]+>", " ", text).split())
    return dict(title=title, date=dp.group(1) if dp else None,
                hero=band.group(1) if band else None, hero_alt=band.group(2) if band else "",
                label=label.group(1) if label else "", read=max(1, round(words / 200)))

def infer(fname, art):
    """Fallback for articles with no meta entry. Prints warnings in main()."""
    text = (art["title"] + " " + fname).lower()
    aud = "both"
    if art["label"].startswith("For creators") and "businesses" not in art["label"]:
        aud = "creators"
    elif art["label"].startswith("For businesses"):
        aud = "businesses"
    topic, best = "the-local-scene", 0
    for slug, kws in KEYWORD_TOPICS:
        score = sum(1 for k in kws if k in text)
        if score > best:
            topic, best = slug, score
    return aud, topic

def main():
    meta = json.load(open(META, encoding="utf-8"))
    arts = []
    warnings = []
    for path in sorted(glob.glob(os.path.join(HERE, "*.html"))):
        f = os.path.basename(path)
        if f == "index.html":
            continue
        a = scan(path)
        a["file"] = f
        m = meta.get(f)
        if m is None:
            aud, topic = infer(f, a)
            a.update(audience=aud, topic=None if f.startswith("find-local-influencers-") else topic,
                     dek="", city=f.startswith("find-local-influencers-"), start=False)
            warnings.append(f"NO META ENTRY for {f}: inferred audience={aud}, topic={a['topic']}. "
                            f"Add an entry to articles-meta.json to make this deliberate.")
        else:
            a.update(audience=m["audience"], topic=m.get("topic"), dek=m.get("dek", ""),
                     city=bool(m.get("cityGuide")), start=bool(m.get("startHere")))
        if not a["date"]:
            warnings.append(f"NO datePublished in {f} — it will sort last. Add schema datePublished.")
            a["date"] = "1970-01-01"
        if not a["hero"]:
            warnings.append(f"NO hero photo band in {f} — card will use the site OG image.")
            a["hero"] = "../assets/og-image.png"; a["hero_alt"] = ""
        arts.append(a)
    arts.sort(key=lambda a: (a["date"], a["file"]), reverse=True)
    mag = [a for a in arts if not a["city"]]
    cities = sorted([a for a in arts if a["city"]], key=lambda a: a["title"])
    lead = mag[0]
    latest = mag[1:12]
    start_here = [next(a for a in mag if a["file"] == f) for f in START_HERE_ORDER if any(a["file"] == f for a in mag)]

    # ---------- read current index: preserve head/tail, CTA, schema names ----------
    cur = open(INDEX, encoding="utf-8").read()
    head, rest = cur.split('<main id="main">', 1)
    _, tail = rest.split('</main>', 1)
    tail = '</main>' + tail
    cta = re.search(r'  <section class="block">\n    <div class="wrap">\n      <div class="cta-panel">.*?\n  </section>', rest, re.S)
    cta_html = cta.group(0) if cta else ""
    ld = re.search(r'<script type="application/ld\+json">(.*?)</script>', head, re.S)
    schema = json.loads(ld.group(1))
    assert json.dumps(schema, separators=(", ", ": "), ensure_ascii=False) == ld.group(1), \
        "ld+json round-trip mismatch — refusing to rewrite schema"
    old_names = {item["url"].rsplit("/", 1)[-1]: item["name"] for item in schema["@graph"][1]["itemListElement"]}
    schema["@graph"][1] = {
        "@type": "ItemList", "name": "SIGNL Learn Guides", "url": "https://joinsignl.com/learn/",
        "numberOfItems": len(arts),
        "itemListElement": [
            {"@type": "ListItem", "position": i + 1,
             "url": f"https://joinsignl.com/learn/{a['file']}",
             "name": old_names.get(a["file"], a["title"])}
            for i, a in enumerate(arts)],
    }
    head = head.replace(ld.group(1), json.dumps(schema, separators=(", ", ": "), ensure_ascii=False), 1)
    head = re.sub(r"<style>.*?</style>", lambda m: "<style>\n" + CSS + "\n</style>", head, count=1, flags=re.S)

    # ---------- render ----------
    def search_text(a):
        bits = [a["title"], a["dek"], TOPIC_NAME.get(a["topic"] or "", ""), AUD_LABEL[a["audience"]],
                a["file"].replace("-", " ").replace(".html", "")]
        return esc(" ".join(bits).lower())

    def meta_line(a):
        return f'{fmt_date(a["date"])} &middot; {a["read"]} min read'

    def kick(a):
        t = TOPIC_NAME.get(a["topic"] or "", "")
        return f'{AUD_LABEL[a["audience"]]}' + (f' &middot; {t}' if t else "")

    def card(a):
        return f'''        <article class="mz-card" data-aud="{a['audience']}" data-topic="{a['topic'] or ''}" data-search="{search_text(a)}">
          <a class="mz-card-link" href="{a['file']}">
            <span class="mz-thumb"><img src="{a['hero']}" alt="{esc(a['hero_alt'])}" loading="lazy"></span>
            <span class="mz-card-body">
              <span class="mz-kick">{kick(a)}</span>
              <h3>{esc(a['title'])}</h3>
              <span class="mz-dek">{esc(a['dek'])}</span>
              <span class="mz-meta">{meta_line(a)}</span>
            </span>
          </a>
        </article>'''

    aud_counts = {k: sum(1 for a in mag if a["audience"] in (k, "both")) for k in ("creators", "businesses")}
    topic_counts = {slug: sum(1 for a in mag if a["topic"] == slug) for slug, _, _ in TOPICS}

    chips = [f'<button type="button" class="mz-chip on" data-topic-filter="all" aria-pressed="true">All topics <span>{len(mag)}</span></button>']
    for slug, name, _ in TOPICS:
        chips.append(f'<button type="button" class="mz-chip" data-topic-filter="{slug}" aria-pressed="false">{name} <span>{topic_counts[slug]}</span></button>')

    latest_rows = "\n".join(
        f'            <li><a href="{a["file"]}"><span class="mz-lt-date">{fmt_date(a["date"])}</span>'
        f'<span class="mz-lt-title">{esc(a["title"])}</span>'
        f'<span class="mz-lt-mins">{a["read"]} min</span></a></li>' for a in latest)

    start_cards = "\n".join(
        f'''            <a class="mz-start-card" href="{a['file']}">
              <img src="{a['hero']}" alt="{esc(a['hero_alt'])}" loading="lazy">
              <span><b>{esc(a['title'])}</b><i>{meta_line(a)}</i></span>
            </a>''' for a in start_here)

    sections = []
    for slug, name, standfirst in TOPICS:
        members = [a for a in mag if a["topic"] == slug]
        cards = "\n".join(card(a) for a in members)
        sections.append(f'''  <section class="mz-sec wrap" data-topic-section="{slug}">
    <div class="mz-sec-head">
      <h2>{name}</h2>
      <p>{standfirst}</p>
      <span class="mz-sec-count">{len(members)} guides</span>
    </div>
    <div class="mz-grid">
{cards}
    </div>
  </section>''')

    city_links = " &middot; ".join(
        f'<a href="{a["file"]}">{esc(a["title"].split(" in ")[-1].replace(" | SIGNL", ""))}</a>' for a in cities)

    main_html = f'''<main id="main">
  <section class="mz-mast wrap">
    <div class="mz-mast-top">
      <span>The field guide to local creator marketing</span>
      <span>{len(arts)} guides &middot; Updated {fmt_date(lead["date"], long=True)}</span>
    </div>
    <h1>SIGNL Learn</h1>
    <p class="mz-mast-sub">Practical guides for local creators and the businesses that book them. No fluff and no jargon: the numbers, the steps and the rules, in plain language.</p>
  </section>

  <div class="mz-controls wrap" id="mzControls">
    <div class="mz-search-row">
      <label class="mz-search">
        <span class="mz-sr">Search guides</span>
        <input type="search" id="mzSearch" placeholder="Search guides&hellip; try &lsquo;comped&rsquo;, &lsquo;rates&rsquo;, &lsquo;reviews&rsquo;" autocomplete="off">
      </label>
      <div class="mz-seg" role="group" aria-label="Audience">
        <button type="button" class="on" data-aud-filter="all" aria-pressed="true">All readers <span>{len(mag)}</span></button>
        <button type="button" data-aud-filter="creators" aria-pressed="false">For creators <span>{aud_counts['creators']}</span></button>
        <button type="button" data-aud-filter="businesses" aria-pressed="false">For businesses <span>{aud_counts['businesses']}</span></button>
      </div>
    </div>
    <div class="mz-chips" role="group" aria-label="Topics">
      {' '.join(chips)}
    </div>
    <div class="mz-status">
      <p class="mz-count" id="mzCount">{len(mag)} guides, newest first</p>
      <button type="button" class="mz-clear" id="mzClear" hidden>Clear search &amp; filters</button>
    </div>
  </div>

  <article class="mz-lead wrap" id="mzLead" data-aud="{lead['audience']}" data-topic="{lead['topic'] or ''}" data-search="{search_text(lead)}">
    <a class="mz-lead-link" href="{lead['file']}">
      <span class="mz-lead-img"><img src="{lead['hero']}" alt="{esc(lead['hero_alt'])}"></span>
      <span class="mz-lead-body">
        <span class="mz-kick mz-kick-lead">The latest &middot; {kick(lead)}</span>
        <h2>{esc(lead['title'])}</h2>
        <span class="mz-lead-dek">{esc(lead['dek'])}</span>
        <span class="mz-meta">{meta_line(lead)}</span>
      </span>
    </a>
  </article>

  <div class="mz-front wrap" id="mzFront">
    <section class="mz-latest">
      <h2 class="mz-front-h">The latest</h2>
      <ol>
{latest_rows}
      </ol>
    </section>
    <aside class="mz-start">
      <h2 class="mz-front-h">Start here</h2>
      <p class="mz-start-note">Editor&rsquo;s picks: the three guides we would hand you first.</p>
{start_cards}
    </aside>
  </div>

{chr(10).join(sections)}

  <div class="mz-empty wrap" id="mzEmpty" hidden>
    <h2>No guides match that&hellip; yet</h2>
    <p>Try a shorter search, or clear the filters to browse everything.</p>
    <button type="button" class="mz-clear mz-clear-big" id="mzClear2">Clear search &amp; filters</button>
  </div>

  <section class="mz-cities wrap" id="mzCities">
    <span class="mz-cities-label">City guides</span>
    <p>How to find local influencers, city by city: {city_links}. Every guide covers where that city&rsquo;s creators actually are, what to offer them, and what it costs.</p>
  </section>

{cta_html}
'''

    out = head + main_html + "\n" + tail
    # inject the filter script just before </body> in tail (idempotent: replace prior block)
    script = "<script>\n" + JS + "\n</script>\n</body>"
    out = re.sub(r"(<script>\n/\* mz-filter \*/.*?</script>\n)?</body>", script, out, count=1, flags=re.S)
    open(INDEX, "w", encoding="utf-8").write(out)
    print(f"index rebuilt: {len(arts)} articles ({len(mag)} magazine + {len(cities)} city guides), "
          f"lead = {lead['file']} ({lead['date']}), sections = {topic_counts}")
    for w in warnings:
        print("WARNING:", w)

CSS = """/* SIGNL Learn magazine index (generated by build-index.py — edit the generator, not this block) */
.mz-sr{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap}
.mz-mast{padding:44px 0 8px;text-align:left}
.mz-mast-top{display:flex;justify-content:space-between;gap:16px;flex-wrap:wrap;border-top:3px solid var(--ink);border-bottom:1px solid var(--ink);padding:10px 2px;font-family:'Space Grotesk',monospace;font-size:.72rem;letter-spacing:.14em;text-transform:uppercase;color:var(--ink2)}
.mz-mast h1{font-size:clamp(3.4rem,9vw,7rem);font-weight:800;line-height:.94;letter-spacing:-.03em;margin:22px 0 10px}
.mz-mast-sub{font-size:1.12rem;color:var(--ink2);max-width:640px}
.mz-controls{margin-top:30px;border-top:1px solid var(--line2);border-bottom:1px solid var(--line2);padding:20px 0 14px}
.mz-search-row{display:flex;gap:14px;flex-wrap:wrap;align-items:stretch}
.mz-search{flex:1 1 320px;display:flex}
.mz-search input{width:100%;font:inherit;font-size:1rem;padding:13px 18px;border:1.5px solid var(--ink);border-radius:999px;background:var(--card);color:var(--ink)}
.mz-search input:focus{outline:3px solid #A9E8C9;outline-offset:1px}
.mz-seg{display:flex;border:1.5px solid var(--ink);border-radius:999px;overflow:hidden}
.mz-seg button{font:inherit;font-weight:700;font-size:.92rem;padding:12px 16px;background:var(--card);color:var(--ink);border:0;cursor:pointer}
.mz-seg button span{opacity:.55;font-weight:600;margin-left:4px}
.mz-seg button.on{background:var(--ink);color:#FAFCFA}
.mz-chips{display:flex;gap:8px;flex-wrap:wrap;margin-top:14px}
.mz-chip{font:inherit;font-weight:600;font-size:.88rem;padding:8px 14px;border-radius:999px;border:1px solid var(--line2);background:var(--bg2);color:var(--ink2);cursor:pointer}
.mz-chip span{opacity:.55;margin-left:3px}
.mz-chip.on{background:GRAD_PLACEHOLDER;color:var(--ink);border-color:transparent;font-weight:800}
.mz-status{display:flex;justify-content:space-between;align-items:center;gap:14px;margin-top:12px;min-height:28px}
.mz-count{font-size:.9rem;color:var(--ink3);margin:0}
.mz-clear{font:inherit;font-weight:700;font-size:.88rem;background:none;border:0;color:#006AFC;cursor:pointer;text-decoration:underline;padding:4px 0}
.mz-clear-big{font-size:1rem}
.mz-lead{margin-top:34px}
.mz-lead-link{display:grid;grid-template-columns:1.25fr 1fr;background:var(--card);border:1px solid var(--line2);border-radius:var(--r-lg);box-shadow:var(--sh-md);overflow:hidden;text-decoration:none;color:inherit;position:relative}
.mz-lead-link::before{content:"";position:absolute;left:0;right:0;top:0;height:5px;background:GRAD_PLACEHOLDER;z-index:2}
.mz-lead-img img{width:100%;height:100%;min-height:300px;object-fit:cover;display:block}
.mz-lead-body{padding:34px 34px 30px;display:flex;flex-direction:column;gap:14px;justify-content:center}
.mz-lead-body h2{font-size:clamp(1.7rem,3vw,2.5rem);line-height:1.08}
.mz-lead-dek{font-size:1.05rem;color:var(--ink2)}
.mz-kick{font-family:'Space Grotesk',monospace;font-size:.72rem;font-weight:700;letter-spacing:.13em;text-transform:uppercase;color:#006AFC}
.mz-meta{font-size:.88rem;color:var(--ink3);font-weight:600}
.mz-front{display:grid;grid-template-columns:1.6fr 1fr;gap:44px;margin-top:52px}
.mz-front-h{font-size:1.35rem;border-bottom:2px solid var(--ink);padding-bottom:10px;margin-bottom:6px}
.mz-latest ol{list-style:none;margin:0;padding:0}
.mz-latest li{border-bottom:1px solid var(--line2)}
.mz-latest a{display:flex;gap:16px;align-items:baseline;padding:11px 2px;text-decoration:none;color:inherit}
.mz-lt-date{font-family:'Space Grotesk',monospace;font-size:.78rem;color:var(--ink3);white-space:nowrap;min-width:86px}
.mz-lt-title{font-weight:700;line-height:1.3;flex:1}
.mz-lt-mins{font-size:.8rem;color:var(--ink3);white-space:nowrap}
.mz-start-note{font-size:.9rem;color:var(--ink3);margin:10px 0 14px}
.mz-start-card{display:flex;gap:14px;align-items:center;background:var(--card);border:1px solid var(--line2);border-radius:18px;padding:10px;margin-bottom:12px;text-decoration:none;color:inherit;box-shadow:var(--sh-md)}
.mz-start-card img{width:86px;height:64px;object-fit:cover;border-radius:10px;flex:none}
.mz-start-card b{display:block;font-size:.95rem;line-height:1.3}
.mz-start-card i{font-style:normal;font-size:.8rem;color:var(--ink3);font-weight:600}
.mz-sec{margin-top:56px}
.mz-sec-head{border-top:3px solid var(--ink);padding-top:16px;display:grid;grid-template-columns:auto 1fr auto;gap:8px 22px;align-items:baseline;margin-bottom:22px}
.mz-sec-head h2{font-size:clamp(1.6rem,3vw,2.2rem)}
.mz-sec-head p{color:var(--ink2);font-size:.98rem;margin:0}
.mz-sec-count{font-family:'Space Grotesk',monospace;font-size:.75rem;letter-spacing:.12em;text-transform:uppercase;color:var(--ink3);white-space:nowrap}
.mz-grid{display:grid;gap:22px}
@media(min-width:700px){.mz-grid{grid-template-columns:1fr 1fr}}
@media(min-width:1080px){.mz-grid{grid-template-columns:repeat(3,1fr)}}
.mz-card{background:var(--card);border:1px solid var(--line2);border-radius:var(--r-lg);box-shadow:var(--sh-md);overflow:hidden}
.mz-card-link{display:flex;flex-direction:column;height:100%;text-decoration:none;color:inherit}
.mz-thumb img{width:100%;aspect-ratio:16/10;object-fit:cover;display:block}
.mz-card-body{padding:20px 22px 22px;display:flex;flex-direction:column;gap:9px;flex:1}
.mz-card-body h3{font-size:1.18rem;line-height:1.25}
.mz-dek{font-size:.94rem;color:var(--ink2);flex:1}
.mz-empty{text-align:center;padding:56px 0 8px}
.mz-empty h2{margin-bottom:8px}
.mz-cities{margin-top:60px;border-top:1px solid var(--line2);padding-top:22px;display:flex;gap:18px;align-items:baseline;flex-wrap:wrap}
.mz-cities-label{font-family:'Space Grotesk',monospace;font-size:.75rem;font-weight:700;letter-spacing:.14em;text-transform:uppercase;color:var(--ink3);white-space:nowrap}
.mz-cities p{color:var(--ink2);font-size:.96rem;margin:0;max-width:820px}
.mz-cities a{font-weight:700}
@media(max-width:900px){.mz-front{grid-template-columns:1fr}.mz-lead-link{grid-template-columns:1fr}.mz-lead-img img{min-height:210px}.mz-sec-head{grid-template-columns:1fr}.mz-sec-count{order:-1}}
"""

JS = """/* mz-filter */ (function(){
var q='', aud='all', topic='all';
var lead=document.getElementById('mzLead');
var cards=[].slice.call(document.querySelectorAll('.mz-card'));
var all=[lead].concat(cards);
var sections=[].slice.call(document.querySelectorAll('[data-topic-section]'));
var front=document.getElementById('mzFront'), cities=document.getElementById('mzCities'),
    empty=document.getElementById('mzEmpty'), count=document.getElementById('mzCount'),
    clearBtns=[document.getElementById('mzClear'), document.getElementById('mzClear2')],
    search=document.getElementById('mzSearch'), total=cards.length;
var leadHref=lead.querySelector('a').getAttribute('href');
function matches(c){
  return (aud==='all'||c.dataset.aud===aud||c.dataset.aud==='both')
      &&(topic==='all'||c.dataset.topic===topic)
      &&(q===''||(c.dataset.search||'').indexOf(q)>-1);
}
function apply(){
  all.forEach(function(c){ c.style.display=matches(c)?'':'none'; });
  var n=0, twinVis=false;
  cards.forEach(function(c){
    if(c.style.display!=='none'){ n++; if(c.querySelector('a').getAttribute('href')===leadHref) twinVis=true; }
  });
  if(lead.style.display!=='none' && !twinVis) n++;
  sections.forEach(function(s){
    var any=[].some.call(s.querySelectorAll('.mz-card'),function(c){return c.style.display!=='none';});
    s.style.display=any?'':'none';
  });
  var filtering=q!==''||aud!=='all'||topic!=='all';
  front.style.display=filtering?'none':''; cities.style.display=filtering?'none':'';
  empty.hidden=n!==0;
  count.textContent=filtering?('Showing '+n+' of '+total+' guides'):''+total+' guides, newest first';
  clearBtns[0].hidden=!filtering;
}
function wire(attr, set){
  [].forEach.call(document.querySelectorAll('['+attr+']'), function(b){
    b.addEventListener('click', function(){
      [].forEach.call(document.querySelectorAll('['+attr+']'), function(x){x.classList.remove('on'); x.setAttribute('aria-pressed','false');});
      b.classList.add('on'); b.setAttribute('aria-pressed','true'); set(b.getAttribute(attr)); apply();
    });
  });
}
wire('data-aud-filter', function(v){aud=v;});
wire('data-topic-filter', function(v){topic=v;});
search.addEventListener('input', function(){q=search.value.trim().toLowerCase(); apply();});
function reset(){
  q=''; aud='all'; topic='all'; search.value='';
  [].forEach.call(document.querySelectorAll('[data-aud-filter],[data-topic-filter]'), function(x){
    var on=x.getAttribute('data-aud-filter')==='all'||x.getAttribute('data-topic-filter')==='all';
    x.classList.toggle('on', on); x.setAttribute('aria-pressed', on?'true':'false');
  });
  apply();
}
clearBtns.forEach(function(b){ if(b) b.addEventListener('click', reset); });
apply();
})();"""

CSS = CSS.replace("GRAD_PLACEHOLDER", GRAD)

if __name__ == "__main__":
    main()
