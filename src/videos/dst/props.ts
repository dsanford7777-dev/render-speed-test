// Props and painted textures for the daylight saving short, in the same look as the Fahrenheit short: two-tone lam()
// materials, hand-painted canvas textures, ink outlines on the shapes, flat bold cartoon colours.
import * as THREE from "three";
import { lam, V, boxGeo, Batch } from "../bridge/build";
import { ctex, rep, beam, stoneHD, roofHD } from "../bridge/paint";
import { twoTone } from "../bridge/shade";
import { NOINK } from "../bridge/ink";

export const INK = "#241726";
const font = (px: number, w = 900) => `${w} ${px}px "DejaVu Sans", "Arial Black", Arial, sans-serif`;
/** big hand-painted word: fill + thick ink outline */
export const paintText = (g: CanvasRenderingContext2D, s: string, x: number, y: number, px: number, fill: string, align: CanvasTextAlign = "center", ol = 0.16) => {
  g.font = font(px); g.textAlign = align; g.textBaseline = "middle"; g.lineJoin = "round";
  g.lineWidth = px * ol; g.strokeStyle = INK; g.strokeText(s, x, y);
  g.fillStyle = fill; g.fillText(s, x, y);
};
const lathe = (pts: [number, number][], seg = 28) => new THREE.LatheGeometry(pts.map(([r, y]) => new THREE.Vector2(r, y)), seg);
const shadowAll = <T extends THREE.Object3D>(g: T): T => { g.traverse((o) => { o.castShadow = true; o.receiveShadow = true; }); return g; };

// ---------------- clock ----------------
const clockFace = (stamp: boolean) => ctex(`clockFace_${stamp}`, 512, 512, (g) => {
  g.fillStyle = "#f6efdc"; g.beginPath(); g.arc(256, 256, 250, 0, Math.PI * 2); g.fill();
  g.lineWidth = 18; g.strokeStyle = INK; g.beginPath(); g.arc(256, 256, 238, 0, Math.PI * 2); g.stroke();
  for (let h = 1; h <= 12; h++) {
    const a = (h / 12) * Math.PI * 2;
    paintText(g, String(h), 256 + Math.sin(a) * 185, 256 - Math.cos(a) * 185, h >= 10 ? 62 : 70, "#ffffff", "center", 0.2);
  }
  if (stamp) {
    g.save(); g.translate(256, 256); g.rotate(-0.38);
    g.fillStyle = "rgba(224,51,46,0.95)"; g.strokeStyle = INK; g.lineWidth = 12;
    g.beginPath(); g.roundRect(-235, -70, 470, 140, 18); g.fill(); g.stroke();
    paintText(g, "BANNED", 0, 4, 112, "#ffffff", "center", 0.12);
    g.restore();
  }
});
/** a wall/post clock facing -z (the cameras look along +z). setTime(hours as a float, e.g. 6.0 = six o'clock) */
export class Clock {
  group = new THREE.Group();
  private face: THREE.Mesh; private hourH = new THREE.Group(); private minH = new THREE.Group();
  constructor(public r: number, rim = "#b5462f") {
    const G = this.group;
    const body = new THREE.Mesh(new THREE.CylinderGeometry(r * 1.08, r * 1.08, r * 0.22, 40).rotateX(Math.PI / 2), lam(`clockRim_${rim}`, () => ({ color: rim })));
    this.face = new THREE.Mesh(new THREE.CircleGeometry(r, 48), lam("clockFace_false", () => ({ map: clockFace(false) })));
    this.face.rotation.y = Math.PI; this.face.position.z = -r * 0.115;
    const ink = lam("clockHand", () => ({ color: INK }));
    const hb = new THREE.Mesh(new THREE.BoxGeometry(r * 0.09, r * 0.52, r * 0.03), ink); hb.position.y = r * 0.22; this.hourH.add(hb);
    const mb = new THREE.Mesh(new THREE.BoxGeometry(r * 0.06, r * 0.78, r * 0.03), ink); mb.position.y = r * 0.35; this.minH.add(mb);
    const cap = new THREE.Mesh(new THREE.CylinderGeometry(r * 0.07, r * 0.07, r * 0.05, 16).rotateX(Math.PI / 2), lam("brass", () => ({ color: "#d9a83a" })));
    for (const [h, z] of [[this.hourH, -r * 0.13], [this.minH, -r * 0.15]] as const) h.position.z = z;
    cap.position.z = -r * 0.17;
    G.add(body, this.face, this.hourH, this.minH, cap);
    shadowAll(G);
  }
  /** seen from -z, clockwise on screen is a rotation about +z */
  setTime(h: number) { this.hourH.rotation.z = ((h % 12) / 12) * Math.PI * 2; this.minH.rotation.z = (h % 1) * Math.PI * 2; }
  setStamp(on: boolean) { this.face.material = lam(`clockFace_${on}`, () => ({ map: clockFace(on) })); }
  facePos() { this.group.updateWorldMatrix(true, false); return this.group.localToWorld(new THREE.Vector3(0, 0, -this.r * 0.12)); }
}
/** clock on a wooden post, face at height hFace */
export const postClock = (r: number, hFace: number) => {
  const g = new THREE.Group(), c = new Clock(r);
  const post = new THREE.Mesh(new THREE.CylinderGeometry(r * 0.12, r * 0.15, hFace, 10), lam("poleWood", () => ({ color: "#7a5236" })));
  post.position.y = hFace / 2; c.group.position.y = hFace + r * 0.2; c.group.position.z = -r * 0.05;
  g.add(post, c.group); shadowAll(g);
  return { g, clock: c };
};

