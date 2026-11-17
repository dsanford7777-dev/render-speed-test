// The Great Stink Short: the two daylight interiors/exteriors built with the two-tone materials.
//   buildRoom    the committee room: sun comes in through three real window openings, so light pools and the shadows of
//                the mullions fall across the floor and table; everything else sits in warm shade.
//   buildStreet  the poor court: tall sooty tenements, a parish pump, a gutter running to the river, washing overhead.
// Built to claude/background-and-character-look.md: named lights, two scales of texture, no ink on the set (NOINK),
// every corner dressed, air (dust, haze), a readable sign in each set.
import * as THREE from "three";
import { Batch, boxGeo, V, lam } from "../bridge/build";
import { planksHD, cobbleHD, stoneHD } from "../bridge/paint";
import { NOINK } from "../bridge/ink";
import { dustMotes, rockGeo, mergeFacets } from "../bridge/scenery";
import { SET, RM, WIN, CURTAIN_Z, TABLE, DOOR, LIME, ROOM_SUN, STREET, PUMP } from "./place";
import { waterTex as waterTex2, panelTex, wallpaperTex, carpetTex, leatherTex, curtainTex, riverViewTex, brickTex, labelTex, portraitTex, clockTex, shaftTex, glowTex, clothTex, tenWinTex, repT } from "./paint";

export const M = (key: string, col: string, extra: THREE.MeshLambertMaterialParameters = {}) => lam(key, () => ({ color: col, ...extra }));
const noInk = (o: THREE.Object3D) => { o.traverse((c) => { c.layers.set(NOINK); }); return o; };
type Put = (g: THREE.BufferGeometry, m: THREE.Material, x: number, y: number, z: number, cast?: boolean) => THREE.Mesh;
const putter = (G: THREE.Object3D, ox: number): Put => (g, m, x, y, z, cast = true) => { const ms = new THREE.Mesh(g, m); ms.position.set(ox + x, y, z); ms.castShadow = cast; ms.receiveShadow = true; G.add(ms); return ms; };
const plane = (w: number, h: number) => new THREE.PlaneGeometry(w, h);

/** a wooden bucket with iron hoops, 0.34 m tall; `fill` = colour of what is in it */
export const makeBucket = (fill: string) => { const G = new THREE.Group(), wood = M("skBucket", "#9a7448"), iron = M("skIron", "#34303a");
  const b = new THREE.Mesh(new THREE.CylinderGeometry(0.19, 0.15, 0.34, 14, 1, true), M("skBucketSide", "#9a7448", { side: THREE.DoubleSide })); b.position.y = 0.17; G.add(b);
  const bot = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.15, 0.02, 14), wood); bot.position.y = 0.01; G.add(bot);
  for (const y of [0.07, 0.27]) { const h = new THREE.Mesh(new THREE.TorusGeometry(0.155 + y * 0.12, 0.012, 6, 18), iron); h.rotation.x = Math.PI / 2; h.position.y = y; G.add(h); }
  const top = new THREE.Mesh(new THREE.CylinderGeometry(0.175, 0.175, 0.012, 14), M("skFill" + fill, fill)); top.position.y = 0.29; G.add(top);
  const hd = new THREE.Mesh(new THREE.TorusGeometry(0.19, 0.01, 6, 16, Math.PI), iron); hd.position.y = 0.34; G.add(hd);
  G.traverse((o) => { o.castShadow = true; o.receiveShadow = true; }); return G; };
/** a barrel 0.95 m tall */
const barrelAt = (put: Put, x: number, z: number, s = 1, col = "#8a6238") => { const st = M("skStave" + col, col), iron = M("skIron", "#34303a");
  put(new THREE.CylinderGeometry(0.3 * s, 0.3 * s, 0.95 * s, 16), st, x, 0.475 * s, z); put(new THREE.CylinderGeometry(0.345 * s, 0.345 * s, 0.5 * s, 16), st, x, 0.475 * s, z);
  for (const hy of [0.1, 0.3, 0.66, 0.86]) put(new THREE.CylinderGeometry((hy > 0.2 && hy < 0.8 ? 0.352 : 0.31) * s, (hy > 0.2 && hy < 0.8 ? 0.352 : 0.31) * s, 0.04 * s, 16), iron, x, hy * s, z); };

