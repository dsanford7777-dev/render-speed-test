// Scenery kit (Nov 16, 2026): shared pieces for backgrounds built to claude/background-and-character-look.md.
// Rock in big flat facets with flecks and cracks on top, loose rocks of every size, pines and bushes for layered
// forests, dust motes, and a soft cone of light under a lamp. Geometry and textures only: the caller picks the
// material (MeshStandardMaterial for lamp-lit interiors, lam() two-tone for sunlit exteriors) and sets layers.
import * as THREE from "three";
import { ctex } from "./paint";

const rngOf = (seed: number) => { let s = (seed * 9301 + 49297) % 233280 || 1; return () => (s = (s * 16807) % 2147483647) / 2147483647; };

/** rock's fine scale: flecks, pits and hairline cracks (and strata bands for cliffs). The big scale is the facets. */
export const rockTex = (key = "scRock", base = "#b08a62", strata = false) => ctex(key, 1024, 1024, (g, r) => {
  g.fillStyle = base; g.fillRect(0, 0, 1024, 1024);
  if (strata) for (let y = 0; y < 1024;) { const h = 34 + r() * 96; g.fillStyle = r() > 0.5 ? "rgba(60,36,20,0.17)" : "rgba(255,232,196,0.13)"; g.fillRect(0, y, 1024, h * 0.55); g.fillStyle = "rgba(50,30,18,0.42)"; g.fillRect(0, y, 1024, 3 + r() * 4); y += h; }
  for (let i = 0; i < 3400; i++) {
    const x = r() * 1024, y = r() * 1024, s = 3 + r() * 9, n = 4 + Math.floor(r() * 3), a0 = r() * 6.283;
    g.fillStyle = r() > 0.55 ? `rgba(70,44,26,${(0.07 + 0.13 * r()).toFixed(2)})` : `rgba(255,232,196,${(0.05 + 0.1 * r()).toFixed(2)})`;
    g.beginPath();
    for (let k = 0; k < n; k++) { const a = a0 + (k * 6.283) / n, rr = s * (0.6 + 0.5 * r()), px = x + Math.cos(a) * rr, py = y + Math.sin(a) * rr; if (k) g.lineTo(px, py); else g.moveTo(px, py); }
    g.closePath(); g.fill();
  }
  g.strokeStyle = "rgba(40,24,14,0.75)"; g.lineCap = "round"; g.lineJoin = "round";
  for (let i = 0; i < 16; i++) { let x = r() * 1024, y = r() * 1024, a = r() * 6.283; g.lineWidth = 2 + r() * 2.5; g.beginPath(); g.moveTo(x, y); const n = 5 + Math.floor(r() * 7); for (let k = 0; k < n; k++) { a += (r() - 0.5) * 1.2; x += Math.cos(a) * (30 + r() * 50); y += Math.sin(a) * (30 + r() * 50); g.lineTo(x, y); } g.stroke(); }
});

