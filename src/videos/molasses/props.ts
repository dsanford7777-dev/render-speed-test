// Props and painted textures for the Molasses Flood short (Paradox Town #3), in the house look: two-tone lam()
// materials, hand-painted canvas textures, ink outlines, flat bold cartoon colours.
import * as THREE from "three";
import { lam } from "../bridge/build";
import { ctex, rep, beam } from "../bridge/paint";
import { twoTone } from "../bridge/shade";
import { INK, paintText } from "../dst/props";

const shadowAll = <T extends THREE.Object3D>(g: T): T => { g.traverse((o) => { o.castShadow = true; o.receiveShadow = true; }); return g; };

// ---------------- the tank ----------------
export const TANK_R = 12, TANK_H = 15;
/** one 12.5 m wide tile of tank wall (the cylinder repeats it 6 times): riveted plate courses, optional leak streaks */
const tankTex = (kind: "steel" | "brown") => ctex(`tankWall_${kind}`, 1024, 1228, (g, r) => {
  const W = 1024, H = 1228;
  g.fillStyle = kind === "steel" ? "#a9b0ba" : "#6e3b1f"; g.fillRect(0, 0, W, H);
  // plate courses (6 rows, 2.5 m each), staggered vertical seams
  for (let row = 0; row < 6; row++) {
    const y0 = (row * H) / 6;
    g.fillStyle = kind === "steel" ? (row % 2 ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.05)") : (row % 2 ? "rgba(255,220,180,0.05)" : "rgba(0,0,0,0.06)");
    g.fillRect(0, y0, W, H / 6);
    g.fillStyle = kind === "steel" ? "#7c838e" : "#4e2913"; g.fillRect(0, y0 - 4, W, 8);
    for (const x of row % 2 ? [256, 768] : [0, 512, 1024]) g.fillRect(x - 4, y0, 8, H / 6);
    // rivets along the seams
    g.fillStyle = kind === "steel" ? "#5f6670" : "#3c1f0e";
    for (let x = 10; x < W; x += 22) { g.beginPath(); g.arc(x, y0 + 12, 4, 0, Math.PI * 2); g.fill(); g.beginPath(); g.arc(x, y0 - 12, 4, 0, Math.PI * 2); g.fill(); }
  }
  // leak streaks running down from the seams: bold on the bare steel, nearly hidden by the brown paint
  for (let i = 0; i < 26; i++) {
    const x = 30 + r() * (W - 60), y = (Math.floor(r() * 5) * H) / 6 + 10, len = 120 + r() * 380, w = 8 + r() * 14;
    g.fillStyle = kind === "steel" ? "rgba(92,44,16,0.92)" : "rgba(70,34,14,0.22)";
    g.beginPath(); g.moveTo(x - w / 2, y); g.lineTo(x + w / 2, y);
    g.quadraticCurveTo(x + w * 0.4, y + len * 0.7, x + 2, y + len); g.quadraticCurveTo(x - w * 0.4, y + len * 0.7, x - w / 2, y); g.fill();
    g.beginPath(); g.arc(x + 1, y + len, w * 0.45, 0, Math.PI * 2); g.fill();
  }
});
const roofTex = () => ctex("tankRoof", 512, 512, (g) => {
  g.fillStyle = "#8e959f"; g.fillRect(0, 0, 512, 512);
  g.strokeStyle = "#6c727c"; g.lineWidth = 6;
  for (let a = 0; a < 16; a++) { g.beginPath(); g.moveTo(256, 256); g.lineTo(256 + Math.cos((a / 16) * Math.PI * 2) * 360, 256 + Math.sin((a / 16) * Math.PI * 2) * 360); g.stroke(); }
});
export type Tank = { group: THREE.Group; whole: THREE.Group; wall: THREE.Mesh; paint: THREE.Mesh; burst: THREE.Group; flapL: THREE.Mesh; flapR: THREE.Mesh; hole: THREE.Mesh };
/** the 50 ft molasses tank: centre at its base. `paint` is a brown skin over the steel that grows upward (scale.y) */
export const buildTank = (): Tank => {
  const group = new THREE.Group(), whole = new THREE.Group(), burst = new THREE.Group();
  const steel = lam("tankWall_steel", () => ({ map: rep(tankTex("steel"), 6, 1) }));
  const brown = lam("tankWall_brown", () => ({ map: rep(tankTex("brown"), 6, 1) }));
  const wall = new THREE.Mesh(new THREE.CylinderGeometry(TANK_R, TANK_R, TANK_H, 96, 1, true), steel); wall.position.y = TANK_H / 2;
  const pg = new THREE.CylinderGeometry(TANK_R + 0.03, TANK_R + 0.03, TANK_H, 96, 1, true); pg.translate(0, TANK_H / 2, 0);
  const paint = new THREE.Mesh(pg, brown);
  const roof = new THREE.Mesh(new THREE.ConeGeometry(TANK_R + 0.25, 2.2, 96), lam("tankRoof", () => ({ map: roofTex() }))); roof.position.y = TANK_H + 1.1;
  const rim = new THREE.Mesh(new THREE.TorusGeometry(TANK_R + 0.1, 0.18, 6, 96).rotateX(Math.PI / 2), lam("tankRim", () => ({ color: "#5f6670" }))); rim.position.y = TANK_H;
  const hatch = new THREE.Mesh(new THREE.CylinderGeometry(0.7, 0.7, 0.5, 16), lam("tankRim", () => ({}))); hatch.position.set(0, TANK_H + 2.2, 0);
  whole.add(wall, paint, roof, rim, hatch);
  // burst: the wall torn open toward the street (+x), two plates bent out, the dark inside showing
  const gap = 1.0, bg = new THREE.CylinderGeometry(TANK_R, TANK_R, TANK_H * 0.62, 96, 1, true, Math.PI / 2 + gap / 2, Math.PI * 2 - gap);
  const bw = new THREE.Mesh(bg, lam("tankBurst", () => ({ map: rep(tankTex("brown"), 6, 0.62), side: THREE.DoubleSide }))); bw.position.y = TANK_H * 0.31;
  const inside = new THREE.Mesh(new THREE.CircleGeometry(TANK_R - 0.05, 48).rotateX(-Math.PI / 2), lam("molassesDark", () => ({ color: "#2e1408" }))); inside.position.y = 0.6;
  const mk = (sgn: number) => {
    const p = new THREE.Mesh(new THREE.PlaneGeometry(4.2, TANK_H * 0.55, 1, 4), lam("tankBurst", () => ({})));
    const pp = p.geometry.attributes.position as THREE.BufferAttribute;
    for (let i = 0; i < pp.count; i++) pp.setX(i, pp.getX(i) + (pp.getY(i) > 0 ? sgn * 0.6 * Math.sin(i) : 0));
    p.geometry.translate(sgn * 2.1, TANK_H * 0.275, 0); return p;
  };
  const flapL = mk(-1), flapR = mk(1);
  const edge = (a: number) => [Math.sin(a) * TANK_R, Math.cos(a) * TANK_R] as const;
  const [lx, lz] = edge(Math.PI / 2 + gap / 2), [rx, rz] = edge(Math.PI / 2 - gap / 2);
  flapL.position.set(lx, 0, lz); flapL.rotation.y = -Math.PI / 2 + gap / 2 - 0.9;
  flapR.position.set(rx, 0, rz); flapR.rotation.y = Math.PI / 2 - gap / 2 + 0.9 + Math.PI;
  burst.add(bw, inside, flapL, flapR);
  // the crack opening at the base (shot 7): a dark jagged slit on the street side, grown with scale
  const hole = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), lam("crack", () => ({ map: crackTex(), alphaTest: 0.5, side: THREE.DoubleSide })));
  hole.position.set(TANK_R + 0.06, 0, 0); hole.rotation.y = Math.PI / 2;
  whole.add(hole);
  group.add(whole, burst);
  shadowAll(group);
  return { group, whole, wall, paint, burst, flapL, flapR, hole };
};
const crackTex = () => ctex("crack", 256, 512, (g) => {
  g.clearRect(0, 0, 256, 512);
  g.fillStyle = "#2a1206"; g.strokeStyle = INK; g.lineWidth = 8;
  g.beginPath(); g.moveTo(128, 0);
  const pts: [number, number][] = [[150, 60], [118, 120], [160, 190], [112, 260], [170, 330], [100, 400], [190, 512], [60, 512], [140, 400], [70, 330], [130, 260], [84, 190], [126, 120], [96, 60]];
  for (const [x, y] of pts) g.lineTo(x, y);
  g.closePath(); g.fill(); g.stroke();
});