export type RoomSet = { group: THREE.Group; dry: THREE.Group; wet: THREE.Group; drift: (t: number) => void };
export function buildRoom(): RoomSet {
  const G = new THREE.Group(), ox = SET.room[0], put = putter(G, ox), b = new Batch(), wb = new Batch();
  const { w: W, z0: Z0, z1: Z1, h: H } = RM;
  const oak = lam("skOak", () => ({ map: panelTex() })), oakPlain = M("skOakPlain", "#6a4930"), oakDark = M("skOakDark", "#4a3220"), stone = M("skStoneTrim", "#cbbd9c");
  const paper = lam("skPaperM", () => ({ map: wallpaperTex() })), floor = lam("skParquet", () => ({ map: planksHD(), color: "#b89878" })), brass = M("skBrass", "#d9b04a"), green = lam("skLeatherM", () => ({ map: leatherTex() }));
  // ---- shell: floor, ceiling, side and front walls (panelled to 2.6 m, papered above) ----
  b.add(boxGeo(V(ox - W - 0.3, -0.3, Z0 - 0.3), V(ox + W + 0.3, 0, Z1 + 0.3), 4), floor);
  wb.add(boxGeo(V(ox - W - 0.3, H, Z0 - 0.3), V(ox + W + 0.3, H + 0.3, Z1 + 0.6), 2), oakDark);
  const wall = (x0: number, x1: number, zA: number, zB: number, doorGap?: [number, number]) => {
    const seg = (a: number, c: number, y0 = 0) => { wb.add(boxGeo(V(ox + x0, y0, a), V(ox + x1, 2.6, c), 2.6), oak); wb.add(boxGeo(V(ox + x0, 2.6, a), V(ox + x1, H, c), 1.6), paper); };
    if (doorGap) { seg(zA, doorGap[0]); seg(doorGap[1], zB); wb.add(boxGeo(V(ox + x0, 2.25, doorGap[0]), V(ox + x1, 2.6, doorGap[1]), 2.6), oak); wb.add(boxGeo(V(ox + x0, 2.6, doorGap[0]), V(ox + x1, H, doorGap[1]), 1.6), paper); } else seg(zA, zB); };
  wall(W, W + 0.3, Z0, Z1); wall(-W - 0.3, -W, Z0, Z1, [DOOR.z - DOOR.hw, DOOR.z + DOOR.hw]);
  wb.add(boxGeo(V(ox - W, 0, Z0 - 0.3), V(ox + W, 2.6, Z0), 2.6), oak); wb.add(boxGeo(V(ox - W, 2.6, Z0 - 0.3), V(ox + W, H, Z0), 1.6), paper);
  // the door stands ajar in its gap (a dark corridor beyond)
  { const d = put(new THREE.BoxGeometry(0.07, 2.25, 1.44), oak, -W - 0.08, 1.125, DOOR.z + 0.5, true); d.rotation.y = 0.9; put(new THREE.BoxGeometry(0.4, 2.3, 1.7), M("skDarkHall", "#1a1412"), -W - 0.75, 1.15, DOOR.z, false);
    put(new THREE.SphereGeometry(0.045, 10, 8), brass, -W + 0.2, 1.05, DOOR.z + 0.95); }
  // ---- the window wall: real openings, so the sun gets in ----
  { const xs = WIN.xs, hw = WIN.w / 2, edges = [-W, ...xs.flatMap((x) => [x - hw, x + hw]), W];
    wb.add(boxGeo(V(ox - W, 0, Z1), V(ox + W, WIN.y0, Z1 + 0.3), 2.6), oak); wb.add(boxGeo(V(ox - W, WIN.y1, Z1), V(ox + W, H, Z1 + 0.3), 1.6), paper);
    for (let i = 0; i < edges.length; i += 2) wb.add(boxGeo(V(ox + edges[i], WIN.y0, Z1), V(ox + edges[i + 1], WIN.y1, Z1 + 0.3), 1.6), paper);
    for (const x of xs) {
      // stone surround, a mullion and a transom (their shadows fall across the floor), two corner fillets for the arch
      for (const sx of [-1, 1]) wb.add(boxGeo(V(ox + x + sx * hw - 0.09, WIN.y0, Z1 - 0.04), V(ox + x + sx * hw + 0.09, WIN.y1, Z1 + 0.34)), stone);
      wb.add(boxGeo(V(ox + x - hw - 0.09, WIN.y0 - 0.12, Z1 - 0.1), V(ox + x + hw + 0.09, WIN.y0, Z1 + 0.34)), stone); wb.add(boxGeo(V(ox + x - hw - 0.09, WIN.y1, Z1 - 0.04), V(ox + x + hw + 0.09, WIN.y1 + 0.14, Z1 + 0.34)), stone);
      wb.add(boxGeo(V(ox + x - 0.05, WIN.y0, Z1 + 0.1), V(ox + x + 0.05, WIN.y1, Z1 + 0.2)), stone); wb.add(boxGeo(V(ox + x - hw, 2.9, Z1 + 0.1), V(ox + x + hw, 2.98, Z1 + 0.2)), stone);
      for (const sx of [-1, 1]) { const sh = new THREE.Shape([new THREE.Vector2(0, 0), new THREE.Vector2(0, -0.75), new THREE.Vector2(sx * -0.55, 0)]), g = new THREE.ExtrudeGeometry(sh, { depth: 0.12, bevelEnabled: false }); g.translate(ox + x + sx * hw, WIN.y1, Z1 + 0.09); wb.add(g, stone); }
    } }
  wb.build(G, true); b.build(G, true);
  // what the windows look onto (never lit, never casts)
  { const v = new THREE.Mesh(plane(46, 20), new THREE.MeshBasicMaterial({ map: riverViewTex(), color: new THREE.Color(1.5, 1.42, 1.2), fog: false })); v.rotation.y = Math.PI; v.position.set(ox, 3.4, Z1 + 9); G.add(v); }
  // ---- curtains: two drapes and a pelmet at each window; a dry set and a soaked set ----
  const dry = new THREE.Group(), wet = new THREE.Group(); G.add(dry, wet);
  { const drape = (wetK: boolean) => { const g = new THREE.PlaneGeometry(0.66, 4.15, 12, 10), p = g.attributes.position as THREE.BufferAttribute;
      for (let i = 0; i < p.count; i++) { const u = p.getX(i) / 0.66 + 0.5, v = p.getY(i) / 4.15 + 0.5; p.setZ(i, -0.075 * Math.sin(u * Math.PI * 5) * (0.5 + 0.5 * (1 - v)) - (wetK ? 0.02 * (1 - v) : 0)); p.setX(i, p.getX(i) * (1 - 0.1 * v + (wetK ? 0.06 * v - 0.05 : 0))); }
      g.computeVertexNormals(); return g; };
    const mats = [lam("skCurtainD", () => ({ map: curtainTex(false), side: THREE.DoubleSide })), lam("skCurtainW", () => ({ map: curtainTex(true), side: THREE.DoubleSide }))];
    [dry, wet].forEach((grp, k) => { const geo = drape(!!k);
      for (const x of WIN.xs) { for (const sx of [-1, 1]) { const m = new THREE.Mesh(geo, mats[k]); m.rotation.y = Math.PI; m.scale.x = sx; m.position.set(ox + x + sx * (WIN.w / 2 + 0.2), 2.4, CURTAIN_Z); m.castShadow = true; m.receiveShadow = true; grp.add(m); }
        const pg = new THREE.PlaneGeometry(2.7, 0.5, 20, 1), pp = pg.attributes.position as THREE.BufferAttribute; for (let i = 0; i < pp.count; i++) pp.setZ(i, -0.05 * Math.sin((pp.getX(i) / 2.7) * Math.PI * 16));
        const pm = new THREE.Mesh(pg, mats[k]); pm.rotation.y = Math.PI; pm.position.set(ox + x, 4.42, CURTAIN_Z - 0.07); pm.castShadow = true; grp.add(pm); } });
    for (const x of WIN.xs) { const rod = put(new THREE.CylinderGeometry(0.03, 0.03, 2.9, 8), brass, x, 4.62, CURTAIN_Z - 0.05); rod.rotation.z = Math.PI / 2; for (const sx of [-1, 1]) put(new THREE.SphereGeometry(0.06, 10, 8), brass, x + sx * 1.48, 4.62, CURTAIN_Z - 0.05); } }
  wet.visible = false;
  // ---- shafts of light from each window down to the floor ----
  { const r = new THREE.Vector3(-ROOM_SUN[0], -ROOM_SUN[1], -ROOM_SUN[2]).normalize(), mat = new THREE.MeshBasicMaterial({ map: shaftTex(), color: new THREE.Color(1.0, 0.9, 0.62), transparent: true, opacity: 0.09, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide, fog: false });
    for (const x of WIN.xs) for (const y of [WIN.y1, 2.9, 1.9]) { const t = y / -r.y, a = V(ox + x - 0.72, y, Z1), c = V(ox + x + 0.72, y, Z1), g = new THREE.BufferGeometry();
      const a2 = a.clone().addScaledVector(r, t), c2 = c.clone().addScaledVector(r, t);
      g.setAttribute("position", new THREE.Float32BufferAttribute([a, c, c2, a, c2, a2].flatMap((v) => [v.x, v.y, v.z]), 3)); g.setAttribute("uv", new THREE.Float32BufferAttribute([0, 0, 1, 0, 1, 1, 0, 0, 1, 1, 0, 1], 2));
      const m = new THREE.Mesh(g, mat); m.frustumCulled = false; m.renderOrder = 4; G.add(m); } }
  // ---- carpet, the clerks' table and what is on it, the chairman's chair ----
  { const c = put(plane(5.4, 10.6), lam("skCarpetM", () => ({ map: repT(carpetTex(), 2, 4) })), 0, 0.012, -1.0, false); c.rotation.x = -Math.PI / 2;
    const T = TABLE, cx = (T.x0 + T.x1) / 2, cz = (T.z0 + T.z1) / 2, tw = T.x1 - T.x0, td = T.z1 - T.z0;
    put(new THREE.BoxGeometry(tw, 0.07, td), oakPlain, cx, T.y - 0.035, cz); put(new THREE.BoxGeometry(tw - 0.16, 0.012, td - 0.16), green, cx, T.y + 0.004, cz, false); put(new THREE.BoxGeometry(tw - 0.2, 0.2, td - 0.2), oakDark, cx, T.y - 0.17, cz);
    for (const [x, z] of [[T.x0 + 0.14, T.z0 + 0.14], [T.x1 - 0.14, T.z0 + 0.14], [T.x0 + 0.14, T.z1 - 0.14], [T.x1 - 0.14, T.z1 - 0.14]]) put(new THREE.CylinderGeometry(0.07, 0.05, T.y - 0.27, 10), oakDark, x, (T.y - 0.27) / 2, z);
    // two dispatch boxes, books, an inkstand
    for (const sx of [-1, 1]) { put(new THREE.BoxGeometry(0.5, 0.3, 0.34), M("skBox", "#5a2a22"), sx * 0.95, T.y + 0.15, cz + 0.2); put(new THREE.BoxGeometry(0.52, 0.04, 0.36), brass, sx * 0.95, T.y + 0.31, cz + 0.2); put(new THREE.BoxGeometry(0.1, 0.07, 0.02), brass, sx * 0.95, T.y + 0.16, cz + 0.02); }
    for (let k = 0; k < 4; k++) put(new THREE.BoxGeometry(0.32 - k * 0.02, 0.055, 0.24), M("skBook" + k, ["#7a2630", "#2f4f7a", "#3f6a4a", "#8a6a2a"][k]), -0.32 + (k % 2) * 0.03, T.y + 0.03 + k * 0.056, cz + 0.28).rotation.y = 0.1 * k;
    put(new THREE.BoxGeometry(0.26, 0.03, 0.14), oakDark, 0.3, T.y + 0.015, cz + 0.3); for (const dx of [-0.07, 0.07]) put(new THREE.CylinderGeometry(0.035, 0.04, 0.06, 10), M("skInk", "#1c1a26"), 0.3 + dx, T.y + 0.06, cz + 0.3);
    // the chair: a tall carved back with a pointed head
    put(new THREE.BoxGeometry(0.9, 0.5, 0.7), oakDark, 0, 0.25, 3.3); put(new THREE.BoxGeometry(0.8, 0.08, 0.6), green, 0, 0.54, 3.25, false); put(new THREE.BoxGeometry(1.0, 1.7, 0.12), oak, 0, 1.35, 3.7);
    { const pk = put(new THREE.ConeGeometry(0.62, 0.6, 4), oakDark, 0, 2.5, 3.7); pk.rotation.y = Math.PI / 4; pk.scale.z = 0.2; } for (const sx of [-1, 1]) { put(new THREE.BoxGeometry(0.1, 0.5, 0.6), oakDark, sx * 0.45, 0.78, 3.3); put(new THREE.ConeGeometry(0.08, 0.3, 6), brass, sx * 0.5, 2.35, 3.7); } }
  // ---- benches: buttoned green leather, two rows each side (the right-hand rows stop short of the door) ----
  { const bench = (x: number, zA: number, zB: number, lift: number, face: number) => { const L = zB - zA, zc = (zA + zB) / 2;
      if (lift) put(new THREE.BoxGeometry(1.3, lift, L + 0.2), oakDark, x + face * -0.2, lift / 2, zc);
      put(new THREE.BoxGeometry(0.6, 0.42, L), green, x, lift + 0.21, zc); put(new THREE.BoxGeometry(0.16, 0.95, L), green, x - face * 0.36, lift + 0.6, zc); put(new THREE.BoxGeometry(0.2, 0.08, L + 0.06), oakPlain, x - face * 0.36, lift + 1.1, zc);
      for (const z of [zA, zB]) put(new THREE.BoxGeometry(0.72, 0.75, 0.1), oakPlain, x - face * 0.06, lift + 0.37, z); };
    bench(3.4, -1.0, 3.9, 0, -1); bench(4.9, -1.0, 3.9, 0.3, -1); bench(-3.4, -0.2, 3.9, 0, 1); bench(-4.9, -0.2, 3.9, 0.3, 1); }
  // ---- named lights: gas brackets on the piers between the windows (lit, a warm pool on the wall round each) ----
  for (const x of [-1.85, 1.85]) { put(new THREE.BoxGeometry(0.06, 0.06, 0.34), brass, x, 3.05, Z1 - 0.17); put(new THREE.CylinderGeometry(0.02, 0.02, 0.2, 6), brass, x, 3.15, Z1 - 0.32);
    const gl = new THREE.Mesh(new THREE.SphereGeometry(0.13, 14, 10), new THREE.MeshBasicMaterial({ color: new THREE.Color(2.6, 2.0, 1.1), fog: false })); gl.position.set(ox + x, 3.34, Z1 - 0.32); G.add(gl);
    const h = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex(), color: new THREE.Color(1.3, 0.9, 0.45), transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, fog: false })); h.position.copy(gl.position); h.scale.setScalar(1.1); G.add(h);
    const pl = new THREE.PointLight("#ffbe6a", 9, 8, 1.5); pl.position.set(ox + x, 2.9, Z1 - 0.9); G.add(pl); }
  // ---- walls: portraits, a clock, a painted board over the door ----
  { const fr = (k: number, x: number, z: number, ry: number) => { const m = put(plane(1.0, 1.25), lam("skPortraitM" + k, () => ({ map: portraitTex(k) })), x, 3.55, z, false); m.rotation.y = ry; };
    fr(0, W - 0.02, 1.2, -Math.PI / 2); fr(1, W - 0.02, -2.2, -Math.PI / 2); fr(2, -W + 0.02, 1.6, Math.PI / 2); fr(1, W - 0.02, -5.4, -Math.PI / 2);
    const ck = put(plane(0.9, 0.9), new THREE.MeshLambertMaterial({ map: clockTex(), transparent: true, alphaTest: 0.5 }), -W + 0.03, 3.6, -0.9, false); ck.rotation.y = Math.PI / 2;
    const bd = put(plane(1.7, 0.42), lam("skBoardRoom", () => ({ map: labelTex("COMMITTEE ROOM", "#2c3a2e", "#d9b860", 4) })), -W + 0.03, 2.95, DOOR.z, false); bd.rotation.y = Math.PI / 2; }
  // ---- the lime: a labelled barrel, an open sack, two buckets, a step ladder (there from the first shot) ----
  { const [lx, , lz] = LIME; barrelAt(put, lx, lz, 1.05, "#9a8a70");
    const lb = put(plane(0.56, 0.3), lam("skLimeLabel", () => ({ map: labelTex("CHLORIDE|OF LIME", "#e9e2cc", "rgba(40,30,26,0.95)", 2) })), lx - 0.26, 0.56, lz - 0.26, false); lb.rotation.y = Math.PI + 0.78;
    put(new THREE.CylinderGeometry(0.31, 0.31, 0.03, 16), M("skLimeTop", "#f1eee2"), lx, 1.0, lz, false);
    const sack = put(new THREE.SphereGeometry(0.36, 12, 8), M("skSack", "#bfae86"), lx + 0.75, 0.24, lz + 0.5); sack.scale.set(1.2, 0.65, 0.9); put(new THREE.SphereGeometry(0.2, 10, 6), M("skLimeTop", "#f1eee2"), lx + 0.6, 0.42, lz + 0.42, false).scale.set(1, 0.4, 1);
    for (const [dx, dz] of [[-0.75, 0.25], [-0.45, -0.55]]) { const bk = makeBucket("#f1eee2"); bk.position.set(ox + lx + dx, 0, lz + dz); G.add(bk); }
    // the step ladder under the left window
    const lad = new THREE.Group(), wd = M("skLadder", "#b08a54"); for (const sx of [-0.24, 0.24]) for (const sz of [-1, 1]) { const leg = new THREE.Mesh(new THREE.BoxGeometry(0.05, 2.1, 0.05), wd); leg.position.set(sx, 1.0, sz * 0.32); leg.rotation.x = sz * 0.3; lad.add(leg); }
    for (let k = 0; k < 5; k++) { const st = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.035, 0.14), wd); st.position.set(0, 0.36 + k * 0.36, -0.42 + k * 0.105); lad.add(st); } const tp = new THREE.Mesh(new THREE.BoxGeometry(0.56, 0.04, 0.26), wd); tp.position.set(0, 2.0, 0); lad.add(tp);
    lad.traverse((o) => { o.castShadow = true; o.receiveShadow = true; }); lad.position.set(ox + 5.55, 0, 3.6); G.add(lad); }
  // ceiling beams, a skirting of shadow at the back, hat stands by the door
  { const cl = put(plane(2 * W + 0.6, Z1 - Z0 + 0.9), oakPlain, 0, H - 0.004, (Z0 + Z1) / 2, false); cl.rotation.x = Math.PI / 2; }
  for (let z = Z0 + 1; z < Z1; z += 2.1) put(new THREE.BoxGeometry(2 * W, 0.28, 0.3), oakDark, 0, H - 0.14, z, false);
  for (const z of [-5.0, -5.6]) { put(new THREE.CylinderGeometry(0.03, 0.03, 1.9, 8), oakDark, -W + 0.45, 0.95, z); put(new THREE.CylinderGeometry(0.2, 0.2, 0.04, 12), oakDark, -W + 0.45, 0.02, z); put(new THREE.CylinderGeometry(0.16, 0.17, 0.2, 14), M("skHat", "#1c1a22"), -W + 0.45, 2.0, z); put(new THREE.CylinderGeometry(0.25, 0.25, 0.02, 14), M("skHat", "#1c1a22"), -W + 0.45, 1.9, z); }
  const dust = dustMotes(new THREE.Vector3(ox + 0.6, 2.0, 2.0), new THREE.Vector3(10, 3.6, 5.5), 240, new THREE.Color(1.5, 1.3, 0.8), 0.03, 0.55); G.add(dust.points);
  noInk(G);
  return { group: G, dry, wet, drift: dust.drift };
}