// ---------------- boards and signs ----------------
/** a painted board (w x h metres) on two legs; tex(key) gives the face, swapped per frame with setFace */
export class Board {
  group = new THREE.Group(); face: THREE.Mesh;
  constructor(public w: number, public h: number, key: string, draw: () => THREE.Texture, legs = 0) {
    const G = this.group;
    const back = new THREE.Mesh(new THREE.BoxGeometry(w + 0.08, h + 0.08, 0.06), lam("signWood", () => ({ color: "#5a3b2a" })));
    this.face = new THREE.Mesh(new THREE.PlaneGeometry(w, h), lam(key, () => ({ map: draw() })));
    this.face.rotation.y = Math.PI; this.face.position.z = -0.035;
    G.add(back, this.face);
    if (legs > 0) for (const sx of [-1, 1]) { const l = new THREE.Mesh(new THREE.BoxGeometry(0.08, legs, 0.08), lam("signWood", () => ({}))); l.position.set(sx * w * 0.38, -legs / 2 - h / 2, 0.02); G.add(l); }
    back.position.y = 0; this.face.position.y = 0;
    shadowAll(G);
  }
  setFace(key: string, draw: () => THREE.Texture) { this.face.material = lam(key, () => ({ map: draw() })); }
  pos(u = 0, v = 0) { this.group.updateWorldMatrix(true, false); return this.group.localToWorld(new THREE.Vector3(-u * this.w / 2, v * this.h / 2, -0.04)); }
}
export const milkSignTex = (late: boolean) => ctex(`milkSign_${late}`, 512, 384, (g) => {
  g.fillStyle = "#f6efdc"; g.fillRect(0, 0, 512, 384);
  g.lineWidth = 14; g.strokeStyle = INK; g.strokeRect(10, 10, 492, 364);
  paintText(g, "MILK TRAIN", 256, 82, 74, "#2f5fb5", "center", 0.12);
  paintText(g, "7:00", 256, 230, 150, "#ffffff", "center", 0.12);
  if (late) {
    g.strokeStyle = "#e0332e"; g.lineWidth = 22; g.lineCap = "round";
    g.beginPath(); g.moveTo(120, 280); g.lineTo(392, 180); g.stroke();
    paintText(g, "6:00!", 256, 330, 84, "#e0332e", "center", 0.14);
  }
});
export const yearTex = (s: string, col = "#e8c45a", bg = "#2f2a3a") => ctex(`year_${s}_${col}`, 512, 256, (g) => {
  g.fillStyle = bg; g.fillRect(0, 0, 512, 256);
  g.lineWidth = 12; g.strokeStyle = col; g.strokeRect(14, 14, 484, 228);
  paintText(g, s, 256, 132, 150, col, "center", 0.1);
});
export const congressTex = (repealed: boolean) => ctex(`congressBoard_${repealed}`, 1024, 384, (g) => {
  g.fillStyle = "#1f3f8f"; g.fillRect(0, 0, 1024, 384);
  g.fillStyle = "#e8c45a"; g.fillRect(0, 0, 1024, 20); g.fillRect(0, 364, 1024, 20);
  for (let i = 0; i < 13; i++) { g.fillStyle = "#ffffff"; g.beginPath(); const x = 60 + i * 75; star(g, x, 52, 16); g.fill(); }
  if (!repealed) paintText(g, "CONGRESS", 512, 220, 150, "#ffffff", "center", 0.1);
  else { paintText(g, "REPEALED!", 512, 200, 160, "#ffd84d", "center", 0.12); paintText(g, "1919", 512, 318, 70, "#ffffff", "center", 0.12); }
});
const star = (g: CanvasRenderingContext2D, x: number, y: number, r: number) => {
  g.moveTo(x, y - r);
  for (let k = 1; k < 10; k++) { const a = (k / 10) * Math.PI * 2, rr = k % 2 ? r * 0.45 : r; g.lineTo(x + Math.sin(a) * rr, y - Math.cos(a) * rr); }
  g.closePath();
};
export const paperTex = (state: 0 | 1) => ctex(`vetoPaper_${state}`, 768, 1024, (g) => {
  g.fillStyle = "#f4e9cf"; g.fillRect(0, 0, 768, 1024);
  g.strokeStyle = "rgba(150,110,60,0.25)"; g.lineWidth = 24; g.strokeRect(12, 12, 744, 1000);
  paintText(g, "REPEAL", 384, 150, 120, "#2f5fb5", "center", 0.1);
  g.font = font(42, 700); g.fillStyle = INK; g.textAlign = "center"; g.fillText("OF DAYLIGHT SAVING", 384, 250);
  for (let i = 0; i < 9; i++) { g.fillStyle = "rgba(36,23,38,0.35)"; g.fillRect(110, 330 + i * 56, 548 - (i % 3) * 60, 14); }
  if (state) {
    g.save(); g.translate(384, 560); g.rotate(-0.3);
    g.strokeStyle = "#e0332e"; g.lineWidth = 22; g.beginPath(); g.roundRect(-300, -110, 600, 220, 26); g.stroke();
    paintText(g, "VETOED", 0, 6, 150, "#e0332e", "center", 0.04);
    g.restore();
  }
});
export const bannerTex = (key: string, big: string, small: string, bigCol = "#2f5fb5") => ctex(`banner_${key}`, 1024, 256, (g) => {
  g.fillStyle = "#f6efe0"; g.fillRect(0, 0, 1024, 256);
  g.fillStyle = "#c9373a"; g.fillRect(0, 0, 1024, 26); g.fillRect(0, 230, 1024, 26);
  paintText(g, big, 512, 116, big.length > 12 ? 112 : 140, bigCol, "center", 0.1);
  g.font = font(36, 700); g.fillStyle = INK; g.textAlign = "center"; g.fillText(small, 512, 205);
});
export const saleTex = () => ctex("saleSign", 512, 384, (g) => {
  g.fillStyle = "#e0332e"; g.fillRect(0, 0, 512, 384);
  g.lineWidth = 16; g.strokeStyle = "#ffffff"; g.strokeRect(16, 16, 480, 352);
  paintText(g, "BIG", 256, 110, 100, "#ffffff", "center", 0.14);
  paintText(g, "SALE", 256, 250, 150, "#ffd84d", "center", 0.12);
});
export const moneyTex = () => ctex("money200", 1024, 384, (g) => {
  g.fillStyle = "#2f7a46"; g.fillRect(0, 0, 1024, 384);
  g.lineWidth = 16; g.strokeStyle = "#e8c45a"; g.strokeRect(14, 14, 996, 356);
  paintText(g, "$200,000,000", 512, 160, 130, "#ffd84d", "center", 0.12);
  paintText(g, "PER EXTRA MONTH", 512, 290, 58, "#ffffff", "center", 0.14);
});