// ---------------- the molasses ----------------
const molTex = () => ctex("molasses", 512, 512, (g, r) => {
  g.fillStyle = "#7a3a14"; g.fillRect(0, 0, 512, 512);
  for (let i = 0; i < 40; i++) {
    const x = r() * 512, y = r() * 512, w = 40 + r() * 140, h = 6 + r() * 12;
    g.fillStyle = r() > 0.35 ? "rgba(176,96,36,0.6)" : "rgba(52,22,6,0.45)";
    g.beginPath(); g.ellipse(x, y, w, h, (r() - 0.5) * 0.4, 0, Math.PI * 2); g.fill();
  }
  for (let i = 0; i < 14; i++) { g.fillStyle = "rgba(255,214,150,0.55)"; const x = r() * 512, y = r() * 512; g.beginPath(); g.ellipse(x, y, 18 + r() * 40, 3 + r() * 4, 0, 0, Math.PI * 2); g.fill(); }
});
export const molMat = () => lam("molasses", () => ({ map: rep(molTex(), 2, 2) }));
/** glossy, flowing molasses: Phong highlights through the house two-tone shader, its own texture so it can scroll */
export const liquidMat = (key: string) => {
  const t = molTex().clone(); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(2, 2); t.needsUpdate = true;
  const m = twoTone(new THREE.MeshPhongMaterial({ map: t, color: "#ffffff", specular: "#ffd9a0", shininess: 70 }), 0.55);
  m.name = key; return { m, t };
};
/** a rolling wave of molasses: a profile (front at z = 0, body trailing back toward +z) extruded across `width` metres,
 *  re-shaped every frame (swells running through it, the crest curling and wobbling, spray flying off the lip) */
