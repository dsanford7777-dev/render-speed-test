// "What If You Were Stuck in 1850 With Only Your Phone?" (Paradox Town Explained #6): the three.js world, posed per frame
// from a shot spec (story3d.ts). Three places, far apart so each sits in its own fog:
//  - the Canal Street wharf, September 1, 1850: a planked pier on piles over the Hudson, a row of warehouses behind it, a
//    welcome arch, and the steamship Atlantic alongside (black hull with a white band, paddle box, one funnel, three
//    masts, flags, a gangway down to the pier). Water around it all.
//  - Broadway (BW_O): Barnum's American Museum (painted panels, flags, the big sign), Genin's hat shop next door, more
//    fronts both sides, cobbles, gas lamps.
//  - one room (ROOM_O), redressed per shot by its wall sign and props: a telegraph counter with key, sounder and a shelf
//    of battery jars; Henry's electromagnet; hospital beds and a wash basin; Barnum's mermaid case; a daguerreotype
//    camera; a bed and a candle; a map on the table.
// The phone is a real prop (body + a screen whose picture changes per shot), held in a hand that reaches to it (`hw`).
// Space: on the wharf the ship is on the +z side and cameras mostly sit on the -z side, so world +x is screen LEFT.
import * as THREE from "three";
import { Batch, boxGeo, V, lam, Kit, quad, tri } from "../bridge/build";
import { ctex, cobbleHD, planksHD, cloudHD, stoneHD, waterNear, waterFar } from "../bridge/paint";
import { Pen, bodyFront, bodySide, fxContact, Outfit, SKIN } from "../bridge/toon";
import { LIGHTS, LOOK, LightPreset, WorldLook } from "../bridge/lights";
import { TONE, CHAR, LFB, untone } from "../bridge/shade";
import { NOINK } from "../bridge/ink";
import { Pool, Actor, Fx } from "../bridge/cast";
import { Board, INK, paintText } from "../dst/props";
import { signTex, newsTex } from "../lustig/props";
import { numTex, Cards } from "../hertzlong/props3d";
import { FPS } from "./timeline";
import { V3, Rm, Bw, PIER, SW } from "./story3d.types";
import type { St3 } from "./story3d.types";
type Light = "day" | "golden" | "night" | "fog";

const DAY_W: LightPreset = { ...LIGHTS.day, fogNear: 90, fogFar: 700 };
const GOLD_W: LightPreset = { ...LIGHTS.golden, el: 16, fogNear: 80, fogFar: 600 };
/** sickly, foggy: "bad air" (grey-green, flat) */
const FOG_W: LightPreset = { ...LIGHTS.day, az: 110, el: 50,
  lit: [0.98, 1.02, 0.92], shade: [0.4, 0.44, 0.4], lift: [0.08, 0.09, 0.07], charTint: [0.9, 0.94, 0.86], sideTint: [0.88, 0.92, 0.84],
  top: "#8f9a86", hor: "#bfc5ad", fog: "#a9b097", fogNear: 2, fogFar: 46, sunCol: "#e6ecd0", sunI: 1.3, sky: "#c9cfb6", ground: "#7a7a6a", hemiI: 0.8 };
const NIGHT_W: LightPreset = {
  az: 35, el: 58,
  lit: [0.7, 0.78, 1.2], shade: [0.13, 0.15, 0.3], lift: [0.03, 0.05, 0.13], lambert: 0.35, sideK: 0.84, term: 0.2,
  charTint: [0.8, 0.86, 1.1], charShade: 0.86, charGrad: 0.1, bodyGrad: 0.22, sideTint: [0.78, 0.82, 1.0],
  blob: [0.6, 0.62, 0.8], actorShadow: false,
  top: "#0b1533", hor: "#22366a", skyCurve: [0.0, 0.5, 0.6], fog: "#1b2a54", fogNear: 60, fogFar: 500, sunDisc: "#000000",
  sunCol: "#a9c0ff", sunI: 1.7, sky: "#2a3f73", ground: "#1a1f33", hemiI: 0.4,
  bias: -0.00025, normalBias: 0.015,
};
const FOG_LOOK: WorldLook = { ...LOOK.day, sky: { c: ["#bfc5ad", "#b3baa1", "#a5ad93", "#99a287", "#8f9a86"], e: [0, 3, 8, 16, 40] }, cloud: { lit: "#cfd4bf", mid: "#b5bba4", shade: "#9aa08a" }, sat: 0.7 };
const NIGHT_LOOK: WorldLook = { ...LOOK.day, sky: { c: ["#263a6e", "#1f3164", "#182955", "#111f46", "#0a1433"], e: [0, 3, 8, 16, 40] },
  water: { near: "#122a52", mid: "#0f2448", far: "#182f5c", crest: "#3f66a8", trough: "#08142e", glint: "#b9c9f5", shade: [0.5, 0.56, 0.72] },
  cloud: { lit: "#4a5f9c", mid: "#34477e", shade: "#243463" }, bounce: [0, 0, 0], sat: 1.0 };
/** the Hudson by day: greener and duller than open sea */
const RIVER_DAY = { near: "#3f7f86", mid: "#356f86", far: "#5b86a6", crest: "#8fc2c4", trough: "#24505e", glint: "#ffffff", shade: [0.5, 0.56, 0.72] as [number, number, number] };
const LP: Record<Light, LightPreset> = { day: DAY_W, golden: GOLD_W, fog: FOG_W, night: NIGHT_W };
const LK: Record<Light, WorldLook> = { day: { ...LOOK.day, water: RIVER_DAY }, golden: LOOK.golden, fog: { ...FOG_LOOK, water: RIVER_DAY }, night: NIGHT_LOOK };

// ---------------- cast ----------------
const COAT = (jacket: string, extra: Partial<Outfit> = {}): Outfit => ({ jacket, pants: "#3a3640", boots: "#1e1a20", hat: "tophat", hair: "#3a2a20", buttons: "#d9d4c8", skin: "#f5c9a0", ...extra });
type Who = { o: Outfit; seed: number; key: string };
const who = (o: Outfit, seed: number, key: string): Who => ({ o, seed, key });
/** everyone the shots can place, by name. "you" is the viewer: red cap, blue jacket, white trainers, in every chapter. */
const OUT: Record<string, Who> = {
  you: who({ jacket: "#2f6fd0", pants: "#39405a", boots: "#f4f1ea", hat: "cap", cap: "#e2453c", skin: SKIN, buttons: "#f4f1ea" }, 41, "you"),
  barnum: who(COAT("#1d1b22", { hat: "hair", hair: "#3a2a20", build: "stout", buttons: "#e8c45a", skin: "#f0d2b0" }), 42, "barnum"),
  lind: who(COAT("#8fb3d9", { hat: "bonnet", dress: "#8fb3d9", skin: "#f7dcc4" }), 43, "lind"),
  henry: who(COAT("#2b2f3d", { hat: "hair", hair: "#d9d4c8", skin: "#f0d2b0" }), 44, "henry"),
  semmel: who(COAT("#f1ede2", { hat: "hair", hair: "#3a2a20", moustache: "#3a2a20", pants: "#2b2f3d", skin: "#ecd0b6", buttons: "#2b2f3d" }), 45, "semmel"),
  snow: who(COAT("#23232b", { hat: "hair", hair: "#6b5a4a", skin: "#f0d2b0" }), 46, "snow"),
  doctor: who(COAT("#1d1b22", { moustache: "#8a8a92", build: "stout", buttons: "#e8c45a" }), 47, "doctor"),
  doctor2: who(COAT("#3a3038", { moustache: "#2a201a", skin: "#ecd0b6" }), 48, "doctor2"),
  doctor3: who(COAT("#2b2f3d", { hat: "hair", hair: "#8a8a92", moustache: "#8a8a92" }), 49, "doctor3"),
  operator: who(COAT("#f1ede2", { hat: "cap", cap: "#3f5f4a", pants: "#3a3038", moustache: "#4a3020" }), 50, "operator"),
  captain: who(COAT("#1f2a44", { hat: "cap", cap: "#1f2a44", moustache: "#e9e5dc", build: "stout", buttons: "#e8c45a" }), 51, "captain"),
  sailor: who(COAT("#1f2a44", { hat: "cap", cap: "#f1ede2", pants: "#f1ede2", skin: "#c99067" }), 52, "sailor"),
  newsboy: who({ jacket: "#8a5a3a", pants: "#4a4038", boots: "#3a2a20", hat: "cap", cap: "#5a4a3a", build: "kid", skin: SKIN }, 53, "newsboy"),
  mother: who(COAT("#7b5ac9", { hat: "bonnet", dress: "#7b5ac9", skin: "#ecd0b6" }), 54, "mother"),
  kid: who({ jacket: "#f08a2c", pants: "#3b5b9a", boots: "#5a3b2a", hat: "cap", cap: "#7a5236", build: "kid" }, 55, "kid"),
  patient: who(COAT("#f4f0e6", { hat: "bonnet", dress: "#f4f0e6", skin: "#ecd0b6" }), 56, "patient"),
  patient2: who(COAT("#f4f0e6", { hat: "hair", hair: "#4a3020", dress: "#f4f0e6", skin: "#f5c9a0" }), 57, "patient2"),
  dagman: who(COAT("#5a4a3a", { hat: "hair", hair: "#4a3020", moustache: "#4a3020" }), 58, "dagman"),
  sitter: who(COAT("#3f4656", { moustache: "#3a2a20", build: "stout" }), 59, "sitter"),
  genin: who(COAT("#23232b", { moustache: "#1e1a20", buttons: "#e8c45a" }), 60, "genin"),
  auctioneer: who(COAT("#5a2a2a", { hat: "hair", hair: "#8a8a92", moustache: "#8a8a92", build: "stout", buttons: "#e8c45a" }), 61, "auctioneer"),
  kossuth: who(COAT("#2b2f3d", { moustache: "#3a2a20", hair: "#3a2a20", buttons: "#e8c45a" }), 62, "kossuth"),
};
// the 1850 crowd: c0..c47, frock coats and top hats, caps, bonnets and full skirts, from a fixed seed
{
  const J = ["#3f4656", "#5a4a3a", "#2b2f3d", "#6b4a2f", "#4a5a7a", "#3f5f4a", "#7a5236", "#4a4038", "#23232b", "#5d5468"];
  const D = ["#c25a7a", "#5a8fc2", "#d9a441", "#7b5ac9", "#3f9a5a", "#a63d4c", "#e8b0a0"], SK = ["#f5c9a0", "#ecd0b6", SKIN, "#c99067", "#f0d2b0"];
  const HR = ["#3a2a20", "#1e1a20", "#4a3020", "#8a8a92", "#b5462f"];
  for (let i = 0; i < 48; i++) {
    const lady = i % 3 === 1, j = J[(i * 7 + 3) % J.length];
    const o: Outfit = lady ? COAT(D[i % D.length], { hat: "bonnet", dress: D[i % D.length], skin: SK[i % SK.length] })
      : COAT(j, { hat: i % 4 === 0 ? "cap" : i % 5 === 2 ? "hair" : "tophat", cap: J[(i * 3 + 1) % J.length], hair: HR[i % HR.length], skin: SK[(i * 3) % SK.length], moustache: i % 4 === 1 ? HR[(i + 2) % HR.length] : undefined, build: i % 6 === 4 ? "stout" : i % 11 === 7 ? "kid" : undefined });
    OUT[`c${i}`] = who(o, 100 + i, `c${i}`);
    // the same crowd with their hats off (for "people took off their hats")
    OUT[`b${i}`] = who({ ...o, hat: lady ? "bonnet" : "hair" }, 100 + i, `b${i}`);
  }
}
/** card units per metre (a card is 600 units wide; feet at y = 975) */
const SUc = 0.00216;
const tier = (d: number): [number, number, number] => d < 3.2 ? [1800, 3000, 3.0] : d < 6.5 ? [1080, 1800, 1.8] : d < 16 ? [480, 800, 0.8] : [240, 400, 0.4];
const M = (key: string, col: string, extra: THREE.MeshLambertMaterialParameters = {}) => lam(key, () => ({ color: col, ...extra }));
const UNLIT = new Map<string, THREE.MeshBasicMaterial>();
const unlit = (key: string, tex: () => THREE.Texture) => { let m = UNLIT.get(key); if (!m) { m = new THREE.MeshBasicMaterial({ map: tex(), color: new THREE.Color(0.9, 0.9, 0.9) }); UNLIT.set(key, m); } return m; };