// ---------------- farm ----------------
const hayTex = () => ctex("hayBale", 512, 256, (g, r) => {
  g.fillStyle = "#e3b850"; g.fillRect(0, 0, 512, 256);
  for (let i = 0; i < 220; i++) { g.strokeStyle = r() > 0.5 ? "rgba(150,100,30,0.45)" : "rgba(255,240,170,0.6)"; g.lineWidth = 2 + r() * 3; const x = r() * 512, y = r() * 256; g.beginPath(); g.moveTo(x, y); g.lineTo(x + 30 + r() * 40, y + (r() - 0.5) * 6); g.stroke(); }
});
const hayEnd = () => ctex("hayEnd", 256, 256, (g) => {
  g.fillStyle = "#e3b850"; g.fillRect(0, 0, 256, 256);
  g.strokeStyle = "rgba(150,100,30,0.6)"; g.lineWidth = 6;
  for (let rr = 20; rr < 128; rr += 18) { g.beginPath(); g.arc(128, 128, rr, 0, Math.PI * 2); g.stroke(); }
});
/** round hay bale lying on its side, axis along x, radius r */
export const hayBale = (r: number) => {
  const g = new THREE.Group();
  const m = new THREE.Mesh(new THREE.CylinderGeometry(r, r, r * 1.3, 28).rotateZ(Math.PI / 2), [lam("hayBale", () => ({ map: hayTex() })), lam("hayEnd", () => ({ map: hayEnd() })), lam("hayEnd", () => ({ map: hayEnd() }))]);
  m.position.y = r; g.add(m);
  return shadowAll(g);
};
const cowTex = () => ctex("cowHide", 512, 512, (g, r) => {
  g.fillStyle = "#f7f3ea"; g.fillRect(0, 0, 512, 512);
  g.fillStyle = "#2b2430";
  for (let i = 0; i < 7; i++) { const x = r() * 512, y = r() * 512, a = 40 + r() * 60; g.beginPath(); for (let k = 0; k < 9; k++) { const t = (k / 9) * Math.PI * 2, rr = a * (0.7 + r() * 0.5); g.lineTo(x + Math.cos(t) * rr, y + Math.sin(t) * rr * 0.8); } g.fill(); }
});
/** a chunky cartoon cow, head toward -z, 1.4 m tall at the back */
export const cow = () => {
  const g = new THREE.Group(), hide = lam("cowHide", () => ({ map: cowTex() }));
  const body = new THREE.Mesh(new THREE.CapsuleGeometry(0.42, 0.95, 6, 16).rotateX(Math.PI / 2), hide); body.position.set(0, 1.0, 0.1);
  const head = new THREE.Mesh(new THREE.BoxGeometry(0.46, 0.5, 0.5), hide); head.position.set(0, 1.28, -0.78);
  const muzzle = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.26, 0.2), lam("cowMuzzle", () => ({ color: "#f2a7b0" }))); muzzle.position.set(0, 1.12, -1.05);
  for (const sx of [-1, 1]) {
    const nos = new THREE.Mesh(new THREE.SphereGeometry(0.035, 8, 6), lam("cowNose", () => ({ color: "#8a4a55" }))); nos.position.set(sx * 0.1, 1.13, -1.16); g.add(nos);
    const eye = new THREE.Mesh(new THREE.SphereGeometry(0.075, 12, 10), lam("eyeWhite", () => ({ color: "#ffffff" }))); eye.position.set(sx * 0.13, 1.4, -1.02);
    const pup = new THREE.Mesh(new THREE.SphereGeometry(0.04, 10, 8), lam("eyeInk", () => ({ color: INK }))); pup.position.set(sx * 0.13, 1.42, -1.085);
    const ear = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.08, 0.14), lam("cowMuzzle", () => ({}))); ear.position.set(sx * 0.33, 1.44, -0.74); ear.rotation.z = sx * -0.3;
    const horn = new THREE.Mesh(new THREE.ConeGeometry(0.05, 0.18, 8), lam("cowHorn", () => ({ color: "#efe3c4" }))); horn.position.set(sx * 0.16, 1.6, -0.74); horn.rotation.z = sx * -0.4;
    g.add(eye, pup, ear, horn);
    for (const z of [-0.4, 0.6]) { const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.08, 0.62, 10), hide); leg.position.set(sx * 0.24, 0.31, z); g.add(leg);
      const hoof = new THREE.Mesh(new THREE.CylinderGeometry(0.095, 0.1, 0.08, 10), lam("eyeInk", () => ({}))); hoof.position.set(sx * 0.24, 0.04, z); g.add(hoof); }
  }
  const tail = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.6, 6), hide); tail.position.set(0, 0.9, 0.98); tail.rotation.x = 0.4; g.add(tail);
  g.add(body, head, muzzle);
  return shadowAll(g);
};
/** milk churn, base at y = 0 */
export const milkCan = () => {
  const g = new THREE.Group(), tin = twoTone(new THREE.MeshPhongMaterial({ color: "#c7ccd6", specular: "#ffffff", shininess: 60 }), 0.25);
  g.add(new THREE.Mesh(lathe([[0.001, 0], [0.2, 0], [0.21, 0.42], [0.12, 0.56], [0.1, 0.64], [0.13, 0.66], [0.13, 0.7], [0.001, 0.71]]), tin));
  return shadowAll(g);
};
/** red barn with a gabled roof: front (big doors) facing -z, centre at origin, footprint w x d */
export const barn = (w: number, d: number, h: number) => {
  const g = new THREE.Group(), b = new Batch();
  const red = lam("barnRed", () => ({ map: rep(planksRed(), 2, 1) }));
  b.add(boxGeo(V(-w / 2, 0, -d / 2), V(w / 2, h, d / 2), 2), red);
  b.build(g);
  const roofH = w * 0.38, shape = new THREE.Shape([new THREE.Vector2(-w / 2 - 0.3, 0), new THREE.Vector2(0, roofH), new THREE.Vector2(w / 2 + 0.3, 0)]);
  const rg = new THREE.ExtrudeGeometry(shape, { depth: d + 0.6, bevelEnabled: false }); rg.translate(0, h, -d / 2 - 0.3);
  const roof = new THREE.Mesh(rg, lam("barnRoof", () => ({ map: roofHD("#5b4a6b") }))); g.add(roof);
  const doors = new THREE.Mesh(new THREE.PlaneGeometry(w * 0.42, h * 0.7), lam("barnDoor", () => ({ map: barnDoorTex() })));
  doors.rotation.y = Math.PI; doors.position.set(0, h * 0.35, -d / 2 - 0.02); g.add(doors);
  return shadowAll(g);
};
const planksRed = () => ctex("planksRed", 512, 512, (g, r) => {
  g.fillStyle = "#b8463a"; g.fillRect(0, 0, 512, 512);
  for (let i = 0; i < 12; i++) { g.fillStyle = r() > 0.5 ? "rgba(0,0,0,0.07)" : "rgba(255,255,255,0.05)"; g.fillRect(i * 43, 0, 43, 512); g.fillStyle = "rgba(36,23,38,0.5)"; g.fillRect(i * 43, 0, 4, 512); }
});
const barnDoorTex = () => ctex("barnDoor", 512, 512, (g) => {
  g.fillStyle = "#9e3a30"; g.fillRect(0, 0, 512, 512);
  g.strokeStyle = "#f6efdc"; g.lineWidth = 26; g.strokeRect(20, 20, 472, 472);
  g.beginPath(); g.moveTo(20, 20); g.lineTo(256, 256); g.lineTo(492, 20); g.moveTo(20, 492); g.lineTo(256, 256); g.lineTo(492, 492); g.stroke();
  g.strokeStyle = INK; g.lineWidth = 6; g.beginPath(); g.moveTo(256, 20); g.lineTo(256, 492); g.stroke();
});
/** split-rail fence along x from x0 to x1 at z */
export const fence = (x0: number, x1: number) => {
  const g = new THREE.Group(), wood = lam("fenceWood", () => ({ color: "#9a7149" }));
  for (let x = x0; x <= x1 + 0.01; x += 2) { const p = new THREE.Mesh(new THREE.BoxGeometry(0.12, 1.1, 0.12), wood); p.position.set(x, 0.55, 0); g.add(p); }
  for (const y of [0.45, 0.85]) { const r = new THREE.Mesh(new THREE.BoxGeometry(x1 - x0 + 0.3, 0.09, 0.07), wood); r.position.set((x0 + x1) / 2, y, 0); g.add(r); }
  return shadowAll(g);
};
/** pitchfork, standing upright, 1.7 m */
export const pitchfork = () => {
  const g = new THREE.Group(), wood = lam("poleWood", () => ({ color: "#7a5236" })), iron = lam("ironHandle", () => ({ color: "#4a4e5a" }));
  const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.022, 1.45, 8), wood); pole.position.y = 0.72; g.add(pole);
  const bar = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.03, 0.03), iron); bar.position.y = 1.45; g.add(bar);
  for (const x of [-0.12, 0, 0.12]) { const t = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.006, 0.3, 6), iron); t.position.set(x, 1.6, 0); g.add(t); }
  return shadowAll(g);
};

