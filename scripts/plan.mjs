// Reads render.json + the composition's frame count, prints the chunk matrix for GitHub Actions.
import fs from "node:fs";
const cfg = JSON.parse(fs.readFileSync("render.json", "utf8"));
const total = Number(process.argv[2]);
if (!Number.isInteger(total) || total <= 0) throw new Error(`bad frame count: ${process.argv[2]}`);
const n = Math.max(1, Math.min(20, cfg.chunks ?? 10));
const per = Math.ceil(total / n);
const chunks = [];
for (let i = 0, a = 0; a < total; i++, a += per) chunks.push({ i, a, b: Math.min(total - 1, a + per - 1) });
const out = process.env.GITHUB_OUTPUT;
const lines = [`composition=${cfg.composition}`, `total=${total}`, `matrix=${JSON.stringify({ include: chunks })}`];
if (out) fs.appendFileSync(out, lines.join("\n") + "\n");
console.log(lines.join("\n"));
