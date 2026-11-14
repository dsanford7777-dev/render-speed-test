// People this Short adds to the Titanic world's cast (by name, as `who` in a shot).
import { Outfit } from "../bridge/toon";
const NAVY = "#1f2a44";
const SUIT = (jacket: string, extra: Partial<Outfit> = {}): Outfit => ({ jacket, pants: "#2b2f3d", boots: "#1e1a20", hat: "hair", hair: "#3a2a20", buttons: "#d9d4c8", skin: "#f5c9a0", ...extra });
export const CAST: [string, Outfit, number][] = [
  ["blair", SUIT(NAVY, { hat: "cap", cap: NAVY, buttons: "#e8c45a", moustache: "#5a3b2a", skin: "#f0d2b0" }), 71],
  ["wilde", SUIT(NAVY, { hat: "cap", cap: NAVY, buttons: "#e8c45a", moustache: "#2a201a", build: "stout", skin: "#ecd0b6" }), 72],
  ["lightoller", SUIT(NAVY, { hat: "cap", cap: NAVY, buttons: "#e8c45a", skin: "#f5c9a0" }), 73],
  ["hogg", SUIT("#3a4a6a", { hat: "cap", cap: "#2b2f3d", skin: "#f0d2b0", moustache: "#6b4a2f" }), 74],
  ["symons", SUIT("#4a5568", { hat: "cap", cap: "#3a3038", skin: "#ecd0b6" }), 75],
  ["senator", SUIT("#2b2f3d", { hat: "hair", hair: "#d9d4c8", moustache: "#d9d4c8", build: "stout", buttons: "#e8c45a" }), 76],
  ["auctioneer", SUIT("#1d1b22", { hat: "hair", hair: "#8a8a92", skin: "#f5c9a0", buttons: "#e8c45a" }), 77],
];
