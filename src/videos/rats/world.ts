// The exploding rats Short's world (kit 2 look): five closed rooms far apart, each dressed once.
//   wk     the saboteurs' workshop: plaster walls, a long bench, a lamp, shelves of tins.
//   shop   the London supplier: a counter, shelves of jars and cages.
//   boil   a German boiler room: brick, a big boiler with a firebox door that opens on its fire, a coal pile.
//   school a German military school: a blackboard with a rat drawn on it, a glass case on a stand, a lectern.
//   depot  where the shipment was caught: brick, stacked crates, one crate on the floor whose lid comes off.
// Posed per frame: rats (any number, each lying on its side or crouched, cut open / stitched / fused), the crate's lid,
// the stoker's shovel, the fire, the plan's blast, lanterns, the needle and putty on the bench, the file on the desk.
import * as THREE from "three";
import { Batch, boxGeo, V, lam, Kit } from "../bridge/build";
import { ctex, stoneHD, planksHD } from "../bridge/paint";
import { Pen, bodyFront, fxContact, Outfit, SKIN } from "../bridge/toon";
import { LIGHTS, LOOK, LightPreset, WorldLook } from "../bridge/lights";
import { TONE, CHAR, untone } from "../bridge/shade";
import { NOINK, AFTERINK } from "../bridge/ink";
import { Pool, Actor, Fx } from "../bridge/cast";
import { Cards } from "../hertzlong/props3d";
import { signTex } from "../lustig/props";
import { V3, FPS, ROOM, RoomKey, RW, RZ0, RZ1, RH, BENCH, COUNTER, BOILER, FIRE, COAL, COAL_R, COAL_H, CASE, LECTERN, CRATE } from "./place";
import type { St3 } from "./story";
type Light = St3["light"];

const ROOM_L: LightPreset = { ...LIGHTS.day, fogNear: 80, fogFar: 600, lit: [1.42, 1.3, 1.1], shade: [0.3, 0.27, 0.31], lift: [0.06, 0.05, 0.07], charTint: [1.0, 0.92, 0.84], sideTint: [0.9, 0.86, 0.86], hemiI: 0.62, sunI: 2.4 };
const BOIL_L: LightPreset = { ...ROOM_L, lit: [1.45, 0.9, 0.52], shade: [0.17, 0.12, 0.15], lift: [0.05, 0.03, 0.04], charTint: [1.0, 0.8, 0.62], sideTint: [0.85, 0.72, 0.66], hemiI: 0.4, sunCol: "#ffb36b", sky: "#ffcf9a", ground: "#4a2f24" };
const DIM_L: LightPreset = { ...ROOM_L, lit: [0.95, 0.9, 0.95], shade: [0.16, 0.16, 0.24], lift: [0.03, 0.04, 0.08], charTint: [0.86, 0.86, 0.94], sideTint: [0.78, 0.78, 0.9], hemiI: 0.42, sunCol: "#d6e0ff" };
const LP: Record<Light, LightPreset> = { room: ROOM_L, boil: BOIL_L, dim: DIM_L };
const LK: Record<Light, WorldLook> = { room: LOOK.day, boil: LOOK.day, dim: LOOK.day };

// ---------------- cast ----------------
type Who = { o: Outfit; seed: number; key: string };
const who = (o: Outfit, seed: number, key: string): Who => ({ o, seed, key });
const SUIT = (jacket: string, extra: Partial<Outfit> = {}): Outfit => ({ jacket, pants: "#3a3530", boots: "#1e1a20", hat: "hair", hair: "#3a2a20", buttons: "#d9d4c8", skin: "#f5c9a0", ...extra });
const GREY = "#6b7158", GREY2 = "#5d634c";
const FELD = (extra: Partial<Outfit> = {}): Outfit => ({ jacket: GREY, pants: GREY2, boots: "#1a1618", hat: "cap", cap: "#4f5541", buttons: "#c9c4b0", belt: "#2a2420", skin: "#f0d2b0", ...extra });
const OUT: Record<string, Who> = {
  // the saboteurs: the officer who buys the rats (tweed, moustache) and the workshop man (white coat)
  officer: who(SUIT("#7a6248", { hat: "fedora", cap: "#4a3a2c", moustache: "#5a3b2a", buttons: "#c9b98a", skin: "#f0d2b0" }), 41, "officer"),
  maker: who(SUIT("#ece8de", { hair: "#b5462f", pants: "#4a4a55", buttons: "#9a9a9a", skin: "#f5c9a0" }), 42, "maker"),
  maker2: who(SUIT("#ece8de", { hair: "#2b2320", pants: "#4a4a55", moustache: "#2b2320", buttons: "#9a9a9a", build: "stout", skin: "#ecd0b6" }), 43, "maker2"),
  // the shopkeeper
  keeper: who(SUIT("#8a6a4a", { hat: "cap", cap: "#5a4a3a", hair: "#8a8a92", moustache: "#8a8a92", build: "stout", skin: "#f0d2b0", buttons: "#e6dcc4" }), 44, "keeper"),
  // the stoker: sooty vest and cap
  stoker: who({ jacket: "#5a5248", pants: "#3a3530", boots: "#1e1a20", hat: "cap", cap: "#2e2a2c", buttons: "#5a5248", moustache: "#2a201a", build: "stout", skin: "#e0b48c" }, 45, "stoker"),
  // German soldiers, an officer, cadets
  gs1: who(FELD({ moustache: "#4a3020" }), 46, "gs1"),
  gs2: who(FELD({ skin: SKIN }), 47, "gs2"),
  gs3: who(FELD({ build: "stout", skin: "#ecd0b6" }), 48, "gs3"),
  gs4: who(FELD({ skin: "#f5c9a0", moustache: "#8a6a4a" }), 49, "gs4"),
  gofficer: who(FELD({ cap: "#3f4434", buttons: "#e8c45a", moustache: "#2a201a", build: "stout", skin: "#f0d2b0" }), 50, "gofficer"),
  lecturer: who(FELD({ cap: "#3f4434", buttons: "#e8c45a", hair: "#8a8a92", hat: "hair", moustache: "#8a8a92", skin: "#ecd0b6" }), 51, "lecturer"),
};
for (let i = 1; i <= 8; i++) OUT[`cad${i}`] = who(FELD({ hat: i % 3 ? "cap" : "hair", hair: ["#3a2a20", "#b5462f", "#d9c08a", "#2b2320"][i % 4], skin: ["#f5c9a0", "#ecd0b6", SKIN, "#f0d2b0"][i % 4] }), 60 + i, `cad${i}`);

