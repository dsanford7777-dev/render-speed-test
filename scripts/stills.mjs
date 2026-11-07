// Renders preview stills: node scripts/stills.mjs <composition> <scale> <frame,frame,...> <outDir>
// Uses the "<composition>Padded" twin (see src/Root.tsx): renders padded frames f..f+PAD and keeps the last one, so the
// software-GL blank first frame of each render tab never reaches the preview.
import { bundle } from "@remotion/bundler";
import { renderFrames, selectComposition } from "@remotion/renderer";
import fs from "node:fs";
import path from "node:path";
const [comp, scale, list, out] = process.argv.slice(2);
const PAD = 2;
fs.mkdirSync(out, { recursive: true });
const serveUrl = await bundle({ entryPoint: path.resolve("src/index.ts") });
const composition = await selectComposition({ serveUrl, id: `${comp}Padded`, chromiumOptions: { gl: "swangle" } });
for (const f of list.split(",").map(Number)) {
  const t0 = Date.now(), dir = path.join(out, `tmp_${f}`);
  await renderFrames({
    composition, serveUrl, outputDir: dir, imageFormat: "jpeg", jpegQuality: 88, scale: Number(scale), concurrency: 1,
    frameRange: [f, f + PAD], chromiumOptions: { gl: "swangle" }, timeoutInMilliseconds: 300000,
    onBrowserLog: (l) => { if (l.type === "error") console.log("[browser]", l.text.slice(0, 300)); },
    onStart: () => {}, onFrameUpdate: () => {},
  });
  const files = fs.readdirSync(dir).sort();
  fs.renameSync(path.join(dir, files[files.length - 1]), path.join(out, `f${String(f).padStart(4, "0")}.jpg`));
  fs.rmSync(dir, { recursive: true });
  console.log("still", f, ((Date.now() - t0) / 1000).toFixed(1) + "s");
}