// ---------------- textures ----------------
const flagTex = () => ctex("pfFlag", 512, 320, (g) => { for (let i = 0; i < 13; i++) { g.fillStyle = i % 2 ? "#f4f0e6" : "#c9373a"; g.fillRect(0, (i * 320) / 13, 512, 320 / 13 + 1); } g.fillStyle = "#2f4f9a"; g.fillRect(0, 0, 210, 172); g.fillStyle = "#f4f0e6"; for (let y = 0; y < 5; y++) for (let x = 0; x < 6; x++) { g.beginPath(); g.arc(22 + x * 33, 20 + y * 33, 7, 0, Math.PI * 2); g.fill(); } });
const pennantTex = (col: string) => ctex(`pfPen_${col}`, 256, 128, (g) => { g.clearRect(0, 0, 256, 128); g.fillStyle = col; g.beginPath(); g.moveTo(0, 8); g.lineTo(250, 64); g.lineTo(0, 120); g.closePath(); g.fill(); g.lineWidth = 8; g.strokeStyle = INK; g.stroke(); });
const brickTex = (key: string, base: string, alt: string) => ctex(key, 512, 512, (g, r) => { g.fillStyle = "#8a7a6a"; g.fillRect(0, 0, 512, 512); for (let y = 0; y < 512; y += 32) for (let x = -64; x < 512; x += 64) { g.fillStyle = r() > 0.5 ? base : alt; g.fillRect(x + ((y / 32) % 2) * 32 + 3, y + 3, 58, 26); } });
/** painted show banners between the museum's windows */
const bannerTex = (k: number) => ctex(`pfBanner${k}`, 256, 192, (g) => {
  const bg = ["#c9373a", "#2f6b55", "#d9a441", "#2f4f9a", "#7b5ac9", "#e2453c"][k % 6]; g.fillStyle = bg; g.fillRect(0, 0, 256, 192);
  g.lineWidth = 10; g.strokeStyle = INK; g.strokeRect(5, 5, 246, 182); g.fillStyle = "#f6efdc";
  // a simple silhouette per panel: elephant, giraffe neck, whale, bird, snake, star
  switch (k % 6) {
    case 0: g.beginPath(); g.ellipse(130, 105, 70, 42, 0, 0, Math.PI * 2); g.fill(); g.fillRect(70, 110, 18, 50); g.fillRect(170, 110, 18, 50); g.fillRect(45, 80, 22, 70); break;
    case 1: g.fillRect(110, 40, 22, 90); g.beginPath(); g.ellipse(140, 135, 50, 26, 0, 0, Math.PI * 2); g.fill(); g.beginPath(); g.ellipse(112, 40, 22, 14, 0, 0, Math.PI * 2); g.fill(); break;
    case 2: g.beginPath(); g.ellipse(120, 110, 80, 36, 0, 0, Math.PI * 2); g.fill(); g.beginPath(); g.moveTo(195, 110); g.lineTo(235, 80); g.lineTo(235, 140); g.closePath(); g.fill(); break;
    case 3: g.beginPath(); g.ellipse(128, 100, 40, 28, 0, 0, Math.PI * 2); g.fill(); g.beginPath(); g.moveTo(100, 95); g.lineTo(40, 60); g.lineTo(100, 115); g.fill(); g.beginPath(); g.moveTo(156, 95); g.lineTo(216, 60); g.lineTo(156, 115); g.fill(); break;
    case 4: g.lineWidth = 22; g.strokeStyle = "#f6efdc"; g.beginPath(); g.moveTo(40, 120); g.bezierCurveTo(90, 40, 130, 170, 180, 90); g.lineTo(215, 80); g.stroke(); break;
    default: g.beginPath(); for (let i = 0; i < 10; i++) { const a = (i * Math.PI) / 5 - Math.PI / 2, r = i % 2 ? 30 : 70; g.lineTo(128 + r * Math.cos(a), 98 + r * Math.sin(a)); } g.closePath(); g.fill();
  }
});
const windowHatsTex = () => ctex("pfHats", 512, 256, (g) => {
  g.fillStyle = "#2a2f3a"; g.fillRect(0, 0, 512, 256); g.fillStyle = "#e9dcc0"; g.fillRect(0, 196, 512, 60);
  for (let i = 0; i < 5; i++) { const x = 52 + i * 102, c = ["#1d1b22", "#5a4a3a", "#1d1b22", "#3f4656", "#1d1b22"][i]; g.fillStyle = c; g.fillRect(x - 28, 110, 56, 80); g.fillRect(x - 44, 182, 88, 12); g.fillStyle = "#c9373a"; g.fillRect(x - 28, 168, 56, 9); g.fillStyle = "#e9dcc0"; }
  g.lineWidth = 10; g.strokeStyle = INK; g.strokeRect(5, 5, 502, 246);
});
const mapTex = () => ctex("pfSnowMap", 512, 512, (g) => {
  g.fillStyle = "#efe6d0"; g.fillRect(0, 0, 512, 512); g.strokeStyle = "#8a7a6a"; g.lineWidth = 14;
  for (const [a, b, c, d] of [[0, 120, 512, 150], [0, 300, 512, 260], [140, 0, 170, 512], [330, 0, 300, 512], [0, 430, 512, 450]]) { g.beginPath(); g.moveTo(a, b); g.lineTo(c, d); g.stroke(); }
  g.fillStyle = INK; let s = 9;
  const r = () => (s = (s * 16807) % 2147483647) / 2147483647;
  for (let i = 0; i < 90; i++) { const a = r() * Math.PI * 2, d = 18 + Math.pow(r(), 1.6) * 210; const x = 236 + Math.cos(a) * d, y = 214 + Math.sin(a) * d * 0.8; g.fillRect(x - 6, y - 3, 12, 6); }
  g.fillStyle = "#c9373a"; g.beginPath(); g.arc(236, 214, 13, 0, Math.PI * 2); g.fill(); g.lineWidth = 5; g.strokeStyle = INK; g.stroke();
  g.lineWidth = 10; g.strokeRect(5, 5, 502, 502);
});
const paperTex = () => ctex("pfPaper", 256, 320, (g) => { g.fillStyle = "#fffaf0"; g.fillRect(4, 4, 248, 312); g.lineWidth = 8; g.strokeStyle = INK; g.strokeRect(4, 4, 248, 312); g.fillStyle = "#8a7a6a"; for (let y = 50; y < 290; y += 34) g.fillRect(30, y, 160 + ((y * 7) % 50), 10); });
const noteTex = () => ctex("pfNote", 256, 128, (g) => { g.fillStyle = "#e9e0c4"; g.fillRect(4, 4, 248, 120); g.lineWidth = 8; g.strokeStyle = INK; g.strokeRect(4, 4, 248, 120); paintText(g, "MORSE", 128, 64, 46, INK, "center", 0.05); });
const ticketTex = () => ctex("pfTicket", 256, 128, (g) => { g.fillStyle = "#c9373a"; g.fillRect(4, 4, 248, 120); g.lineWidth = 8; g.strokeStyle = INK; g.strokeRect(4, 4, 248, 120); g.strokeStyle = "#f6efdc"; g.lineWidth = 4; g.strokeRect(16, 16, 224, 96); paintText(g, "JENNY LIND", 128, 52, 34, "#f6efdc", "center", 0.05); paintText(g, "No. 1", 128, 92, 30, "#f6efdc", "center", 0.05); });
const hatTex = () => ctex("pfHatCard", 256, 256, (g) => { g.clearRect(0, 0, 256, 256); g.fillStyle = "#1d1b22"; g.fillRect(78, 50, 100, 140); g.fillRect(40, 180, 176, 24); g.fillStyle = "#c9373a"; g.fillRect(78, 160, 100, 16); g.lineWidth = 8; g.strokeStyle = "#f4f0e6"; g.strokeRect(78, 50, 100, 140); });
/** the phone's screen, by state */
const screenTex = (s: string) => ctex(`pfScreen_${s}`, 256, 512, (g) => {
  const bar = (dim = false) => {
    g.fillStyle = dim ? "#0c0c10" : "#121826"; g.fillRect(0, 0, 256, 512);
    g.fillStyle = "#ffffff"; g.font = "700 22px Montserrat, Arial, sans-serif"; g.textBaseline = "middle"; g.textAlign = "left"; g.fillText("No Service", 16, 26);
    const pct = s === "40" ? 40 : s === "1" ? 1 : s === "low" ? 33 : 80;
    g.textAlign = "right"; g.fillText(`${pct}%`, 200, 26); g.strokeStyle = "#ffffff"; g.lineWidth = 3; g.strokeRect(206, 16, 36, 20);
    g.fillStyle = pct <= 1 ? "#ff3b30" : pct < 50 ? "#ffcc00" : "#4cd964"; g.fillRect(209, 19, Math.max(2, (30 * pct) / 100), 14);
    if (s === "low") { g.fillStyle = "#ff9500"; g.textAlign = "left"; g.fillText("✈", 140, 26); }
  };
  switch (s) {
    case "black": g.fillStyle = "#050507"; g.fillRect(0, 0, 256, 512); break;
    case "rec": {
      g.fillStyle = "#4f86b8"; g.fillRect(0, 0, 256, 512); g.fillStyle = "#3f7f86"; g.fillRect(0, 300, 256, 212); g.fillStyle = "#23232b"; g.fillRect(40, 190, 170, 110); g.fillStyle = "#f4f0e6"; g.fillRect(40, 232, 170, 10);
      g.fillStyle = "#1d1b22"; g.fillRect(118, 90, 12, 100); g.fillStyle = "rgba(0,0,0,0.55)"; g.fillRect(0, 0, 256, 54);
      g.fillStyle = "#ff3b30"; g.beginPath(); g.arc(30, 27, 10, 0, Math.PI * 2); g.fill(); g.fillStyle = "#fff"; g.font = "700 24px Montserrat, Arial, sans-serif"; g.textBaseline = "middle"; g.fillText("REC 00:12", 48, 28);
      g.strokeStyle = "#fff"; g.lineWidth = 6; g.beginPath(); g.arc(128, 460, 26, 0, Math.PI * 2); g.stroke(); g.fillStyle = "#ff3b30"; g.fillRect(116, 448, 24, 24); break;
    }
    case "map": {
      bar(); g.fillStyle = "#e9e4d8"; g.fillRect(0, 54, 256, 458); g.strokeStyle = "#ffffff"; g.lineWidth = 14; for (let i = 0; i < 6; i++) { g.beginPath(); g.moveTo(0, 90 + i * 80); g.lineTo(256, 60 + i * 80); g.stroke(); g.beginPath(); g.moveTo(30 + i * 50, 54); g.lineTo(50 + i * 44, 512); g.stroke(); }
      g.fillStyle = "rgba(47,111,208,0.25)"; g.beginPath(); g.arc(128, 280, 70, 0, Math.PI * 2); g.fill(); g.fillStyle = "#2f6fd0"; g.beginPath(); g.arc(128, 280, 16, 0, Math.PI * 2); g.fill(); g.lineWidth = 5; g.strokeStyle = "#fff"; g.stroke();
      g.fillStyle = "#121826"; g.font = "700 22px Montserrat, Arial, sans-serif"; g.textAlign = "center"; g.fillText("Searching…", 128, 470); break;
    }
    case "dial": {
      bar(); g.fillStyle = "#fff"; g.textAlign = "center"; g.font = "700 30px Montserrat, Arial, sans-serif"; g.fillText("Calling…", 128, 120); g.font = "700 22px Montserrat, Arial, sans-serif"; g.fillStyle = "#ff3b30"; g.fillText("Call failed", 128, 160);
      for (let i = 0; i < 9; i++) { g.strokeStyle = "#5a6070"; g.lineWidth = 3; g.beginPath(); g.arc(60 + (i % 3) * 68, 230 + Math.floor(i / 3) * 70, 26, 0, Math.PI * 2); g.stroke(); }
      g.fillStyle = "#ff3b30"; g.beginPath(); g.arc(128, 452, 30, 0, Math.PI * 2); g.fill(); break;
    }
    default: {
      bar(s === "low");
      g.fillStyle = s === "low" ? "#3a3f4a" : "#ffffff"; g.textAlign = "center"; g.font = "800 88px Montserrat, Arial, sans-serif"; g.fillText("9:41", 128, 150);
      g.font = "700 24px Montserrat, Arial, sans-serif"; g.fillText("Sept 1, 2026", 128, 210);
      if (s === "1") { g.fillStyle = "#ff3b30"; g.font = "900 64px Montserrat, Arial, sans-serif"; g.fillText("1%", 128, 330); }
      if (s === "40") { g.fillStyle = "#ffcc00"; g.font = "900 64px Montserrat, Arial, sans-serif"; g.fillText("40%", 128, 330); }
      for (let i = 0; i < 8; i++) if (s !== "1" && s !== "40") { g.fillStyle = ["#e2453c", "#4cd964", "#2f6fd0", "#ffcc00", "#7b5ac9", "#ff9500", "#30b0c7", "#f4f0e6"][i]; g.globalAlpha = s === "low" ? 0.35 : 1; g.fillRect(28 + (i % 4) * 54, 300 + Math.floor(i / 4) * 64, 40, 40); g.globalAlpha = 1; }
    }
  }
});
const discTex = () => ctex("sunDisc", 128, 128, (g) => { const gr = g.createRadialGradient(64, 64, 58, 64, 64, 64); gr.addColorStop(0, "rgba(255,255,255,1)"); gr.addColorStop(1, "rgba(255,255,255,0)"); g.fillStyle = gr; g.fillRect(0, 0, 128, 128); });
const glowTex = () => ctex("pfGlow", 128, 128, (g) => { const gr = g.createRadialGradient(64, 64, 0, 64, 64, 64); gr.addColorStop(0, "rgba(255,255,255,1)"); gr.addColorStop(0.35, "rgba(255,255,255,0.45)"); gr.addColorStop(1, "rgba(255,255,255,0)"); g.fillStyle = gr; g.fillRect(0, 0, 128, 128); });
const smokeTex = () => ctex("pfSmoke", 128, 128, (g) => { const gr = g.createRadialGradient(64, 64, 0, 64, 64, 62); gr.addColorStop(0, "rgba(70,66,72,0.85)"); gr.addColorStop(0.6, "rgba(90,86,92,0.5)"); gr.addColorStop(1, "rgba(90,86,92,0)"); g.fillStyle = gr; g.fillRect(0, 0, 128, 128); });