export class LiquidWave {
  group = new THREE.Group(); mesh: THREE.Mesh; lip: THREE.Mesh; private base: Float32Array; private lipBase: Float32Array;
  private tex: THREE.Texture; private spray: THREE.Mesh[] = [];
  constructor(public width: number, public H: number, len: number, key: string, nSpray = 36) {
    const s = new THREE.Shape(), P: [number, number][] = [
      [-0.6, 0], [0.4, H * 0.2], [0.3, H * 0.45], [-0.8, H * 0.66], [-2.4, H * 0.76], [-2.6, H * 0.86], [-1.6, H * 0.97], [0.0, H * 1.02], [1.6, H * 0.98],
      [3.4, H * 0.84], [7, H * 0.52], [len * 0.55, H * 0.2], [len, 0.5], [len, 0],
    ];
    s.moveTo(P[0][0], P[0][1]); for (const [x, y] of P.slice(1)) s.lineTo(x, y); s.closePath();
    const g = new THREE.ExtrudeGeometry(s, { depth: width, bevelEnabled: false, curveSegments: 4, steps: 40 });
    g.rotateY(-Math.PI / 2); g.translate(width / 2, 0, 0);
    const p = g.attributes.position as THREE.BufferAttribute;
    for (let i = 0; i < p.count; i++) {
      const u = p.getX(i) / (width / 2), y = p.getY(i);
      p.setZ(i, p.getZ(i) + 1.6 * u * u + 0.4 * Math.sin(u * 5));
      p.setY(i, y * (1 - 0.18 * u * u + 0.06 * Math.sin(u * 7 + 1)));
    }
    this.base = Float32Array.from(p.array as Float32Array);
    const { m, t } = liquidMat(key); this.tex = t;
    this.mesh = new THREE.Mesh(g, m); this.mesh.castShadow = true; this.mesh.receiveShadow = false; // its own curl would shade the whole face
    // the glossy amber roll along the curling crest
    this.lip = new THREE.Mesh(new THREE.CylinderGeometry(0.34, 0.34, width * 0.98, 12, 40).rotateZ(Math.PI / 2),
      twoTone(new THREE.MeshPhongMaterial({ color: "#c98236", specular: "#fff0c8", shininess: 90 }), 0.6));
    const lp = this.lip.geometry.attributes.position as THREE.BufferAttribute;
    for (let i = 0; i < lp.count; i++) { const u = lp.getX(i) / (width / 2); lp.setY(i, lp.getY(i) + H * 0.84 * (1 - 0.18 * u * u + 0.06 * Math.sin(u * 7 + 1))); lp.setZ(i, lp.getZ(i) - 2.3 + 1.6 * u * u + 0.4 * Math.sin(u * 5)); }
    this.lipBase = Float32Array.from(lp.array as Float32Array);
    this.group.add(this.mesh, this.lip);
    const dm = twoTone(new THREE.MeshPhongMaterial({ color: "#8a4416", specular: "#ffe2b0", shininess: 90 }), 0.6);
    for (let i = 0; i < nSpray; i++) { const d = new THREE.Mesh(new THREE.SphereGeometry(0.09 + 0.06 * ((i * 0.37) % 1), 8, 6), dm); this.group.add(d); this.spray.push(d); }
  }
  /** pose the liquid at time t (seconds) */
  update(t: number) {
    const W = this.width, H = this.H, p = this.mesh.geometry.attributes.position as THREE.BufferAttribute, b = this.base;
    const sway = (x: number, y: number) => (y / H) * (0.28 * Math.sin(x * 0.9 + t * 3.1) + 0.16 * Math.sin(x * 2.3 - t * 4.7)) - (y > 0.7 * H ? 0.35 * Math.sin(t * 2.2 + x * 0.5) : 0);
    for (let i = 0; i < p.count; i++) {
      const x = b[i * 3], y = b[i * 3 + 1], z = b[i * 3 + 2];
      const swell = y > 0.15 && z > 1 ? 0.3 * Math.sin(z * 0.45 - t * 3.6 + x * 0.3) * Math.min(1, z / 6) : 0;
      p.setXYZ(i, x, y + swell, z + sway(x, y));
    }
    p.needsUpdate = true; this.mesh.geometry.computeVertexNormals();
    const lp = this.lip.geometry.attributes.position as THREE.BufferAttribute, lb = this.lipBase;
    for (let i = 0; i < lp.count; i++) { const x = lb[i * 3], y = lb[i * 3 + 1]; lp.setXYZ(i, x, y, lb[i * 3 + 2] + sway(x, H * 0.84)); }
    lp.needsUpdate = true;
    this.tex.offset.set(t * 0.04, -t * 0.32);
    // spray: droplets thrown forward off the lip, arcing down
    this.spray.forEach((d, i) => {
      const ph = ((t * 0.9 + i * 0.618) % 1), x = ((i * 0.381) % 1 - 0.5) * W * 0.9, tau = ph * 1.1;
      d.position.set(x, H * 0.86 + (2.6 + (i % 4) * 0.5) * tau - 4.9 * tau * tau, -2.4 - (2.2 + (i % 3) * 0.8) * tau + sway(x, H * 0.84));
      d.visible = d.position.y > 0.2;
    });
  }
}
/** the cold, thickened molasses lying over the street: a sheet with lumps */
export const molSheet = (w: number, d: number) => {
  const g = new THREE.Group();
  const sheet = new THREE.Mesh(new THREE.PlaneGeometry(w, d, 40, 120).rotateX(-Math.PI / 2), liquidMat("molSheet").m);
  const p = sheet.geometry.attributes.position as THREE.BufferAttribute;
  for (let i = 0; i < p.count; i++) { const x = p.getX(i), z = p.getZ(i); p.setY(i, 0.18 * Math.sin(x * 1.3 + z * 0.4) * Math.sin(z * 0.7) + 0.08 * Math.sin(x * 4.1 - z * 2.3)); }
  sheet.geometry.computeVertexNormals(); sheet.receiveShadow = true; g.add(sheet);
  return g;
};

