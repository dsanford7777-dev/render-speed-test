// Props and painted textures for the barber pole short (Paradox Town #5), in the house look: two-tone lam()
// materials, hand-painted canvas textures, ink outlines on the shapes, flat bold cartoon colours.
// Interior props face -z (the shop is open toward -z); street props hang on the west row and face +x.
import * as THREE from "three";
import { lam, boxGeo, V, Batch } from "../bridge/build";
import { ctex, rep, beam, stoneHD } from "../bridge/paint";
import { INK, paintText } from "../dst/props";

const shadowAll = <T extends THREE.Object3D>(g: T): T => { g.traverse((o) => { o.castShadow = true; o.receiveShadow = true; }); return g; };
const font = (px: number, w = 900) => `${w} ${px}px "DejaVu Sans", "Arial Black", Arial, sans-serif`;
const lathe = (pts: [number, number][], seg = 28) => new THREE.LatheGeometry(pts.map(([r, y]) => new THREE.Vector2(r, y)), seg);
export const RED = "#d8323a", BLUE = "#2f4f9f", BRASS = "#f0c24e";

// ---------------- stripes ----------------
/** the pole's sleeve: `n` stripe sets around, each red [+ blue] + white; v runs up the pole */
export const stripeTex = (blue: boolean) => ctex(`poleStripes_${blue}`, 512, 512, (g) => {
  const n = 2, cols = blue ? [RED, "#ffffff", BLUE, "#ffffff"] : [RED, "#ffffff"];
  const w = 512 / (n * cols.length);
  for (let i = 0; i < n * cols.length; i++) { g.fillStyle = cols[i % cols.length]; g.fillRect(i * w, 0, w + 1, 512); }
  g.fillStyle = INK; for (let i = 0; i < n * cols.length; i++) g.fillRect(i * w - 3, 0, 6, 512);
});
/** washed but still stained bandages: off-white strips with blotchy red-brown stains, frayed gaps between strips */
export const bandageTex = () => ctex("bandages", 512, 512, (g, r) => {
  g.fillStyle = "#fbf6ea"; g.fillRect(0, 0, 512, 512);
  const n = 4, w = 512 / n;
  for (let i = 0; i < n; i++) {
    // a stained band on half of each strip
    const x0 = i * w + w * 0.45;
    g.fillStyle = "#c62f38"; g.fillRect(x0, 0, w * 0.5, 512);
    for (let k = 0; k < 26; k++) { g.fillStyle = k % 3 ? "rgba(140,30,40,0.45)" : "rgba(239,230,212,0.7)"; const y = r() * 512; g.beginPath(); g.ellipse(x0 + r() * w * 0.5, y, 6 + r() * 14, 10 + r() * 30, 0, 0, Math.PI * 2); g.fill(); }
    g.fillStyle = "rgba(36,23,38,0.55)"; g.fillRect(i * w, 0, 4, 512);
  }
});