// ---------------- geometry helpers ----------------
const win = (b: Batch, mat: THREE.Material, x: number, y: number, z: number, w: number, h: number, s: number) => {
  const a = V(x - w / 2, y - h / 2, z), c = V(x + w / 2, y + h / 2, z);
  b.add(s < 0 ? quad(V(c.x, a.y, z), V(a.x, a.y, z), V(a.x, c.y, z), V(c.x, c.y, z)) : quad(V(a.x, a.y, z), V(c.x, a.y, z), V(c.x, c.y, z), V(a.x, c.y, z)), mat);
};
const cylAt = (b: Batch, mat: THREE.Material, r0: number, r1: number, h: number, x: number, y: number, z: number, seg = 20) => {
  const g = new THREE.CylinderGeometry(r0, r1, h, seg, 1); g.translate(x, y + h / 2, z); b.add(g, mat);
};
/** a bar between two points (masts' rigging, wires) */
const rod = (b: Batch, mat: THREE.Material, a: V3, c: V3, r: number, seg = 6) => {
  const A = V(...a), C = V(...c), len = A.distanceTo(C), g = new THREE.CylinderGeometry(r, r, len, seg, 1);
  const q = new THREE.Quaternion().setFromUnitVectors(V(0, 1, 0), C.clone().sub(A).normalize());
  b.add(g, mat, new THREE.Matrix4().compose(A.clone().add(C).multiplyScalar(0.5), q, V(1, 1, 1)));
};
const prow = (b: Batch, x0: number, x1: number, z0: number, z1: number, y0: number, y1: number, mat: THREE.Material, top?: THREE.Material) => {
  const zc = (z0 + z1) / 2, A = V(x0, y0, z0), B = V(x1, y0, zc), C = V(x1, y1, zc), D = V(x0, y1, z0), E = V(x0, y0, z1), F = V(x0, y1, z1);
  if (x1 > x0) { b.add(quad(A, B, C, D), mat); b.add(quad(B, E, F, C), mat); if (top) b.add(tri(D, F, C), top); }
  else { b.add(quad(B, A, D, C), mat); b.add(quad(E, B, C, F), mat); if (top) b.add(tri(F, D, C), top); }
};
const shadowAll = <T extends THREE.Object3D>(o: T) => { o.traverse((m) => { m.castShadow = true; m.receiveShadow = true; }); return o; };
/** a building front on a street: front face at zf facing -z (s = 1, north side) or +z (s = -1), body going back */
const front = (b: Batch, wb: Batch, winMat: THREE.Material, x0: number, x1: number, h: number, zf: number, s: number, mat: THREE.Material, trim: THREE.Material, y0 = 0, door = true) => {
  const zb = zf + s * 24;
  b.add(boxGeo(V(x0, y0, Math.min(zf, zb)), V(x1, y0 + h, Math.max(zf, zb)), 0), mat);
  b.add(boxGeo(V(x0 - 0.25, y0 + h, Math.min(zf, zb) - 0.25), V(x1 + 0.25, y0 + h + 0.6, Math.max(zf, zb) + 0.25)), trim);
  const n = Math.max(2, Math.floor((x1 - x0) / 2.6)), dx = (x1 - x0) / n;
  for (let y = y0 + 5.6; y < y0 + h - 1.5; y += 3.4) for (let i = 0; i < n; i++) win(wb, winMat, x0 + dx * (i + 0.5), y, zf - s * 0.03, dx * 0.46, 1.9, -s);
  for (let i = 0; i < n; i++) if (!(door && i === Math.floor(n / 2))) win(wb, winMat, x0 + dx * (i + 0.5), y0 + 2.0, zf - s * 0.03, dx * 0.6, 2.4, -s);
  if (door) { const xd = x0 + dx * (Math.floor(n / 2) + 0.5); b.add(boxGeo(V(xd - 0.7, y0, Math.min(zf, zf - s * 0.12)), V(xd + 0.7, y0 + 2.8, Math.max(zf, zf - s * 0.12))), M("pfDoor", "#4a2f22")); }
};

const WATER_DECL = `#include <common>
varying vec3 vWP;
uniform vec3 wNearC, wMidC, wFarC, wCrest, wTrough, wGlint, wShade;
uniform sampler2D wNearTex, wFarTex;
uniform float wFlow, wCalm;`;
const WATER_COL = `
  vec3 wV = vWP - cameraPosition;
  float wd = length(wV);
  float wDep = asin(clamp(-wV.y / wd, 0.0, 1.0));
  float wf = 1.0 - smoothstep(0.0, 0.42, wDep);
  vec3 wc = mix(mix(wNearC, wMidC, smoothstep(0.0, 0.55, wf)), wFarC, smoothstep(0.55, 1.0, wf));
  vec2 wp = vWP.xz + vec2(wFlow, 0.0);
  vec4 mk = mix(texture2D(wNearTex, wp / 8.0), texture2D(wFarTex, wp / 40.0 + 0.37), smoothstep(25.0, 90.0, wd));
  wc = mix(wc, wTrough, mk.g * 0.6 * wCalm);
  wc = mix(wc, wCrest, mk.r * 0.7 * wCalm);
  wc = mix(wc, wGlint, mk.b * (0.3 + 0.5 * wf) * wCalm);
  diffuseColor.rgb = wc;`;

/** ship hull: x -40..40 (bow at +x), z 11..25, keel at y -3, deck at y 6.5 */
export const SHIP = { x0: -40, x1: 40, z0: 11, z1: 25, deck: 6.5 };

export class PWorld {
  root = new THREE.Group();
  private pool = new Pool();
  private actors: Actor[] = []; private fxs: Fx[] = [];
  private hemi: THREE.HemisphereLight; private sun: THREE.DirectionalLight;
  private sky: THREE.Mesh; private skyMat: THREE.ShaderMaterial;
  private fog = new THREE.Fog("#bccbec", 25, 420);
  private sunDisc: THREE.Sprite; private stars: THREE.Points;
  private sunCache = new Map<number, THREE.Vector3>();
  private clouds: THREE.Mesh[] = []; private cloudMaps: Record<Light, THREE.Texture[]>;
  private cloudHome: THREE.Vector3[] = [];
  private winMat = new THREE.MeshBasicMaterial({ color: 0xffffff, fog: true, side: THREE.DoubleSide });
  private WU: Record<string, THREE.IUniform>;
  private ship = new THREE.Group(); private smoke: THREE.Sprite[] = [];
  private roomSign: THREE.Mesh;
  private table = new THREE.Group(); private telegraph = new THREE.Group(); private jars: THREE.Group[] = []; private jarGlow: THREE.Sprite[] = []; private shelf = new THREE.Group();
  private wires = new THREE.Group(); private magnet = new THREE.Group(); private beds = new THREE.Group(); private basin = new THREE.Group(); private mermaid = new THREE.Group();
  private bed = new THREE.Group(); private candle = new THREE.Group(); private flame: THREE.Sprite; private dag = new THREE.Group(); private map: THREE.Mesh;
  private phone = new THREE.Group(); private screen: THREE.Mesh; private phoneGlow: THREE.Sprite;
  private rnum: Board; private papers: Cards; private notes: Cards; private hats: Cards; private tickets: Cards;
  private hall = new THREE.Group(); private news: Board; private pile = new THREE.Group(); private pileHats: THREE.Object3D[] = [];
  private lastPeople: { name: string; p: V3; walking: boolean; low: boolean; extra: boolean }[] = [];
  private ray = new THREE.Raycaster();
  private frustum = new THREE.Frustum(); private m4 = new THREE.Matrix4(); private sph = new THREE.Sphere(); private v = new THREE.Vector3();

