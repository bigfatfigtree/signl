// Static verification of Sig V4 on the marketing homepage (Jeff,
// 2026-10-28): the real rendered character lives on joinsignl.com's
// Meet Sig section with the app's media model — idle loop over the
// hero still, lazy attachment (no above-the-fold weight), poster
// under reduced motion, head-crop stills at small placements, and
// no reference to the retired drawn avatar anywhere on the page.
// Run: node scripts/verify-sig-homepage.mjs
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const read = (p) => fs.readFileSync(path.join(ROOT, p), "utf8");
const size = (p) => fs.statSync(path.join(ROOT, p)).size;

let passed = 0;
let failed = 0;
function check(name, cond, extra) {
  if (cond) { passed += 1; console.log(`  PASS  ${name}`); }
  else { failed += 1; console.log(`  FAIL  ${name}${extra ? " :: " + extra : ""}`); }
}

const html = read("index.html");
const js = read("assets/agent/sig-agent.js");
const css = read("assets/agent/sig-agent.css");

// --- the assets exist on disk, copied from the app's production set
for (const f of ["idle.webm", "idle.mp4", "hero.webp", "head-idle.webp"]) {
  check(`assets/sig-v4/${f} exists`, fs.existsSync(path.join(ROOT, "assets/sig-v4", f)));
}

// --- loop weight budget: the whole loop set stays under ~600KB
const loopBytes = size("assets/sig-v4/idle.webm") + size("assets/sig-v4/idle.mp4");
check(`idle loop set under 600KB (is ${loopBytes})`, loopBytes < 600 * 1024);

// --- the Meet Sig hero: poster still in markup, video with NO
// sources in markup (they attach lazily), the app's video attrs
const heroBlock = html.slice(html.indexOf('class="sigx-hero"'), html.indexOf('class="sigx-hero"') + 600);
check("hero still is the v4 poster", heroBlock.includes('src="assets/sig-v4/hero.webp"'));
check("hero video present with data-sig-loop", /<video[^>]*data-sig-loop/.test(heroBlock));
check("hero video muted + loop + playsinline", /<video[^>]*muted[^>]*loop[^>]*playsinline/.test(heroBlock));
check("hero video carries no sources in markup", !/<source/.test(heroBlock));
check("hero video poster is the hero still", heroBlock.includes('poster="assets/sig-v4/hero.webp"'));

// --- the lazy loader: attaches both formats near the viewport,
// honors reduced motion (poster stands), hides a failed clip
check("loader attaches the webm source", html.includes("assets/sig-v4/idle.webm"));
check("loader attaches the mp4 source", html.includes("assets/sig-v4/idle.mp4"));
check("loader gates on prefers-reduced-motion", /data-sig-loop[\s\S]{0,4000}prefers-reduced-motion/.test(html));
check("loader uses IntersectionObserver", /data-sig-loop[\s\S]{0,4000}IntersectionObserver/.test(html));

// --- small placements: every Sig face on the page is the head crop
check("SIG_CONFIG.avatar is the v4 head crop", js.includes('avatar: "assets/sig-v4/head-idle.webp"'));
check("no reference to the retired drawn avatar", !html.includes("sig-avatar.webp") && !js.includes("sig-avatar.webp"));
const avaImgs = [...html.matchAll(/sigx-ava-img" src="([^"]+)"/g)].map((m) => m[1]);
check("static avatar slots all use the head crop", avaImgs.length >= 2 && avaImgs.every((s) => s === "assets/sig-v4/head-idle.webp"), avaImgs.join(","));

// --- styles for the hero disc exist, incl. the failed-clip rule
check("sigx-hero styles present", css.includes(".sigx-hero{") && css.includes(".sigx-hero video[hidden]"));

console.log(`\n${passed} passed, ${failed} failed`);
process.exit(failed ? 1 : 0);