// ---------------- street stalls ----------------
/** kettle grill on three legs, base at y = 0 */
export const grill = () => {
  const g = new THREE.Group(), blk = twoTone(new THREE.MeshPhongMaterial({ color: "#2b2b33", specular: "#9aa0b5", shininess: 40 }), 0.3);
  const bowl = new THREE.Mesh(new THREE.SphereGeometry(0.34, 24, 12, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2), blk); bowl.position.y = 0.82;
  const lid = new THREE.Mesh(new THREE.SphereGeometry(0.34, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2.4), blk); lid.position.set(0, 0.86, 0.32); lid.rotation.x = 1.1;
  const coals = new THREE.Mesh(new THREE.CircleGeometry(0.3, 20).rotateX(-Math.PI / 2), new THREE.MeshBasicMaterial({ color: new THREE.Color(2.6, 0.9, 0.25) }));
  coals.position.y = 0.8; coals.layers.set(NOINK);
  const rack = new THREE.Mesh(new THREE.TorusGeometry(0.3, 0.01, 4, 24).rotateX(Math.PI / 2), lam("ironHandle", () => ({ color: "#4a4e5a" }))); rack.position.y = 0.83;
  for (let i = 0; i < 3; i++) { const a = (i / 3) * Math.PI * 2; const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.62, 6), blk); leg.position.set(Math.cos(a) * 0.2, 0.31, Math.sin(a) * 0.2); leg.rotation.set(Math.sin(a) * 0.25, 0, -Math.cos(a) * 0.25); g.add(leg); }
  g.add(bowl, lid, coals, rack);
  for (const x of [-0.12, 0.1]) { const s = new THREE.Mesh(new THREE.CapsuleGeometry(0.04, 0.18, 4, 8).rotateZ(Math.PI / 2), lam("sausage", () => ({ color: "#b3542f" }))); s.position.set(x, 0.85, -0.05 + x); s.rotation.y = 0.4; g.add(s); }
  return shadowAll(g);
};
/** putting green with a flag, centre at origin */
export const golf = () => {
  const g = new THREE.Group();
  const green = new THREE.Mesh(new THREE.CylinderGeometry(1.3, 1.35, 0.06, 32), lam("puttGreen", () => ({ color: "#5fb24a" }))); green.position.y = 0.03;
  const hole = new THREE.Mesh(new THREE.CircleGeometry(0.07, 16).rotateX(-Math.PI / 2), lam("eyeInk", () => ({ color: INK }))); hole.position.set(0.3, 0.065, 0.2);
  const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 1.9, 8), lam("flagPole", () => ({ color: "#f4f1ea" }))); pole.position.set(0.3, 1.0, 0.2);
  const fs = new THREE.Shape([new THREE.Vector2(0, 0), new THREE.Vector2(0.62, -0.2), new THREE.Vector2(0, -0.42)]);
  const flag = new THREE.Mesh(new THREE.ShapeGeometry(fs), lam("golfFlag", () => ({ color: "#e0332e", side: THREE.DoubleSide }))); flag.position.set(0.3, 1.94, 0.2); flag.rotation.y = Math.PI * 0.85;
  const ball = new THREE.Mesh(new THREE.SphereGeometry(0.05, 14, 10), lam("golfBall", () => ({ color: "#ffffff" }))); ball.position.set(-0.4, 0.11, -0.3);
  g.add(green, hole, pole, flag, ball);
  return shadowAll(g);
};

