// Extra 3D props for the long-form: the black hog the script describes, the 2022 bronze statue (pig + potato on a
// plinth), and the company's wooden dock where Pickett landed. Same house look as ../pigwar/props.
import * as THREE from "three";
import { lam } from "../bridge/build";

const shadowAll = <T extends THREE.Object3D>(g: T): T => { g.traverse((o) => { o.castShadow = true; o.receiveShadow = true; }); return g; };

/** the pig, in any coat: snout toward -z, ~0.75 m tall. head: a child group to bob */
export const hog = (key: string, coat: string, snoutCol: string, eyeCol = "#ffffff", potato = false) => {
  const g = new THREE.Group(), skin = lam(`${key}Coat`, () => ({ color: coat })), dark = lam(`${key}Snout`, () => ({ color: snoutCol }));
  const body = new THREE.Mesh(new THREE.SphereGeometry(0.42, 28, 18), skin); body.scale.set(0.92, 0.82, 1.25); body.position.set(0, 0.5, 0.12);
  const head = new THREE.Group(); head.position.set(0, 0.62, -0.42);
  const skull = new THREE.Mesh(new THREE.SphereGeometry(0.27, 24, 16), skin); skull.scale.set(1.05, 0.95, 0.95);
  const snout = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.13, 0.12, 20).rotateX(Math.PI / 2), dark); snout.position.set(0, -0.05, -0.27);
  head.add(skull, snout);
  for (const sx of [-1, 1]) {
    const eye = new THREE.Mesh(new THREE.SphereGeometry(0.06, 12, 10), lam(`${key}Eye`, () => ({ color: eyeCol }))); eye.position.set(sx * 0.11, 0.08, -0.21);
    const pup = new THREE.Mesh(new THREE.SphereGeometry(0.033, 10, 8), lam(`${key}Pupil`, () => ({ color: "#241726" }))); pup.position.set(sx * 0.11, 0.09, -0.265);
    const ear = new THREE.Mesh(new THREE.ConeGeometry(0.09, 0.2, 4), skin); ear.position.set(sx * 0.17, 0.25, -0.02); ear.rotation.set(-0.5, 0, sx * -0.45);
    const nos = new THREE.Mesh(new THREE.SphereGeometry(0.025, 8, 6), lam(`${key}Nos`, () => ({ color: "#3a1a22" }))); nos.position.set(sx * 0.045, -0.05, -0.335);
    head.add(eye, pup, ear, nos);
    for (const z of [-0.22, 0.42]) {
      const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.065, 0.3, 10), skin); leg.position.set(sx * 0.2, 0.15, z);
      g.add(leg);
    }
  }
  if (potato) { const p = new THREE.Mesh(new THREE.SphereGeometry(0.09, 12, 10), lam(`${key}Potato`, () => ({ color: "#8a6a3a" }))); p.scale.set(1.5, 0.9, 1); p.position.set(0, -0.06, -0.36); head.add(p); }
  const tail = new THREE.Mesh(new THREE.TorusGeometry(0.06, 0.018, 6, 16, Math.PI * 1.6), skin); tail.position.set(0, 0.68, 0.66); tail.rotation.y = Math.PI / 2;
  g.add(body, head, tail);
  return { g: shadowAll(g), head };
};

/** the 2022 statue: a bronze pig with a potato in its mouth on a stone plinth (pig at plinth top) */
export const statue = () => {
  const root = new THREE.Group();
  const plinth = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.7, 1.9), lam("plinthStone", () => ({ color: "#b8b2a6" }))); plinth.position.y = 0.35;
  const cap = new THREE.Mesh(new THREE.BoxGeometry(1.62, 0.08, 2.02), lam("plinthCap", () => ({ color: "#cfc9bd" }))); cap.position.y = 0.74;
  const h = hog("bronze", "#9a6a34", "#7a4e22", "#9a6a34", true); h.g.position.y = 0.78; h.g.scale.setScalar(1.15);
  root.add(plinth, cap, h.g);
  return { g: shadowAll(root), head: h.head };
};

/** a plank dock reaching out over the water, along +z (shore end at z = 0) */
export const dock = (len = 9, w = 2.4) => {
  const g = new THREE.Group(), wood = lam("dockWood", () => ({ color: "#8a6440" })), post = lam("dockPost", () => ({ color: "#5e4430" }));
  for (let i = 0; i < Math.round(len / 0.3); i++) { const p = new THREE.Mesh(new THREE.BoxGeometry(w, 0.08, 0.27), wood); p.position.set(0, 0.04, 0.15 + i * 0.3); g.add(p); }
  for (let z = 0.5; z < len; z += 2.2) for (const sx of [-1, 1]) { const p = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 6.6, 8), post); p.position.set(sx * (w / 2 - 0.05), -3.3, z); g.add(p); }
  return shadowAll(g);
};