const SUc = 0.00216;
const tier = (d: number): [number, number, number] => d < 3.2 ? [1800, 3000, 3.0] : d < 6.5 ? [1080, 1800, 1.8] : d < 16 ? [480, 800, 0.8] : [240, 400, 0.4];
const M = (key: string, col: string, extra: THREE.MeshLambertMaterialParameters = {}) => lam(key, () => ({ color: col, ...extra }));
const shadowAll = <T extends THREE.Object3D>(o: T) => { o.traverse((m) => { m.castShadow = true; m.receiveShadow = true; }); return o; };

// ---------------- paint ----------------
const brickTex = (key: string, base: string, alt: string, mortar: string) => { const t2 = ctex(key, 512, 512, (g, r) => {
  g.fillStyle = mortar; g.fillRect(0, 0, 512, 512);
  for (let y = 0; y < 512; y += 32) for (let x = -64; x < 512; x += 64) { g.fillStyle = r() > 0.5 ? base : alt; g.fillRect(x + ((y / 32) % 2) * 32 + 3, y + 3, 58, 26); if (r() > 0.8) { g.fillStyle = "rgba(20,10,10,0.18)"; g.fillRect(x + ((y / 32) % 2) * 32 + 3, y + 3, 58, 26); } }
}); t2.wrapS = t2.wrapT = THREE.RepeatWrapping; t2.repeat.set(3, 2); return t2; };
const puffTex = () => ctex("rtPuff", 256, 256, (g, r) => { g.clearRect(0, 0, 256, 256); for (let i = 0; i < 9; i++) { const x = 128 + (r() - 0.5) * 110, y = 128 + (r() - 0.5) * 110, rr = 46 + r() * 34; const gr = g.createRadialGradient(x, y, 0, x, y, rr); gr.addColorStop(0, "rgba(255,255,255,0.95)"); gr.addColorStop(0.7, "rgba(255,255,255,0.7)"); gr.addColorStop(1, "rgba(255,255,255,0)"); g.fillStyle = gr; g.beginPath(); g.arc(x, y, rr, 0, 6.3); g.fill(); } });
const lumpTex = () => ctex("rtLump", 64, 64, (g) => { g.clearRect(0, 0, 64, 64); g.fillStyle = "#2a2628"; g.strokeStyle = "#0e0b10"; g.lineWidth = 5; g.beginPath(); g.moveTo(10, 38); g.lineTo(26, 10); g.lineTo(52, 20); g.lineTo(56, 44); g.lineTo(30, 56); g.closePath(); g.fill(); g.stroke(); });
const flameTex = () => ctex("rtFlame", 128, 256, (g) => { g.clearRect(0, 0, 128, 256); const gr = g.createRadialGradient(64, 190, 6, 64, 170, 110); gr.addColorStop(0, "rgba(255,250,200,1)"); gr.addColorStop(0.35, "rgba(255,190,70,0.95)"); gr.addColorStop(0.7, "rgba(240,90,30,0.7)"); gr.addColorStop(1, "rgba(200,40,20,0)");
  g.fillStyle = gr; g.beginPath(); g.moveTo(64, 10); g.bezierCurveTo(130, 120, 120, 240, 64, 250); g.bezierCurveTo(8, 240, -2, 120, 64, 10); g.fill(); });
const boardTex = () => ctex("rtBoard", 1024, 512, (g) => {
  g.fillStyle = "#24302a"; g.fillRect(0, 0, 1024, 512); g.strokeStyle = "#6b4a2f"; g.lineWidth = 26; g.strokeRect(0, 0, 1024, 512);
  g.strokeStyle = "rgba(240,240,230,0.92)"; g.lineWidth = 9; g.lineCap = "round";
  // a rat in chalk, opened up: the charge inside, the fuse at the tail end, arrows
  g.beginPath(); g.ellipse(470, 270, 210, 105, 0, 0, Math.PI * 2); g.stroke();
  g.beginPath(); g.moveTo(670, 230); g.lineTo(820, 280); g.lineTo(670, 320); g.stroke();
  g.beginPath(); g.arc(640, 200, 30, 0, Math.PI * 2); g.stroke();
  g.beginPath(); g.moveTo(262, 280); g.bezierCurveTo(160, 300, 120, 380, 60, 360); g.stroke();
  g.setLineDash([18, 14]); g.beginPath(); g.ellipse(470, 270, 130, 55, 0, 0, Math.PI * 2); g.stroke(); g.setLineDash([]);
  g.fillStyle = "rgba(240,210,120,0.85)"; g.beginPath(); g.ellipse(470, 270, 120, 46, 0, 0, Math.PI * 2); g.fill();
  g.beginPath(); g.moveTo(560, 120); g.lineTo(500, 220); g.stroke(); g.beginPath(); g.moveTo(500, 220); g.lineTo(500, 190); g.moveTo(500, 220); g.lineTo(528, 206); g.stroke();
  g.fillStyle = "rgba(240,240,230,0.92)"; g.beginPath(); g.arc(780, 110, 14, 0, Math.PI * 2); g.fill(); g.beginPath(); g.arc(840, 150, 14, 0, Math.PI * 2); g.fill();
  g.beginPath(); g.arc(160, 120, 40, 0, Math.PI * 2); g.stroke(); g.font = "900 64px Arial"; g.fillText("!", 148, 142);
});
const fileTex = () => ctex("rtFile", 512, 360, (g) => {
  g.fillStyle = "#d8b97a"; g.fillRect(0, 0, 512, 360); g.strokeStyle = "#8a6a3a"; g.lineWidth = 10; g.strokeRect(5, 5, 502, 350);
  g.fillStyle = "#c9373a"; g.font = "900 54px Arial"; g.textAlign = "center"; g.fillText("MOST SECRET", 256, 90);
  g.fillStyle = "#2a201a"; g.font = "900 40px Arial"; g.fillText("S.O.E.", 256, 160); g.font = "700 32px Arial"; g.fillText("EXPLOSIVE RATS", 256, 220);
  g.strokeStyle = "#2a201a"; g.lineWidth = 4; for (let y = 260; y < 340; y += 22) { g.beginPath(); g.moveTo(90, y); g.lineTo(422, y); g.stroke(); }
});
const labelTex = (s: string, bg: string) => ctex(`rtLabel_${s}`, 256, 128, (g) => { g.fillStyle = bg; g.fillRect(0, 0, 256, 128); g.strokeStyle = "#2a201a"; g.lineWidth = 8; g.strokeRect(4, 4, 248, 120); g.fillStyle = "#2a201a"; g.font = "900 46px Arial"; g.textAlign = "center"; g.textBaseline = "middle"; g.fillText(s, 128, 66); });

