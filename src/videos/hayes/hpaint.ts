// Painted textures for the Frank Hayes Short. Sets carry no ink line (background rules), so nothing here is outlined
// except the signs' lettering and the characters' own props.
import { ctex } from "../bridge/paint";

/** turf: mown stripes, a little clover and wear */
export const turfTex = () => ctex("hsTurf", 1024, 1024, (g, r) => {
  g.fillStyle = "#4f8a34"; g.fillRect(0, 0, 1024, 1024);
  for (let x = 0; x < 1024; x += 128) { g.fillStyle = (x / 128) % 2 ? "rgba(255,255,220,0.06)" : "rgba(0,30,0,0.06)"; g.fillRect(x, 0, 128, 1024); }
  for (let i = 0; i < 9000; i++) { const c = r(); g.fillStyle = c > 0.6 ? "rgba(120,170,70,0.35)" : c > 0.3 ? "rgba(40,80,30,0.3)" : "rgba(160,190,90,0.25)"; g.fillRect(r() * 1024, r() * 1024, 2 + r() * 3, 5 + r() * 6); }
  for (let i = 0; i < 40; i++) { g.fillStyle = "rgba(120,100,60,0.12)"; g.beginPath(); g.ellipse(r() * 1024, r() * 1024, 10 + r() * 30, 4 + r() * 8, r() * 3, 0, 6.3); g.fill(); }
});
/** the dirt main track: harrowed lines along it, hoof prints */
export const dirtTex = () => ctex("hsDirt", 1024, 1024, (g, r) => {
  g.fillStyle = "#a07a52"; g.fillRect(0, 0, 1024, 1024);
  for (let y = 0; y < 1024; y += 10) { g.fillStyle = r() > 0.5 ? "rgba(255,230,190,0.08)" : "rgba(60,40,20,0.1)"; g.fillRect(0, y + r() * 4, 1024, 3); }
  for (let i = 0; i < 600; i++) { g.fillStyle = "rgba(70,48,28,0.25)"; g.beginPath(); g.ellipse(r() * 1024, r() * 1024, 5, 3.5, 0, 0, 6.3); g.fill(); }
  for (let i = 0; i < 5000; i++) { g.fillStyle = r() > 0.5 ? "rgba(250,220,170,0.25)" : "rgba(60,40,25,0.25)"; g.fillRect(r() * 1024, r() * 1024, 2, 2); }
});
/** a steeplechase brush fence's face: packed birch brush, darker at the base */
export const brushTex = () => ctex("hsBrush", 512, 256, (g, r) => {
  const gr = g.createLinearGradient(0, 0, 0, 256); gr.addColorStop(0, "#6a7a3a"); gr.addColorStop(1, "#3a4a22"); g.fillStyle = gr; g.fillRect(0, 0, 512, 256);
  for (let i = 0; i < 1400; i++) { const x = r() * 512, y = r() * 256, h = 14 + r() * 40; g.strokeStyle = r() > 0.5 ? "rgba(140,150,80,0.5)" : "rgba(40,50,20,0.5)"; g.lineWidth = 1.5 + r() * 2; g.beginPath(); g.moveTo(x, y); g.lineTo(x + (r() - 0.5) * 8, y - h); g.stroke(); }
  for (let x = 0; x < 512; x += 6) { g.fillStyle = "rgba(220,230,170,0.35)"; g.fillRect(x + r() * 4, r() * 10, 2, 8 + r() * 10); }   // the ragged top
});
/** the grandstand crowd, 1923: rows of faces under straw boaters, felt hats and cloches; jackets, a few parasols */
export const crowdTex = (key: string, rows = 12) => ctex("hsCrowd_" + key, 2048, 1024, (g, r) => {
  g.fillStyle = "#3a3430"; g.fillRect(0, 0, 2048, 1024);
  const rh = 1024 / rows, coats = ["#2a2e3a", "#4a4038", "#6a5a48", "#e8e2d4", "#3a4a5a", "#7a3a34", "#5a6a4a", "#d8ccb4", "#2a2a2a"], skins = ["#f0d0b0", "#e0b48c", "#c8946a", "#f4dcc4", "#a8744c"];
  for (let row = 0; row < rows; row++) { const y = row * rh;
    g.fillStyle = row % 2 ? "#4a423a" : "#544a40"; g.fillRect(0, y + rh * 0.78, 2048, rh * 0.22);   // the bench edge
    for (let x = -10; x < 2060; x += rh * (0.46 + 0.1 * r())) { const s = rh * (0.4 + 0.08 * r()), cx = x + r() * 6, by = y + rh * 0.82;
      g.fillStyle = coats[Math.floor(r() * coats.length)]; g.beginPath(); g.ellipse(cx, by, s * 0.55, s * 0.62, 0, Math.PI, 0); g.fill();
      if (r() > 0.6) { g.fillStyle = "#f2eee4"; g.fillRect(cx - s * 0.08, by - s * 0.58, s * 0.16, s * 0.3); }   // a shirt front
      const hy = by - s * 0.78; g.fillStyle = skins[Math.floor(r() * skins.length)]; g.beginPath(); g.ellipse(cx, hy, s * 0.25, s * 0.3, 0, 0, 6.3); g.fill();
      const h = r(); if (h < 0.45) { g.fillStyle = "#e6d29a"; g.fillRect(cx - s * 0.38, hy - s * 0.28, s * 0.76, s * 0.07); g.fillRect(cx - s * 0.24, hy - s * 0.48, s * 0.48, s * 0.21); g.fillStyle = "#2a2a3a"; g.fillRect(cx - s * 0.24, hy - s * 0.32, s * 0.48, s * 0.05); }
      else if (h < 0.75) { g.fillStyle = ["#3a3430", "#5a4a3a", "#2a2e3a"][Math.floor(r() * 3)]; g.beginPath(); g.ellipse(cx, hy - s * 0.26, s * 0.36, s * 0.07, 0, 0, 6.3); g.fill(); g.beginPath(); g.ellipse(cx, hy - s * 0.34, s * 0.24, s * 0.16, 0, Math.PI, 0); g.fill(); }
      else if (h < 0.92) { g.fillStyle = ["#a8485a", "#4a6a8a", "#c9a46a", "#6a4a7a"][Math.floor(r() * 4)]; g.beginPath(); g.ellipse(cx, hy - s * 0.12, s * 0.3, s * 0.26, 0, Math.PI, 0); g.fill(); }
      else { g.fillStyle = "#4a3428"; g.beginPath(); g.ellipse(cx, hy - s * 0.1, s * 0.27, s * 0.22, 0, Math.PI, 0); g.fill(); } }
  }
});
/** the scale's dial, 0-200 lb, a red mark at 130 */
export const dialTex = () => ctex("hsDial", 1024, 1024, (g) => {
  g.fillStyle = "#2a2622"; g.beginPath(); g.arc(512, 512, 500, 0, 6.3); g.fill();
  g.fillStyle = "#f4efe2"; g.beginPath(); g.arc(512, 512, 470, 0, 6.3); g.fill();
  const ang = (lb: number) => -Math.PI * 0.75 + (lb / 200) * Math.PI * 1.5 - Math.PI / 2;
  g.strokeStyle = "#e0332e"; g.lineWidth = 34; g.beginPath(); g.arc(512, 512, 400, ang(128), ang(132)); g.stroke();
  for (let lb = 0; lb <= 200; lb += 2) { const a = ang(lb), big = lb % 10 === 0, r0 = big ? 360 : 395; g.strokeStyle = "#120c16"; g.lineWidth = big ? 9 : 4;
    g.beginPath(); g.moveTo(512 + Math.cos(a) * r0, 512 + Math.sin(a) * r0); g.lineTo(512 + Math.cos(a) * 440, 512 + Math.sin(a) * 440); g.stroke();
    if (lb % 20 === 0) { g.fillStyle = "#120c16"; g.font = "900 64px Montserrat, sans-serif"; g.textAlign = "center"; g.textBaseline = "middle"; g.fillText(String(lb), 512 + Math.cos(a) * 290, 512 + Math.sin(a) * 290); } }
  g.fillStyle = "#e0332e"; g.font = "900 70px Montserrat, sans-serif"; g.textAlign = "center"; g.fillText("130", 512 + Math.cos(ang(130)) * 205, 512 + Math.sin(ang(130)) * 205);
  g.fillStyle = "#120c16"; g.font = "900 58px Montserrat, sans-serif"; g.fillText("POUNDS", 512, 700);
});
/** the scale's needle angle (radians, about the dial's axis) for a weight */
export const needleAt = (lb: number) => -Math.PI * 0.75 + (lb / 200) * Math.PI * 1.5;   // seen from the -z side, +z rotation turns clockwise
/** weathered limestone for the headstones */
export const stoneTex = () => ctex("hsStone", 512, 512, (g, r) => {
  g.fillStyle = "#b8b4aa"; g.fillRect(0, 0, 512, 512);
  for (let i = 0; i < 3000; i++) { g.fillStyle = r() > 0.5 ? "rgba(255,255,250,0.12)" : "rgba(60,60,50,0.12)"; g.fillRect(r() * 512, r() * 512, 2 + r() * 3, 2 + r() * 3); }
  for (let i = 0; i < 30; i++) { g.fillStyle = "rgba(90,110,60,0.15)"; g.beginPath(); g.ellipse(r() * 512, 400 + r() * 112, 20 + r() * 40, 8 + r() * 20, 0, 0, 6.3); g.fill(); }
});
/** a stall's back wall / the barn: whitewashed boards */
export const boardsTex = (key: string, col: string) => ctex("hsBoards_" + key, 1024, 1024, (g, r) => {
  g.fillStyle = col; g.fillRect(0, 0, 1024, 1024);
  for (let x = 0; x < 1024; x += 64) { g.fillStyle = "rgba(40,30,20,0.25)"; g.fillRect(x, 0, 3, 1024); for (let i = 0; i < 30; i++) { g.fillStyle = r() > 0.5 ? "rgba(255,250,240,0.07)" : "rgba(60,40,20,0.08)"; g.fillRect(x + 4 + r() * 56, r() * 1024, 1 + r() * 2, 20 + r() * 80); } }
});
/** straw bedding */
export const strawTex = () => ctex("hsStraw", 512, 512, (g, r) => {
  g.fillStyle = "#c9a85a"; g.fillRect(0, 0, 512, 512);
  for (let i = 0; i < 2500; i++) { const x = r() * 512, y = r() * 512, a = r() * 3.14, l = 10 + r() * 24; g.strokeStyle = r() > 0.5 ? "rgba(240,210,130,0.6)" : "rgba(130,100,40,0.45)"; g.lineWidth = 1.5; g.beginPath(); g.moveTo(x, y); g.lineTo(x + Math.cos(a) * l, y + Math.sin(a) * l); g.stroke(); }
});