// ---------------- street pieces ----------------
/** riveted iron trestle of the elevated railway along z from z0 to z1, centred on x = 0, deck at height h */
export type ElRail = { group: THREE.Group; bent: THREE.Group };
export const elRail = (z0: number, z1: number, h: number, bentZ: number): ElRail => {
  const group = new THREE.Group(), bent = new THREE.Group();
  const iron = lam("elIron", () => ({ color: "#4f5a4f" })), tie = lam("elTie", () => ({ map: rep(beam(), 1, 1) }));
  const span = 8;
  for (let z = z0; z >= z1; z -= span) for (const x of [-1.7, 1.7]) {
    const post = new THREE.Mesh(new THREE.BoxGeometry(0.32, h, 0.32), iron); post.position.set(x, h / 2, z); group.add(post);
    if (x < 0) { const cross = new THREE.Mesh(new THREE.BoxGeometry(3.8, 0.45, 0.36), iron); cross.position.set(0, h - 0.2, z); group.add(cross); }
  }
  const seg = (za: number, zb: number, parent: THREE.Object3D, oz = 0) => {
    const L = za - zb, mz = (za + zb) / 2 - oz;
    for (const x of [-1.3, 1.3]) { const gird = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.7, L), iron); gird.position.set(x, h + 0.2, mz); parent.add(gird); }
    for (let z = za - 0.3; z > zb; z -= 0.75) { const t = new THREE.Mesh(new THREE.BoxGeometry(3.2, 0.14, 0.24), tie); t.position.set(0, h + 0.62, z - oz); parent.add(t); }
    for (const x of [-0.72, 0.72]) { const rl = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.12, L), iron); rl.position.set(x, h + 0.75, mz); parent.add(rl); }
  };
  // straight deck except one span, which lives in `bent` (pivot at its far end) so the wave can twist it
  for (let z = z0; z > z1; z -= span) if (Math.abs(z - span / 2 - bentZ) > 0.1) seg(z, z - span, group);
  bent.position.set(0, h, bentZ - span / 2); seg(bentZ + span / 2, bentZ - span / 2, bent, bentZ - span / 2); bent.children.forEach((c) => (c.position.y -= h));
  group.add(bent);
  return { group: shadowAll(group), bent };
};
const fireTex = () => ctex("fireFront", 1024, 1024, (g) => {
  g.fillStyle = "#b9473a"; g.fillRect(0, 0, 1024, 1024);
  g.strokeStyle = "rgba(60,20,20,0.35)"; g.lineWidth = 3;
  for (let y = 0; y < 1024; y += 28) { g.beginPath(); g.moveTo(0, y); g.lineTo(1024, y); g.stroke(); for (let x = (y / 28) % 2 ? 0 : 40; x < 1024; x += 80) { g.beginPath(); g.moveTo(x, y); g.lineTo(x, y + 28); g.stroke(); } }
  // big doors and windows
  g.fillStyle = "#7a1f1f"; g.strokeStyle = INK; g.lineWidth = 14;
  for (const x of [140, 560]) { g.beginPath(); g.roundRect(x, 520, 330, 500, [140, 140, 0, 0]); g.fill(); g.stroke(); g.fillStyle = "#e8c45a"; g.fillRect(x + 160, 560, 10, 460); g.fillStyle = "#7a1f1f"; }
  g.fillStyle = "#cfe0ee"; for (const x of [140, 420, 700]) { g.fillRect(x, 140, 180, 220); g.strokeRect(x, 140, 180, 220); }
  g.fillStyle = "#f6efdc"; g.fillRect(150, 400, 724, 100); g.strokeRect(150, 400, 724, 100);
  paintText(g, "FIRE HOUSE", 512, 452, 84, "#c0353a", "center", 0.1);
});
/** two-storey brick firehouse, front facing -x, base centred at its origin (8 m wide along z, 8 m deep) */
export const firehouse = () => {
  const g = new THREE.Group();
  const body = new THREE.Mesh(new THREE.BoxGeometry(8, 9, 8), [lam("fireSide", () => ({ color: "#a94235" })), lam("fireFront", () => ({ map: fireTex() })), lam("fireRoof", () => ({ color: "#5a3b2a" })), lam("fireSide", () => ({})), lam("fireSide", () => ({})), lam("fireSide", () => ({}))]);
  body.position.y = 4.5; g.add(body);
  const cornice = new THREE.Mesh(new THREE.BoxGeometry(8.6, 0.5, 8.6), lam("fireRoof", () => ({}))); cornice.position.y = 9.1; g.add(cornice);
  const base = new THREE.Mesh(new THREE.BoxGeometry(8.6, 0.4, 8.6), lam("stepStone", () => ({ color: "#b8aa97" }))); base.position.y = 0.2;
  return { g: shadowAll(g), base: shadowAll(base) };
};
/** a street cart stuck in the molasses */
export const cart = () => {
  const g = new THREE.Group(), wood = lam("cartWood", () => ({ map: rep(beam(), 1, 1) })), dark = lam("cartDark", () => ({ color: "#4a3426" }));
  const bed = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.5, 2.6), wood); bed.position.y = 0.9; g.add(bed);
  for (const sx of [-1, 1]) {
    const w = new THREE.Mesh(new THREE.TorusGeometry(0.55, 0.07, 6, 18).rotateY(Math.PI / 2), dark); w.position.set(sx * 0.9, 0.55, 0); g.add(w);
    for (let k = 0; k < 4; k++) { const sp = new THREE.Mesh(new THREE.BoxGeometry(0.04, 1.05, 0.05), dark); sp.position.set(sx * 0.9, 0.55, 0); sp.rotation.x = (k / 4) * Math.PI; g.add(sp); }
    const sh = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.07, 2.2), dark); sh.position.set(sx * 0.6, 0.75, -2.2); sh.rotation.x = -0.25; g.add(sh);
  }
  const barrel = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.32, 0.8, 14), lam("barrelWood", () => ({ color: "#9a6a3c" }))); barrel.position.set(0.25, 1.55, 0.4); g.add(barrel);
  return shadowAll(g);
};
/** a bowler hat lying on the goo */
export const hat = () => {
  const g = new THREE.Group(), m = lam("hatBlack", () => ({ color: "#2b2730" }));
  const brim = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.24, 0.03, 20), m), crown = new THREE.Mesh(new THREE.SphereGeometry(0.15, 16, 10, 0, Math.PI * 2, 0, Math.PI / 2), m);
  crown.position.y = 0.02; crown.scale.y = 1.1; g.add(brim, crown);
  return shadowAll(g);
};
/** garden hose coiled by a tap on a short pipe */
export const hose = () => {
  const g = new THREE.Group(), green = lam("hoseGreen", () => ({ color: "#3f8f3a" })), brass = lam("brass", () => ({ color: "#d9a83a" }));
  for (let k = 0; k < 4; k++) { const t = new THREE.Mesh(new THREE.TorusGeometry(0.42 - k * 0.02, 0.045, 6, 28).rotateX(Math.PI / 2), green); t.position.y = 0.05 + k * 0.09; g.add(t); }
  const pipe = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 1.0, 10), lam("ironHandle", () => ({ color: "#4a4e5a" }))); pipe.position.set(-0.55, 0.5, 0); g.add(pipe);
  const tap = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.06, 0.06), brass); tap.position.set(-0.55, 0.95, 0); g.add(tap);
  const spout = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 0.3, 8).rotateZ(Math.PI / 2), brass); spout.position.set(-0.4, 0.82, 0); g.add(spout);
  return shadowAll(g);
};
/** a big red X (two crossed bars) standing on the ground, in the x-y plane */
export const redX = (s: number) => {
  const g = new THREE.Group(), m = lam("xRed", () => ({ color: "#e0332e" }));
  for (const a of [0.78, -0.78]) { const b = new THREE.Mesh(new THREE.BoxGeometry(s * 1.3, s * 0.2, 0.08), m); b.rotation.z = a; g.add(b); }
  return shadowAll(g);
};
/** easel with a board on it */
export const easel = () => {
  const g = new THREE.Group(), wood = lam("poleWood", () => ({ color: "#7a5236" }));
  for (const [x, rz] of [[-0.4, 0.12], [0.4, -0.12]] as const) { const l = new THREE.Mesh(new THREE.BoxGeometry(0.06, 1.9, 0.06), wood); l.position.set(x, 0.92, 0); l.rotation.z = rz; g.add(l); }
  const back = new THREE.Mesh(new THREE.BoxGeometry(0.06, 1.8, 0.06), wood); back.position.set(0, 0.88, 0.35); back.rotation.x = -0.2; g.add(back);
  const shelf = new THREE.Mesh(new THREE.BoxGeometry(1.0, 0.05, 0.12), wood); shelf.position.set(0, 0.95, -0.12); g.add(shelf);
  return shadowAll(g);
};
/** small desk with a ledger and a stack of coins */
export const desk = () => {
  const g = new THREE.Group(), wood = lam("deskWood", () => ({ color: "#7a4b2e" }));
  const top = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.08, 0.7), wood); top.position.y = 0.78; g.add(top);
  for (const [x, z] of [[-0.62, -0.28], [0.62, -0.28], [-0.62, 0.28], [0.62, 0.28]]) { const l = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.78, 0.07), wood); l.position.set(x, 0.39, z); g.add(l); }
  const ledger = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.06, 0.36), lam("ledger", () => ({ color: "#2f5f3a" }))); ledger.position.set(0.25, 0.85, 0.05); ledger.rotation.y = 0.2; g.add(ledger);
  for (let k = 0; k < 5; k++) { const c = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.02, 12), lam("brass", () => ({ color: "#d9a83a" }))); c.position.set(-0.35, 0.83 + k * 0.022, 0.05); g.add(c); }
  return shadowAll(g);
};
/** tin cup (base at y = 0) */
export const cup = () => {
  const g = new THREE.Group();
  const c = new THREE.Mesh(new THREE.CylinderGeometry(0.075, 0.06, 0.13, 14), lam("tinCup", () => ({ color: "#c9ced6" }))); c.position.y = 0.065;
  const fill = new THREE.Mesh(new THREE.CircleGeometry(0.068, 14).rotateX(-Math.PI / 2), lam("molassesDark", () => ({ color: "#2e1408" }))); fill.position.y = 0.11;
  g.add(c, fill);
  return shadowAll(g);
};
/** painter's plank hung on two ropes, with a paint pot */
export const plank = () => {
  const g = new THREE.Group();
  const p = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.06, 2.4), lam("deckWood", () => ({ color: "#d9a86c" }))); g.add(p);
  for (const z of [-1.05, 1.05]) { const r = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 20, 6), lam("rope", () => ({ color: "#c9a46a" }))); r.position.set(0, 10, z); g.add(r); }
  const pot = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.12, 0.25, 12), lam("molassesDark", () => ({ color: "#6e3b1f" }))); pot.position.set(0.05, 0.16, 0.7); g.add(pot);
  return shadowAll(g);
};
/** brush on a pole (held by the painter), bristles at the top */
export const brush = () => {
  const g = new THREE.Group();
  const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 1.2, 6), lam("poleWood", () => ({ color: "#7a5236" }))); pole.position.y = 0.6; g.add(pole);
  const head = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.16, 0.08), lam("tankWall_brownSolid", () => ({ color: "#6e3b1f" }))); head.position.y = 1.25; g.add(head);
  return shadowAll(g);
};

