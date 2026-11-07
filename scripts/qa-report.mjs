// Framing check, part 2: merges the per-frame measurements into a report of problems that last (a single sampled
// frame mid-glide is allowed), lays the frames out as numbered contact sheets for a by-eye pass, and fails when the
// measurements found anything.  usage: node scripts/qa-report.mjs <dir with qa_*.json + frames> <step>
import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";
const [dir, step] = process.argv.slice(2), N = Number(step), FPS = 30;
const all = {};
for (const f of fs.readdirSync(dir).filter((x) => /^qa_\d+\.json$/.test(x))) Object.assign(all, JSON.parse(fs.readFileSync(path.join(dir, f), "utf8")));
const frames = Object.keys(all).map(Number).sort((a, b) => a - b);
// runs of consecutive samples with the same problem
const runs = [];
const open = new Map();
for (const f of frames) {
  const now = new Set(all[f].problems);
  for (const [k, r] of open) if (!now.has(k)) { runs.push(r); open.delete(k); }
  for (const k of now) { const r = open.get(k); if (r && f - r.b <= N) r.b = f; else { if (r) runs.push(r); open.set(k, { k, a: f, b: f, shot: all[f].shot }); } }
}
runs.push(...open.values());
const ts = (f) => `${Math.floor(f / FPS / 60)}:${String(Math.floor(f / FPS) % 60).padStart(2, "0")}.${String(Math.round(((f / FPS) % 1) * 10) % 10)}`;
const bad = runs.filter((r) => r.b - r.a >= N).sort((x, y) => x.a - y.a);
const lines = [`## Framing check`, `- Frames measured: ${frames.length} (every ${N}th)`, `- Problems: ${bad.length}`, ""];
for (const r of bad) lines.push(`- **${ts(r.a)}–${ts(r.b)}** (shot ${r.shot}, frames ${r.a}-${r.b}): ${r.k}`);
const brief = runs.filter((r) => r.b - r.a < N);
if (brief.length) lines.push("", `<details><summary>${brief.length} one-sample blips (allowed)</summary>`, "", ...brief.map((r) => `- ${ts(r.a)} shot ${r.shot}: ${r.k}`), "</details>");
fs.writeFileSync(path.join(dir, "qa.md"), lines.join("\n") + "\n");
console.log(lines.join("\n"));
// contact sheets: 8 x 3 per sheet, each tile labelled with its frame, shot and time
const imgs = fs.readdirSync(dir).filter((x) => /^f\d{4}_s\d\d\.jpg$/.test(x)).sort();
for (let i = 0, k = 1; i < imgs.length; i += 24, k++) {
  const part = imgs.slice(i, i + 24).map((x) => { const f = Number(x.slice(1, 5)); return `-label "${f}  s${Number(x.slice(7, 9))}  ${ts(f)}" ${path.join(dir, x)}`; }).join(" ");
  execSync(`montage ${part} -tile 8x3 -geometry 180x320+3+3 -pointsize 15 -background "#111" -fill white ${path.join(dir, `sheet_${String(k).padStart(2, "0")}.jpg`)}`);
}
if (bad.length) process.exit(1);