/** packed dirt: a worn base, raised worm-track squiggles that catch the light, grit, pebbles, and optional wheel ruts along v */
export const dirtTex = (key = "scDirt", base = "#a8845a", ruts = false) => ctex(key, 1024, 1024, (g, r) => {
  g.fillStyle = base; g.fillRect(0, 0, 1024, 1024);
  for (let i = 0; i < 60; i++) { g.fillStyle = r() > 0.5 ? "rgba(255,226,180,0.07)" : "rgba(60,38,20,0.08)"; g.beginPath(); g.ellipse(r() * 1024, r() * 1024, 60 + r() * 140, 40 + r() * 90, r() * 3, 0, 6.3); g.fill(); }
  if (ruts) for (const u of [0.3, 0.7]) { g.strokeStyle = "rgba(70,46,26,0.5)"; g.lineWidth = 46; g.beginPath(); g.moveTo(1024 * u, 0); for (let y = 0; y <= 1024; y += 64) g.lineTo(1024 * u + 10 * Math.sin(y * 0.02 + u * 9), y); g.stroke(); g.strokeStyle = "rgba(255,226,180,0.2)"; g.lineWidth = 6; g.beginPath(); g.moveTo(1024 * u + 30, 0); for (let y = 0; y <= 1024; y += 64) g.lineTo(1024 * u + 30 + 10 * Math.sin(y * 0.02 + u * 9), y); g.stroke(); }
  g.lineCap = "round";
  for (let i = 0; i < 900; i++) { const x = r() * 1024, y = r() * 1024, a = r() * 6.283, l = 10 + r() * 22; g.lineWidth = 3 + r() * 2;
    g.strokeStyle = "rgba(64,40,22,0.35)"; g.beginPath(); g.moveTo(x, y + 2); g.quadraticCurveTo(x + Math.cos(a) * l * 0.5 + 6 * (r() - 0.5), y + 2 + Math.sin(a) * l * 0.5, x + Math.cos(a) * l, y + 2 + Math.sin(a) * l); g.stroke();
    g.strokeStyle = "rgba(255,230,190,0.3)"; g.beginPath(); g.moveTo(x, y); g.quadraticCurveTo(x + Math.cos(a) * l * 0.5 + 6 * (r() - 0.5), y + Math.sin(a) * l * 0.5, x + Math.cos(a) * l, y + Math.sin(a) * l); g.stroke(); }
  for (let i = 0; i < 4200; i++) { g.fillStyle = r() > 0.5 ? "rgba(255,232,196,0.22)" : "rgba(50,30,16,0.28)"; g.fillRect(r() * 1024, r() * 1024, 2 + r() * 4, 2 + r() * 3); }
  for (let i = 0; i < 130; i++) { const x = r() * 1024, y = r() * 1024, s = 5 + r() * 9; g.fillStyle = "rgba(50,32,20,0.4)"; g.beginPath(); g.ellipse(x + 2, y + 3, s, s * 0.7, 0, 0, 6.3); g.fill(); g.fillStyle = r() > 0.5 ? "#c9b49a" : "#a89886"; g.beginPath(); g.ellipse(x, y, s, s * 0.7, r() * 3, 0, 6.3); g.fill(); }
});

const facet = (g0: THREE.BufferGeometry, seed: number, spread = 0.3) => {
  const g = g0.index ? g0.toNonIndexed() : g0; g.computeVertexNormals();
  const n = g.attributes.position.count, col = new Float32Array(n * 3), r = rngOf(seed);
  for (let t = 0; t < n; t += 3) { const k = 1 - spread / 2 + spread * r(); for (let i = 0; i < 9; i++) col[t * 3 + i] = k; }
  g.setAttribute("color", new THREE.Float32BufferAttribute(col, 3));
  return g;
};

/** a rough rock face standing in the XY plane, facing +z, feet on y = 0, centred on x: W x H metres in cells of ~cell m.
 *  Inner vertices are pushed out up to `amp` and jittered, then the mesh is split into flat facets, each a slightly
 *  different shade (vertex colours: use vertexColors + flatShading). `push(u, v)` (0..1 across, 0..1 up) scales the push;
 *  `tile` = metres of wall per texture repeat. */
export const rockWall = (W: number, H: number, cell: number, amp: number, seed: number, tile = 3, push?: (u: number, v: number) => number) => {
  const nx = Math.max(2, Math.round(W / cell)), ny = Math.max(2, Math.round(H / cell)), r = rngOf(seed);
  const g0 = new THREE.PlaneGeometry(W, H, nx, ny); g0.translate(0, H / 2, 0);
  const p = g0.attributes.position as THREE.BufferAttribute, uv = g0.attributes.uv as THREE.BufferAttribute;
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i), y = p.getY(i), u = x / W + 0.5, v = y / H, edge = u < 1e-4 || u > 1 - 1e-4 || v < 1e-4 || v > 1 - 1e-4;
    const k = push ? push(u, v) : 1, broad = 0.55 + 0.45 * Math.sin(u * 9 + seed) * Math.cos(v * 6 + seed * 0.7);
    if (!edge) { p.setX(i, x + (r() - 0.5) * cell * 0.55); p.setY(i, y + (r() - 0.5) * cell * 0.55); }
    p.setZ(i, edge ? 0 : amp * k * (0.2 + 0.8 * r()) * broad);
    uv.setXY(i, (u * W) / tile, (v * H) / tile);
  }
  return facet(g0, seed + 1, 0.44);
};

