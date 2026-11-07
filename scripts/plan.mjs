// Reads render.json + the composition's frame count, prints the chunk matrix for GitHub Actions.
import fs from "node:fs";
const cfg = JSON.parse(fs.readFileSync("render.json", "utf8"));
const full = Number(process.argv[2]);
if (!Number.isInteger(full) || full <= 0) throw new Error(`bad frame count: ${process.argv[2]}`);
// optional "range": [first, last] renders only part of the video (quick previews / fixes)
const [first, last] = Array.isArray(cfg.range) ? [Math.max(0, cfg.range[0]), Math.min(full - 1, cfg.range[1])] : [0, full - 1];
const total = last - first + 1;
const n = Math.max(1, Math.min(20, cfg.chunks ?? 10));
const per = Math.ceil(total / n);
const chunks = [];
for (let i = 0, a = first; a <= last; i++, a += per) chunks.push({ i, a, b: Math.min(last, a + per - 1) });
const out = process.env.GITHUB_OUTPUT;
const lines = [`composition=${cfg.composition}`, `total=${total}`, `matrix=${JSON.stringify({ include: chunks })}`];
if (out) fs.appendFileSync(out, lines.join("\n") + "\n");
console.log(lines.join("\n"));