// ---------------- pumpkins ----------------
const pumpkinTex = (carved: boolean) => ctex(`pumpkin_${carved}`, 512, 256, (g) => {
  g.fillStyle = "#f08a2c"; g.fillRect(0, 0, 512, 256);
  for (let i = 0; i < 8; i++) { g.fillStyle = "rgba(160,60,10,0.35)"; g.fillRect(i * 64, 0, 8, 256); }
  if (carved) {
    // face centred at u = 0.75 (the side the lathe puts toward -z)
    const cx = 384, cy = 128;
    g.fillStyle = "#ffd84d"; g.strokeStyle = INK; g.lineWidth = 5;
    for (const sx of [-1, 1]) { g.beginPath(); g.moveTo(cx + sx * 34 - 18, cy - 20); g.lineTo(cx + sx * 34 + 18, cy - 20); g.lineTo(cx + sx * 34, cy - 52); g.closePath(); g.fill(); g.stroke(); }
    g.beginPath(); g.moveTo(cx - 64, cy + 18); g.quadraticCurveTo(cx, cy + 86, cx + 64, cy + 18);
    for (let k = 4; k >= 0; k--) g.lineTo(cx - 64 + k * 32, cy + 18 + (k % 2 ? 22 : 0));
    g.closePath(); g.fill(); g.stroke();
  }
});
/** pumpkin of radius r; carved ones get a glowing face toward -z */
export const pumpkin = (r: number, carved: boolean) => {
  const g = new THREE.Group();
  const body = new THREE.Mesh(new THREE.SphereGeometry(r, 28, 16), lam(`pumpkin_${carved}`, () => ({ map: pumpkinTex(carved) })));
  body.scale.set(1.15, 0.85, 1.15); body.position.y = r * 0.85; body.rotation.y = 0;
  const stem = new THREE.Mesh(new THREE.CylinderGeometry(r * 0.12, r * 0.16, r * 0.4, 8), lam("pumpkinStem", () => ({ color: "#4d7a2f" }))); stem.position.y = r * 1.75;
  g.add(body, stem);
  return shadowAll(g);
};
/** candy pumpkin: the classic little orange candy, base at y = 0, radius r */
export const candyPumpkin = (r: number) => {
  const g = new THREE.Group();
  const body = new THREE.Mesh(new THREE.SphereGeometry(r, 20, 12), lam("candyPumpkin", () => ({ color: "#f39a2a" }))); body.scale.set(1.1, 0.8, 1.1); body.position.y = r * 0.8;
  const stem = new THREE.Mesh(new THREE.CylinderGeometry(r * 0.3, r * 0.4, r * 0.45, 10), lam("candyStem", () => ({ color: "#3f8f3a" }))); stem.position.y = r * 1.75;
  g.add(body, stem);
  return shadowAll(g);
};

