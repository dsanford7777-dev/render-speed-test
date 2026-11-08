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
// optional "redo": [chunk indices] + "reuse_run": <run id> re-renders only those chunks and takes the rest from an
// earlier render run (same composition, same frame count and chunk count, so the chunk boundaries line up)
const redo = Array.isArray(cfg.redo) && cfg.reuse_run ? new Set(cfg.redo.map(Number)) : null;
const todo = redo ? chunks.filter((c) => redo.has(c.i)) : chunks;
if (redo && !todo.length) throw new Error("redo lists no valid chunk index");
const out = process.env.GITHUB_OUTPUT;
const lines = [`composition=${cfg.composition}`, `total=${total}`, `matrix=${JSON.stringify({ include: todo })}`, `reuse=${redo ? cfg.reuse_run : ""}`];
if (out) fs.appendFileSync(out, lines.join("\n") + "\n");
console.log(lines.join("\n"));