export type StreetSet = { group: THREE.Group; gutter: THREE.Texture; spout: THREE.Mesh; drift: (t: number) => void };
export function buildStreet(): StreetSet {
  const G = new THREE.Group(), ox = SET.street[0], put = putter(G, ox), b = new Batch(), { w: W, z0: Z0, z1: Z1 } = STREET, Hh = 9.5;
  const brick = lam("skBrickSoot", () => ({ map: brickTex("skBrickSootT", ["#9a8258", "#8c7650", "#a48a60", "#7e6a48"], "#4a4034", 1) })), brick2 = lam("skBrickSoot2", () => ({ map: brickTex("skBrickSootT2", ["#7a5a48", "#6e5040", "#84624e"], "#3a302a", 1) }));
  const cob = lam("skCobble", () => ({ map: cobbleHD(), color: "#a09484" })), wood = M("skStWood", "#6e5238"), wood2 = M("skStWood2", "#4e3a28"), iron = M("skIron", "#34303a"), stone = lam("skStStone", () => ({ map: stoneHD("skStStoneHD", ["#9a9284", "#8e867a", "#a69e90"], "#5a544c") }));
  b.add(boxGeo(V(ox - W - 0.6, -0.4, Z0 - 2), V(ox + W + 0.6, 0, Z1 + 0.5), 4), cob);
  b.add(boxGeo(V(ox + W, 0, Z0 - 2), V(ox + W + 0.6, Hh, Z1 + 0.5), 3), brick); b.add(boxGeo(V(ox - W - 0.6, 0, Z0 - 2), V(ox - W, Hh, Z1 + 0.5), 3), brick2);
  // the far end: an arch down to the river
  b.add(boxGeo(V(ox - W, 0, Z1), V(ox - 1.3, Hh - 2, Z1 + 0.5), 3), brick); b.add(boxGeo(V(ox + 1.3, 0, Z1), V(ox + W, Hh - 2, Z1 + 0.5), 3), brick); b.add(boxGeo(V(ox - 1.3, 3.1, Z1), V(ox + 1.3, Hh - 2, Z1 + 0.5), 3), brick);
  for (const sx of [-1, 1]) { const sh = new THREE.Shape([new THREE.Vector2(0, 0), new THREE.Vector2(0, -0.9), new THREE.Vector2(sx * -0.9, 0)]), g = new THREE.ExtrudeGeometry(sh, { depth: 0.5, bevelEnabled: false }); g.translate(ox + sx * 1.3, 3.1, Z1); b.add(g, brick); }
  for (let k = 0; k < 4; k++) b.add(boxGeo(V(ox - 1.3, -0.4 - k * 0.22, Z1 + 0.5 + k * 0.45), V(ox + 1.3, -0.18 - k * 0.22, Z1 + 0.95 + k * 0.45), 2), stone);
  b.build(G, true);
  { const v = new THREE.Mesh(plane(30, 13), new THREE.MeshBasicMaterial({ map: riverViewTex(), color: new THREE.Color(1.35, 1.28, 1.08), fog: false })); v.rotation.y = Math.PI; v.position.set(ox, 2.6, Z1 + 12); G.add(v); }
  // the gutter down the middle, wet and brown, running to the arch
  const gt = repT(waterTex2(), 0.4, 9); const gm = put(plane(0.62, Z1 - Z0 + 2), lam("skGutter", () => ({ map: gt, color: "#c9b890" })), 0, 0.012, (Z0 + Z1) / 2 - 1, false); gm.rotation.x = -Math.PI / 2;
  for (const sx of [-1, 1]) put(new THREE.BoxGeometry(0.1, 0.05, Z1 - Z0 + 2), M("skKerb", "#6a6258"), sx * 0.36, 0.02, (Z0 + Z1) / 2 - 1, false);
  // windows and doors up both walls
  { let k = 0; for (const sx of [-1, 1]) for (let z = Z0 + 1.2; z < Z1 - 0.6; z += 2.6) for (const y of [1.9, 4.6, 7.2]) { if (y < 2 && Math.abs(z - PUMP[2]) < 1.2 && sx > 0) continue; const m = put(plane(0.95, 1.45), lam("skTenWinM" + (k % 6), () => ({ map: tenWinTex(k % 6) })), sx * (W - 0.02), y, z + (y > 4 ? 0.4 : 0), false); m.rotation.y = -sx * Math.PI / 2; k++;
      put(new THREE.BoxGeometry(0.14, 0.08, 1.15), stone, sx * (W - 0.06), y - 0.78, z + (y > 4 ? 0.4 : 0), false); }
    for (const [sx, z] of [[-1, -4.4], [1, -6.2], [-1, 5.2]] as [number, number][]) { const d = put(plane(1.0, 2.0), M("skTenDoor" + z, "#3e3428"), sx * (W - 0.02), 1.0, z, false); d.rotation.y = -sx * Math.PI / 2; put(new THREE.BoxGeometry(0.4, 0.16, 1.3), stone, sx * (W - 0.2), 0.08, z); } }
  // washing lines overhead
  { let k = 0; for (const [z, y] of [[-4.5, 5.2], [-0.5, 6.0], [3.4, 4.9], [6.4, 5.6]]) { const ln = put(new THREE.CylinderGeometry(0.012, 0.012, 2 * W, 5), wood2, 0, y, z, false); ln.rotation.z = Math.PI / 2;
      for (let i = 0; i < 6; i++) { const c = put(plane(0.62, 0.78), new THREE.MeshLambertMaterial({ map: clothTex(k), transparent: true, alphaTest: 0.5, side: THREE.DoubleSide }), -2.3 + i * 0.92 + 0.2 * Math.sin(k), y - 0.4, z, true); c.rotation.y = Math.PI + 0.2 * Math.sin(k * 1.7); k++; } } }
  // the parish pump: a stone base, an iron body with a spout and a long handle, a tub under the spout, its board on the wall
  { const [px, , pz] = PUMP; put(new THREE.BoxGeometry(0.8, 0.22, 0.8), stone, px, 0.11, pz); put(new THREE.CylinderGeometry(0.11, 0.13, 1.35, 12), M("skPumpGreen", "#4f7a5e"), px, 0.9, pz); put(new THREE.SphereGeometry(0.15, 12, 8), M("skPumpGreen", "#4f7a5e"), px, 1.6, pz);
    const sp = put(new THREE.CylinderGeometry(0.055, 0.055, 0.46, 8), M("skBrass", "#d9b04a"), px - 0.28, 1.02, pz); sp.rotation.z = Math.PI / 2 - 0.25;
    const hd = put(new THREE.BoxGeometry(0.06, 0.06, 0.95), M("skPumpGreen", "#4f7a5e"), px + 0.02, 1.4, pz - 0.42); hd.rotation.x = -0.5;
    put(new THREE.CylinderGeometry(0.34, 0.3, 0.3, 14), wood, px - 0.55, 0.15, pz); put(new THREE.CylinderGeometry(0.31, 0.31, 0.02, 14), M("skBrown", "#6a5430"), px - 0.55, 0.27, pz, false);
    const bd = put(plane(1.5, 0.5), lam("skPumpBoard", () => ({ map: labelTex("PARISH PUMP", "#2e3a4a", "#e6dcc0", 3) })), W - 0.03, 2.75, pz, false); bd.rotation.y = -Math.PI / 2;
    const bd2 = put(plane(1.3, 0.44), lam("skCourtBoard", () => ({ map: labelTex("RIVER COURT", "#e6dcc0", "rgba(40,30,26,0.95)", 3) })), -W + 0.03, 3.3, -1.6, false); bd2.rotation.y = Math.PI / 2; }
  // the stream of water from the spout (posed: shown when someone pumps)
  const spout = put(new THREE.CylinderGeometry(0.04, 0.06, 0.72, 8), new THREE.MeshBasicMaterial({ color: "#8a6a30" }), PUMP[0] - 0.5, 0.62, PUMP[2], false); spout.visible = false;
  // dressing: barrels, crates, a hand cart, sacks, a ladder, a broken wheel, a rubbish heap, puddles
  barrelAt(put, -2.3, -6.4, 1, "#6e5238"); barrelAt(put, -2.45, -5.5, 0.85, "#5e4630"); barrelAt(put, 2.4, 6.6, 0.9, "#6e5238");
  for (const [x, y, z, s, ry] of [[2.3, 0.3, -3.4, 0.6, 0.2], [2.35, 0.82, -3.5, 0.45, -0.3], [-2.3, 0.25, 7.2, 0.5, 0.4], [2.2, 0.25, -8.2, 0.5, 0.1]]) put(new THREE.BoxGeometry(s, s, s), lam("skCrateSt", () => ({ map: labelTex("SOAP", "#a8834e") })), x, y, z).rotation.y = ry;
  { const cart = new THREE.Group(); const bed = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.12, 0.8), wood); bed.position.y = 0.62; cart.add(bed); for (const sz of [-0.42, 0.42]) { const sd = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.3, 0.04), wood2); sd.position.set(0, 0.82, sz); cart.add(sd); const wh = new THREE.Mesh(new THREE.TorusGeometry(0.4, 0.04, 6, 18), wood2); wh.position.set(0.1, 0.42, sz * 1.2); cart.add(wh); for (let k = 0; k < 4; k++) { const spk = new THREE.Mesh(new THREE.BoxGeometry(0.78, 0.03, 0.03), wood2); spk.position.copy(wh.position); spk.rotation.z = (k * Math.PI) / 4; cart.add(spk); } }
    for (const sz of [-0.36, 0.36]) { const hd = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.04, 0.04), wood2); hd.position.set(-1.15, 0.66, sz); cart.add(hd); } const leg = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.6, 0.05), wood2); leg.position.set(-0.6, 0.3, 0); cart.add(leg);
    const sk = new THREE.Mesh(new THREE.SphereGeometry(0.3, 10, 8), M("skSack", "#bfae86")); sk.scale.set(1.3, 0.6, 1); sk.position.set(0.2, 0.86, 0); cart.add(sk);
    cart.traverse((o) => { o.castShadow = true; o.receiveShadow = true; }); cart.rotation.y = 1.25; cart.position.set(ox - 2.05, 0, -1.9); G.add(cart); }
  { const heap = mergeFacets([0, 1, 2, 3, 4, 5, 6].map((i) => ({ g: rockGeo(0.14 + 0.1 * (i % 3), i + 9, 0, 0.6), m: new THREE.Matrix4().makeTranslation(ox - 2.4 + 0.25 * (i % 3), 0.07, 3.2 + 0.22 * i) }))); const hm = new THREE.Mesh(heap, lam("skRubbish", () => ({ color: "#5a4a3a", vertexColors: true, flatShading: true }))); hm.castShadow = true; G.add(hm); }
  for (const [x, z, rx, rz] of [[1.2, -4.6, 0.7, 0.4], [-1.3, 4.2, 0.5, 0.35], [1.6, 5.6, 0.6, 0.3], [-0.9, -7.4, 0.8, 0.4]]) { const p = put(new THREE.CircleGeometry(1, 18), new THREE.MeshLambertMaterial({ color: "#3a3226", transparent: true, opacity: 0.6 }), x, 0.008, z, false); p.rotation.x = -Math.PI / 2; p.scale.set(rx, rz, 1); }
  { const ln = put(new THREE.BoxGeometry(0.06, 3.4, 0.06), wood2, W - 0.25, 1.7, -8.6); ln.rotation.x = 0.16; const ln2 = put(new THREE.BoxGeometry(0.06, 3.4, 0.06), wood2, W - 0.25, 1.7, -9.1); ln2.rotation.x = 0.16; for (let k = 0; k < 7; k++) put(new THREE.BoxGeometry(0.04, 0.04, 0.5), wood2, W - 0.25, 0.35 + k * 0.44, -8.85 + (0.35 + k * 0.44 - 1.7) * 0.16); }
  const dust = dustMotes(new THREE.Vector3(ox, 2.4, 0), new THREE.Vector3(5, 4.5, 14), 160, new THREE.Color(1.2, 1.1, 0.8), 0.028, 0.4); G.add(dust.points);
  noInk(G);
  return { group: G, gutter: gt, spout, drift: dust.drift };
}