// ---------------- the modern pole ----------------
/** a barber pole on a wall bracket. Sleeve spins with spin(t); setBlue swaps the stripes. Axis vertical, centre at 0. */
export class Pole {
  group = new THREE.Group(); sleeve: THREE.Mesh; ball: THREE.Mesh; bowl: THREE.Group;
  private tex: Record<"rw" | "rwb", THREE.Texture> = { rw: rep(stripeTex(false), 1, 1), rwb: rep(stripeTex(true), 1, 1) };
  constructor(public len = 1.2, public r = 0.13) {
    const G = this.group, brass = lam("brass", () => ({ color: BRASS }));
    for (const t of Object.values(this.tex)) { t.wrapS = THREE.RepeatWrapping; t.wrapT = THREE.RepeatWrapping; }
    this.sleeve = new THREE.Mesh(new THREE.CylinderGeometry(r, r, len, 40, 24, true), lam("poleSleeve_rw", () => ({ map: this.tex.rw })));
    twistUV(this.sleeve, 1.6);
    const capT = new THREE.Mesh(lathe([[0, 0], [r * 1.25, 0], [r * 1.25, 0.06], [r * 0.9, 0.12], [r * 0.4, 0.16], [0, 0.16]]), brass); capT.position.y = len / 2;
    const capB = capT.clone(); capB.rotation.x = Math.PI; capB.position.y = -len / 2;
    this.ball = new THREE.Mesh(new THREE.SphereGeometry(r * 0.75, 20, 14), brass); this.ball.position.y = len / 2 + 0.16 + r * 0.6;
    const bb = new BloodBowl(r * 1.6); bb.setFill(0.7); this.bowl = bb.group; this.bowl.position.y = len / 2 + 0.14; this.bowl.visible = false;
    const tip = new THREE.Mesh(new THREE.SphereGeometry(r * 0.3, 12, 10), brass); tip.position.y = -len / 2 - 0.2;
    // wall bracket toward -x (the wall)
    const iron = lam("ironHandle", () => ({ color: "#4a4e5a" }));
    for (const y of [len * 0.32, -len * 0.32]) { const a = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.045, 0.045), iron); a.position.set(-0.24, y, 0); G.add(a); }
    G.add(this.sleeve, capT, capB, this.ball, this.bowl, tip);
    shadowAll(G);
  }
  spin(t: number, rate = 0.35) { this.tex.rw.offset.x = -t * rate; this.tex.rwb.offset.x = -t * rate; }
  setBlue(on: boolean) { this.sleeve.material = lam(`poleSleeve_${on ? "rwb" : "rw"}`, () => ({ map: on ? this.tex.rwb : this.tex.rw })); }
}
/** u' = u + k v: turns vertical stripes into a helix (k turns over the height) */
export const twistUV = (m: THREE.Mesh, k: number) => {
  const g = m.geometry as THREE.CylinderGeometry, uv = g.attributes.uv as THREE.BufferAttribute;
  const base = (g.userData.uv0 ??= Float32Array.from(uv.array as Float32Array)) as Float32Array;
  for (let i = 0; i < uv.count; i++) uv.setXY(i, base[i * 2] + k * base[i * 2 + 1], base[i * 2 + 1]);
  uv.needsUpdate = true;
};

// ---------------- the old staff ----------------
/** the wooden staff the patient squeezed, with the brass bowl on top and a sleeve of drying bandages (twist with wrap()) */
export class Staff {
  group = new THREE.Group(); wood: THREE.Mesh; cloth: THREE.Mesh; bowl: THREE.Group; strips: THREE.Mesh[] = [];
  constructor(public len = 1.25) {
    const G = this.group;
    this.wood = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.055, len, 14), lam("staffWood", () => ({ color: "#9a6a3e" })));
    const bt = rep(bandageTex(), 1, 1); bt.wrapS = THREE.RepeatWrapping;
    this.cloth = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.11, len * 0.82, 32, 16, true), lam("bandageSleeve", () => ({ map: bt, side: THREE.DoubleSide })));
    this.cloth.position.y = -len * 0.05;
    this.bowl = brassBowl(0.2); this.bowl.position.y = len / 2;
    // loose hanging ends below the sleeve (sway in the wind)
    for (let k = 0; k < 4; k++) {
      const s = new THREE.Mesh(new THREE.PlaneGeometry(0.06, 0.28, 1, 4), lam(k % 2 ? "bandStain" : "bandWhite", () => ({ color: k % 2 ? "#b8343a" : "#efe6d4", side: THREE.DoubleSide })));
      s.geometry.translate(0, -0.14, 0); const a = (k / 4) * Math.PI * 2;
      s.position.set(Math.cos(a) * 0.085, -len * 0.46, Math.sin(a) * 0.085); s.rotation.y = -a + Math.PI / 2;
      this.strips.push(s); G.add(s);
    }
    const iron = lam("ironHandle", () => ({ color: "#4a4e5a" }));
    for (const y of [len * 0.32, -len * 0.32]) { const a = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.045, 0.045), iron); a.position.set(-0.24, y, 0); G.add(a); }
    G.add(this.wood, this.cloth, this.bowl);
    shadowAll(G);
  }
  /** 0 = strips hang straight, 1 = twisted into a spiral */
  wrap(u: number, t: number) {
    twistUV(this.cloth, 1.4 * u);
    this.strips.forEach((s, k) => { s.rotation.x = (1 - u) * 0.25 * Math.sin(t * 3 + k * 1.7); s.rotation.z = u * 0.6; s.visible = u < 0.85; });
  }
}