// ---------------- the chamber (Congress) ----------------
export type Chamber = { board: THREE.Mesh; paper: THREE.Mesh; desks: THREE.Vector3[]; candies: THREE.Group[]; podiumTop: THREE.Vector3 };
/** open-roofed hall centred on (cx, y0, cz): back wall at +z with the big board, rows of desks facing it */
export const buildChamber = (root: THREE.Object3D, cx: number, y0: number, cz: number): Chamber => {
  const b = new Batch();
  const floor = lam("chamberFloor", () => ({ map: rep(beam(), 3, 3) }));
  const wall = lam("chamberWall", () => ({ map: stoneHD("chamberWallHD", ["#e8dcc4", "#ddd0b6", "#efe5d0", "#d6c8ad"], "#a8977a") }));
  const wood = lam("deskWood", () => ({ color: "#7a4b2e" }));
  const X0 = cx - 7, X1 = cx + 7, Z0 = cz - 5, Z1 = cz + 6, H = 5;
  b.add(boxGeo(V(X0 - 2, y0 - 0.2, Z0 - 8), V(X1 + 2, y0, Z1 + 1), 3), floor);
  b.add(boxGeo(V(X0 - 0.3, y0, Z0), V(X0, y0 + H, Z1 + 0.3), 2), wall);
  b.add(boxGeo(V(X1, y0, Z0), V(X1 + 0.3, y0 + H, Z1 + 0.3), 2), wall);
  b.add(boxGeo(V(X0 - 0.3, y0, Z1), V(X1 + 0.3, y0 + H, Z1 + 0.3), 2), wall);
  // podium (raised dais + lectern)
  b.add(boxGeo(V(cx - 3, y0, Z1 - 2.4), V(cx + 3, y0 + 0.4, Z1)), wood);
  b.add(boxGeo(V(cx - 0.6, y0 + 0.4, Z1 - 1.9), V(cx + 0.6, y0 + 1.5, Z1 - 1.3)), wood);
  // desks + chairs in two rows, an aisle down the middle
  const desks: THREE.Vector3[] = [];
  for (const [z, n] of [[cz + 1.2, 3], [cz - 0.9, 3]] as const) for (const sx of [-1, 1]) for (let k = 0; k < n; k++) {
    const x = cx + sx * (1.3 + k * 1.5);
    b.add(boxGeo(V(x - 0.55, y0, z - 0.2), V(x + 0.55, y0 + 0.78, z + 0.25)), wood);
    // chair on the lens side (-z), seat at 0.48 m
    b.add(boxGeo(V(x - 0.24, y0 + 0.44, z - 0.78), V(x + 0.24, y0 + 0.5, z - 0.32)), lam("chairRed", () => ({ color: "#9e2f3a" })));
    b.add(boxGeo(V(x - 0.24, y0 + 0.5, z - 0.8), V(x + 0.24, y0 + 0.78, z - 0.74)), lam("chairRed", () => ({})));
    for (const [lx, lz] of [[-0.2, -0.75], [0.2, -0.75], [-0.2, -0.35], [0.2, -0.35]]) b.add(boxGeo(V(x + lx - 0.025, y0, z + lz - 0.025), V(x + lx + 0.025, y0 + 0.44, z + lz + 0.025)), wood);
    desks.push(V(x, y0 + 0.5, z - 0.55));
  }
  b.build(root);
  // red curtains either side of the board
  for (const sx of [-1, 1]) {
    const c = new THREE.Mesh(new THREE.PlaneGeometry(1.6, H - 0.3, 8, 1), lam("curtain", () => ({ map: curtainTex(), side: THREE.DoubleSide })));
    c.rotation.y = Math.PI; c.position.set(cx + sx * 4.6, y0 + (H - 0.3) / 2, Z1 - 0.05); root.add(c);
  }
  const board = new THREE.Mesh(new THREE.PlaneGeometry(5.6, 2.1), lam("congressBoard_false", () => ({ map: congressTex(false) })));
  board.rotation.y = Math.PI; board.position.set(cx, y0 + 3.1, Z1 - 0.04); root.add(board);
  const paper = new THREE.Mesh(new THREE.PlaneGeometry(0.42, 0.56), lam("vetoPaper_0", () => ({ map: paperTex(0) })));
  paper.rotation.set(-Math.PI / 2 + 0.35, 0, Math.PI); paper.position.set(cx, y0 + 1.52, Z1 - 1.6); paper.rotation.order = "YXZ";
  paper.rotation.set(-Math.PI / 2 + 0.35, Math.PI, 0); paper.position.y = y0 + 1.62; root.add(paper);
  const candies = desks.map((d) => { const c = candyPumpkin(0.1); c.position.copy(d); c.position.y = y0 + 0.5; root.add(c); return c; });
  root.traverse((o) => { const m = o as THREE.Mesh; if (m.isMesh) { m.receiveShadow = true; } });
  return { board, paper, desks, candies, podiumTop: V(cx, y0 + 1.62, Z1 - 1.6) };
};
const curtainTex = () => ctex("curtain", 256, 512, (g) => {
  g.fillStyle = "#a8303a"; g.fillRect(0, 0, 256, 512);
  for (let i = 0; i < 8; i++) { g.fillStyle = i % 2 ? "rgba(0,0,0,0.18)" : "rgba(255,255,255,0.08)"; g.fillRect(i * 32, 0, 32, 512); }
  g.fillStyle = "#e8c45a"; g.fillRect(0, 470, 256, 20);
});

