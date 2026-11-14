// The Titanic key Short's own props, added to the Titanic world (../titanicif/world3d.ts): Blair's iron key with its
// brass oval tag ("CROWS NEST TELEPHONE KEY" on one face, "R.M.S. TITANIC" on the other), a pair of binoculars, the
// crow's nest telephone box and locker, a cupboard in the officer's cabin (door swings), and the auction table's
// cushion and gavel. Everything is posed per frame from the shot spec (KeyState).
import * as THREE from "three";
import { lam } from "../bridge/build";
import { ctex } from "../bridge/paint";
import type { V3 } from "../titanicif/story3d";

/** the key: p = where the ring through its bow is; yaw/pitch/roll in radians; s = size (1 = the hero size, ~0.32 m long) */
export type KeyPose = { p: V3; yaw?: number; pitch?: number; roll?: number; s?: number; /** tag swing (radians) */ swing?: number };
export type KeyState = {
  key?: KeyPose | null;
  bino?: { p: V3; yaw?: number; pitch?: number; s?: number } | null;
  /** the officer's cupboard: 0 = shut, 1 = wide open; lock = the key turned in it */
  cupboard?: { door: number } | null;
  /** the crow's nest's telephone box and locker */
  nestBox?: boolean;
  /** auction table: cushion (and the key on it), gavel lifted 0..1 */
  auction?: { gavel: number } | null;
};

const M = (key: string, col: string, extra: THREE.MeshLambertMaterialParameters = {}) => lam(key, () => ({ color: col, ...extra }));
const tagTex = (front: boolean) => ctex(front ? "tkTagFront" : "tkTagBack", 512, 320, (g) => {
  g.fillStyle = "#e3b852"; g.beginPath(); g.ellipse(256, 160, 250, 154, 0, 0, Math.PI * 2); g.fill();
  g.strokeStyle = "#9a7428"; g.lineWidth = 14; g.beginPath(); g.ellipse(256, 160, 232, 138, 0, 0, Math.PI * 2); g.stroke();
  g.fillStyle = "#3a2a14"; g.beginPath(); g.arc(256, 40, 16, 0, Math.PI * 2); g.fill();
  g.fillStyle = "#2a1c0c"; g.textAlign = "center"; g.textBaseline = "middle";
  if (front) { g.font = "900 62px Arial"; g.fillText("CROWS NEST", 256, 120); g.fillText("TELEPHONE", 256, 186); g.font = "900 48px Arial"; g.fillText("KEY", 256, 244); }
  else { g.font = "900 58px Arial"; g.fillText("R.M.S.", 256, 130); g.fillText("TITANIC", 256, 200); }
});
const phoneTex = () => ctex("tkPhoneBox", 256, 256, (g) => {
  g.fillStyle = "#6b4a2f"; g.fillRect(0, 0, 256, 256); g.strokeStyle = "#3a2616"; g.lineWidth = 10; g.strokeRect(14, 14, 228, 228);
  g.fillStyle = "#e8c45a"; g.beginPath(); g.arc(128, 150, 16, 0, Math.PI * 2); g.fill(); g.fillStyle = "#1d1b22"; g.fillRect(124, 150, 8, 26);
  g.fillStyle = "#f1ede2"; g.font = "900 34px Arial"; g.textAlign = "center"; g.fillText("TELEPHONE", 128, 70);
});

export class KeyProps {
  root = new THREE.Group();
  private key = new THREE.Group(); private tag = new THREE.Group();
  private bino = new THREE.Group();
  private cup = new THREE.Group(); private cupDoor = new THREE.Group();
  private nest = new THREE.Group();
  private auction = new THREE.Group(); private gavel = new THREE.Group();

