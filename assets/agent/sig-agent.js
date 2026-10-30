/* ============================================================================
   SIG · SIGNL homepage guide agent (v1, guided flows, no free-form LLM)
   ----------------------------------------------------------------------------
   RENAME THE AGENT: edit SIG_CONFIG.name below. That is the ONLY place the
   name lives; every label, greeting and button reads it from the config.
   THE FACE: SIG_CONFIG.avatar below is the ONLY place the avatar image is
   referenced; every Sig avatar on the page (panel, messages, floating
   button, sheet head) renders from it. Swap that one file to change the face.
   ----------------------------------------------------------------------------
   The agent is a scripted guide. Every answer comes from the locked SIGNL
   playbook baked into ANSWERS / FLOWS in this file. Free text is resolved
   against that same answer set; anything else falls back to the two doors.
   Sample data in cards is the site's own sample persona, labeled as sample.
   ========================================================================== */

window.SIG_CONFIG = {
  name: "Sig",
  role: "SIGNL guide",
  version: 1,
  links: {
    creatorClaim: "https://app.joinsignl.com/?src=home-sig",
    businessApply: "businesses.html#apply",
    pricing: "pricing.html",
    cities: "cities.html"
  },
  samplePhoto: "assets/photos/sample-portrait-jordan.jpg",
  avatar: "assets/sig-v4/head-idle.webp"
};