// ---------------- the farm ----------------
export type Farm = { clock: Clock; clockG: THREE.Group; cow: THREE.Group; hay: THREE.Group[]; dew: THREE.Mesh[]; milkSign: Board; cans: THREE.Group[] };
export const buildFarm = (root: THREE.Object3D, cx: number, y0: number, cz: number): Farm => {
  const at = (o: THREE.Object3D, x: number, z: number, ry = 0) => { o.position.set(cx + x, y0, cz + z); o.rotation.y = ry; root.add(o); return o; };
  at(barn(7, 6, 4), 0.5, 11);
  at(fence(-9, -3), 0, 8); at(fence(4, 10), 0, 8);
  const pc = postClock(0.6, 2.0); at(pc.g, 1.15, 2.2);
  const c = cow(); at(c, 2.75, 3.2, 0.25);
  const hay = [hayBale(0.6), hayBale(0.6), hayBale(0.55)];
  at(hay[0], -3.0, 4.0, 0.2); at(hay[1], -4.4, 4.6, -0.1); at(hay[2], -3.6, 5.7, 0.4);
  // dew: tiny bright beads on the bales (bloom makes them sparkle)
  const dew: THREE.Mesh[] = [];
  const dm = new THREE.MeshBasicMaterial({ color: new THREE.Color(3.2, 3.4, 3.8) });
  hay.forEach((h, k) => { for (let i = 0; i < 14; i++) {
    const a = -Math.PI / 2 - 1.1 + (i / 13) * 2.2, xx = ((i * 0.37) % 1 - 0.5) * 0.7, r = k === 2 ? 0.55 : 0.6;
    const d = new THREE.Mesh(new THREE.SphereGeometry(0.045, 6, 4), dm); d.layers.set(NOINK);
    d.position.set(xx, r + Math.sin(-a) * r * 1.0 + 0.01, Math.cos(a) * r * 0.0 - Math.abs(Math.cos(a)) * r); // front-upper face (toward -z)
    d.position.set(xx, r + r * Math.cos(a + Math.PI / 2) * 0.9, -r * Math.abs(Math.sin(a + Math.PI / 2)) * 0.9 - 0.02);
    h.add(d); dew.push(d);
  } });
  const milkSign = new Board(1.1, 0.82, "milkSign_false", () => milkSignTex(false), 1.1); at(milkSign.group, -1.6, 6.2); milkSign.group.position.y = y0 + 1.1 + 0.41;
  const cans = [milkCan(), milkCan(), milkCan()];
  at(cans[0], -1.9, 5.6); at(cans[1], -1.4, 5.75); at(cans[2], -2.35, 5.85);
  return { clock: pc.clock, clockG: pc.g, cow: c, hay, dew, milkSign, cans };
};