  constructor(kit: Kit) {
    void kit;
    const R = this.root;
    this.skyMat = new THREE.ShaderMaterial({
      uniforms: { c0: { value: new THREE.Color() }, c1: { value: new THREE.Color() }, c2: { value: new THREE.Color() }, c3: { value: new THREE.Color() }, c4: { value: new THREE.Color() }, e: { value: new THREE.Vector4() } },
      vertexShader: "varying vec3 vP; void main(){ vP = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }",
      fragmentShader: `uniform vec3 c0, c1, c2, c3, c4; uniform vec4 e; varying vec3 vP;
        void main(){ float el = asin(clamp(normalize(vP).y, -1.0, 1.0));
          vec3 c = mix(c0, c1, smoothstep(0.0, e.x, el)); c = mix(c, c2, smoothstep(e.x, e.y, el));
          c = mix(c, c3, smoothstep(e.y, e.z, el)); c = mix(c, c4, smoothstep(e.z, e.w, el)); gl_FragColor = vec4(c, 1.0); }`,
      side: THREE.BackSide, depthWrite: false, fog: false,
    });
    this.sky = new THREE.Mesh(new THREE.SphereGeometry(1900, 48, 24), this.skyMat);
    this.sky.renderOrder = -1; this.sky.frustumCulled = false; this.sky.layers.set(NOINK); R.add(this.sky);
    this.sunDisc = new THREE.Sprite(new THREE.SpriteMaterial({ map: discTex(), color: new THREE.Color(6.0, 4.4, 2.4), fog: false, depthWrite: false }));
    this.sunDisc.frustumCulled = false; this.sunDisc.layers.set(NOINK); R.add(this.sunDisc);
    const sp: number[] = []; let seed = 7; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
    for (let i = 0; i < 420; i++) { const a = rnd() * Math.PI * 2, el = 0.1 + rnd() * 1.3, r = 1700; sp.push(r * Math.cos(el) * Math.cos(a), r * Math.sin(el), r * Math.cos(el) * Math.sin(a)); }
    const sg = new THREE.BufferGeometry(); sg.setAttribute("position", new THREE.Float32BufferAttribute(sp, 3));
    this.stars = new THREE.Points(sg, new THREE.PointsMaterial({ color: new THREE.Color(1.5, 1.6, 2.0), size: 2.6, sizeAttenuation: false, fog: false, depthWrite: false }));
    this.stars.frustumCulled = false; this.stars.layers.set(NOINK); R.add(this.stars);
    this.hemi = new THREE.HemisphereLight("#cfe6ff", "#6c5c8c", 1.1);
    this.sun = new THREE.DirectionalLight("#fff0d6", 2.6);
    this.sun.castShadow = true; this.sun.shadow.mapSize.set(4096, 4096);
    R.add(this.hemi, this.sun, this.sun.target);
    this.cloudMaps = { day: [0, 1, 2, 3].map((k) => cloudHD(k, LOOK.day.cloud)), golden: [0, 1, 2, 3].map((k) => cloudHD(k, LOOK.golden.cloud)), fog: [0, 1, 2, 3].map((k) => cloudHD(k, FOG_LOOK.cloud)), night: [0, 1, 2, 3].map((k) => cloudHD(k, NIGHT_LOOK.cloud)) };
    for (let i = 0; i < 9; i++) {
      const a = (i / 9) * Math.PI * 2 + 0.3, d = 1150 + (i % 3) * 90, w = 230 + (i % 4) * 50;
      const m = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ map: this.cloudMaps.day[i % 4], color: new THREE.Color(1.1, 1.1, 1.1), transparent: true, depthWrite: false, fog: false }));
      this.cloudHome.push(new THREE.Vector3(Math.cos(a) * d, 260 + (i % 4) * 70, Math.sin(a) * d)); m.scale.set(w, w / 2, 1); m.layers.set(NOINK);
      this.clouds.push(m); R.add(m);
    }

    // ---------------- the river ----------------
    const wNear = waterNear(), wFar = waterFar();
    for (const t of [wNear, wFar]) { t.colorSpace = THREE.NoColorSpace; t.anisotropy = 16; t.needsUpdate = true; }
    this.WU = {
      wNearC: { value: new THREE.Color() }, wMidC: { value: new THREE.Color() }, wFarC: { value: new THREE.Color() },
      wCrest: { value: new THREE.Color() }, wTrough: { value: new THREE.Color() }, wGlint: { value: new THREE.Color() },
      wShade: { value: new THREE.Vector3(0.5, 0.56, 0.72) }, wNearTex: { value: wNear }, wFarTex: { value: wFar }, wFlow: { value: 0 }, wCalm: { value: 1 },
    };
    const waterM = new THREE.MeshLambertMaterial({ color: 0xffffff });
    waterM.onBeforeCompile = (sh) => {
      Object.assign(sh.uniforms, this.WU);
      sh.vertexShader = sh.vertexShader.replace("#include <common>", "#include <common>\nvarying vec3 vWP;")
        .replace("#include <project_vertex>", "#include <project_vertex>\nvWP = (modelMatrix * vec4(transformed, 1.0)).xyz;");
      sh.fragmentShader = sh.fragmentShader.replace("#include <common>", WATER_DECL).replace("#include <map_fragment>", WATER_COL)
        .replace("#include <lights_fragment_begin>", "float sunVis = 1.0;\n" + LFB)
        .replace("#include <lights_fragment_end>", "#include <lights_fragment_end>\n  reflectedLight.directDiffuse = diffuseColor.rgb * mix(wShade, vec3(1.0), sunVis);\n  reflectedLight.indirectDiffuse = vec3(0.0);");
    };
    waterM.customProgramCacheKey = () => "phoneifRiver1";
    const wg = new THREE.PlaneGeometry(1500, 1500); wg.rotateX(-Math.PI / 2); wg.translate(0, -0.4, 300);
    const wm = new THREE.Mesh(wg, waterM); wm.receiveShadow = true; R.add(wm);

    // ---------------- the wharf ----------------
    const b = new Batch(), wb = new Batch();
    const deck = lam("pfPlanks", () => ({ map: planksHD() })), pile = M("pfPile", "#5a4030"), dark = M("pfDark", "#1d1b22"), wood = M("pfWood", "#8a5a3a"), gold = M("pfGold", "#e8c45a");
    const BR = [brickTex("pfBrick0", "#a8553e", "#9a4a36"), brickTex("pfBrick1", "#8f5a44", "#7f4e3a"), brickTex("pfBrick2", "#b06a48", "#a05e40")].map((t, i) => { t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(4, 4); return lam("pfBrickM" + i, () => ({ map: t })); });
    const trim = M("pfTrim", "#d9cdb4"), stone = lam("pfStone", () => ({ map: stoneHD("pfStoneHD", ["#e6dcc8", "#ddd2bc", "#ece3d1", "#d6cab3"], "#b3a68e") }));
    // the pier: deck, edge beam, piles along the waterside
    b.add(boxGeo(V(-90, 0.9, -40), V(90, PIER, 8), 4), deck);
    b.add(boxGeo(V(-90, 0.6, 7.6), V(90, PIER + 0.12, 8.2)), pile);
    for (let x = -88; x <= 88; x += 3.2) cylAt(b, pile, 0.22, 0.25, 2.2, x, -0.8, 7.9, 8);
    // bollards and coiled lines along the edge
    // warehouses behind the pier, fronts at z = -16 facing the water (+z)
    let wi = 0;
    for (let x = -90; x < 90; ) { const w = 14 + ((wi * 5) % 4) * 3; front(b, wb, this.winMat, x, x + w - 0.5, 9 + ((wi * 7) % 4) * 2.5, -16, -1, BR[wi % 3], trim, PIER, true); x += w; wi++; }
    // crates and barrels on the pier
    for (const [x, z] of [[-30, -11], [-28.6, -11.2], [24, -12], [25.2, -10.6], [44, -12.5]]) b.add(boxGeo(V(x - 0.6, PIER, z - 0.6), V(x + 0.6, PIER + 1.1, z + 0.6)), wood);
    for (const [x, z] of [[-33, -12], [-34, -10.8], [30, -12.4], [47, -11]]) cylAt(b, M("pfBarrel", "#7a5236"), 0.42, 0.42, 1.1, x, PIER, z, 14);
    // the welcome arch: two posts, a beam and a sign facing the pier's open side (-z), bunting
    for (const x of [-20, -8]) { b.add(boxGeo(V(x - 0.35, PIER, -4.4), V(x + 0.35, PIER + 7.6, -3.6)), M("pfArch", "#f1ede2")); b.add(boxGeo(V(x - 0.5, PIER + 7.6, -4.55), V(x + 0.5, PIER + 8.0, -3.45)), gold); }
    b.add(boxGeo(V(-20.6, PIER + 6.6, -4.3), V(-7.4, PIER + 7.5, -3.7)), M("pfArch", "#f1ede2"));
    const arch = new Board(10.6, 1.7, "pf_arch", () => signTex("pf_arch", "WELCOME JENNY LIND", "#c9373a", "#f6efdc")); arch.group.position.set(-14, PIER + 7.05, -4.36); R.add(arch.group);
    for (let i = 0; i < 9; i++) { const p = new THREE.Mesh(new THREE.PlaneGeometry(0.9, 0.45), lam(`pfPenM${i % 3}`, () => ({ map: pennantTex(["#c9373a", "#f6efdc", "#2f4f9a"][i % 3]), transparent: true, alphaTest: 0.5, side: THREE.DoubleSide }))); p.rotation.z = -Math.PI / 2; p.position.set(-19.4 + i * 1.35, PIER + 6.25 - 0.35 * Math.sin((i / 8) * Math.PI), -4.05); R.add(p); }
    b.build(R); wb.build(R, false);

    // ---------------- the steamship Atlantic ----------------
    {
      const S = this.ship, sb = new Batch(), swb = new Batch(), { x0, x1, z0, z1, deck: dk } = SHIP;
      const hull = M("pfHull", "#23232b", { side: THREE.DoubleSide }), band = M("pfBand", "#f1ede2"), red = M("pfRed", "#c9373a"), mast = M("pfMast", "#7a5236"), rope = M("pfRope", "#3a3038");
      sb.add(boxGeo(V(x0, -3, z0), V(x1, dk, z1)), hull);
      prow(sb, x1, x1 + 11, z0, z1, -3, dk, hull, deck); prow(sb, x0, x0 - 6, z0, z1, -3, dk, hull, deck);
      sb.add(boxGeo(V(x0, dk, z0 + 0.1), V(x1, dk + 0.08, z1 - 0.1), 4), deck);
      for (const z of [z0 - 0.04, z1 + 0.04]) { sb.add(boxGeo(V(x0, 4.4, z - 0.03), V(x1, 5.0, z + 0.03)), band); }
      for (const z of [z0 + 0.15, z1 - 0.15]) { sb.add(boxGeo(V(x0, dk + 0.08, z - 0.12), V(x1, dk + 1.1, z + 0.12)), wood); }
      for (let x = x0 + 3; x < x1 - 2; x += 3) win(swb, this.winMat, x, 2.6, z0 - 0.06, 0.55, 0.55, -1);
      // the paddle box on the pier side: a half drum with the wheel housing
      { const pb = new THREE.CylinderGeometry(6.2, 6.2, 1.6, 28, 1, false, Math.PI / 2, Math.PI); pb.rotateX(Math.PI / 2); pb.translate(2, 2.4, z0 - 0.8); sb.add(pb, M("pfPaddle", "#2b2f3d")); }
      { const rim = new THREE.TorusGeometry(6.25, 0.18, 6, 28, Math.PI); rim.translate(2, 2.4, z0 - 1.62); sb.add(rim, gold); }
      // deckhouse, funnel (black with a red band), three masts with yards, rigging to bow and stern
      sb.add(boxGeo(V(-10, dk, 14.5), V(14, dk + 2.6, 21.5)), M("pfHouse", "#e9dcc0"));
      cylAt(sb, dark, 1.7, 1.8, 12, 2, dk + 2.6, 18, 20); cylAt(sb, red, 1.72, 1.72, 1.6, 2, dk + 11.2, 18, 20);
      for (const [mx, h] of [[26, 25], [-12, 27], [-30, 22]]) {
        cylAt(sb, mast, 0.22, 0.34, h, mx, dk, 18, 8);
        for (const [yy, w] of [[0.55, 9], [0.8, 6.5]]) sb.add(boxGeo(V(mx - 0.12, dk + h * yy - 0.12, 18 - w / 2), V(mx + 0.12, dk + h * yy + 0.12, 18 + w / 2)), mast);
        for (const zz of [z0 + 0.3, z1 - 0.3]) rod(sb, rope, [mx, dk + h * 0.95, 18], [mx - 3, dk + 1.1, zz], 0.04);
      }
      rod(sb, rope, [26, dk + 24, 18], [x1 + 10, dk + 0.5, 18], 0.05); rod(sb, rope, [-30, dk + 21, 18], [x0 - 5, dk + 0.5, 18], 0.05);
      // name board on the bow, facing the pier
      sb.build(S); swb.build(S, false);
      const nm = new Board(7, 1.2, "pf_atl", () => signTex("pf_atl", "ATLANTIC", "#1d1b22", "#e8c45a")); nm.group.position.set(30, 3.5, z0 - 0.08); S.add(nm.group);
      // flags: the stars and stripes at the stern, pennants at the mastheads
      { const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 6, 8), mast); pole.position.set(x0 - 4.5, dk + 3, 18); S.add(pole);
        const fl = new THREE.Mesh(new THREE.PlaneGeometry(3.2, 2.0), lam("pfFlagM", () => ({ map: flagTex(), side: THREE.DoubleSide }))); fl.position.set(x0 - 6.1, dk + 5, 18); S.add(fl); }
      for (const [mx, h, c] of [[26, 25, "#c9373a"], [-12, 27, "#f6efdc"], [-30, 22, "#2f4f9a"]] as [number, number, string][]) { const pn = new THREE.Mesh(new THREE.PlaneGeometry(2.4, 1.0), lam(`pfPenBig_${c}`, () => ({ map: pennantTex(c), transparent: true, alphaTest: 0.5, side: THREE.DoubleSide }))); pn.position.set(mx - 1.3, dk + h + 0.3, 18); S.add(pn); }
      // the gangway, from the deck rail down to the pier
      { const gw = new THREE.Group(), len = Math.hypot(dk + 0.1 - PIER, 6.0), g = new THREE.Mesh(new THREE.BoxGeometry(1.7, 0.14, len), deck);
        gw.add(g); for (const s of [-1, 1]) { const r2 = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.9, len), wood); r2.position.set(s * 0.85, 0.5, 0); gw.add(r2); }
        gw.position.set(8, (dk + 0.1 + PIER) / 2, z0 - 3.0); gw.rotation.x = -Math.atan2(dk + 0.1 - PIER, 6.0); S.add(gw); }
      shadowAll(S); R.add(S);
      const smT = smokeTex();
      for (let i = 0; i < 10; i++) { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: smT, transparent: true, depthWrite: false, fog: true })); s.visible = false; this.smoke.push(s); R.add(s); }
    }

    // ---------------- Broadway ----------------
    {
      const bb = new Batch(), bwb = new Batch(), cobble = lam("cobbleHD", () => ({ map: cobbleHD() })), iron = M("pfIron", "#2f2a3a");
      const B = (x: number, y: number, z: number) => V(...Bw(x, y, z));
      bb.add(boxGeo(B(-160, -0.4, -160), B(160, 0, 160), 6), cobble);
      bb.add(boxGeo(B(-160, 0, 6), B(160, SW, 12), 4), stone); bb.add(boxGeo(B(-160, 0, -12), B(160, SW, -6), 4), stone);
      // Barnum's American Museum: x -6..24, five storeys, painted panels between the windows, the long sign, roof flags
      const muse = M("pfMuseum", "#ece3d1"), ox = Bw(0, 0, 0);
      bb.add(boxGeo(B(-6, 0, 12), B(24, 22, 40)), muse); bb.add(boxGeo(B(-6.3, 22, 11.7), B(24.3, 22.8, 40)), trim);
      for (let fl = 0; fl < 5; fl++) { const y = 2 + fl * 4; bb.add(boxGeo(B(-6.2, y + 2.6, 11.7), B(24.2, y + 2.9, 12)), trim); for (let i = 0; i < 8; i++) win(bwb, this.winMat, -4.2 + i * 3.7, y + (fl === 0 ? 0.2 : 0.6), ox[2] + 11.97, 1.3, fl === 0 ? 2.6 : 1.9, -1); }
      for (let fl = 1; fl < 5; fl++) for (let i = 0; i < 7; i++) { const p = new THREE.Mesh(new THREE.PlaneGeometry(1.9, 1.5), lam(`pfBannerM${(fl * 3 + i) % 6}`, () => ({ map: bannerTex((fl * 3 + i) % 6) }))); p.rotation.y = Math.PI; p.position.set(...Bw(-2.35 + i * 3.7, 2.6 + fl * 4, 11.9)); R.add(p); }
      const msign = new Board(26, 2.3, "pf_museum", () => signTex("pf_museum", "BARNUM'S AMERICAN MUSEUM", "#c9373a", "#f6efdc")); msign.group.position.set(...Bw(9, 20.4, 11.8)); R.add(msign.group);
      for (let i = 0; i < 4; i++) { const px = -3 + i * 8.4; cylAt(bb, iron, 0.06, 0.06, 6, ...Bw(px, 22.8, 14)); const fl = new THREE.Mesh(new THREE.PlaneGeometry(2.6, 1.6), lam("pfFlagM", () => ({ map: flagTex(), side: THREE.DoubleSide }))); fl.position.set(...Bw(px - 1.35, 27.8, 14)); R.add(fl); }
      bb.add(boxGeo(B(6, 0, 11.4), B(12, 3.4, 12.05)), M("pfDoor", "#4a2f22"));
      // Genin's hat shop next door: x -16..-6.4, brick, a shop window full of hats, its sign
      front(bb, bwb, this.winMat, -16, -6.4, 13, ox[2] + 12, 1, BR[1], trim, 0, false);
      const hw = new THREE.Mesh(new THREE.PlaneGeometry(5.6, 2.6), unlit("pfHatsWin", windowHatsTex)); hw.rotation.y = Math.PI; hw.position.set(...Bw(-12.4, 1.9, 11.94)); R.add(hw);
      bb.add(boxGeo(B(-8.6, 0, 11.86), B(-7.2, 2.8, 12)), M("pfDoor", "#4a2f22"));
      const gsign = new Board(8.4, 1.3, "pf_genin", () => signTex("pf_genin", "GENIN · HATTER", "#1d1b22", "#e8c45a")); gsign.group.position.set(...Bw(-11.2, 4.1, 11.82)); R.add(gsign.group);
      // the rest of the street
      let bi = 0;
      for (let x = -120; x < -16.6;) { const w = 9 + ((bi * 5) % 4) * 2.5; front(bb, bwb, this.winMat, x, Math.min(-16.6, x + w - 0.4), 11 + ((bi * 7) % 4) * 2.4, ox[2] + 12, 1, BR[bi % 3], trim); x += w; bi++; }
      for (let x = 24.6; x < 120;) { const w = 9 + ((bi * 5) % 4) * 2.5; front(bb, bwb, this.winMat, x, x + w - 0.4, 11 + ((bi * 7) % 4) * 2.4, ox[2] + 12, 1, BR[bi % 3], trim); x += w; bi++; }
      for (let x = -120; x < 120;) { const w = 9 + ((bi * 3) % 4) * 2.5; front(bb, bwb, this.winMat, x, x + w - 0.4, 10 + ((bi * 5) % 4) * 2.4, ox[2] - 12, -1, BR[(bi + 1) % 3], trim); x += w; bi++; }
      // gas lamps on both kerbs
      for (let x = -60; x <= 60; x += 15) for (const z of [6.6, -6.6]) { cylAt(bb, iron, 0.07, 0.1, 3.4, ...Bw(x, SW, z)); bb.add(boxGeo(B(x - 0.22, SW + 3.4, z - 0.22), B(x + 0.22, SW + 3.95, z + 0.22)), iron); const gl = new THREE.BoxGeometry(0.34, 0.42, 0.34); gl.translate(...Bw(x, SW + 3.68, z)); bwb.add(gl, this.winMat); }
      bb.build(R); bwb.build(R, false);
    }

    // ---------------- the room ----------------
    {
      const rb = new Batch();
      const wall = lam("pfRoomWall", () => ({ map: stoneHD("pfRoomWallHD", ["#efe2c6", "#e8d9ba", "#f4ead2", "#e2d2b0"], "#b8a684") })), floor = lam("pfPlanks", () => ({ map: planksHD() }));
      rb.add(boxGeo(V(...Rm(-10, -0.2, -16)), V(...Rm(10, 0, 5)), 4), floor);
      rb.add(boxGeo(V(...Rm(-7.3, 0, -5)), V(...Rm(-7, 5.2, 3.8)), 2), wall);
      rb.add(boxGeo(V(...Rm(7, 0, -5)), V(...Rm(7.3, 5.2, 3.8)), 2), wall);
      rb.add(boxGeo(V(...Rm(-7.3, 0, 3.5)), V(...Rm(7.3, 5.2, 3.8)), 2), wall);
      rb.add(boxGeo(V(...Rm(-7, 0, 3.44)), V(...Rm(7, 1.1, 3.5))), M("wainscot", "#7a5236")); rb.add(boxGeo(V(...Rm(-7, 1.1, 3.42)), V(...Rm(7, 1.2, 3.5))), gold);
      const ceil = new THREE.BoxGeometry(22, 0.3, 26); ceil.translate(...Rm(0, 5.35, -4)); rb.add(ceil, M("pfCeil", "#e9dcc0"));
      rb.build(R);
    }
    this.roomSign = new THREE.Mesh(new THREE.PlaneGeometry(4.6, 1.04), lam("sign_pf_room0", () => ({ map: signTex("pf_room0", "ROOM", "#2f2a3a", "#e8c45a") })));
    this.roomSign.rotation.y = Math.PI; this.roomSign.position.set(...Rm(0, 3.3, 3.4)); R.add(this.roomSign);
    const part = (G: THREE.Object3D, g: THREE.BufferGeometry, m: THREE.Material, x: number, y: number, z: number) => { const ms = new THREE.Mesh(g, m); ms.position.set(x, y, z); G.add(ms); return ms; };
    // the table (x -2..3, z 0.1..1.1, top at 0.8)
    part(this.table, new THREE.BoxGeometry(5, 0.08, 1.0), M("pfTop", "#6b4a2f"), 0.5, 0.76, 0.6);
    for (const [x, z] of [[-1.9, 0.2], [2.9, 0.2], [-1.9, 1.0], [2.9, 1.0]]) part(this.table, new THREE.BoxGeometry(0.1, 0.72, 0.1), wood, x, 0.36, z);
    // the telegraph: a key (base, lever, knob) and a sounder (two coils on a base), on the table at x 0..1
    part(this.telegraph, new THREE.BoxGeometry(0.34, 0.04, 0.16), wood, 0.3, 0.82, 0.55); { const lv = part(this.telegraph, new THREE.BoxGeometry(0.3, 0.025, 0.04), gold, 0.3, 0.87, 0.55); lv.rotation.z = 0.05; }
    part(this.telegraph, new THREE.CylinderGeometry(0.035, 0.035, 0.03, 12), M("pfKnob", "#1d1b22"), 0.17, 0.9, 0.55);
    part(this.telegraph, new THREE.BoxGeometry(0.36, 0.04, 0.2), wood, 0.9, 0.82, 0.62);
    for (const x of [0.83, 0.97]) part(this.telegraph, new THREE.CylinderGeometry(0.04, 0.04, 0.12, 12), M("pfCoil", "#b5462f"), x, 0.9, 0.62);
    part(this.telegraph, new THREE.BoxGeometry(0.26, 0.02, 0.05), gold, 0.9, 0.98, 0.62);
    // the battery shelf against the back wall: 12 glass jars in two rows, each with a zinc rod, wired together
    part(this.shelf, new THREE.BoxGeometry(3.2, 0.06, 0.5), wood, 0, 0.9, 0); part(this.shelf, new THREE.BoxGeometry(3.2, 0.06, 0.5), wood, 0, 0.0 + 0.45, 0);
    for (const x of [-1.55, 1.55]) part(this.shelf, new THREE.BoxGeometry(0.06, 0.95, 0.5), wood, x, 0.45, 0);
    const glass = new THREE.MeshLambertMaterial({ color: "#bfe0e6", transparent: true, opacity: 0.55 }), acid = M("pfAcid", "#d9c85a"), zinc = M("pfZinc", "#8a8f99");
    for (let i = 0; i < 12; i++) {
      const J = new THREE.Group(), row = Math.floor(i / 6), col = i % 6;
      part(J, new THREE.CylinderGeometry(0.11, 0.11, 0.26, 16), glass, 0, 0.13, 0); part(J, new THREE.CylinderGeometry(0.1, 0.1, 0.2, 16), acid, 0, 0.1, 0);
      part(J, new THREE.BoxGeometry(0.03, 0.34, 0.03), zinc, 0.03, 0.18, 0); part(J, new THREE.BoxGeometry(0.02, 0.06, 0.02), gold, -0.04, 0.29, 0);
      J.position.set(-1.25 + col * 0.5, row ? 0.93 : 0.48, 0); this.shelf.add(J); this.jars.push(J);
      const gl = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex(), color: new THREE.Color(1.3, 1.1, 0.35), blending: THREE.AdditiveBlending, depthWrite: false, transparent: true })); gl.scale.setScalar(0.5); gl.position.set(0, 0.2, -0.02); gl.visible = false; gl.layers.set(NOINK); J.add(gl); this.jarGlow.push(gl);
    }
    { const wbt = new Batch(); for (let r = 0; r < 2; r++) rod(wbt, M("pfWire", "#5a3b2a"), [-1.29, (r ? 0.93 : 0.48) + 0.31, 0], [1.29, (r ? 0.93 : 0.48) + 0.31, 0], 0.012); wbt.build(this.shelf); }
    { const wbt = new Batch(); for (const x of [-0.2, 0.2]) rod(wbt, M("pfWire", "#5a3b2a"), [x, 1.3, 0], [x, 3.2, 0.2], 0.015); wbt.build(this.wires); }
    // Henry's electromagnet: a horseshoe of iron on a frame, its legs wound with copper, a block of iron weights below
    {
      const frame = M("pfFrame", "#5a3b2a"), ironM = M("pfIronM", "#4a4a55"), copper = M("pfCopper", "#c87533");
      for (const x of [-0.7, 0.7]) part(this.magnet, new THREE.BoxGeometry(0.1, 1.9, 0.1), frame, x, 0.95, 0);
      part(this.magnet, new THREE.BoxGeometry(1.6, 0.1, 0.12), frame, 0, 1.9, 0);
      const hs = new THREE.TorusGeometry(0.3, 0.07, 10, 24, Math.PI); hs.rotateZ(Math.PI); part(this.magnet, hs, ironM, 0, 1.55, 0);
      for (const x of [-0.3, 0.3]) { part(this.magnet, new THREE.CylinderGeometry(0.07, 0.07, 0.3, 12), ironM, x, 1.7, 0); part(this.magnet, new THREE.CylinderGeometry(0.12, 0.12, 0.26, 16), copper, x, 1.7, 0); }
      part(this.magnet, new THREE.BoxGeometry(0.8, 0.12, 0.2), ironM, 0, 1.17, 0);
      part(this.magnet, new THREE.BoxGeometry(0.04, 0.3, 0.04), ironM, 0, 0.98, 0); part(this.magnet, new THREE.BoxGeometry(0.7, 0.36, 0.36), ironM, 0, 0.66, 0);
    }
    // three hospital beds along the back wall and a wash basin on a stand
    for (let i = 0; i < 3; i++) { const x = -3.2 + i * 2.4; part(this.beds, new THREE.BoxGeometry(1.0, 0.45, 2.0), M("pfBedFrame", "#d9d4c8"), x, 0.45, 2.3); part(this.beds, new THREE.BoxGeometry(0.95, 0.12, 1.95), M("pfSheet", "#f4f0e6"), x, 0.72, 2.3); part(this.beds, new THREE.BoxGeometry(0.6, 0.12, 0.35), M("pfPillow", "#fffaf0"), x, 0.82, 3.05); part(this.beds, new THREE.BoxGeometry(0.97, 0.07, 1.1), M("pfBlanketW", "#8fa3b8"), x, 0.8, 1.9); }
    part(this.basin, new THREE.CylinderGeometry(0.05, 0.08, 0.86, 10), wood, 0, 0.43, 0); part(this.basin, new THREE.CylinderGeometry(0.3, 0.2, 0.14, 20), M("pfBowl", "#f1ede2"), 0, 0.93, 0); part(this.basin, new THREE.CylinderGeometry(0.26, 0.26, 0.02, 20), M("pfWater", "#9fd0ea"), 0, 0.98, 0);
    // the mermaid case: a pedestal, a glass box, a small dark stylised figure with a fish tail, a label
    {
      this.mermaid.scale.setScalar(1.35);
    part(this.mermaid, new THREE.BoxGeometry(1.2, 0.9, 0.7), wood, 0, 0.45, 0);
      const gb = new THREE.MeshLambertMaterial({ color: "#cfe6f0", transparent: true, opacity: 0.16, depthWrite: false }); part(this.mermaid, new THREE.BoxGeometry(1.1, 0.8, 0.6), gb, 0, 1.3, 0);
      const fig = M("pfMerm", "#5a4030"), tail = M("pfTail", "#7a8a6a");
      part(this.mermaid, new THREE.SphereGeometry(0.09, 12, 10), fig, -0.25, 1.22, 0); part(this.mermaid, new THREE.CylinderGeometry(0.06, 0.09, 0.2, 10), fig, -0.25, 1.06, 0);
      const tl = part(this.mermaid, new THREE.ConeGeometry(0.08, 0.5, 10), tail, 0.02, 1.0, 0); tl.rotation.z = Math.PI / 2 + 0.2;
      const lb = new Board(0.9, 0.22, "pf_merm", () => signTex("pf_merm", "FEEJEE MERMAID", "#f6efdc", "#1d1b22")); lb.group.position.set(0, 0.7, -0.37); this.mermaid.add(lb.group);
    }
    // a bed and a candle on a stool (night)
    part(this.bed, new THREE.BoxGeometry(2.3, 0.3, 1.2), wood, 0, 0.3, 1.5); part(this.bed, new THREE.BoxGeometry(2.2, 0.26, 1.1), M("pfSheet", "#f4f0e6"), 0, 0.58, 1.5);
    part(this.bed, new THREE.BoxGeometry(0.5, 0.12, 0.8), M("pfPillow", "#fffaf0"), 0.75, 0.77, 1.5); part(this.bed, new THREE.BoxGeometry(1.2, 0.08, 1.14), M("pfQuilt", "#7a5ac9"), -0.5, 0.74, 1.5);
    part(this.candle, new THREE.CylinderGeometry(0.22, 0.22, 0.6, 14), wood, 0, 0.3, 0); part(this.candle, new THREE.CylinderGeometry(0.1, 0.12, 0.03, 14), M("pfDish", "#b9b3a8"), 0, 0.615, 0); part(this.candle, new THREE.CylinderGeometry(0.025, 0.025, 0.16, 10), M("pfWax", "#fffaf0"), 0, 0.71, 0);
    this.flame = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex(), color: new THREE.Color(3.2, 2.0, 0.6), blending: THREE.AdditiveBlending, depthWrite: false, transparent: true })); this.flame.scale.set(0.16, 0.28, 1); this.flame.position.set(0, 0.84, 0); this.flame.layers.set(NOINK); this.candle.add(this.flame);
    // a daguerreotype camera: a box on a tripod, a brass lens toward -z
    {
      part(this.dag, new THREE.BoxGeometry(0.42, 0.34, 0.5), M("pfCamBox", "#6b4a2f"), 0, 1.45, 0); const ln = part(this.dag, new THREE.CylinderGeometry(0.07, 0.07, 0.2, 14), gold, 0, 1.47, 0.33); ln.rotation.x = Math.PI / 2;
      for (const a of [0, 2.1, 4.2]) { const lg = part(this.dag, new THREE.CylinderGeometry(0.02, 0.025, 1.36, 6), wood, 0.28 * Math.sin(a), 0.64, 0.28 * Math.cos(a)); lg.rotation.set(-0.2 * Math.cos(a), 0, 0.2 * Math.sin(a)); }
    }
    this.map = new THREE.Mesh(new THREE.PlaneGeometry(0.9, 0.9), lam("pfMapM", () => ({ map: mapTex() }))); this.map.rotation.x = -Math.PI / 2;
    for (const [G, p] of [[this.table, Rm(0, 0, 0)], [this.telegraph, Rm(0, 0, 0)], [this.shelf, Rm(0, 0, 3.15)], [this.wires, Rm(0, 0, 3.2)], [this.magnet, Rm(-3.2, 0, 1.6)], [this.beds, Rm(0, 0, 0)], [this.basin, Rm(3.6, 0, 1.0)],
      [this.mermaid, Rm(0, 0, 1.6)], [this.bed, Rm(0, 0, 0)], [this.candle, Rm(1.8, 0, 1.4)], [this.dag, Rm(-0.3, 0, -1.2)]] as [THREE.Group, V3][]) { G.position.set(...p); shadowAll(G); G.visible = false; R.add(G); }
    this.map.position.set(...Rm(0.5, 0.81, 0.6)); this.map.visible = false; R.add(this.map);

    // ---------------- the phone ----------------
    part(this.phone, new THREE.BoxGeometry(0.075, 0.155, 0.009), M("pfPhone", "#1d1b22"), 0, 0, 0);
    this.screen = part(this.phone, new THREE.PlaneGeometry(0.068, 0.146), unlit("pfScreen_80", () => screenTex("80")), 0, 0, -0.0052); this.screen.rotation.y = Math.PI; this.screen.layers.set(NOINK);
    this.phoneGlow = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex(), color: new THREE.Color(0.5, 0.65, 1.0), blending: THREE.AdditiveBlending, depthWrite: false, transparent: true })); this.phoneGlow.scale.setScalar(0.5); this.phoneGlow.position.set(0, 0, -0.05); this.phoneGlow.layers.set(NOINK); this.phone.add(this.phoneGlow);
    this.phone.visible = false; R.add(this.phone);

    this.rnum = new Board(1.9, 1.2, "num_x", () => numTex("x")); R.add(this.rnum.group);
    this.papers = new Cards(R, paperTex(), 20, 0.4); this.notes = new Cards(R, noteTex(), 10, 0.4); this.hats = new Cards(R, hatTex(), 20, 0.5); this.tickets = new Cards(R, ticketTex(), 4, 0.4);
    // Castle Garden: a stage across the back (x -4..4, z 1.6..3.4, 0.7 high) with a rostrum, five rows of benches facing it
    part(this.hall, new THREE.BoxGeometry(8, 0.7, 1.8), M("pfStage", "#7a5236"), 0, 0.35, 2.5); part(this.hall, new THREE.BoxGeometry(8.1, 0.06, 1.9), wood, 0, 0.73, 2.5);
    part(this.hall, new THREE.BoxGeometry(0.9, 0.55, 0.5), M("pfRostrum", "#5a3b2a"), 0, 1.0, 2.2);
    for (let r = 0; r < 5; r++) for (const sx of [-1, 1]) { const x = sx * 2.3, z = 0.6 - r * 1.25; part(this.hall, new THREE.BoxGeometry(3.4, 0.08, 0.4), M("pfBench", "#8a5a3a"), x, 0.45, z); part(this.hall, new THREE.BoxGeometry(3.4, 0.5, 0.06), M("pfBench", "#8a5a3a"), x, 0.7, z - 0.22); for (const lx of [-1.5, 1.5]) part(this.hall, new THREE.BoxGeometry(0.08, 0.45, 0.36), wood, x + lx, 0.22, z); }
    this.hall.position.set(...Rm(0, 0, 0)); shadowAll(this.hall); this.hall.visible = false; R.add(this.hall);
    this.news = new Board(0.9, 0.67, "news_pf0", () => newsTex("pf0", "The Herald", "JENNY LIND", "TICKETS")); this.news.group.visible = false; R.add(this.news.group);
    // a heap of top hats
    { const hatM = M("pfHatBlack", "#1d1b22"), band = M("pfHatBand", "#c9373a");
      for (let i = 0; i < 14; i++) { const h = new THREE.Group(); part(h, new THREE.CylinderGeometry(0.11, 0.12, 0.2, 14), hatM, 0, 0.1, 0); part(h, new THREE.CylinderGeometry(0.19, 0.19, 0.02, 16), hatM, 0, 0.01, 0); part(h, new THREE.CylinderGeometry(0.122, 0.122, 0.04, 14), band, 0, 0.04, 0);
        const ring = i < 6 ? 0 : i < 11 ? 1 : 2, k = ring === 0 ? i : ring === 1 ? i - 6 : i - 11, n = [6, 5, 3][ring], a = (k / n) * Math.PI * 2 + ring;
        h.position.set(Math.cos(a) * [0.42, 0.26, 0.1][ring], ring * 0.19, Math.sin(a) * [0.42, 0.26, 0.1][ring]); h.rotation.set(0.25 * Math.sin(i * 1.7), i, 0.25 * Math.cos(i * 2.3)); this.pile.add(h); this.pileHats.push(h); }
      shadowAll(this.pile); this.pile.visible = false; R.add(this.pile); }
  }

  private shotSun(id: number, L: LightPreset, sample: (f: number) => { pos: V3; look: V3 }, a: number, b: number) {
    let v = this.sunCache.get(id);
    if (v) return v;
    let fx = 0, fz = 0;
    for (let f = a; f < b; f += 3) { const c = sample(f), x = c.look[0] - c.pos[0], z = c.look[2] - c.pos[2], n = Math.hypot(x, z) || 1; fx += x / n; fz += z / n; }
    const n = Math.hypot(fx, fz) || 1; fx /= n; fz /= n;
    const az = THREE.MathUtils.degToRad(L.az), el = THREE.MathUtils.degToRad(L.el);
    const hx = fx * Math.cos(az) - fz * Math.sin(az), hz = fz * Math.cos(az) + fx * Math.sin(az);
    v = new THREE.Vector3(hx * Math.cos(el), Math.sin(el), hz * Math.cos(el)).normalize();
    this.sunCache.set(id, v);
    return v;
  }
  private actor(i: number) { while (this.actors.length <= i) this.actors.push(new Actor(this.root)); return this.actors[i]; }
  private fx(i: number) { while (this.fxs.length <= i) this.fxs.push(new Fx(this.root)); return this.fxs[i]; }

  /** pose the world for shot `id` (spec st) at frame f; sample(f) gives the shot's camera at any frame (for the sun) */
  update(id: number, st: St3, f: number, cam: THREE.PerspectiveCamera, scene: THREE.Scene, sample: (f: number) => { pos: V3; look: V3 }, a: number, b: number) {
    const t = f / FPS, light: Light = st.light, L = LP[light], K = LK[light];
    const c = st.cam;
    cam.position.set(...c.pos); cam.up.set(0, 1, 0); cam.lookAt(...c.look); cam.rotateZ(c.roll);
    cam.fov = c.fov; cam.near = 0.03; cam.far = 4000; cam.updateProjectionMatrix(); cam.updateMatrixWorld();
    const focus = V(...(st.focus ?? c.look)), dist = cam.position.distanceTo(focus);
    cam.layers.enable(NOINK);
    // ---- lights ----
    const sunDir = this.shotSun(id, L, sample, a, b);
    this.hemi.color.set(L.sky); this.hemi.groundColor.set(L.ground); this.hemi.intensity = L.hemiI;
    this.sun.color.set(L.sunCol); this.sun.intensity = L.sunI;
    let Rr = THREE.MathUtils.clamp(dist * 1.15 + 7, 12, 260);
    if (light === "golden") Rr = Math.max(Rr, 30);
    this.sun.position.copy(focus).addScaledVector(sunDir, 420); this.sun.target.position.copy(focus);
    const sc = this.sun.shadow.camera;
    sc.left = -Rr; sc.right = Rr; sc.top = Rr; sc.bottom = -Rr; sc.near = 20; sc.far = 900; sc.updateProjectionMatrix();
    this.sun.shadow.bias = L.bias; this.sun.shadow.normalBias = L.normalBias * (Rr / 12);
    TONE.uLitCol.value.set(...L.lit); TONE.uShadeCol.value.set(...L.shade); TONE.uShadeLift.value.set(...L.lift);
    TONE.uLambert.value = L.lambert; TONE.uSideK.value = L.sideK; TONE.uTerm.value = L.term; TONE.uBounce.value.set(...K.bounce); TONE.uSat.value = K.sat;
    CHAR.uCharTint.value.set(...L.charTint); CHAR.uCharShade.value = L.charShade; CHAR.uGrad.value = L.charGrad;
    CHAR.uBodyGrad.value = L.bodyGrad; CHAR.uSideTint.value.set(...L.sideTint);
    const su = this.skyMat.uniforms;
    K.sky.c.forEach((h, i) => untone(h, su["c" + i].value));
    const e = K.sky.e.map((deg) => THREE.MathUtils.degToRad(deg)); su.e.value.set(e[1], e[2], e[3], e[4]);
    this.sky.position.copy(cam.position); this.stars.position.copy(cam.position); this.stars.visible = light === "night";
    untone(L.fog, this.fog.color); this.fog.near = L.fogNear; this.fog.far = L.fogFar; scene.fog = this.fog; scene.background = null;
    this.sunDisc.visible = light === "golden";
    if (this.sunDisc.visible) { this.sunDisc.position.copy(cam.position).addScaledVector(sunDir, 1500); this.sunDisc.scale.setScalar(2 * 1500 * Math.tan(THREE.MathUtils.degToRad(1.7))); }
    for (let i = 0; i < this.clouds.length; i++) { const m = this.clouds[i]; m.visible = light !== "night"; m.position.set(cam.position.x + this.cloudHome[i].x, this.cloudHome[i].y, cam.position.z + this.cloudHome[i].z); m.lookAt(cam.position.x, m.position.y, cam.position.z); (m.material as THREE.MeshBasicMaterial).map = this.cloudMaps[light][i % 4]; }
    const W = this.WU, wc = K.water;
    untone(wc.near, W.wNearC.value); untone(wc.mid, W.wMidC.value); untone(wc.far, W.wFarC.value);
    untone(wc.crest, W.wCrest.value); untone(wc.trough, W.wTrough.value); untone(wc.glint, W.wGlint.value);
    (W.wShade.value as THREE.Vector3).set(...wc.shade); W.wFlow.value = 0.25 * t; W.wCalm.value = light === "night" ? 0.45 : 0.8;
    const lit = light === "night" ? [3.2, 2.4, 1.1] : light === "golden" ? [1.7, 1.1, 0.55] : light === "fog" ? [0.22, 0.24, 0.2] : [0.16, 0.22, 0.32];
    this.winMat.color.setRGB(lit[0], lit[1], lit[2]);

    // ---- the ship ----
    const shp = st.ship ?? {};
    this.ship.position.x = shp.x ?? 0;
    const sm = shp.smoke ?? 0.6;
    this.smoke.forEach((s, i) => { const u = ((t * 0.18 + i / this.smoke.length) % 1); s.visible = sm > 0.01; s.position.set(2 + (shp.x ?? 0) - u * 18, SHIP.deck + 15 + u * 14, 18 + Math.sin(i * 2.3) * 2 * u); s.scale.setScalar((3 + u * 10) * (0.6 + 0.4 * sm)); (s.material as THREE.SpriteMaterial).opacity = (1 - u) * 0.8 * sm; });

    // ---- the room ----
    const rm = st.room;
    if (rm) { const [key, text] = rm.sign; const mat = lam(`sign_${key}`, () => ({ map: signTex(key, text, "#2f2a3a", "#e8c45a") })); if (this.roomSign.material !== mat) this.roomSign.material = mat; }
    this.table.visible = !!rm?.table; this.telegraph.visible = !!rm?.telegraph; this.shelf.visible = (rm?.jars ?? 0) > 0; this.wires.visible = !!rm?.wires;
    this.jars.forEach((j, i) => { j.visible = i < (rm?.jars ?? 0); this.jarGlow[i].visible = i < (rm?.jarsLit ?? 0); if (this.jarGlow[i].visible) this.jarGlow[i].scale.setScalar(0.24 + 0.04 * Math.sin(t * 9 + i)); });
    this.magnet.visible = !!rm?.magnet; this.beds.visible = !!rm?.beds; this.basin.visible = !!rm?.basin; this.mermaid.visible = !!rm?.mermaid;
    this.bed.visible = !!rm?.bed; this.candle.visible = (rm?.candle ?? 0) > 0; this.flame.scale.set(0.16 * (rm?.candle ?? 1) * (1 + 0.08 * Math.sin(t * 13)), 0.28 * (rm?.candle ?? 1) * (1 + 0.1 * Math.sin(t * 17)), 1);
    this.dag.visible = !!rm?.daguerre; this.map.visible = !!rm?.map; this.hall.visible = !!rm?.hall;
    const nw = st.news;
    this.news.group.visible = !!nw;
    if (nw) { const nm = lam(`news_${nw.text.join("_")}`, () => ({ map: newsTex(nw.text.join("_"), nw.text[0], nw.text[1], nw.text[2]) })); if (this.news.face.material !== nm) this.news.face.material = nm;
      this.news.group.position.set(...nw.p); this.news.group.quaternion.copy(cam.quaternion); this.news.group.rotateY(Math.PI); this.news.group.rotateZ(nw.spin ?? 0); this.news.group.scale.setScalar(nw.s); }
    this.pile.visible = !!st.pile; if (st.pile) { this.pile.position.set(...st.pile.p); this.pileHats.forEach((h, i) => { h.visible = i < st.pile!.n; }); }
    // ---- the phone ----
    const ph = st.phone;
    this.phone.visible = !!ph;
    if (ph) {
      this.phone.position.set(...ph.p); this.phone.scale.setScalar(ph.s ?? 1);
      if (ph.face === undefined || ph.face === "cam") { this.phone.lookAt(cam.position); this.phone.rotateY(Math.PI); } else this.phone.rotation.set(0, ph.face, 0);
      this.phone.rotateX(ph.tilt ?? 0);
      const sm2 = unlit(`pfScreen_${ph.screen}`, () => screenTex(ph.screen)); if (this.screen.material !== sm2) this.screen.material = sm2;
      const gk = ph.glow ?? (ph.screen === "black" ? 0 : light === "night" ? 1 : 0); this.phoneGlow.visible = gk > 0.01; this.phoneGlow.scale.setScalar(0.5 * gk);
    }
    const rn = st.num;
    if (rn) { this.rnum.face.material = unlit(`num_${rn.text}_${rn.bg ?? ""}_${rn.fg ?? ""}`, () => numTex(rn.text, rn.bg, rn.fg)); this.rnum.group.position.set(...rn.p); this.rnum.group.rotation.y = rn.yaw ?? 0; }
    this.rnum.group.visible = !!rn && (rn.k ?? 1) > 0.001; this.rnum.group.scale.set(Math.max(0.001, rn ? (rn.k ?? 1) * (rn.w ?? 1) : 1), Math.max(0.001, rn ? rn.k ?? 1 : 1), 1);
    // ---- cards ----
    this.papers.hide(); this.notes.hide(); this.hats.hide(); this.tickets.hide();
    let np = 0, nn = 0, nh = 0, nt = 0;
    for (const cd of st.cards ?? []) {
      if (cd.kind === "paper") { this.papers.put(np, V(...cd.p), cam, cd.spin, cd.s, cd.flat); this.papers.list[np++]?.scale.set(cd.s, cd.s * 1.25, 1); }
      else if (cd.kind === "note") { this.notes.put(nn, V(...cd.p), cam, cd.spin, cd.s, cd.flat); this.notes.list[nn++]?.scale.set(cd.s, cd.s * 0.5, 1); }
      else if (cd.kind === "ticket") { this.tickets.put(nt, V(...cd.p), cam, cd.spin, cd.s, cd.flat); this.tickets.list[nt++]?.scale.set(cd.s, cd.s * 0.5, 1); }
      else this.hats.put(nh++, V(...cd.p), cam, cd.spin, cd.s, cd.flat);
    }

    // ---- cast ----
    this.frustum.setFromProjectionMatrix(this.m4.multiplyMatrices(cam.projectionMatrix, cam.matrixWorldInverse));
    const right = V(0, 0, 0).setFromMatrixColumn(cam.matrixWorld, 0);
    const lightA = Math.round(Math.atan2(-sunDir.y, sunDir.dot(right)) / (Math.PI / 4)) * (Math.PI / 4);
    const blink = (seed: number) => { const n = Math.floor((t + seed * 0.37) / 2.3), ph2 = (t + seed * 0.37) - n * 2.3; return ph2 < 0.13 ? 1 : 0; };
    const people = (st.people ?? []).map((q) => ({ q, w: OUT[q.who] ?? OUT.c0 }));
    this.lastPeople = people.map(({ q }) => ({ name: q.who, p: q.p, walking: !!q.side, low: !!q.low, extra: !!q.extra }));
    let ai = 0;
    for (const { q, w } of people) {
      if (!this.frustum.intersectsSphere(this.sph.set(this.v.set(q.p[0], q.p[1] + 1.1, q.p[2]), 3.5))) continue;
      const d = cam.position.distanceTo(this.v.set(q.p[0], q.p[1] + 1.2, q.p[2]));
      const [cw, ch, kk] = tier(d), act = this.actor(ai++), bl = blink(w.seed);
      const mirror = !!q.side && (q.side.mirror !== (right.x < 0));
      const lt = mirror ? Math.PI - lightA : lightA;
      // hands: where each held point falls on this character's card, as seen from the camera
      let hr: [number, number] | undefined, hl: [number, number] | undefined;
      if (q.hw && !q.side) {
        const o3 = V(...q.p), nx = cam.position.x - q.p[0], nz = cam.position.z - q.p[2], nl2 = Math.hypot(nx, nz) || 1, n3 = V(nx / nl2, 0, nz / nl2), crs = V(n3.z, 0, -n3.x);
        const onCard = (wp: THREE.Vector3): [number, number] => { const dir = wp.clone().sub(cam.position), tt = o3.clone().sub(cam.position).dot(n3) / dir.dot(n3), pc = cam.position.clone().addScaledVector(dir, tt); return [pc.clone().sub(o3).dot(crs), pc.y - q.p[1]]; };
        for (const hwp of q.hw) { const hc = onCard(V(...hwp)); if ((hc[0] >= 0 && !hr) || hl) hr = hc; else hl = hc; }
      }
      const hk = hr || hl ? [hr, hl].flat().map((x) => (x ?? 9).toFixed(2)).join(",") : "";
      const hands = hr || hl ? { r: hr ? [300 + hr[0] / SUc, 975 - hr[1] / SUc] as [number, number] : undefined, l: hl ? [300 + hl[0] / SUc, 975 - hl[1] / SUc] as [number, number] : undefined } : undefined;
      const key = q.side
        ? `S|${w.key}|${q.expr}|${Math.round(q.side.phase * 16)}|${bl}|${lt.toFixed(2)}`
        : `F|${w.key}|${q.expr}|${q.look ?? 0}|${(q.headTilt ?? 0).toFixed(2)}|${q.facing ?? 0}|${bl}|${q.wave ?? "-"}|${hk}|${lt.toFixed(2)}`;
      act.r = this.pool.req(key, cw, ch, kk, (p: Pen) => q.side
        ? bodySide(p, w.o, { mode: "march", phase: Math.round(q.side.phase * 16) / 16, expr: q.expr, blink: bl, stride: q.side.stride ?? 0.8, stomp: 0.4, light: lt, seed: w.seed })
        : bodyFront(p, w.o, { mode: "stand", expr: q.expr, look: q.look ?? 0, headTilt: q.headTilt ?? 0, facing: q.facing ?? 0, blink: bl, wave: hands ? undefined : q.wave, hands, light: lt, seed: w.seed }));
      act.mesh.visible = true;
      act.mesh.position.set(...q.p);
      act.mesh.rotation.set(0, Math.atan2(cam.position.x - q.p[0], cam.position.z - q.p[2]), 0);
      act.mesh.scale.set(mirror ? -1 : 1, 1, 1);
      act.mesh.castShadow = L.actorShadow;
    }
    for (let i = ai; i < this.actors.length; i++) this.actors[i].mesh.visible = false;
    // ---- contact shadows ----
    const cc = light === "night" ? "#5d6aa8" : light === "fog" ? "#7d8070" : "#8a8ab0";
    let fi = 0;
    for (const { q } of people) {
      if (q.low) continue;
      const pos: V3 = [q.p[0], q.p[1] + 0.022, q.p[2]];
      if (!this.frustum.intersectsSphere(this.sph.set(this.v.set(...pos), 0.6))) continue;
      const e2 = this.fx(fi++);
      e2.r = this.pool.req(`blob|contact|${cc}`, 128, 128, 1, (p) => fxContact(p, cc));
      e2.use(false); e2.mesh.visible = true; e2.mesh.position.set(...pos); e2.mesh.rotation.set(-Math.PI / 2, 0, 0); e2.mesh.scale.set(0.55, 0.42, 1);
    }
    for (let i = fi; i < this.fxs.length; i++) this.fxs[i].mesh.visible = false;
    this.pool.flush();
    for (const a2 of this.actors) if (a2.mesh.visible) a2.bind();
    for (const e3 of this.fxs) if (e3.mesh.visible) e3.bind();
    return focus;
  }
  /** framing checks for this frame (call right after update). Pure measurement, no drawing. */
  qa(st: St3, cam: THREE.PerspectiveCamera): string[] {
    const out: string[] = [], right = V(0, 0, 0).setFromMatrixColumn(cam.matrixWorld, 0), p = new THREE.Vector3();
    const box = (c: V3, x0: number, x1: number, y0: number, y1: number) => {
      let a = 9, b = -9, cc = 9, d = -9;
      for (const [dx, dy] of [[x0, y0], [x1, y0], [x0, y1], [x1, y1]]) {
        p.set(c[0], c[1] + dy, c[2]).addScaledVector(right, dx);
        if (p.clone().sub(cam.position).dot(cam.getWorldDirection(this.v)) < 0.15) return { frac: -1, h: 9, vcut: true, inX: true };
        p.project(cam); a = Math.min(a, p.x); b = Math.max(b, p.x); cc = Math.min(cc, p.y); d = Math.max(d, p.y);
      }
      const ix = Math.max(0, Math.min(b, 1) - Math.max(a, -1)), iy = Math.max(0, Math.min(d, 1) - Math.max(cc, -1));
      return { frac: (ix * iy) / Math.max(1e-6, (b - a) * (d - cc)), h: d - cc, vcut: cc < -1 || d > 1, inX: b > -1 && a < 1 };
    };
    for (const q of this.lastPeople) {
      if (q.extra) continue;
      const head = box(q.p, -0.27, 0.27, 1.16, 1.84), body = box(q.p, -0.3, 0.3, q.low ? 1.0 : 0.05, 1.16);
      if (head.frac < 0 && body.frac !== 0) out.push(`${q.name}: too close to the camera`);
      else if (head.frac > 0.02 && head.frac < 0.97 && (!q.walking || (head.vcut && head.inX))) out.push(`${q.name}: head cut off by the frame edge (${Math.round(head.frac * 100)}% in shot)`);
      else if (head.frac <= 0.02 && body.frac > 0.12) out.push(`${q.name}: body in shot without the head`);
      if (head.frac > 0.02 && head.h > 1.6 && !st.closeup) out.push(`${q.name}: face fills the screen`);
    }
    for (const [name, at, r] of st.subjects ?? []) {
      const v3 = V(...at);
      p.copy(v3).project(cam);
      if (p.z > 1 || Math.abs(p.x) > 0.92 || Math.abs(p.y) > 0.9) { out.push(`${name}: not in shot`); continue; }
      if (p.y < -0.48 && Math.abs(p.x) < 0.6) out.push(`${name}: under the subtitles`);
      const dir = v3.clone().sub(cam.position), dist = dir.length();
      this.ray.set(cam.position, dir.normalize()); this.ray.far = dist; this.ray.layers.set(0);
      const hit = this.ray.intersectObject(this.root, true).find((h) => {
        const m = h.object as THREE.Mesh, mat = m.material as THREE.Material;
        let o: THREE.Object3D | null = m; while (o) { if (!o.visible) return false; o = o.parent; }
        return !(Array.isArray(mat) ? false : mat.transparent || (mat as THREE.Material & { alphaTest?: number }).alphaTest > 0) && h.object !== this.sky && (h.object as THREE.Points).isPoints !== true;
      });
      if (hit && hit.distance < dist - r) out.push(`${name}: hidden behind something ${(dist - hit.distance).toFixed(2)} m in front of it`);
    }
    return out;
  }
}