(function () {
  "use strict";
  var CFG = window.SIG_CONFIG;
  var NAME = CFG.name;
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------------- locked sample data (site's own sample persona) -------- */
  var SAMPLE = {
    name: "Jordan Ellis",
    handle: "@jordaneats757",
    tier: "Locals",
    reach: 58,
    audience: "6,240",
    geo: "Virginia Beach",
    cats: ["Food & Drink", "Brunch"],
    meta: "Comp friendly · Oceanfront · 6,240 audience · Self-reported"
  };

  /* ---------------- the locked answer set -------------------------------- */
  var ANSWERS = {
    costBusiness: "Three founding plans. Self-Service is $199 a month with 5 creator visits. Growth is $349 with 10. Managed is $699 with 20. Founding businesses get $100 off the first month ($99, $249, $599), with a 3-month minimum, and they keep the founding rate while the plan stays active. Paid bookings and licensing are available on every plan.",
    costCreator: "Creators pay nothing to join, and comped visits are always free. The only creator cost anywhere is 3% on a paid booking, so you keep 97% of your rate. That is the whole list.",
    costBoth: "For businesses: founding plans run $199 to $699 a month, with $100 off the first month and a 3-month minimum. For creators: free to join, and the only cost is 3% on a paid booking. Pick a door and I will walk you through your side in full.",
    localReach: "Local reach is the share of a creator's audience that actually lives in the market. A creator with 6,240 followers and 58% local reach puts roughly 3,600 neighbors in front of a business. A national account with a million followers might have 200 people in the same city. SIGNL ranks on the local number.",
    deliverable: "A comped visit is 1 post or reel, plus 1 story that shares the post. 48 hours is the standard the creator is held to, and one week is the hard deadline. A post inside the week counts as delivered.",
    ugc: "Yes, in effect, and the local part is the point. Generic UGC is content from anyone, anywhere, often people who have never visited. On SIGNL, local creators your customers already follow post to their own audiences, right here in your city. Any post can be licensed for your own channels and ads: a paid booking includes one standard license, 90 days of repost and ad use, and a comped post can be licensed at the creator's listed fee, with the creator approving each use and keeping 97%. Until it is licensed, a comped post is native share only.",
    rights: "Rights follow the visit, never the plan. A comped visit is native share only: the business can reshare the post natively with credit, with no ad use. A paid booking includes one standard license: 90 days of repost and paid ad use, agreed inside the booking terms. To license a comped post, the business pays the creator's listed licensing fee, the creator approves each use, and the creator keeps 97%. Nothing is ever perpetual.",
    guarantee: "That is covered by the Visit Guarantee. If a week passes with no post, the visit does not count against the plan and it is replaced. The visit itself is made good, never a cash refund.",
    rollover: "Unused visits roll into the next month, then expire. One month of carry, maximum.",
    cities: "SIGNL is rolling out across 38 founding markets in 8 countries, and founding enrollment is open now. Nashville is the priority market. The Cities page carries the full list.",
    tiers: "You can join from 500 followers. Tiers are set by your stacked audience: Neighbors from 500 to 2,000, Locals from 2,000 to 15,000, and Headliners above 15,000. Businesses rank you on local reach, so a small audience that lives in one city beats a big audience scattered everywhere.",
    momentum: "Momentum is SIGNL's on-time score for creators. Post inside 48 hours and you earn +20 Momentum. It builds badges and priority in business invites, so the creators who deliver on time get booked more.",
    paidHow: "Creators set their own rate, from $50. The business pays the rate plus 3%, the money is held until the post is live, and the creator keeps 97%. A paid booking also includes one standard license: 90 days of repost and ad use.",
    isLive: "SIGNL is built and rolling out now. Founding creator rosters are forming across 38 markets, founding businesses are joining the founding list, and markets activate as their rosters fill, Nashville first. Founding enrollment is open today.",
    contact: "Fastest route is right here: pick your side below and I will take you straight to the page that does the job. If you would rather write to a human, the team reads hello@joinsignl.com.",
    bizSummary: "Short version: browse Discover, where creators are ranked by local reach. Tap a creator, tap Invite, and the offer opens prefilled from their tier. They visit with a code, post within the standard, and the visit is tracked to the post. Take the business door and I will walk each step.",
    creSummary: "Short version: claim your spot, link your handle, finish your profile. From 500 followers you are bookable, ranked on local reach, with two ways to earn: comped experiences, or paid bookings at your own rate where you keep 97%. Take the creator door and I will walk each step."
  };

  /* ---------------- guided flows ------------------------------------------ */
  var FLOWS = {
    business: [
      {
        say: [
          "Here is the whole loop, the way you will run it. Start with finding creators.",
          "In Discover, creators are ranked by local reach: the share of their audience that actually lives in your market. Follower count is not the headline here. Local reach is."
        ],
        card: "rank",
        chips: [
          { label: "Show me a profile", act: "step", step: 1 },
          { label: "Local reach?", act: "answer", key: "localReach" }
        ]
      },
      {
        say: [
          "This is a creator card in Discover.",
          "Jordan Ellis is a Local in Virginia Beach: 6,240 audience, and 58% of it lives right there. On SIGNL, the 58% is the number you book."
        ],
        card: "sample",
        chips: [
          { label: "How do I invite?", act: "step", step: 2 },
          { label: "What gets posted?", act: "answer", key: "deliverable" }
        ]
      },
      {
        say: [
          "Inviting takes two taps. Tap Invite, and the offer opens prefilled from the creator's tier: what is comped, the cap, the window. Check it, then tap Publish offer."
        ],
        card: "offer",
        chips: [
          { label: "Then what happens?", act: "step", step: 3 },
          { label: "Cost for businesses?", act: "answer", key: "costBusiness" }
        ]
      },
      {
        say: [
          "The creator visits with a code, so the visit is verified in store. Then comes the post: 1 post or reel, plus 1 story that shares the post.",
          "48 hours is the standard. One week is the hard deadline. The visit is tracked to the post, and results land on your dashboard at day 7, 14, and 30."
        ],
        card: "track",
        chips: [
          { label: "See the plans", act: "step", step: 4 },
          { label: "Never posts?", act: "answer", key: "guarantee" },
          { label: "Ads and rights?", act: "answer", key: "rights" }
        ]
      },
      {
        say: [
          "Last piece: the money. Founding plans, while founding enrollment is open.",
          "Founding businesses keep their founding rate while the plan stays active. Paid bookings and licensing are available on every plan."
        ],
        card: "plans",
        ctas: [
          { label: "Apply for founding", href: CFG.links.businessApply, primary: true },
          { label: "See full pricing", href: CFG.links.pricing }
        ],
        chips: [
          { label: "Ads and rights?", act: "answer", key: "rights" },
          { label: "I'm a creator", act: "door", door: "creator" },
          { label: "Start over", act: "restart" }
        ]
      }
    ],
    creator: [
      {
        say: ["Welcome in. Claiming your founding spot takes minutes. Three steps:"],
        card: "steps",
        chips: [
          { label: "What do I get?", act: "step", step: 1 },
          { label: "Size to join?", act: "answer", key: "tiers" }
        ]
      },
      {
        say: [
          "Bookings. Businesses browse creators ranked by local reach, not follower count, and invite you directly. They also post open offers you can apply to.",
          "From 500 followers, you are bookable. A small audience that lives in one city beats a big audience scattered everywhere."
        ],
        chips: [
          { label: "Show me the lanes", act: "step", step: 2 },
          { label: "Local reach?", act: "answer", key: "localReach" }
        ]
      },
      {
        say: ["Every booking runs in one of two lanes:"],
        card: "lanes",
        chips: [
          { label: "What is Momentum?", act: "step", step: 3 },
          { label: "Cost for creators?", act: "answer", key: "costCreator" }
        ]
      },
      {
        say: [
          "Momentum is how on-time creators get booked more. Post inside 48 hours and you earn +20 Momentum. It builds badges and priority in invites, so the creators who deliver get found first."
        ],
        card: "momentum",
        chips: [
          { label: "Claim my spot", act: "step", step: 4 },
          { label: "How does pay work?", act: "answer", key: "paidHow" }
        ]
      },
      {
        say: [
          "Founding enrollment is open in 38 markets across 8 countries, and Nashville is the priority market right now.",
          "City not on the list? Claim anyway and add your city. SIGNL opens markets where creators gather."
        ],
        ctas: [
          { label: "Claim your spot", href: CFG.links.creatorClaim, primary: true },
          { label: "See the cities", href: CFG.links.cities }
        ],
        chips: [
          { label: "I'm a business", act: "door", door: "business" },
          { label: "Start over", act: "restart" }
        ]
      }
    ]
  };

  var ROOT_CHIPS = [
    { label: "I'm a business", act: "door", door: "business", primary: true },
    { label: "I'm a creator", act: "door", door: "creator", primary: true },
    { label: "Cost for businesses?", act: "answer", key: "costBusiness" },
    { label: "Which cities?", act: "answer", key: "cities" },
    { label: "Local reach?", act: "answer", key: "localReach" }
  ];

  /* ---------------- card templates ---------------------------------------- */
  function esc(s) {
    return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }
  var CARDS = {
    rank: function () {
      var rows = [
        { pct: 58, meta: "Locals · 6,240 audience" },
        { pct: 41, meta: "Headliners · 41,000 audience" },
        { pct: 23, meta: "Neighbors · 1,800 audience" }
      ];
      var html = '<div class="sigx-card"><div class="sigx-card-k">Sample ranking · Preview</div>';
      rows.forEach(function (r) {
        html += '<div class="sigx-rank-row"><span class="sigx-rank-pct">' + r.pct + '%</span>' +
          '<span class="sigx-rank-bar"><i style="width:' + r.pct + '%"></i></span>' +
          '<span class="sigx-rank-meta">' + r.meta + '</span></div>';
      });
      html += '<p class="sigx-card-note">Ranked by local reach. The biggest audience sits second.</p></div>';
      return html;
    },
    sample: function () {
      return '<div class="sigx-card sigx-sample">' +
        '<div class="sigx-sample-top"><img src="' + CFG.samplePhoto + '" alt="Sample creator photo" loading="lazy">' +
        '<span class="sigx-tier">' + SAMPLE.tier + '</span>' +
        '<span class="sigx-sample-pill">Sample profile · Preview</span></div>' +
        '<div class="sigx-sample-body"><div class="sigx-sample-name">' + SAMPLE.name + '</div>' +
        '<div class="sigx-sample-handle">' + SAMPLE.handle + ' · ' + SAMPLE.geo + '</div>' +
        '<div class="sigx-local"><span class="sigx-local-pct">' + SAMPLE.reach + '%</span><span class="sigx-local-lbl">Local reach</span></div>' +
        '<div class="sigx-chiprow">' + SAMPLE.cats.map(function (c) { return '<span>' + c + '</span>'; }).join("") + '</div>' +
        '<div class="sigx-sample-meta">' + SAMPLE.meta + '</div>' +
        '<div class="sigx-dock"><span class="sigx-dock-pass">Later</span><span class="sigx-dock-go">Invite</span></div>' +
        '</div></div>';
    },
    offer: function () {
      return '<div class="sigx-card sigx-offer"><div class="sigx-card-k light">Offer · Prefilled for a Local</div>' +
        '<div class="sigx-offer-row"><span>Title</span><b>Meal for two</b></div>' +
        '<div class="sigx-offer-row"><span>Comped</span><b>Dinner for two</b></div>' +
        '<div class="sigx-offer-row"><span>Cap</span><b>$100</b></div>' +
        '<div class="sigx-offer-row"><span>Window</span><b>7 days</b></div>' +
        '<div class="sigx-dock"><span class="sigx-dock-pass">Later</span><span class="sigx-dock-go">Publish offer</span></div></div>';
    },
    track: function () {
      var rows = [
        ["Invited", "Offer accepted by the creator"],
        ["Visited", "Code redeemed in store"],
        ["Posted", "31 hours, inside the standard"],
        ["Tracked", "Results at day 7, 14, and 30"]
      ];
      var html = '<div class="sigx-card"><div class="sigx-card-k">One visit, tracked</div>';
      rows.forEach(function (r) {
        html += '<div class="sigx-track-row"><span class="sigx-track-dot"></span><b>' + r[0] + '</b><span>' + r[1] + '</span></div>';
      });
      return html + '</div>';
    },
    plans: function () {
      var rows = [
        { n: "Self-Service", p: "$199", v: "5 creator visits / mo", b: "First month $99", feat: false },
        { n: "Growth", p: "$349", v: "10 creator visits / mo", b: "First month $249", feat: true },
        { n: "Managed", p: "$699", v: "20 creator visits / mo", b: "First month $599", feat: false }
      ];
      var html = '<div class="sigx-card"><div class="sigx-card-k">Founding plans</div>';
      rows.forEach(function (r) {
        html += '<div class="sigx-plan-row' + (r.feat ? " feat" : "") + '"><div><div class="sigx-plan-name">' + r.n + '</div>' +
          '<div class="sigx-plan-visits">' + r.v + '</div></div>' +
          '<div class="sigx-plan-right"><span class="sigx-plan-price">' + r.p + '<small>/mo</small></span>' +
          '<span class="sigx-plan-badge">' + r.b + '</span></div></div>';
      });
      html += '<p class="sigx-card-note">$100 founding credit on month one · 3-month minimum · Unused visits roll into the next month, then expire.</p></div>';
      return html;
    },
    steps: function () {
      var rows = [
        ["Link your handle", "Add your city and link your Instagram or TikTok. Your profile links straight to your real page, so the link is required."],
        ["Get your tier", "Set by your stacked audience: Neighbors 500 to 2,000, Locals 2,000 to 15,000, Headliners above 15,000."],
        ["Finish your profile", "Your categories, your local reach, and your paid rate, from $50. A finished profile is what businesses can invite."]
      ];
      var html = '<div class="sigx-card"><div class="sigx-card-k">Claiming, in three steps</div>';
      rows.forEach(function (r, i) {
        html += '<div class="sigx-step-row"><span class="sigx-step-n">' + (i + 1) + '</span><div><b>' + r[0] + '</b><p>' + r[1] + '</p></div></div>';
      });
      return html + '</div>';
    },
    lanes: function () {
      return '<div class="sigx-card">' +
        '<div class="sigx-lane-row"><span class="sigx-lane-chip comp">Comped</span><p>A business comps a meal, service, or experience. You post 1 post or reel plus 1 story that shares it. Joining and comped visits are always free.</p></div>' +
        '<div class="sigx-lane-row"><span class="sigx-lane-chip paid">Paid</span><p>You set your own rate, from $50, and keep 97%. The business pays your rate plus 3%, held until your post is live. A paid booking includes one standard license: 90 days of repost and ad use.</p></div>' +
        '<p class="sigx-card-note">Licensing a comped post instead? The business pays your listed licensing fee, you approve each use, and you keep 97%.</p></div>';
    },
    momentum: function () {
      return '<div class="sigx-card sigx-momentum"><span class="sigx-momentum-big">+20</span>' +
        '<div><b>Momentum for a post inside 48 hours</b><p>Badges and priority in invites. On-time creators get booked more.</p></div></div>';
    }
  };

  /* ---------------- free-text resolver (same locked set) ------------------ */
  function resolveText(raw) {
    var q = " " + raw.toLowerCase() + " ";
    function has() {
      for (var i = 0; i < arguments.length; i++) if (q.indexOf(arguments[i]) > -1) return true;
      return false;
    }
    if (has("never post", "no post", "not post", "doesn't post", "doesnt post", "won't post", "no-show", "no show", "ghost")) return "guarantee";
    if (has("roll", "unused", "expire", "carry over")) return "rollover";
    if (has("ugc", "user-generated", "user generated")) return "ugc";
    if (has("license", "licence", "licensing", " ad ", "ads", "advertis", "rights", "repost", "reuse", "re-use")) return "rights";
    if (has("momentum")) return "momentum";
    if (has("local reach")) return "localReach";
    if (has("cities", "city", "market", "nashville", "where")) return "cities";
    if (has("tier", "follower", "how big", "audience size", "to join")) return "tiers";
    if (has("story", "deliver", "what do i post", "what gets posted", "have to post", "comped", "comp visit", "free visit", "free meal")) return "deliverable";
    if (has("cost", "price", "pricing", "plan", "how much", "fee", "expensive")) {
      if (has("business")) return "costBusiness";
      if (has("creator")) return "costCreator";
      if (state.door === "creator") return "costCreator";
      if (state.door === "business") return "costBusiness";
      return "costBoth";
    }
    if (has("rate", "paid", " pay ", "97", "earn", "money")) return "paidHow";
    if (has("free")) return "costCreator";
    if (has("live", "launch", "open now", "is it real", "when")) return "isLive";
    /* signup, invite and contact intents are handled by routeText BEFORE
       this resolver runs: a doable job must land on its flow and its link,
       never on a summary line or an email address. */
    return null;
  }

  /* ---------------- intent router (typed questions) ---------------------- */
  /* Checked before the keyword resolver. Every route ends in a guided step
     or an answer WITH its action links; the email address exists only as a
     secondary line inside the contact answer. */
  var CTA_BIZ = [{ label: "Apply for founding", href: CFG.links.businessApply, primary: true }];
  var CTA_CRE = [{ label: "Claim your spot", href: CFG.links.creatorClaim, primary: true }];
  var CTA_BOTH = [
    { label: "Apply for founding", href: CFG.links.businessApply, primary: true },
    { label: "Claim your spot", href: CFG.links.creatorClaim }
  ];
  /* action links (and cards) attached to plain answers, whichever path
     reaches them: typed question, chip, or flow detour */
  var ANSWER_ACTIONS = {
    costBusiness: { card: "plans", ctas: CTA_BIZ.concat([{ label: "See full pricing", href: CFG.links.pricing }]) },
    costCreator: { ctas: CTA_CRE },
    costBoth: { ctas: CTA_BOTH },
    localReach: { ctas: CTA_BOTH },
    deliverable: { ctas: CTA_BOTH },
    ugc: { ctas: CTA_BIZ.concat([{ label: "See how it works", href: "businesses.html#ugc" }]) },
    rights: { ctas: CTA_BOTH },
    guarantee: { ctas: CTA_BIZ },
    rollover: { ctas: CTA_BIZ },
    cities: { ctas: [{ label: "See the cities", href: CFG.links.cities, primary: true }].concat(CTA_CRE) },
    tiers: { ctas: CTA_CRE },
    momentum: { card: "momentum", ctas: CTA_CRE },
    paidHow: { ctas: CTA_CRE },
    isLive: { ctas: CTA_BOTH },
    bizSummary: { ctas: CTA_BIZ },
    creSummary: { ctas: CTA_CRE },
    contact: { chips: "fallback" }
  };
  var FALLBACK_CHIPS = [
    { label: "I'm a business", act: "door", door: "business", primary: true },
    { label: "I'm a creator", act: "door", door: "creator", primary: true },
    { label: "Sign up as a creator", act: "route", route: { kind: "creatorSignup" } },
    { label: "What does it cost?", act: "answer", key: "costBoth" },
    { label: "How do creators get paid?", act: "answer", key: "paidHow" }
  ];

  function anyIn(q, list) {
    for (var i = 0; i < list.length; i++) if (q.indexOf(list[i]) > -1) return true;
    return false;
  }
  function routeText(raw) {
    var q = " " + raw.toLowerCase().replace(/['\u2019]/g, "") + " ";
    var signupVerb = anyIn(q, ["sign up", "signup", "sign-up", "join", "register", "claim",
      "get started", "become a", "sign me up", "enroll", "how do i start", "how to start"]);
    var creatorSide = anyIn(q, ["creator", "influencer"]);
    var bizWord = anyIn(q, ["business", "restaurant", "cafe", "coffee shop", "salon", "barber",
      "gym", "boutique", "store", "shop", "brewery", "food truck", "company"]);
    var bizIdentity = anyIn(q, ["i own", "i run a ", "i run my", "im a business", "i am a business",
      "business owner", "restaurant owner", "for my business"]);
    var creatorSelf = anyIn(q, ["im a creator", "i am a creator"]);

    /* 1 · creator signup: Jeff's failing query ("help me sign up as a
       creator") and every variant land here, never on the contact line */
    if ((creatorSide && signupVerb) || creatorSelf ||
        anyIn(q, ["claim my profile", "claim my spot", "claim your spot"])) {
      return { kind: "creatorSignup" };
    }
    /* 1.5 · UGC: businesses ask in the buzzword; answer it precisely,
       with the Apply door attached, never a dead end or an email line */
    if (anyIn(q, ["ugc", "user generated", "user-generated"])) {
      return { kind: "answer", key: "ugc" };
    }
    /* 2 · business signup: explicit join language, or a plain statement of
       who they are ("I own a restaurant in Nashville") */
    if ((bizWord && signupVerb) || bizIdentity) return { kind: "businessSignup" };
    /* 3 · signup with no side named: ask, with both doors as one tap */
    if (signupVerb || anyIn(q, ["sign me up", "get started", "how do i join", "how to join"])) {
      return { kind: "whichSide" };
    }
    /* 4 · the two-tap invite: land on the invite step itself */
    if (q.indexOf("invite") > -1 &&
        anyIn(q, ["how", "creator", "two tap", "two-tap", "work", "send", "book"])) {
      return { kind: "invite" };
    }
    /* 5 · genuine contact asks only; the answer leads with the doors and
       keeps the email as a secondary line */
    if (anyIn(q, ["contact", "email", "e-mail", "human", "real person",
        "talk to someone", "phone number", "reach the team", "support"])) {
      return { kind: "answer", key: "contact" };
    }
    /* 6 · city availability: the cities answer carries its own links */
    if (anyIn(q, ["my city", "my area", "near me", "open in", "nashville open",
        "which cities", "what cities", "cities are", "markets"])) {
      return { kind: "answer", key: "cities" };
    }
    return null;
  }

  /* ---------------- conversation engine ------------------------------------ */
  var state = { door: null, step: -1, started: false };
  var panel, log, chipsBox, form, input;

  function el(tag, cls, html) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (html != null) n.innerHTML = html;
    return n;
  }
  function avatarImg() {
    var img = el("img", "sigx-ava-img");
    img.src = CFG.avatar;
    img.alt = "";
    return img;
  }
  function avatar(cls) {
    var a = el("span", "sigx-ava " + (cls || ""));
    a.appendChild(avatarImg());
    a.setAttribute("aria-hidden", "true");
    return a;
  }
  function scrollLog() {
    requestAnimationFrame(function () { log.scrollTop = log.scrollHeight; });
  }
  /* sayAsync resolves with the bubble element once the message has landed */
  function sayAsync(text) {
    return new Promise(function (resolve) {
      var done = function () {
        var m = el("div", "sigx-msg sigx-agent");
        m.appendChild(avatar());
        var b = el("div", "sigx-bubble");
        b.appendChild(el("p", null, esc(text)));
        m.appendChild(b);
        log.appendChild(m); scrollLog();
        resolve(b);
      };
      if (reduceMotion) { done(); return; }
      var t = el("div", "sigx-msg sigx-agent sigx-typing", "<span></span><span></span><span></span>");
      log.appendChild(t); scrollLog();
      setTimeout(function () { t.remove(); done(); }, 480);
    });
  }
  function sayStep(stepDef) {
    var chain = Promise.resolve(), lastBubble = null;
    stepDef.say.forEach(function (text) {
      chain = chain.then(function () { return sayAsync(text); })
        .then(function (b) { lastBubble = b; });
    });
    return chain.then(function () {
      if (stepDef.card && CARDS[stepDef.card] && lastBubble) {
        var wrap = el("div", "sigx-cardwrap");
        wrap.innerHTML = CARDS[stepDef.card]();
        lastBubble.appendChild(wrap); scrollLog();
      }
      if (stepDef.ctas) renderCtas(stepDef.ctas);
      renderChips(stepDef.chips);
    });
  }
  function renderCtas(ctas) {
    var row = el("div", "sigx-ctas");
    ctas.forEach(function (c) {
      var a = el("a", "sigx-cta" + (c.primary ? " primary" : ""), esc(c.label));
      a.href = c.href;
      row.appendChild(a);
    });
    log.appendChild(row); scrollLog();
  }
  function echoUser(text) {
    var m = el("div", "sigx-msg sigx-user");
    m.appendChild(el("div", "sigx-ububble", esc(text)));
    log.appendChild(m); scrollLog();
  }
  function renderChips(chips) {
    chipsBox.innerHTML = "";
    (chips || []).forEach(function (c) {
      var b = el("button", "sigx-chip" + (c.primary ? " primary" : ""), esc(c.label));
      b.type = "button";
      b.addEventListener("click", function () { onChip(c); });
      chipsBox.appendChild(b);
    });
  }
  function resumeChip() {
    if (state.door && state.step >= 0 && state.step < FLOWS[state.door].length - 1) {
      return { label: "Keep going", act: "step", step: state.step + 1 };
    }
    return null;
  }
  function afterAnswer() {
    var chips = [];
    var r = resumeChip();
    if (r) chips.push(r);
    chips.push({ label: "I'm a business", act: "door", door: "business" });
    chips.push({ label: "I'm a creator", act: "door", door: "creator" });
    chips.push({ label: "Start over", act: "restart" });
    renderChips(chips);
  }
  function showAnswer(key) {
    if (!ANSWERS[key]) return;
    var extras = ANSWER_ACTIONS[key] || {};
    sayAsync(ANSWERS[key]).then(function (bubble) {
      if (extras.card && CARDS[extras.card] && bubble) {
        var wrap = el("div", "sigx-cardwrap");
        wrap.innerHTML = CARDS[extras.card]();
        bubble.appendChild(wrap); scrollLog();
      }
      if (extras.ctas) renderCtas(extras.ctas);
      if (extras.chips === "fallback") renderChips(FALLBACK_CHIPS);
      else if (extras.chips) renderChips(extras.chips);
      else afterAnswer();
    });
  }
  function runRoute(route) {
    if (!route) return;
    if (route.kind === "creatorSignup") {
      state.door = "creator"; state.step = 0;
      sayAsync("Let's get you set up. Claiming is free and takes minutes: link your handle, get your tier, finish your profile. Here is the whole path, and the button takes you straight to step one.")
        .then(function () { return sayStep(FLOWS.creator[0]); })
        .then(function () { renderCtas(CTA_CRE); });
    } else if (route.kind === "businessSignup") {
      state.door = "business";
      sayAsync("Founding enrollment for businesses is open, and applying takes minutes. Founding plans run $199 to $699 a month with $100 off the first month, and you keep the founding rate while the plan stays active. The button takes you straight to the application.")
        .then(function () {
          renderCtas(CTA_BIZ.concat([{ label: "See full pricing", href: CFG.links.pricing }]));
          renderChips([
            { label: "Walk me through it", act: "door", door: "business" },
            { label: "See the plans", act: "answer", key: "costBusiness" },
            { label: "I'm a creator", act: "door", door: "creator" },
            { label: "Start over", act: "restart" }
          ]);
        });
    } else if (route.kind === "whichSide") {
      sayAsync("Signing up is quick on both sides, and the doors are different. Which one are you?")
        .then(function () {
          renderChips([
            { label: "I'm a creator", act: "route", route: { kind: "creatorSignup" }, primary: true },
            { label: "I'm a business", act: "route", route: { kind: "businessSignup" }, primary: true },
            { label: "Start over", act: "restart" }
          ]);
        });
    } else if (route.kind === "invite") {
      sayAsync("Here is the invite itself, the exact two taps:")
        .then(function () { runStep("business", 2); });
    } else if (route.kind === "answer") {
      showAnswer(route.key);
    }
  }
  function runStep(door, idx) {
    state.door = door; state.step = idx;
    sayStep(FLOWS[door][idx]);
  }
  function startDoor(door) {
    runStep(door, 0);
  }
  function restart() {
    log.innerHTML = "";
    state = { door: null, step: -1, started: true };
    greet();
  }
  function greet() {
    sayAsync("Hi, I'm " + NAME + ", the " + CFG.role + ". I can walk you through SIGNL the way it actually works, on either side of the table.")
      .then(function () { return sayAsync("Pick a door, or ask me something."); })
      .then(function () { renderChips(ROOT_CHIPS); });
  }
  function onChip(c) {
    echoUser(c.label);
    if (c.act === "door") { startDoor(c.door); }
    else if (c.act === "route") { runRoute(c.route); }
    else if (c.act === "step") { runStep(state.door || "business", c.step); }
    else if (c.act === "answer") { showAnswer(c.key); }
    else if (c.act === "restart") { setTimeout(restart, reduceMotion ? 30 : 250); }
  }

  /* ---------------- panel build -------------------------------------------- */
  function buildPanel() {
    panel = el("div", "sigx-panel");
    panel.setAttribute("data-sig-panel-el", "");

    var head = el("div", "sigx-phead");
    head.appendChild(avatar("lg"));
    var who = el("div", "sigx-who");
    who.appendChild(el("div", "sigx-name", esc(NAME)));
    who.appendChild(el("div", "sigx-role", esc(CFG.role) + " · Guided tour"));
    head.appendChild(who);
    var restartBtn = el("button", "sigx-restart", "Start over");
    restartBtn.type = "button";
    restartBtn.addEventListener("click", function () { restart(); });
    head.appendChild(restartBtn);
    panel.appendChild(head);

    log = el("div", "sigx-log");
    log.setAttribute("role", "log");
    log.setAttribute("aria-live", "polite");
    log.setAttribute("aria-label", "Conversation with " + NAME);
    panel.appendChild(log);

    chipsBox = el("div", "sigx-chips");
    panel.appendChild(chipsBox);

    form = el("form", "sigx-form");
    input = el("input", "sigx-input");
    input.type = "text";
    input.placeholder = "Ask " + NAME + " anything…";
    input.setAttribute("aria-label", "Ask " + NAME + " a question");
    input.autocomplete = "off";
    var send = el("button", "sigx-send", "Send");
    send.type = "submit";
    form.appendChild(input); form.appendChild(send);
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var q = input.value.trim();
      if (!q) return;
      input.value = "";
      echoUser(q);
      var route = routeText(q);
      if (route) { runRoute(route); return; }
      var key = resolveText(q);
      if (key) { showAnswer(key); }
      else {
        /* never a dead end: the two doors plus the three commonest jobs */
        sayAsync("I want to point you at the right thing, not a dead end. Pick a side, or tap one of the common jobs:")
          .then(function () { renderChips(FALLBACK_CHIPS); });
      }
    });
    panel.appendChild(form);

    panel.appendChild(el("p", "sigx-fine", "Guided tour · Answers come straight from the SIGNL playbook · Sample profile shown is a preview"));
    return panel;
  }

  /* ---------------- sheet (floating entry) ---------------------------------- */
  var homeSlot = null, sheet = null, sheetSlot = null, lastFocus = null;
  function openSheet() {
    if (!sheet) return;
    lastFocus = document.activeElement;
    sheetSlot.appendChild(panel);
    sheet.hidden = false;
    scrollLog(); /* the sheet log is taller: snap to the latest message */
    document.body.classList.add("sigx-locked");
    var closeBtn = sheet.querySelector(".sigx-close");
    if (closeBtn) closeBtn.focus();
    if (!state.started) { state.started = true; greet(); }
  }
  function closeSheet() {
    if (!sheet) return;
    sheet.hidden = true;
    document.body.classList.remove("sigx-locked");
    if (homeSlot) { homeSlot.appendChild(panel); scrollLog(); }
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }

  function init() {
    homeSlot = document.querySelector("[data-sig-panel]");
    if (!homeSlot) return;
    /* the name lives in SIG_CONFIG only: stamp it into every static slot */
    document.querySelectorAll("[data-sig-name]").forEach(function (n) { n.textContent = NAME; });
    document.querySelectorAll("[data-sig-initial]").forEach(function (n) { n.innerHTML = ""; n.appendChild(avatarImg()); });
    buildPanel();
    homeSlot.innerHTML = ""; /* drop the no-JS fallback now that the live panel exists */
    homeSlot.appendChild(panel);

    /* greet when the section first comes into view (or immediately if seen) */
    if ("IntersectionObserver" in window) {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          if (en.isIntersecting && !state.started) { state.started = true; greet(); io.disconnect(); }
        });
      }, { threshold: 0.25 });
      io.observe(homeSlot);
    } else { state.started = true; greet(); }

    /* floating button + sheet */
    var fab = document.querySelector("[data-sig-fab]");
    sheet = document.querySelector("[data-sig-sheet]");
    if (fab && sheet) {
      sheetSlot = sheet.querySelector("[data-sig-sheet-slot]");
      fab.addEventListener("click", openSheet);
      sheet.querySelector(".sigx-close").addEventListener("click", closeSheet);
      sheet.querySelector(".sigx-backdrop").addEventListener("click", closeSheet);
      document.addEventListener("keydown", function (e) {
        if (e.key === "Escape" && sheet && !sheet.hidden) closeSheet();
      });
    }

    /* any [data-sig-open] trigger (e.g. the section's own button) opens the sheet */
    document.querySelectorAll("[data-sig-open]").forEach(function (n) {
      n.addEventListener("click", function (e) { e.preventDefault(); openSheet(); });
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else { init(); }
})();