// ---------------- the shop ----------------
/** brass bowl (open side up), rim radius r */
export const brassBowl = (r: number) => {
  const g = new THREE.Group();
  const bowl = new THREE.Mesh(lathe([[0, 0], [r * 0.45, 0], [r * 0.5, 0.02], [r * 0.8, r * 0.18], [r, r * 0.45], [r * 1.04, r * 0.47], [r * 0.96, r * 0.45], [r * 0.76, r * 0.2], [0, r * 0.06]], 32),
    lam("brassD", () => ({ color: BRASS, side: THREE.DoubleSide })));
  g.add(bowl);
  return shadowAll(g);
};
/** bowl with a red pool inside that fills with setFill(0..1) */
export class BloodBowl {
  group: THREE.Group; pool: THREE.Mesh;
  constructor(public r = 0.22) {
    this.group = brassBowl(r);
    this.pool = new THREE.Mesh(new THREE.CircleGeometry(1, 28).rotateX(-Math.PI / 2), lam("bloodPool", () => ({ color: "#a8202e" })));
    this.group.add(this.pool); this.setFill(0);
  }
  setFill(u: number) {
    const k = Math.max(0, Math.min(1, u)), y = this.r * (0.07 + 0.34 * k), rr = this.r * (0.5 + 0.42 * k);
    this.pool.position.y = y; this.pool.scale.setScalar(rr); this.pool.visible = k > 0.02;
  }
}
/** a falling drop (red sphere stretched) */
export const drop = () => { const m = new THREE.Mesh(new THREE.SphereGeometry(0.022, 12, 10), lam("bloodPool", () => ({ color: "#a8202e" }))); m.scale.set(1, 1.5, 1); return m; };
/** barber's chair, seat toward -z, seat height 0.55 */
export const chair = () => {
  const g = new THREE.Group(), leather = lam("chairRed", () => ({ color: "#8c2f3a" })), wood = lam("chairWood", () => ({ color: "#6b4a2f" })), brass = lam("brass", () => ({ color: BRASS }));
  const seat = new THREE.Mesh(new THREE.BoxGeometry(0.62, 0.14, 0.58), leather); seat.position.set(0, 0.52, 0);
  const back = new THREE.Mesh(new THREE.BoxGeometry(0.62, 0.8, 0.12), leather); back.position.set(0, 0.98, 0.3); back.rotation.x = -0.12;
  const head = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.16, 0.1), leather); head.position.set(0, 1.47, 0.36);
  for (const sx of [-1, 1]) { const arm = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.06, 0.5), wood); arm.position.set(sx * 0.35, 0.78, 0.02); g.add(arm);
    const post = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.24, 0.06), wood); post.position.set(sx * 0.35, 0.64, -0.18); g.add(post); }
  const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 0.42, 12), brass); stem.position.y = 0.24;
  const foot = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.32, 0.05, 20), brass); foot.position.y = 0.025;
  g.add(seat, back, head, stem, foot);
  return shadowAll(g);
};
const jarTex = (s: string) => ctex(`jar_${s}`, 256, 256, (g) => {
  g.fillStyle = "#f4e9cf"; g.fillRect(0, 0, 256, 256); g.lineWidth = 10; g.strokeStyle = INK; g.strokeRect(5, 5, 246, 246);
  paintText(g, s, 128, 132, s.length > 5 ? 46 : 60, "#c9373a", "center", 0.12);
});
const mirrorTex = () => ctex("barberMirror", 512, 640, (g) => {
  const gr = g.createLinearGradient(0, 0, 512, 640); gr.addColorStop(0, "#cfe2ee"); gr.addColorStop(0.5, "#a9c3d6"); gr.addColorStop(1, "#c3d8e6");
  g.fillStyle = gr; g.fillRect(0, 0, 512, 640);
  g.fillStyle = "rgba(255,255,255,0.55)"; g.beginPath(); g.moveTo(60, 120); g.lineTo(150, 40); g.lineTo(190, 40); g.lineTo(80, 160); g.fill();
  g.beginPath(); g.moveTo(90, 220); g.lineTo(260, 60); g.lineTo(280, 60); g.lineTo(100, 240); g.fill();
  g.lineWidth = 26; g.strokeStyle = "#b78a3a"; g.strokeRect(13, 13, 486, 614); g.lineWidth = 8; g.strokeStyle = INK; g.strokeRect(4, 4, 504, 632);
});
export type Shop = { chair: THREE.Group; bowl: BloodBowl; drops: THREE.Mesh[]; heldStaff: THREE.Group; razor: THREE.Group };
/** open-roofed room centred on (cx, y0, cz): walls on -x, +x and +z, open towards -z */
export const buildShop = (root: THREE.Object3D, cx: number, y0: number, cz: number): Shop => {
  const b = new Batch();
  const floor = lam("barberFloor", () => ({ map: rep(checkTex(), 4, 4) }));
  const wall = lam("barberWall", () => ({ map: stoneHD("barberWallHD", ["#e9dcc2", "#e0d2b6", "#efe4cd", "#d9caac"], "#a8987c") }));
  const wood = lam("shopBeam", () => ({ map: beam() }));
  const X0 = cx - 4, X1 = cx + 4, Z0 = cz - 3, Z1 = cz + 3, H = 3.6;
  b.add(boxGeo(V(X0 - 2, y0 - 0.2, Z0 - 6), V(X1 + 2, y0, Z1 + 1), 3), floor);
  b.add(boxGeo(V(X0 - 0.3, y0, Z0), V(X0, y0 + H, Z1 + 0.3), 2), wall);
  b.add(boxGeo(V(X1, y0, Z0), V(X1 + 0.3, y0 + H, Z1 + 0.3), 2), wall);
  b.add(boxGeo(V(X0 - 0.3, y0, Z1), V(X1 + 0.3, y0 + H, Z1 + 0.3), 2), wall);
  for (let k = 0; k < 5; k++) { const z = Z0 + 0.6 + k * 1.35; b.add(boxGeo(V(X0 - 0.3, y0 + H, z - 0.12), V(X1 + 0.3, y0 + H + 0.24, z + 0.12)), wood); }
  // wainscot, shelf on the back wall, side table (left of the chair)
  b.add(boxGeo(V(X0, y0, Z1 - 0.06), V(X1, y0 + 1.0, Z1)), lam("wainscot", () => ({ color: "#7a5236" })));
  b.add(boxGeo(V(cx - 3.2, y0 + 2.0, Z1 - 0.34), V(cx - 1.2, y0 + 2.06, Z1)), wood);
  b.add(boxGeo(V(cx + 1.2, y0 + 2.0, Z1 - 0.34), V(cx + 3.2, y0 + 2.06, Z1)), wood);
  b.add(boxGeo(V(cx - 1.75, y0 + 0.78, cz + 0.05), V(cx - 0.95, y0 + 0.84, cz + 0.75)), wood);
  for (const [x, z] of [[-1.7, 0.1], [-1.0, 0.1], [-1.7, 0.7], [-1.0, 0.7]]) b.add(boxGeo(V(cx + x - 0.03, y0, cz + z - 0.03), V(cx + x + 0.03, y0 + 0.78, cz + z + 0.03)), wood);
  b.build(root);
  // mirror over the chair
  const mirror = new THREE.Mesh(new THREE.PlaneGeometry(1.4, 1.75), lam("barberMirror", () => ({ map: mirrorTex() })));
  mirror.rotation.y = Math.PI; mirror.position.set(cx, y0 + 2.2, Z1 - 0.02); root.add(mirror);
  // jars on the shelves (one of leeches)
  ["LEECHES", "SALVE", "TONIC", "SOAP", "POWDER", "OIL"].forEach((s, i) => {
    const jar = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.28, 16), lam(`jarGlass${i % 3}`, () => ({ color: ["#8fb6a8", "#c9a86a", "#a9b8d6"][i % 3] })));
    const x = i < 3 ? cx - 2.9 + i * 0.75 : cx + 1.5 + (i - 3) * 0.75; jar.position.set(x, y0 + 2.2, Z1 - 0.18);
    const lab = new THREE.Mesh(new THREE.PlaneGeometry(0.2, 0.14), lam(`jar_${s}`, () => ({ map: jarTex(s) }))); lab.rotation.y = Math.PI; lab.position.set(x, y0 + 2.2, Z1 - 0.305);
    root.add(shadowAll(jar), lab);
  });
  const ch = chair(); ch.position.set(cx, y0, cz + 0.7); root.add(ch);
  const bowl = new BloodBowl(0.17); bowl.group.position.set(cx - 1.35, y0 + 0.84, cz + 0.35); root.add(bowl.group);
  const drops = [0, 1, 2].map(() => { const d = drop(); root.add(d); return d; });
  const heldStaff = new THREE.Group();
  const sw = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 0.7, 12), lam("staffWood", () => ({ color: "#9a6a3e" }))); heldStaff.add(sw); root.add(shadowAll(heldStaff));
  // razor on the table
  const razor = new THREE.Group();
  const blade = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.008, 0.04), lam("steel", () => ({ color: "#c9ced8" })));
  const hd = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.014, 0.03), lam("chairWood", () => ({}))); hd.position.x = -0.17;
  razor.add(blade, hd); razor.position.set(cx - 1.1, y0 + 0.85, cz + 0.6); razor.rotation.y = 0.5; root.add(shadowAll(razor));
  root.traverse((o) => { const m = o as THREE.Mesh; if (m.isMesh && !m.receiveShadow) m.receiveShadow = true; });
  return { chair: ch, bowl, drops, heldStaff, razor };
};
const checkTex = () => ctex("barberCheck", 256, 256, (g) => {
  for (let y = 0; y < 4; y++) for (let x = 0; x < 4; x++) { g.fillStyle = (x + y) % 2 ? "#2f2a3a" : "#efe6d4"; g.fillRect(x * 64, y * 64, 64, 64); }
});