// ---------------- the rat ----------------
const RAT = "#7d716c", RAT2 = "#685c58", PINK = "#d99a9a";
/** a rat lying along +x (head at +x), feet down; at the origin is the middle of its belly on the ground */
const makeRat = () => {
  const G = new THREE.Group(), fur = M("rtFur", RAT), fur2 = M("rtFur2", RAT2), pink = M("rtPink", PINK), black = M("rtBlack", "#0b090c");
  const add = (g: THREE.BufferGeometry, m: THREE.Material, x: number, y: number, z: number, sx = 1, sy = 1, sz = 1) => { const ms = new THREE.Mesh(g, m); ms.position.set(x, y, z); ms.scale.set(sx, sy, sz); G.add(ms); return ms; };
  add(new THREE.SphereGeometry(1, 18, 12), fur, 0, 0.075, 0, 0.14, 0.075, 0.085);
  const head = add(new THREE.ConeGeometry(0.058, 0.13, 14), fur2, 0.16, 0.08, 0); head.rotation.z = -Math.PI / 2;
  add(new THREE.SphereGeometry(0.017, 8, 6), pink, 0.228, 0.078, 0);
  for (const s of [-1, 1]) {
    const ear = add(new THREE.CircleGeometry(0.034, 14), pink, 0.125, 0.135, s * 0.04); ear.rotation.y = Math.PI / 2 + s * 0.4; (ear.material as THREE.Material).side = THREE.DoubleSide;
    add(new THREE.SphereGeometry(0.01, 8, 6), black, 0.175, 0.1, s * 0.03);
    for (const fx of [0.08, -0.08]) add(new THREE.SphereGeometry(0.02, 8, 6), pink, fx, 0.012, s * 0.06, 1.3, 0.6, 1);
  }
  const curve = new THREE.CatmullRomCurve3([V(-0.13, 0.05, 0), V(-0.24, 0.025, 0.03), V(-0.34, 0.015, -0.02), V(-0.44, 0.012, 0.04)]);
  G.add(new THREE.Mesh(new THREE.TubeGeometry(curve, 16, 0.009, 6), pink));
  // the slit along the back, the charge inside it, the stitches over it, the fuse out of the tail end
  const slit = add(new THREE.BoxGeometry(0.17, 0.012, 0.03), black, -0.005, 0.148, 0); slit.name = "slit";
  const putty = add(new THREE.SphereGeometry(1, 12, 8), M("rtPutty", "#e6cf8a"), -0.005, 0.15, 0, 0.075, 0.016, 0.02); putty.name = "putty";
  const st = new THREE.Group(); st.name = "stitch";
  for (let i = 0; i < 6; i++) { const s2 = new THREE.Mesh(new THREE.BoxGeometry(0.01, 0.008, 0.05), M("rtThread", "#1a1418")); s2.position.set(-0.075 + i * 0.03, 0.149, 0); s2.rotation.y = 0.5; st.add(s2); }
  G.add(st);
  const fuse = add(new THREE.CylinderGeometry(0.008, 0.008, 0.07, 8), M("rtBrass", "#e3b852"), -0.15, 0.09, 0); fuse.rotation.z = Math.PI / 2; fuse.name = "fuse";
  return shadowAll(G);
};
/** a crate 0.9 x 0.5 x 0.6 m, open at the top, with a lid hinged on its back edge */
const makeCrate = (lid: THREE.Group) => {
  const G = new THREE.Group(), w = M("rtCrate", "#a07a4a"), w2 = M("rtCrate2", "#7a5634"), W = 0.9, H = 0.5, D = 0.6, t = 0.03;
  const add = (g: THREE.BufferGeometry, m: THREE.Material, x: number, y: number, z: number) => { const ms = new THREE.Mesh(g, m); ms.position.set(x, y, z); G.add(ms); return ms; };
  add(new THREE.BoxGeometry(W, t, D), w2, 0, t / 2, 0);
  add(new THREE.BoxGeometry(W, H, t), w, 0, H / 2, -D / 2 + t / 2); add(new THREE.BoxGeometry(W, H, t), w, 0, H / 2, D / 2 - t / 2);
  add(new THREE.BoxGeometry(t, H, D), w, -W / 2 + t / 2, H / 2, 0); add(new THREE.BoxGeometry(t, H, D), w, W / 2 - t / 2, H / 2, 0);
  for (const y of [0.12, 0.38]) { add(new THREE.BoxGeometry(W + 0.01, 0.06, t + 0.01), w2, 0, y, -D / 2 + t / 2); add(new THREE.BoxGeometry(W + 0.01, 0.06, t + 0.01), w2, 0, y, D / 2 - t / 2); }
  const lm = new THREE.Mesh(new THREE.BoxGeometry(W + 0.02, t, D + 0.02), w); lm.position.set(0, t / 2, D / 2 + 0.01); lid.add(lm);
  const lb = new THREE.Mesh(new THREE.BoxGeometry(W + 0.03, 0.04, 0.06), w2); lb.position.set(0, 0.03, D / 2); lid.add(lb);
  lid.position.set(0, H, -D / 2); G.add(lid);
  return shadowAll(G);
};

export class RWorld {
  root = new THREE.Group();
  private pool = new Pool();
  private actors: Actor[] = []; private fxs: Fx[] = [];
  private hemi: THREE.HemisphereLight; private sun: THREE.DirectionalLight;
  private fog = new THREE.Fog("#2a2024", 80, 600);
  private sunCache = new Map<number, THREE.Vector3>();
  private rats: THREE.Group[] = [];
  private crate = new THREE.Group(); private lid = new THREE.Group();
  private shovel = new THREE.Group(); private shBlade: THREE.Mesh; private shHandle: THREE.Mesh; private shCoal: THREE.Mesh;
  private door = new THREE.Group(); private glow: THREE.Mesh; private flames: THREE.Mesh[] = [];
  private needle = new THREE.Group(); private putty: THREE.Mesh[] = []; private file: THREE.Mesh;
  private lanterns: THREE.Group[] = [];
  private puffs: THREE.Sprite[] = []; private lumps: Cards;
  private lastPeople: { name: string; p: V3; low: boolean; extra: boolean }[] = [];
  private ray = new THREE.Raycaster();
  private frustum = new THREE.Frustum(); private m4 = new THREE.Matrix4(); private sph = new THREE.Sphere(); private v = new THREE.Vector3();

