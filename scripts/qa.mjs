// Framing check, part 1: renders every Nth frame of a range small, in "qa" mode, and records what the world's own
// measurements say is wrong with each one (characters cut off by the frame edge or too close to the lens, key props
// out of shot or hidden behind something; see FWorld.qa).
// usage: node scripts/qa.mjs <composition> <first> <last> <step> <scale> <outDir>
import { bundle } from "@remotion/bundler";
import { renderFrames, selectComposition } from "@remotion/renderer";
import fs from "node:fs";
import path from "node:path";
const [comp, first, last, step, scale, out] = process.argv.slice(2);
const PAD = 2, A = Number(first), B = Number(last), N = Number(step);
fs.mkdirSync(out, { recursive: true });
const serveUrl = await bundle({ entryPoint: path.resolve("src/index.ts") });
const inputProps = { qa: true };
const composition = await selectComposition({ serveUrl, id: `${comp}Padded`, inputProps, chromiumOptions: { gl: "swangle" } });
// padded frame p shows real frame p - PAD. The first frame a fresh tab draws is blank under software GL, so start one
// step early and throw that one away.
const p0 = Math.max(0, A + PAD - N), p1 = Math.min(B + PAD, composition.durationInFrames - 1);
const issues = {}, tmp = path.join(out, "tmp");
const t0 = Date.now();
await renderFrames({
  composition, serveUrl, inputProps, outputDir: tmp, imageFormat: "jpeg", jpegQuality: 80, scale: Number(scale), concurrency: 1,
  frameRange: [p0, p1], everyNthFrame: N, chromiumOptions: { gl: "swangle" }, timeoutInMilliseconds: 300000,
  onBrowserLog: (l) => {
    const m = /^QA\|(\d+)\|(\d+)\|(.*)$/.exec(l.text);
    if (m) { issues[m[1]] = { shot: Number(m[2]), problems: JSON.parse(m[3]) }; return; }
    if (l.type === "error" && !/404|THREE\.Clock/.test(l.text)) console.log("[browser]", l.text.slice(0, 300));
  },
  onStart: () => {}, onFrameUpdate: () => {},
});
const files = fs.readdirSync(tmp).sort();
// renderFrames names files by padded frame number
for (const fl of files) {
  const pf = Number(/(\d+)\.jpe?g$/.exec(fl)[1]), f = pf - PAD;
  if (pf === p0 && A + PAD - N >= 0 || f < A || f > B) { fs.rmSync(path.join(tmp, fl)); continue; }
  const shot = issues[f]?.shot ?? 0;
  fs.renameSync(path.join(tmp, fl), path.join(out, `f${String(f).padStart(4, "0")}_s${String(shot).padStart(2, "0")}.jpg`));
}
fs.rmSync(tmp, { recursive: true, force: true });
fs.writeFileSync(path.join(out, `qa_${A}.json`), JSON.stringify(issues));
console.log(`checked ${Object.keys(issues).length} frames in ${((Date.now() - t0) / 1000).toFixed(0)} s`);