// ---------------- the street front ----------------
/** shop front panel painted on the west-row house (window right, door left, sign over) */
export const frontTex = () => ctex("barberFront", 1024, 704, (g) => {
  g.fillStyle = "#2f5f6a"; g.fillRect(0, 0, 1024, 704);
  g.fillStyle = "#24474f"; for (let x = 0; x < 1024; x += 64) g.fillRect(x, 0, 6, 704);
  // sign
  g.fillStyle = "#f6efdc"; g.fillRect(90, 30, 844, 130); g.lineWidth = 12; g.strokeStyle = INK; g.strokeRect(90, 30, 844, 130);
  paintText(g, "BARBER · SURGEON", 512, 98, 82, RED, "center", 0.12);
  // door (left)
  g.fillStyle = "#6b4a2f"; g.fillRect(70, 210, 260, 494); g.strokeRect(70, 210, 260, 494);
  g.fillStyle = "#3a2a20"; g.fillRect(110, 250, 180, 170); g.fillStyle = "#e8c45a"; g.beginPath(); g.arc(290, 470, 14, 0, Math.PI * 2); g.fill();
  // window (right): dark interior with a warm glow
  const gr = g.createLinearGradient(0, 220, 0, 560); gr.addColorStop(0, "#3a3550"); gr.addColorStop(1, "#5a4a5a");
  g.fillStyle = gr; g.fillRect(420, 220, 520, 340); g.strokeRect(420, 220, 520, 340);
  g.lineWidth = 14; g.strokeStyle = "#f6efdc"; g.beginPath(); g.moveTo(680, 220); g.lineTo(680, 560); g.moveTo(420, 390); g.lineTo(940, 390); g.stroke();
  g.lineWidth = 8; g.strokeStyle = INK; g.strokeRect(420, 220, 520, 340);
});
export const bannedTex = () => ctex("bannedStamp", 1024, 420, (g) => {
  g.clearRect(0, 0, 1024, 420);
  g.fillStyle = "rgba(224,51,46,0.96)"; g.strokeStyle = INK; g.lineWidth = 16;
  g.beginPath(); g.roundRect(30, 40, 964, 340, 30); g.fill(); g.stroke();
  g.lineWidth = 10; g.strokeStyle = "#ffffff"; g.beginPath(); g.roundRect(60, 70, 904, 280, 20); g.stroke();
  paintText(g, "BANNED", 512, 190, 190, "#ffffff", "center", 0.1);
  g.font = font(54, 800); g.fillStyle = "#ffffff"; g.textAlign = "center"; g.textBaseline = "middle"; g.fillText("NO BLOOD IN THE WINDOWS", 512, 315);
});
/** what a barber did: icons that light up one by one (n = 0..3) */
export const jobsTex = (n: number) => ctex(`jobs_${n}`, 1024, 420, (g) => {
  g.fillStyle = "#f6efdc"; g.fillRect(0, 0, 1024, 420); g.lineWidth = 16; g.strokeStyle = INK; g.strokeRect(8, 8, 1008, 404);
  const labels = ["HAIR", "TEETH", "BLOOD"], cols = ["#2f5f9f", "#7b5ac9", RED];
  for (let i = 0; i < 3; i++) {
    const x = 180 + i * 332, on = i < n;
    g.globalAlpha = on ? 1 : 0.15;
    g.save(); g.translate(x, 170);
    if (i === 0) { // scissors
      g.lineWidth = 16; g.strokeStyle = INK; g.fillStyle = cols[0];
      for (const s of [-1, 1]) { g.beginPath(); g.arc(s * 40, 60, 30, 0, Math.PI * 2); g.fill(); g.stroke(); }
      g.lineWidth = 26; g.beginPath(); g.moveTo(-30, 35); g.lineTo(55, -90); g.moveTo(30, 35); g.lineTo(-55, -90); g.stroke();
      g.lineWidth = 14; g.strokeStyle = "#d9dde6"; g.beginPath(); g.moveTo(-30, 35); g.lineTo(55, -90); g.moveTo(30, 35); g.lineTo(-55, -90); g.stroke();
    } else if (i === 1) { // tooth
      g.fillStyle = "#ffffff"; g.strokeStyle = INK; g.lineWidth = 14;
      g.beginPath(); g.moveTo(-70, -80); g.quadraticCurveTo(0, -120, 70, -80); g.quadraticCurveTo(90, 0, 50, 30); g.lineTo(35, 100); g.lineTo(10, 30); g.lineTo(-10, 30); g.lineTo(-35, 100); g.lineTo(-50, 30); g.quadraticCurveTo(-90, 0, -70, -80); g.closePath(); g.fill(); g.stroke();
    } else { // drop
      g.fillStyle = cols[2]; g.strokeStyle = INK; g.lineWidth = 14;
      g.beginPath(); g.moveTo(0, -110); g.quadraticCurveTo(75, 0, 70, 40); g.arc(0, 40, 70, 0, Math.PI); g.quadraticCurveTo(-75, 0, 0, -110); g.closePath(); g.fill(); g.stroke();
      g.fillStyle = "rgba(255,255,255,0.6)"; g.beginPath(); g.ellipse(-28, 30, 12, 24, 0.3, 0, Math.PI * 2); g.fill();
    }
    g.restore();
    paintText(g, labels[i], x, 360, 64, cols[i], "center", 0.14);
  }
  g.globalAlpha = 1;
});
export const surgeonTex = () => ctex("barberSurgeon", 1024, 400, (g) => {
  g.fillStyle = "#2f2a3a"; g.fillRect(0, 0, 1024, 400); g.lineWidth = 18; g.strokeStyle = "#e8c45a"; g.strokeRect(14, 14, 996, 372);
  paintText(g, "BARBER", 512, 120, 130, "#ffffff", "center", 0.1);
  paintText(g, "= SURGEON", 512, 280, 130, RED, "center", 0.1);
});
export const labelTex = (key: string, s: string, col: string, bg = "#f6efdc") => ctex(`label_${key}`, 1024, 300, (g) => {
  g.fillStyle = bg; g.fillRect(0, 0, 1024, 300); g.lineWidth = 16; g.strokeStyle = INK; g.strokeRect(8, 8, 1008, 284);
  paintText(g, s, 512, 156, s.length > 9 ? 120 : 160, col, "center", 0.1);
});
/** the window sill with three bowls on it (bowls toward +x, the street) */
export const sill = () => {
  const g = new THREE.Group();
  const board = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.08, 2.6), lam("signWood", () => ({ color: "#5a3b2a" }))); g.add(board);
  const bowls: BloodBowl[] = [];
  for (const z of [-0.8, 0, 0.8]) { const b = new BloodBowl(0.22); b.setFill(0.9); b.group.position.set(0.02, 0.04, z); g.add(b.group); bowls.push(b); }
  return { g: shadowAll(g), bowls };
};