/** a loose rock or boulder of radius ~rad: a low-poly ball pushed about, flat facets, per-facet shade */
export const rockGeo = (rad: number, seed: number, detail = 1, squash = 0.75) => {
  const g0 = new THREE.IcosahedronGeometry(rad, detail), p = g0.attributes.position as THREE.BufferAttribute;
  const h = (x: number, y: number, z: number) => { const s = Math.sin(x * 127.1 + y * 311.7 + z * 74.7 + seed * 13.1) * 43758.5453; return s - Math.floor(s); };
  for (let i = 0; i < p.count; i++) { const x = p.getX(i), y = p.getY(i), z = p.getZ(i), q = (v: number) => Math.round((v / rad) * 50), k = 0.72 + 0.5 * h(q(x), q(y), q(z)); p.setXYZ(i, x * k, y * k * squash, z * k); }
  return facet(g0, seed + 2, 0.34);
};

/** a pine: tiers of drooping, ragged boughs on a trunk, h metres tall, foliage radius rr. Each tier is a cone whose rim
 *  is cut into points that hang down, so the outline is a tree and not a stack of party hats.
 *  Returns [foliage, trunk] geometries at the origin. */
export const pineGeo = (h: number, rr: number, seed: number): [THREE.BufferGeometry, THREE.BufferGeometry] => {
  const r = rngOf(seed), pos: number[] = [], tiers = 6, seg = 10, y0 = h * 0.16, span = h - y0;
  for (let k = 0; k < tiers; k++) {
    const t = k / tiers, ch = (span / tiers) * 1.9, cr = rr * Math.pow(1 - t, 0.85) * (0.88 + 0.24 * r()) + rr * 0.06, c = new THREE.ConeGeometry(cr, ch, seg, 1), p = c.attributes.position as THREE.BufferAttribute;
    const jit = Array.from({ length: seg }, () => r()), ph = Math.floor(r() * 2);
    for (let i = 0; i < p.count; i++) { const x = p.getX(i), y = p.getY(i), z = p.getZ(i), rad = Math.hypot(x, z); if (y > -ch / 2 + 1e-3 || rad < 1e-4) continue;
      const q = ((Math.round(Math.atan2(z, x) / (6.2832 / seg)) % seg) + seg) % seg, out = (q + ph) % 2 === 0, kk = out ? 1.0 + 0.16 * jit[q] : 0.6 + 0.12 * jit[q];
      p.setXYZ(i, x * kk, y - (out ? ch * (0.1 + 0.12 * jit[q]) : -ch * 0.06), z * kk); }
    c.rotateY(r() * 6.283); c.translate((r() - 0.5) * 0.1 * rr, y0 + t * span * 0.94 + ch * 0.36, (r() - 0.5) * 0.1 * rr);
    pos.push(...(c.toNonIndexed().attributes.position.array as Float32Array));
  }
  const fol = new THREE.BufferGeometry(); fol.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  const trunk = new THREE.CylinderGeometry(rr * 0.06, rr * 0.11, h * 0.36, 6); trunk.translate(0, h * 0.18, 0);
  return [facet(fol, seed + 3, 0.26), facet(trunk, seed + 4, 0.15)];
};

/** a bush or a round treetop: a clump of low-poly balls, flat facets */
export const bushGeo = (rad: number, seed: number, n = 5) => {
  const r = rngOf(seed), pos: number[] = [];
  for (let k = 0; k < n; k++) { const b = new THREE.IcosahedronGeometry(rad * (0.55 + 0.45 * r()), 1); b.scale(1, 0.8, 1); b.translate((r() - 0.5) * rad * 1.5, rad * (0.45 + 0.5 * r()), (r() - 0.5) * rad * 1.5); pos.push(...(b.attributes.position.array as Float32Array)); }
  const g = new THREE.BufferGeometry(); g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  return facet(g, seed + 5, 0.26);
};

