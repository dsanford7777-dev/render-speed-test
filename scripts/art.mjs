// Renders static compositions (channel art) to PNG: node scripts/art.mjs <outDir> <Comp> [<Comp> ...]
// Each art composition is 3 frames long; the first frame a fresh render tab draws is blank under software GL, so
// render all 3 and keep the last.
import { bundle } from "@remotion/bundler";
import { renderFrames, selectComposition } from "@remotion/renderer";
import fs from "node:fs";
import path from "node:path";
const [out, ...comps] = process.argv.slice(2);
fs.mkdirSync(out, { recursive: true });
const serveUrl = await bundle({ entryPoint: path.resolve("src/index.ts") });
for (const id of comps) {
  const composition = await selectComposition({ serveUrl, id, chromiumOptions: { gl: "swangle" } });
  const dir = path.join(out, `tmp_${id}`);
  await renderFrames({
    composition, serveUrl, outputDir: dir, imageFormat: "png", scale: 1, concurrency: 1, frameRange: [0, 2],
    chromiumOptions: { gl: "swangle" }, timeoutInMilliseconds: 600000,
    onBrowserLog: (l) => { if (l.type === "error" && !/404|THREE\.Clock/.test(l.text)) console.log("[browser]", l.text.slice(0, 300)); },
    onStart: () => {}, onFrameUpdate: () => {},
  });
  const files = fs.readdirSync(dir).sort();
  fs.renameSync(path.join(dir, files[files.length - 1]), path.join(out, `${id}.png`));
  fs.rmSync(dir, { recursive: true });
  console.log("rendered", id);
}