  /** nest: the crow's nest floor centre; cupAt: the cupboard's foot (against a wall facing +z... see below); table: the auction cushion's spot */
  constructor(parent: THREE.Object3D, nest: V3, cupAt: V3, table: V3) {
    parent.add(this.root);
    const iron = M("tkIron", "#55555f"), brass = M("tkBrass", "#e3b852"), dark = M("ttDark", "#1d1b22"), wood = M("tkWood", "#7a5236"), red = M("tkVelvet", "#a3243a");
    // ---- the key (bow ring at the origin, shaft along +x) ----
    const bow = new THREE.Mesh(new THREE.TorusGeometry(0.045, 0.014, 10, 28), iron);
    const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.21, 10).rotateZ(Math.PI / 2), iron); shaft.position.x = 0.15;
    const collar = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.018, 0.016, 10).rotateZ(Math.PI / 2), iron); collar.position.x = 0.065;
    const bit = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.05, 0.012), iron); bit.position.set(0.235, -0.03, 0);
    const bit2 = new THREE.Mesh(new THREE.BoxGeometry(0.012, 0.022, 0.014), iron); bit2.position.set(0.218, -0.05, 0);
    this.key.add(bow, shaft, collar, bit, bit2);
    // the split ring through the bow, and the tag hanging off it
    const ring = new THREE.Mesh(new THREE.TorusGeometry(0.024, 0.005, 8, 20), iron); ring.rotation.y = Math.PI / 2; ring.position.x = -0.045;
    this.key.add(ring);
    const tf = new THREE.Mesh(new THREE.PlaneGeometry(0.17, 0.106), new THREE.MeshLambertMaterial({ map: tagTex(true), transparent: true, alphaTest: 0.5 }));
    const tb = new THREE.Mesh(new THREE.PlaneGeometry(0.17, 0.106), new THREE.MeshLambertMaterial({ map: tagTex(false), transparent: true, alphaTest: 0.5 }));
    tf.position.set(0, -0.053, 0.002); tb.position.set(0, -0.053, -0.002); tb.rotation.y = Math.PI;
    const rim = new THREE.Mesh(new THREE.TorusGeometry(1, 0.025, 6, 40), brass); rim.scale.set(0.085, 0.053, 0.085); rim.position.set(0, -0.053, 0);
    this.tag.add(tf, tb, rim); this.tag.position.set(-0.045, -0.02, 0); this.key.add(this.tag);
    this.key.scale.setScalar(1.35);
    this.root.add(this.key);
    // ---- binoculars (centre at the origin, lenses toward -z) ----
    for (const sx of [-1, 1]) {
      const tube = new THREE.Mesh(new THREE.CylinderGeometry(0.034, 0.03, 0.13, 16).rotateX(Math.PI / 2), dark); tube.position.x = sx * 0.042;
      const lens = new THREE.Mesh(new THREE.CylinderGeometry(0.036, 0.036, 0.012, 16).rotateX(Math.PI / 2), brass); lens.position.set(sx * 0.042, 0, -0.068);
      const eye = new THREE.Mesh(new THREE.CylinderGeometry(0.024, 0.024, 0.03, 12).rotateX(Math.PI / 2), dark); eye.position.set(sx * 0.042, 0, 0.078);
      this.bino.add(tube, lens, eye);
    }
    const hinge = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.022, 0.06), brass); this.bino.add(hinge);
    this.bino.scale.setScalar(1.4);
    this.root.add(this.bino);
    // ---- the cupboard in Blair's cabin (foot at cupAt, its doors face +z... it stands against the room's -z side) ----
    const cw = 0.9, ch = 1.25, cd = 0.42;
    const body = new THREE.Group();
    const side = (x: number) => { const m = new THREE.Mesh(new THREE.BoxGeometry(0.04, ch, cd), wood); m.position.set(x, ch / 2, 0); return m; };
    const top = new THREE.Mesh(new THREE.BoxGeometry(cw + 0.06, 0.05, cd + 0.04), wood); top.position.y = ch;
    const bot = new THREE.Mesh(new THREE.BoxGeometry(cw, 0.05, cd), wood); bot.position.y = 0.02;
    const shelf = new THREE.Mesh(new THREE.BoxGeometry(cw, 0.03, cd - 0.02), wood); shelf.position.y = 0.78;
    const back = new THREE.Mesh(new THREE.BoxGeometry(cw, ch, 0.03), M("tkWoodDark", "#4a3020")); back.position.set(0, ch / 2, -cd / 2);
    body.add(side(-cw / 2), side(cw / 2), top, bot, shelf, back);
    const leaf = new THREE.Mesh(new THREE.BoxGeometry(cw, ch - 0.04, 0.035), wood); leaf.position.set(cw / 2, (ch - 0.04) / 2 + 0.02, 0);
    const plate = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.11, 0.01), brass); plate.position.set(cw - 0.08, ch * 0.55, 0.022);
    const hole = new THREE.Mesh(new THREE.BoxGeometry(0.012, 0.035, 0.012), dark); hole.position.set(cw - 0.08, ch * 0.55, 0.027);
    this.cupDoor.add(leaf, plate, hole); this.cupDoor.position.set(-cw / 2, 0, cd / 2 + 0.02);
    this.cup.add(body, this.cupDoor); this.cup.position.set(...cupAt); this.cup.rotation.y = Math.PI;
    this.cup.traverse((o) => { o.castShadow = true; o.receiveShadow = true; });
    this.root.add(this.cup);
    // ---- the crow's nest: a telephone box on the rim's aft side and a small locker under it ----
    const pb = new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.42, 0.18), [wood, wood, wood, wood, new THREE.MeshLambertMaterial({ map: phoneTex() }), wood]);
    pb.position.set(nest[0] - 0.72, nest[1] + 1.36, nest[2]); pb.rotation.y = Math.PI / 2;
    const hs = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.26, 8), dark); hs.position.set(nest[0] - 0.6, nest[1] + 1.36, nest[2] + 0.22);
    const lk = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.34, 0.26), wood); lk.position.set(nest[0] - 0.7, nest[1] + 0.55, nest[2]); lk.rotation.y = Math.PI / 2;
    this.nest.add(pb, hs, lk); this.root.add(this.nest);
    // ---- the auction: a red cushion and a gavel on the table ----
    const cush = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.07, 0.38), red); cush.position.set(table[0], table[1] + 0.035, table[2]);
    const head = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.18, 14).rotateZ(Math.PI / 2), wood);
    const hand = new THREE.Mesh(new THREE.CylinderGeometry(0.016, 0.016, 0.3, 8).rotateX(Math.PI / 2), wood); hand.position.z = 0.16;
    this.gavel.add(head, hand); this.gavel.position.set(table[0] + 0.75, table[1] + 0.05, table[2] - 0.05);
    const block = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.09, 0.04, 16), wood); block.position.set(table[0] + 0.75, table[1] + 0.02, table[2] - 0.05);
    this.auction.add(cush, this.gavel, block); this.auction.traverse((o) => { o.castShadow = true; o.receiveShadow = true; });
    this.root.add(this.auction);
    this.key.traverse((o) => { o.castShadow = true; });
    this.bino.traverse((o) => { o.castShadow = true; });
  }

  update(st: KeyState) {
    const k = st.key;
    this.key.visible = !!k;
    if (k) {
      this.key.position.set(...k.p); this.key.rotation.set(k.pitch ?? 0, k.yaw ?? 0, k.roll ?? 0, "YXZ"); this.key.scale.setScalar(1.35 * (k.s ?? 1));
      this.tag.rotation.set(0, 0, k.swing ?? 0);
    }
    const b = st.bino;
    this.bino.visible = !!b;
    if (b) { this.bino.position.set(...b.p); this.bino.rotation.set(b.pitch ?? 0, b.yaw ?? 0, 0, "YXZ"); this.bino.scale.setScalar(1.4 * (b.s ?? 1)); }
    this.cup.visible = !!st.cupboard;
    if (st.cupboard) this.cupDoor.rotation.y = -1.9 * st.cupboard.door;
    this.nest.visible = !!st.nestBox;
    this.auction.visible = !!st.auction;
    if (st.auction) { const g = st.auction.gavel; this.gavel.position.y = this.gavel.userData.y0 ?? (this.gavel.userData.y0 = this.gavel.position.y); this.gavel.position.y = (this.gavel.userData.y0 as number) + 0.25 * g; this.gavel.rotation.x = -0.9 * g; }
  }
}
