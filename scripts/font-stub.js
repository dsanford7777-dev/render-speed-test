// Local previews only (scripts/stills.mjs with BROWSER_EXE set): Google Fonts can't be fetched from the sandbox,
// so captions fall back to a local heavy sans. CI renders always use the real Montserrat.
export const loadFont = () => ({ fontFamily: '"DejaVu Sans", Arial, sans-serif', waitUntilDone: () => Promise.resolve() });