/** merge geometries that carry position + colour (+ normal) into one, each moved by its matrix */
export const mergeFacets = (list: { g: THREE.BufferGeometry; m: THREE.Matrix4; tint?: number }[]) => {
  let n = 0; for (const { g } of list) n += g.attributes.position.count;
  const pos = new Float32Array(n * 3), col = new Float32Array(n * 3), uv = new Float32Array(n * 2), v = new THREE.Vector3(); let o = 0;
  for (const { g, m, tint = 1 } of list) { const p = g.attributes.position, c = g.attributes.color, u = g.attributes.uv;
    for (let i = 0; i < p.count; i++) { v.fromBufferAttribute(p, i).applyMatrix4(m); pos[(o + i) * 3] = v.x; pos[(o + i) * 3 + 1] = v.y; pos[(o + i) * 3 + 2] = v.z;
      const k = (c ? c.getX(i) : 1) * tint; col[(o + i) * 3] = k; col[(o + i) * 3 + 1] = k; col[(o + i) * 3 + 2] = k; if (u) { uv[(o + i) * 2] = u.getX(i); uv[(o + i) * 2 + 1] = u.getY(i); } }
    o += p.count; }
  const out = new THREE.BufferGeometry(); out.setAttribute("position", new THREE.BufferAttribute(pos, 3)); out.setAttribute("color", new THREE.BufferAttribute(col, 3)); out.setAttribute("uv", new THREE.BufferAttribute(uv, 2)); out.computeVertexNormals();
  return out;
};

const glowDot = () => ctex("scGlowDot", 64, 64, (g) => { const gr = g.createRadialGradient(32, 32, 0, 32, 32, 32); gr.addColorStop(0, "rgba(255,255,255,1)"); gr.addColorStop(0.35, "rgba(255,255,255,0.5)"); gr.addColorStop(1, "rgba(255,255,255,0)"); g.fillStyle = gr; g.fillRect(0, 0, 64, 64); });

/** dust motes drifting in a box (centre c, size s): call drift(t) every frame */
export const dustMotes = (c: THREE.Vector3, s: THREE.Vector3, n: number, color: THREE.Color, size = 0.035, opacity = 0.55) => {
  const base = new Float32Array(n * 3), r = rngOf(n + 5);
  for (let i = 0; i < n; i++) { base[i * 3] = c.x + (r() - 0.5) * s.x; base[i * 3 + 1] = c.y + (r() - 0.5) * s.y; base[i * 3 + 2] = c.z + (r() - 0.5) * s.z; }
  const g = new THREE.BufferGeometry(); g.setAttribute("position", new THREE.BufferAttribute(base.slice(), 3));
  const points = new THREE.Points(g, new THREE.PointsMaterial({ map: glowDot(), color, size, sizeAttenuation: true, transparent: true, opacity, blending: THREE.AdditiveBlending, depthWrite: false, fog: false }));
  points.frustumCulled = false;
  const drift = (t: number) => { const a = g.attributes.position.array as Float32Array;
    for (let i = 0; i < n; i++) { a[i * 3] = base[i * 3] + 0.18 * Math.sin(t * 0.3 + i); a[i * 3 + 1] = base[i * 3 + 1] + 0.25 * Math.sin(t * 0.21 + i * 1.7); a[i * 3 + 2] = base[i * 3 + 2] + 0.18 * Math.cos(t * 0.26 + i * 0.6); }
    g.attributes.position.needsUpdate = true; };
  return { points, drift };
};

const coneTex = () => ctex("scCone", 256, 256, (g) => {
  g.clearRect(0, 0, 256, 256);
  for (let y = 0; y < 256; y++) { const v = y / 255, w = 10 + 118 * v, a = Math.pow(1 - v, 1.5) * (0.25 + 0.75 * Math.min(1, v * 6));
    const gr = g.createLinearGradient(128 - w, 0, 128 + w, 0); gr.addColorStop(0, "rgba(255,255,255,0)"); gr.addColorStop(0.5, `rgba(255,255,255,${a.toFixed(3)})`); gr.addColorStop(1, "rgba(255,255,255,0)");
    g.fillStyle = gr; g.fillRect(128 - w, y, 2 * w, 1); }
});
/** a soft cone of light hanging from a lamp: a painted glow that always faces the camera, brightest down the middle and
 *  near the lamp, fading to nothing at the sides and the bottom. Put it at the lamp: it hangs down h metres, 2r wide. */
export const lightCone = (r: number, h: number, color: THREE.Color, strength = 0.5) => {
  const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: coneTex(), color, opacity: strength, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, fog: false }));
  sp.center.set(0.5, 1); sp.scale.set(2 * r, h, 1);
  return sp;
};