  constructor(kit: Kit) {
    void kit; const R = this.root;
    this.hemi = new THREE.HemisphereLight("#ffe9d0", "#5c4a44", 0.6);
    this.sun = new THREE.DirectionalLight("#fff0d6", 2.4);
    this.sun.castShadow = true; this.sun.shadow.mapSize.set(4096, 4096);
    R.add(this.hemi, this.sun, this.sun.target);
    const wood = M("rtWood", "#8a5a3a"), wood2 = M("rtWood2", "#6b4a2f"), iron = M("rtIron", "#3a3a48"), dark = M("rtDark", "#1d1b22"), brass = M("rtBrass", "#e3b852");
    const floor = lam("rtPlanks", () => ({ map: planksHD() })), stoneFloor = lam("rtStoneFloor", () => ({ map: stoneHD("rtFlagHD", ["#6e6460", "#665c58", "#746a64", "#5e5652"], "#3a3432") }));
    const plaster = lam("rtPlaster", () => ({ map: stoneHD("rtPlasterHD", ["#e9dcc0", "#e2d4b6", "#efe3c9", "#dccdae"], "#c2b08e") }));
    const plaster2 = lam("rtPlaster2", () => ({ map: stoneHD("rtPlaster2HD", ["#cfd8cf", "#c6cfc6", "#d6ded6", "#bfc9bf"], "#9aa69a") }));
    const brick = lam("rtBrick", () => ({ map: brickTex("rtBrickT", "#8a4a36", "#7a3e2e", "#4a3430") })), brick2 = lam("rtBrick2", () => ({ map: brickTex("rtBrickT2", "#6e5a4e", "#5e4c42", "#3a302c") }));
    const WALL: Record<RoomKey, THREE.Material> = { wk: plaster, shop: plaster, boil: brick, school: plaster2, depot: brick2 };
    const FLOOR: Record<RoomKey, THREE.Material> = { wk: floor, shop: floor, boil: stoneFloor, school: floor, depot: stoneFloor };
    const SIGN: Record<RoomKey, [string, string, string] | null> = {
      wk: ["rt_wk", "WORKSHOP · LONDON", "#2f2a3a"], shop: ["rt_shop", "SUPPLIES · LONDON", "#3f5f4a"], boil: null, school: ["rt_school", "MILITARY SCHOOL", "#3f4434"], depot: null,
    };
    // ---------------- the rooms ----------------
    for (const k of Object.keys(ROOM) as RoomKey[]) {
      const [ox, oy, oz] = ROOM[k], b = new Batch(), wb = new Batch();
      b.add(boxGeo(V(ox - RW - 0.3, oy - 0.3, oz + RZ0 - 0.3), V(ox + RW + 0.3, oy, oz + RZ1 + 0.3), 4), FLOOR[k]);
      wb.add(boxGeo(V(ox - RW, oy, oz + RZ1), V(ox + RW, oy + RH, oz + RZ1 + 0.3), 2), WALL[k]);
      wb.add(boxGeo(V(ox - RW - 0.3, oy, oz + RZ0), V(ox - RW, oy + RH, oz + RZ1 + 0.3), 2), WALL[k]);
      wb.add(boxGeo(V(ox + RW, oy, oz + RZ0), V(ox + RW + 0.3, oy + RH, oz + RZ1 + 0.3), 2), WALL[k]);
      wb.add(boxGeo(V(ox - RW, oy, oz + RZ0 - 0.3), V(ox + RW, oy + RH, oz + RZ0), 2), WALL[k]);
      wb.add(boxGeo(V(ox - RW - 0.3, oy + RH, oz + RZ0 - 0.3), V(ox + RW + 0.3, oy + RH + 0.3, oz + RZ1 + 0.3), 2), M("rtCeil" + k, k === "boil" || k === "depot" ? "#3a3030" : "#e9dcc0"));
      // a skirting board and a dado rail on the plaster rooms
      if (k === "wk" || k === "shop" || k === "school") { b.add(boxGeo(V(ox - RW, oy, oz + RZ1 - 0.05), V(ox + RW, oy + 0.18, oz + RZ1)), wood2); b.add(boxGeo(V(ox - RW, oy + 1.1, oz + RZ1 - 0.05), V(ox + RW, oy + 1.17, oz + RZ1)), wood2); }
      b.build(R);
      const wg = new THREE.Group(); wb.build(wg); wg.traverse((o) => { o.castShadow = false; o.receiveShadow = true; }); R.add(wg);
      const sg = SIGN[k];
      if (sg) { const s = new THREE.Mesh(new THREE.PlaneGeometry(4.0, 0.9), lam(`sign_${sg[0]}`, () => ({ map: signTex(sg[0], sg[1], sg[2], "#e8c45a") }))); s.rotation.y = Math.PI; s.position.set(ox, oy + 3.3, oz + RZ1 - 0.02); R.add(s); }
    }
    const part = (g: THREE.BufferGeometry, m: THREE.Material, x: number, y: number, z: number) => { const ms = new THREE.Mesh(g, m); ms.position.set(x, y, z); ms.castShadow = true; ms.receiveShadow = true; R.add(ms); return ms; };
    // ---- workshop: the bench, a hanging lamp, shelves of tins ----
    { const [ox, , oz] = ROOM.wk, B = BENCH;
      part(new THREE.BoxGeometry(B.x1 - B.x0, 0.08, B.z1 - B.z0), wood, ox + (B.x0 + B.x1) / 2, B.y - 0.04, oz + (B.z0 + B.z1) / 2);
      for (const [x, z] of [[B.x0 + 0.1, B.z0 + 0.1], [B.x1 - 0.1, B.z0 + 0.1], [B.x0 + 0.1, B.z1 - 0.1], [B.x1 - 0.1, B.z1 - 0.1]]) part(new THREE.BoxGeometry(0.08, B.y - 0.08, 0.08), wood2, ox + x, (B.y - 0.08) / 2, oz + z);
      for (const y of [1.6, 2.3]) { part(new THREE.BoxGeometry(5.0, 0.05, 0.35), wood2, ox, y, oz + RZ1 - 0.18);
        for (let i = 0; i < 9; i++) part(new THREE.CylinderGeometry(0.09, 0.09, 0.2, 12), M("rtTin" + (i % 3), ["#9aa0a8", "#c9373a", "#3f6f5a"][i % 3]), ox - 2.2 + i * 0.55, y + 0.125, oz + RZ1 - 0.2); }
      part(new THREE.CylinderGeometry(0.01, 0.01, 1.2, 6), dark, ox, RH - 0.6, oz + 1.5);
      const shade = part(new THREE.ConeGeometry(0.35, 0.25, 16, 1, true), M("rtShade", "#3f6f5a", { side: THREE.DoubleSide }), ox, RH - 1.25, oz + 1.5); shade.castShadow = false;
      const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.08, 10, 8), new THREE.MeshBasicMaterial({ color: new THREE.Color(3, 2.6, 1.8) })); bulb.position.set(ox, RH - 1.33, oz + 1.5); bulb.layers.set(NOINK); R.add(bulb);
      // the putty blocks and the needle live on the bench
      for (let i = 0; i < 3; i++) { const p = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.07, 0.1), M("rtPutty", "#e6cf8a")); p.castShadow = true; p.visible = false; R.add(p); this.putty.push(p); }
      const nd = new THREE.Mesh(new THREE.CylinderGeometry(0.004, 0.002, 0.12, 6), M("rtSteel", "#d8dde4")); nd.rotation.z = Math.PI / 2; this.needle.add(nd);
      const th = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3([V(-0.06, 0, 0), V(-0.12, 0.03, 0.02), V(-0.2, 0.0, 0.05), V(-0.26, 0.02, 0.0)]), 12, 0.003, 4), M("rtThread", "#1a1418")); this.needle.add(th);
      this.needle.visible = false; R.add(this.needle);
      this.file = new THREE.Mesh(new THREE.PlaneGeometry(0.5, 0.35), lam("rtFileM", () => ({ map: fileTex() }))); this.file.rotation.x = -Math.PI / 2; this.file.receiveShadow = true; this.file.visible = false; R.add(this.file); }
    // ---- shop: the counter, shelves of jars and two cages ----
    { const [ox, , oz] = ROOM.shop, C = COUNTER;
      part(new THREE.BoxGeometry(C.x1 - C.x0, C.y, C.z1 - C.z0), wood2, ox + (C.x0 + C.x1) / 2, C.y / 2, oz + (C.z0 + C.z1) / 2);
      part(new THREE.BoxGeometry(C.x1 - C.x0 + 0.1, 0.06, C.z1 - C.z0 + 0.1), wood, ox + (C.x0 + C.x1) / 2, C.y + 0.03, oz + (C.z0 + C.z1) / 2);
      for (const y of [1.4, 2.0, 2.6]) { part(new THREE.BoxGeometry(6.0, 0.05, 0.4), wood2, ox, y, oz + RZ1 - 0.2);
        for (let i = 0; i < 11; i++) part(new THREE.CylinderGeometry(0.1, 0.1, 0.26, 12), M("rtJar" + (i % 4), ["#b8d8c8", "#d9c08a", "#c9a0a0", "#a8b8d8"][i % 4], { transparent: true, opacity: 0.85 }), ox - 2.7 + i * 0.54, y + 0.155, oz + RZ1 - 0.22); }
      for (const x of [-4.4, 4.4]) { const cage = new THREE.Group();
        for (let i = 0; i < 9; i++) { const bar = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, 0.5, 4), iron); bar.position.set(-0.3 + i * 0.075, 0.25, 0.25); cage.add(bar); const bar2 = bar.clone(); bar2.position.z = -0.25; cage.add(bar2); }
        const top = new THREE.Mesh(new THREE.BoxGeometry(0.65, 0.02, 0.55), iron); top.position.y = 0.5; cage.add(top); const bot = new THREE.Mesh(new THREE.BoxGeometry(0.65, 0.04, 0.55), wood2); cage.add(bot);
        cage.position.set(ox + x, 0, oz + 2.8); shadowAll(cage); R.add(cage); } }
    // ---- boiler room: the boiler on a brick bed, its firebox door and fire; the coal pile ----
    { const [ox, , oz] = ROOM.boil, B = BOILER;
      const body = part(new THREE.CylinderGeometry(B.r, B.r, RZ1 - B.z, 32).rotateX(Math.PI / 2), M("rtBoiler", "#4a4a52"), ox + B.x, B.cy, oz + (B.z + RZ1) / 2);
      void body;
      for (const z of [B.z + 0.4, B.z + 1.2, B.z + 2.0]) part(new THREE.TorusGeometry(B.r + 0.01, 0.035, 8, 40), M("rtRivet", "#2e2e34"), ox + B.x, B.cy, oz + z);
      part(new THREE.CylinderGeometry(B.r * 0.98, B.r * 0.98, 0.06, 32).rotateX(Math.PI / 2), M("rtBoilerFace", "#5a5a62"), ox + B.x, B.cy, oz + B.z - 0.03);
      part(new THREE.BoxGeometry(B.r * 2.3, B.cy - B.r + 0.4, RZ1 - B.z + 0.2), brick, ox + B.x, (B.cy - B.r + 0.4) / 2, oz + (B.z + RZ1) / 2);
      // gauges and a pipe going up
      part(new THREE.CylinderGeometry(0.12, 0.12, 0.04, 16).rotateX(Math.PI / 2), brass, ox + B.x + 0.8, B.cy + 0.9, oz + B.z - 0.07);
      part(new THREE.CylinderGeometry(0.15, 0.15, RH, 12), iron, ox + B.x - 0.9, B.cy + B.r + 0.2, oz + B.z + 1.4);
      // the firebox: a dark mouth, the fire in it, the door on its hinge (opens toward -x)
      const [fx, fy, fz] = FIRE;
      part(new THREE.BoxGeometry(0.86, 0.66, 0.08), dark, ox + fx, fy, oz + fz - 0.07);
      this.glow = new THREE.Mesh(new THREE.PlaneGeometry(0.74, 0.54), new THREE.MeshBasicMaterial({ color: new THREE.Color(3.4, 1.4, 0.4) })); this.glow.rotation.y = Math.PI; this.glow.position.set(ox + fx, fy, oz + fz - 0.115); this.glow.layers.set(NOINK); R.add(this.glow);
      const fm = new THREE.MeshBasicMaterial({ map: flameTex(), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, color: new THREE.Color(1.6, 1.3, 1.0) });
      for (let i = 0; i < 3; i++) { const fl = new THREE.Mesh(new THREE.PlaneGeometry(0.22, 0.44), fm); fl.rotation.y = Math.PI; fl.position.set(ox + fx - 0.22 + i * 0.22, fy - 0.05, oz + fz - 0.12); fl.layers.set(AFTERINK); R.add(fl); this.flames.push(fl); }
      const leaf = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.6, 0.05), M("rtDoor", "#2e2e34")); leaf.position.set(0.4, 0, 0); this.door.add(leaf);
      const hd = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.04, 0.05), brass); hd.position.set(0.68, 0, -0.05); this.door.add(hd);
      for (let i = 0; i < 3; i++) { const vent = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.03, 0.02), dark); vent.position.set(0.4, -0.15 + i * 0.15, -0.035); this.door.add(vent); }
      this.door.position.set(ox + fx - 0.4, fy, oz + fz - 0.16); shadowAll(this.door); R.add(this.door);
      // coal: lumps piled in a cone, plus a scatter on the floor
      const cb = new Batch(), coalM = M("rtCoal", "#2a2628"), coalM2 = M("rtCoal2", "#3a3436");
      let s = 11; const rnd = () => (s = (s * 16807) % 2147483647) / 2147483647;
      { const cone = new THREE.ConeGeometry(COAL_R, COAL_H, 18, 1); cone.translate(ox + COAL[0], COAL_H / 2 - 0.02, oz + COAL[2]); cb.add(cone, coalM); }
      for (let i = 0; i < 340; i++) { const a = rnd() * Math.PI * 2, rr = Math.sqrt(rnd()) * COAL_R * 1.05, x = COAL[0] + Math.cos(a) * rr, z = COAL[2] + Math.sin(a) * rr / 1.1, y = Math.max(0, COAL_H * (1 - rr / COAL_R)) - 0.02;
        const g = new THREE.DodecahedronGeometry(0.05 + rnd() * 0.06, 0); g.rotateX(rnd() * 3); g.rotateY(rnd() * 3); g.translate(ox + x, y + 0.02, oz + z); cb.add(g, rnd() > 0.5 ? coalM : coalM2); }
      cb.build(R); }
    // ---- the school: a blackboard, the glass case on its stand, a lectern ----
    { const [ox, , oz] = ROOM.school;
      const bd = part(new THREE.PlaneGeometry(3.6, 1.8), lam("rtBoardM", () => ({ map: boardTex() })), ox + 1.4, 2.1, oz + RZ1 - 0.03); bd.rotation.y = Math.PI; bd.castShadow = false;
      part(new THREE.BoxGeometry(0.5, CASE[1] - 0.02, 0.5), wood2, ox + CASE[0], (CASE[1] - 0.02) / 2, oz + CASE[2]);
      const glass = new THREE.Mesh(new THREE.BoxGeometry(0.62, 0.38, 0.42), new THREE.MeshLambertMaterial({ color: "#cfe6f0", transparent: true, opacity: 0.28, depthWrite: false })); glass.position.set(ox + CASE[0], CASE[1] + 0.19, oz + CASE[2]); glass.layers.set(NOINK); R.add(glass);
      const edges = new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.BoxGeometry(0.62, 0.38, 0.42)), new THREE.LineBasicMaterial({ color: "#2a2a30" })); edges.position.copy(glass.position); R.add(edges);
      part(new THREE.BoxGeometry(0.68, 0.03, 0.48), brass, ox + CASE[0], CASE[1], oz + CASE[2]);
      const lb = part(new THREE.PlaneGeometry(0.3, 0.15), lam("rtLabelM", () => ({ map: labelTex("BEUTE", "#f1ede2") })), ox + CASE[0], CASE[1] - 0.25, oz + CASE[2] - 0.255); lb.rotation.y = Math.PI; lb.castShadow = false;
      part(new THREE.BoxGeometry(0.75, 1.05, 0.5), wood, ox + LECTERN[0], 0.525, oz + LECTERN[2]);
      { const top = part(new THREE.BoxGeometry(0.85, 0.05, 0.6), wood2, ox + LECTERN[0], 1.08, oz + LECTERN[2] - 0.03); top.rotation.x = 0.25; } }
    // ---- the depot: stacks of crates against the walls ----
    { const [ox, , oz] = ROOM.depot, cw = M("rtCrateS", "#8f6a40"), cw2 = M("rtCrateS2", "#7a5634");
      for (const [x, z, h] of [[-4.6, 2.9, 3], [-3.5, 2.9, 2], [3.6, 2.9, 3], [4.7, 2.9, 2], [4.7, 1.7, 1], [-4.7, 1.6, 1]] as [number, number, number][]) for (let k = 0; k < h; k++) part(new THREE.BoxGeometry(1.0, 0.7, 1.0), k % 2 ? cw : cw2, ox + x, 0.35 + k * 0.7, oz + z); }
    // ---- posed props ----
    for (let i = 0; i < 36; i++) { const r2 = makeRat(); r2.visible = false; R.add(r2); this.rats.push(r2); }
    this.crate.add(makeCrate(this.lid)); this.crate.visible = false; R.add(this.crate);
    this.shBlade = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.02, 0.32), iron); this.shHandle = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.018, 1, 8), wood);
    const grip = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.03, 0.03), wood2); grip.name = "grip";
    this.shCoal = new THREE.Mesh(new THREE.DodecahedronGeometry(0.1, 0), M("rtCoal", "#2a2628")); this.shCoal.scale.set(1.2, 0.5, 1.2);
    this.shovel.add(this.shBlade, this.shHandle, grip, this.shCoal); shadowAll(this.shovel); this.shovel.visible = false; R.add(this.shovel);
    for (let i = 0; i < 4; i++) { const L = new THREE.Group();
      const cage = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.1, 0.22, 8, 1, true), M("rtLantern", "#2e2e34", { side: THREE.DoubleSide })); L.add(cage);
      const ring = new THREE.Mesh(new THREE.TorusGeometry(0.05, 0.008, 6, 14), iron); ring.position.y = 0.16; L.add(ring);
      const light = new THREE.Mesh(new THREE.SphereGeometry(0.07, 10, 8), new THREE.MeshBasicMaterial({ color: new THREE.Color(3.2, 2.2, 0.9) })); light.layers.set(NOINK); L.add(light);
      L.visible = false; R.add(L); this.lanterns.push(L); }
    const puffT = puffTex();
    for (let i = 0; i < 40; i++) { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: puffT, transparent: true, depthWrite: false, fog: false })); s.visible = false; s.layers.set(AFTERINK); R.add(s); this.puffs.push(s); }
    this.lumps = new Cards(R, lumpTex(), 24, 0.14);
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

  /** pose the world for shot `id` (spec st) at frame f; sample(f) gives the shot's camera at any frame (for the light) */
  update(id: number, st: St3, f: number, cam: THREE.PerspectiveCamera, scene: THREE.Scene, sample: (f: number) => { pos: V3; look: V3 }, a: number, b: number) {
    const t = f / FPS, light: Light = st.light, L = LP[light], K = LK[light];
    const c = st.cam;
    cam.position.set(...c.pos); cam.up.set(0, 1, 0); cam.lookAt(...c.look); cam.rotateZ(c.roll);
    cam.fov = c.fov; cam.near = 0.03; cam.far = 1000; cam.updateProjectionMatrix(); cam.updateMatrixWorld();
    const focus = V(...(st.focus ?? c.look)), dist = cam.position.distanceTo(focus);
    cam.layers.enable(NOINK);
    // ---- lights ----
    const sunDir = this.shotSun(id, L, sample, a, b);
    this.hemi.color.set(L.sky); this.hemi.groundColor.set(L.ground); this.hemi.intensity = L.hemiI;
    this.sun.color.set(L.sunCol); this.sun.intensity = L.sunI;
    const Rr = THREE.MathUtils.clamp(dist * 1.15 + 5, 9, 40);
    this.sun.position.copy(focus).addScaledVector(sunDir, 60); this.sun.target.position.copy(focus);
    const sc = this.sun.shadow.camera;
    sc.left = -Rr; sc.right = Rr; sc.top = Rr; sc.bottom = -Rr; sc.near = 1; sc.far = 140; sc.updateProjectionMatrix();
    this.sun.shadow.bias = L.bias; this.sun.shadow.normalBias = L.normalBias * (Rr / 12);
    TONE.uLitCol.value.set(...L.lit); TONE.uShadeCol.value.set(...L.shade); TONE.uShadeLift.value.set(...L.lift);
    TONE.uLambert.value = L.lambert; TONE.uSideK.value = L.sideK; TONE.uTerm.value = L.term; TONE.uBounce.value.set(...K.bounce); TONE.uSat.value = K.sat;
    CHAR.uCharTint.value.set(...L.charTint); CHAR.uCharShade.value = L.charShade; CHAR.uGrad.value = L.charGrad;
    CHAR.uBodyGrad.value = L.bodyGrad; CHAR.uSideTint.value.set(...L.sideTint);
    untone("#2a2024", this.fog.color); this.fog.near = 80; this.fog.far = 600; scene.fog = this.fog; scene.background = new THREE.Color("#1a1416");

    // ---------------- props ----------------
    this.rats.forEach((g, i) => { const r = st.rats?.[i]; g.visible = !!r; if (!r) return;
      g.position.set(r.p[0], r.p[1] + (r.side ? 0.085 * (r.s ?? 1.25) : 0), r.p[2]); g.rotation.set(0, r.yaw ?? 0, 0, "YXZ"); g.rotateX(r.side ? -1.35 : 0); if (r.spin) g.rotateZ(r.spin); g.scale.setScalar(r.s ?? 1.25);
      const o = r.open ?? 0;
      g.getObjectByName("slit")!.visible = o > 0.01 && !r.stitch; g.getObjectByName("slit")!.scale.x = Math.max(0.01, o);
      g.getObjectByName("putty")!.visible = o > 0.3 && !r.stitch; g.getObjectByName("putty")!.scale.x = 0.075 * Math.min(1, (o - 0.3) / 0.7 + 0.2);
      g.getObjectByName("stitch")!.visible = !!r.stitch; g.getObjectByName("fuse")!.visible = !!r.fuse; });
    const cr = st.crate; this.crate.visible = !!cr;
    if (cr) { this.crate.position.set(...cr.p); this.crate.rotation.y = cr.yaw ?? 0; this.lid.rotation.x = -1.9 * (cr.lid ?? 0); this.lid.position.y = 0.5 + 0.0 * (cr.lid ?? 0); }
    const sh = st.shovel; this.shovel.visible = !!sh;
    if (sh) { const gp = V(...sh.g), bp = V(...sh.b), d = bp.clone().sub(gp), len = d.length(); d.normalize();
      this.shovel.position.set(0, 0, 0); this.shovel.rotation.set(0, 0, 0); this.shovel.scale.set(1, 1, 1);
      this.shHandle.position.copy(gp).addScaledVector(d, len / 2); this.shHandle.quaternion.setFromUnitVectors(V(0, 1, 0), d); this.shHandle.scale.set(1, len, 1);
      const flat = V(d.x, 0, d.z).normalize(), yaw = Math.atan2(flat.x, flat.z);
      this.shBlade.position.copy(bp).addScaledVector(d, 0.12); this.shBlade.rotation.set(Math.asin(-d.y) * 0.4 + (sh.tip ?? 0), yaw, 0, "YXZ");
      const gr = this.shovel.getObjectByName("grip")!; gr.position.copy(gp); gr.rotation.set(0, yaw, 0);
      this.shCoal.visible = !!sh.load; this.shCoal.position.copy(this.shBlade.position).add(V(0, 0.04, 0)); }
    const fireK = st.fire ?? 0; this.door.rotation.y = 1.9 * fireK;
    const flick = 1 + 0.12 * Math.sin(t * 23) + 0.08 * Math.sin(t * 37 + 1);
    (this.glow.material as THREE.MeshBasicMaterial).color.setRGB(3.4 * flick * (1 + (st.flare ?? 0) * 2), 1.4 * flick * (1 + (st.flare ?? 0)), 0.4);
    this.flames.forEach((fl, i) => { fl.visible = fireK > 0.05; fl.scale.set(1 + 0.15 * Math.sin(t * 17 + i), (0.85 + 0.25 * Math.sin(t * 13 + i * 2)) * (1 + (st.flare ?? 0) * 1.5), 1); });
    this.needle.visible = !!st.needle; if (st.needle) { this.needle.position.set(...st.needle.p); this.needle.rotation.set(0, st.needle.yaw, st.needle.tilt ?? 0); }
    this.putty.forEach((p, i) => { const q = st.putty?.[i]; p.visible = !!q; if (q) p.position.set(...q); });
    this.file.visible = !!st.file; if (st.file) { this.file.position.set(...st.file.p); this.file.rotation.set(-Math.PI / 2, 0, st.file.yaw); }
    this.lanterns.forEach((Lg, i) => { const q = st.lanterns?.[i]; Lg.visible = !!q; if (q) { Lg.position.set(q[0], q[1] - 0.12, q[2]); Lg.rotation.z = 0.08 * Math.sin(t * 3 + i); } });
    this.puffs.forEach((s, i) => { const pf = st.puffs?.[i]; s.visible = !!pf; if (pf) { s.position.set(...pf.p); s.scale.setScalar(pf.s); const m2 = s.material as THREE.SpriteMaterial; m2.color.setRGB(...pf.c); m2.opacity = pf.a; m2.rotation = i * 1.7; m2.blending = pf.add ? THREE.AdditiveBlending : THREE.NormalBlending; } });
    this.lumps.hide(); let nl = 0;
    for (const cd of st.cards ?? []) this.lumps.put(nl++, V(...cd.p), cam, cd.spin, cd.s);

    // ---- cast ----
    this.frustum.setFromProjectionMatrix(this.m4.multiplyMatrices(cam.projectionMatrix, cam.matrixWorldInverse));
    const right = V(0, 0, 0).setFromMatrixColumn(cam.matrixWorld, 0);
    const lightA = Math.round(Math.atan2(-sunDir.y, sunDir.dot(right)) / (Math.PI / 4)) * (Math.PI / 4);
    const blink = (seed: number) => { const n2 = Math.floor((t + seed * 0.37) / 2.3), ph = (t + seed * 0.37) - n2 * 2.3; return ph < 0.13 ? 1 : 0; };
    const people = (st.people ?? []).map((q) => ({ q, w: OUT[q.who] ?? OUT.gs1 }));
    this.lastPeople = people.map(({ q }) => ({ name: q.who, p: q.p, low: !!q.low, extra: !!q.extra }));
    let ai = 0;
    for (const { q, w } of people) {
      if (!this.frustum.intersectsSphere(this.sph.set(this.v.set(q.p[0], q.p[1] + 1.1, q.p[2]), 3.5))) continue;
      const d = cam.position.distanceTo(this.v.set(q.p[0], q.p[1] + 1.2, q.p[2]));
      const [cw, ch, kk] = tier(d), act = this.actor(ai++), bl = blink(w.seed);
      let hr: [number, number] | undefined = q.hold?.r, hl: [number, number] | undefined = q.hold?.l;
      const o3 = V(...q.p), nx = cam.position.x - q.p[0], nz = cam.position.z - q.p[2], nl2 = Math.hypot(nx, nz) || 1, n3 = V(nx / nl2, 0, nz / nl2), crs = V(n3.z, 0, -n3.x);
      // where a point in the world falls on this character's card, as seen from the camera (metres from the feet)
      const onCard = (wp: THREE.Vector3): [number, number] => { const dir = wp.clone().sub(cam.position), tt = o3.clone().sub(cam.position).dot(n3) / dir.dot(n3), pc = cam.position.clone().addScaledVector(dir, tt); return [pc.clone().sub(o3).dot(crs), pc.y - q.p[1]]; };
      const give = (hc: [number, number]) => { if ((hc[0] >= 0 && !hr) || hl) hr = hc; else hl = hc; };
      for (const hwp of q.hw ?? []) give(onCard(V(...hwp)));
      const hk = hr || hl ? [hr, hl].flat().map((x) => (x ?? 9).toFixed(2)).join(",") : "";
      const key = `F|${w.key}|${q.expr}|${q.look ?? 0}|${(q.headTilt ?? 0).toFixed(2)}|${q.facing ?? 0}|${bl}|${q.wave ?? "-"}|${hk}|${q.march === undefined ? "" : Math.round(q.march * 12)}|${lightA.toFixed(2)}`;
      const hands = hr || hl ? { r: hr ? [300 + hr[0] / SUc, 975 - hr[1] / SUc] as [number, number] : undefined, l: hl ? [300 + hl[0] / SUc, 975 - hl[1] / SUc] as [number, number] : undefined } : undefined;
      act.r = this.pool.req(key, cw, ch, kk, (p: Pen) => bodyFront(p, w.o, { mode: q.march === undefined ? "stand" : "march", phase: q.march === undefined ? undefined : Math.round(q.march * 12) / 12, expr: q.expr, look: q.look ?? 0, headTilt: q.headTilt ?? 0, facing: q.facing ?? 0, blink: bl, wave: hands ? undefined : q.wave, hands, light: lightA, seed: w.seed }));
      act.mesh.visible = true;
      act.mesh.position.set(...q.p);
      act.mesh.rotation.set(0, Math.atan2(cam.position.x - q.p[0], cam.position.z - q.p[2]), 0);
      act.mesh.scale.set(1, 1, 1);
      act.mesh.castShadow = L.actorShadow;
    }
    for (let i = ai; i < this.actors.length; i++) this.actors[i].mesh.visible = false;
    // ---- contact shadows ----
    const cc = light === "boil" ? "#5a3a34" : "#7a6a70";
    let fi = 0;
    for (const { q } of people) {
      if (q.low) continue;
      const pos: V3 = [q.p[0], q.p[1] + 0.03, q.p[2]];
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
      else if (head.frac > 0.02 && head.frac < 0.97) out.push(`${q.name}: head cut off by the frame edge (${Math.round(head.frac * 100)}% in shot)`);
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
        return !(Array.isArray(mat) ? false : mat.transparent || (mat as THREE.Material & { alphaTest?: number }).alphaTest > 0) && (h.object as THREE.Points).isPoints !== true;
      });
      if (hit && hit.distance < dist - r) out.push(`${name}: hidden behind something ${(dist - hit.distance).toFixed(2)} m in front of it`);
    }
    return out;
  }
}
