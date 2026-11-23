// Local previews only (scripts/stills.mjs and qa.mjs with BROWSER_EXE set): Google Fonts can't be fetched from the
// sandbox, so this loads the real Montserrat (variable font, weights 100-900, SIL OFL: public/fonts/Montserrat-OFL.txt)
// from public/fonts instead. Nov 22: the old stub used DejaVu Sans, about half as wide as Montserrat 900, so board
// lines that fit in previews ran off the frame in the real render. CI renders still use @remotion/google-fonts.
import { continueRender, delayRender, staticFile } from "remotion";
let started = false;
export const loadFont = () => {
  if (!started && typeof document !== "undefined" && typeof FontFace !== "undefined") {
    started = true;
    const h = delayRender("Montserrat (preview)");
    const face = new FontFace("Montserrat", `url(${staticFile("fonts/Montserrat-Variable.ttf")}) format("truetype")`, { weight: "100 900" });
    face.load().then(() => { document.fonts.add(face); continueRender(h); }).catch((e) => { console.error("preview font failed", e); continueRender(h); });
  }
  return { fontFamily: "Montserrat", fonts: {}, unicodeRanges: {}, waitUntilDone: () => Promise.resolve(undefined) };
};