// ---------------- signs ----------------
export const gallonsTex = () => ctex("gallons", 1024, 512, (g) => {
  g.fillStyle = "#f6efdc"; g.fillRect(0, 0, 1024, 512);
  g.lineWidth = 18; g.strokeStyle = INK; g.strokeRect(12, 12, 1000, 488);
  paintText(g, "OVER", 512, 92, 76, "#5a2b10", "center", 0.12);
  paintText(g, "2,000,000", 512, 248, 180, "#ffd84d", "center", 0.12);
  paintText(g, "GALLONS", 512, 412, 104, "#5a2b10", "center", 0.12);
});
export const planTex = () => ctex("tankPlan", 768, 1024, (g) => {
  g.fillStyle = "#2f5fb5"; g.fillRect(0, 0, 768, 1024);
  g.strokeStyle = "rgba(255,255,255,0.18)"; g.lineWidth = 2;
  for (let x = 0; x < 768; x += 48) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, 1024); g.stroke(); }
  for (let y = 0; y < 1024; y += 48) { g.beginPath(); g.moveTo(0, y); g.lineTo(768, y); g.stroke(); }
  // drawn the right way up, then the whole sheet is hung upside down (rotated in the world)
  g.strokeStyle = "#ffffff"; g.lineWidth = 8;
  g.strokeRect(214, 300, 340, 480); g.beginPath(); g.ellipse(384, 300, 170, 40, 0, 0, Math.PI * 2); g.stroke();
  g.beginPath(); g.ellipse(384, 780, 170, 40, 0, 0, Math.PI); g.stroke();
  paintText(g, "TANK PLAN", 384, 140, 92, "#ffffff", "center", 0.06);
  g.font = "700 36px DejaVu Sans, Arial"; g.fillStyle = "#ffffff"; g.textAlign = "center"; g.fillText("50 FT  x  90 FT", 384, 880);
});
export const treasurerTex = () => ctex("treasurer", 1024, 256, (g) => {
  g.fillStyle = "#2f2a3a"; g.fillRect(0, 0, 1024, 256);
  g.lineWidth = 12; g.strokeStyle = "#e8c45a"; g.strokeRect(12, 12, 1000, 232);
  paintText(g, "TREASURER", 512, 132, 140, "#e8c45a", "center", 0.08);
});
export const calendarTex = () => ctex("calendar1919", 512, 640, (g) => {
  g.fillStyle = "#f6efdc"; g.fillRect(0, 0, 512, 640);
  g.fillStyle = "#c0353a"; g.fillRect(0, 0, 512, 170);
  g.lineWidth = 14; g.strokeStyle = INK; g.strokeRect(7, 7, 498, 626);
  paintText(g, "JANUARY", 256, 92, 92, "#ffffff", "center", 0.1);
  paintText(g, "15", 256, 360, 280, "#2f2a3a", "center", 0.04);
  paintText(g, "1919", 256, 560, 96, "#c0353a", "center", 0.1);
});
export const feetTex = () => ctex("feet25", 512, 320, (g) => {
  g.fillStyle = "#ffd84d"; g.fillRect(0, 0, 512, 320);
  g.lineWidth = 16; g.strokeStyle = INK; g.strokeRect(8, 8, 496, 304);
  paintText(g, "25 FT", 256, 166, 170, "#2f2a3a", "center", 0.04);
});
export const mphTex = () => ctex("mph35", 512, 640, (g) => {
  g.fillStyle = "#ffffff"; g.fillRect(0, 0, 512, 640);
  g.lineWidth = 18; g.strokeStyle = INK; g.strokeRect(9, 9, 494, 622);
  paintText(g, "SPEED", 256, 112, 96, "#2f2a3a", "center", 0.04);
  paintText(g, "35", 256, 330, 280, "#e0332e", "center", 0.06);
  paintText(g, "MPH", 256, 540, 120, "#2f2a3a", "center", 0.04);
});
/** height pole with foot marks up to 25 ft (7.6 m) */
export const markPole = () => {
  const g = new THREE.Group();
  const pole = new THREE.Mesh(new THREE.BoxGeometry(0.18, 7.8, 0.18), lam("markPole", () => ({ color: "#f4f1ea" }))); pole.position.y = 3.9; g.add(pole);
  for (let k = 1; k <= 25; k++) { const t = new THREE.Mesh(new THREE.BoxGeometry(k % 5 ? 0.3 : 0.6, 0.05, 0.2), lam("xRed", () => ({ color: "#e0332e" }))); t.position.set(0, k * 0.3048, 0); g.add(t); }
  return shadowAll(g);
};

/** a big "?" that pops over someone's head (camera-facing plane) */
export const questionMark = () => {
  const m = new THREE.Mesh(new THREE.PlaneGeometry(0.55, 0.7), new THREE.MeshBasicMaterial({ map: ctex("qmark", 256, 320, (g) => paintText(g, "?", 128, 170, 280, "#ffd84d", "center", 0.12)), transparent: true, depthWrite: false }));
  return m;
};
