// The Longyearbyen long-form's 3D layer (the Frozen Short's world, re-shot for 16:9): one persistent canvas (the world is built once per render tab), posed per frame from the
// current shot's spec (story3d.ts). Same render stack as the Shorts: InkPass -> lens blur -> bloom + tone map + grade.
// Hidden (and the world switched off) while a non-3D shot is on screen.
import React, { useEffect, useMemo, useState } from "react";
import * as THREE from "three";
import { continueRender, delayRender, getInputProps } from "remotion";
import { ThreeCanvas } from "@remotion/three";
import { useThree } from "@react-three/fiber";
import { EffectComposer } from "@react-three/postprocessing";
import { BlendFunction, BloomEffect, ToneMappingEffect, ToneMappingMode } from "postprocessing";
import { loadKit } from "../bridge/world";
import { InkPass, noInkFallback } from "../bridge/ink";
import { LensBlur } from "../bridge/lensblur";
import { GradeEffect, GRADES, GradeParams } from "../bridge/grade";
import { Kit } from "../bridge/build";
import { SWorld } from "../frozen/world";
import { SPECS, specAt, whipAt } from "./story3d";
import { ShotDef } from "./timeline";

const sat = (k: number) => GRADES.day.sat.map((x) => x * k) as [number, number, number];
const GR: Record<"night" | "grey" | "twilight" | "quay" | "ward" | "cut" | "alaska" | "lab", GradeParams> = { night: { ...GRADES.day, sat: sat(0.85), vig: [0.42, 0.3] }, grey: { ...GRADES.day, sat: sat(0.85), vig: [0.3, 0.36] }, twilight: { ...GRADES.day, sat: sat(0.9), vig: [0.36, 0.32] }, quay: { ...GRADES.day, sat: sat(0.85), vig: [0.34, 0.34] }, ward: { ...GRADES.day, sat: sat(0.95), vig: [0.44, 0.26] }, cut: { ...GRADES.day, sat: sat(0.95), vig: [0.42, 0.28] }, alaska: { ...GRADES.day, sat: sat(0.85), vig: [0.28, 0.38] }, lab: { ...GRADES.day, sat: sat(0.9), vig: [0.32, 0.34] } };
const QA = !!(getInputProps() as { qa?: boolean }).qa;

const makeBloom = () => {
  const b = new BloomEffect({ blendFunction: BlendFunction.ADD, intensity: 0.6, luminanceThreshold: 1.0, luminanceSmoothing: 0.2, mipmapBlur: true, levels: 6, radius: 0.6 });
  const mip = b.mipmapBlurPass, setSize = mip.setSize.bind(mip);
  mip.setSize = (w: number, h: number) => setSize(Math.round((1080 * w) / Math.max(h, 1)), 1080);
  return b;
};
const fwd = new THREE.Vector3(), fpt = new THREE.Vector3();

export const useKit = () => {
  const [kit, setKit] = useState<Kit | null>(null);
  const [handle] = useState(() => delayRender("frozenlong kit"));
  useEffect(() => { loadKit().then((k) => { setKit(k); continueRender(handle); }); }, [handle]);
  return kit;
};

export const has3D = (s: ShotDef | null | undefined) => !!s && s.k === "3d" && !!SPECS[s.g];

const Inner: React.FC<{ kit: Kit; shot: ShotDef | null; f: number }> = ({ kit, shot, f }) => {
  const { camera, scene } = useThree();
  const world = useMemo(() => new SWorld(kit), [kit]);
  const fx = useMemo(() => ({
    ink: Object.assign(new InkPass(scene, camera as THREE.PerspectiveCamera), { afterInk: true }),
    lens: new LensBlur({ maxCoC: 24, nearScale: 1.2 }),
    bloom: makeBloom(),
    tone: new ToneMappingEffect({ mode: ToneMappingMode.NEUTRAL }),
    grade: new GradeEffect(GRADES.day, 1),
  }), [camera, scene]);
  useEffect(() => () => fx.ink.dispose(), [fx]);
  const post = useMemo(() => (
    <EffectComposer multisampling={4}>
      <primitive object={fx.ink} dispose={null} />
      <primitive object={fx.lens.pre} dispose={null} />
      <primitive object={fx.lens.main} dispose={null} />
      <primitive object={fx.bloom} dispose={null} />
      <primitive object={fx.tone} dispose={null} />
      <primitive object={fx.grade} dispose={null} />
    </EffectComposer>
  ), [fx]);
  const cam = camera as THREE.PerspectiveCamera;
  if (shot && has3D(shot)) {
    const st = specAt(shot, f);
    world.root.visible = true;
    const target = world.update(shot.id, st, f, cam, scene);
    noInkFallback(world.root);
    if (QA) console.log(`QA|${f}|${shot.id}|${JSON.stringify(world.qa(st, cam))}`);
    cam.getWorldDirection(fwd);
    fx.lens.focus = Math.max(0.3, fpt.copy(target).sub(cam.position).dot(fwd));
    fx.lens.cInf = st.dof ?? 0;
    const tag = fx.grade as unknown as { _l?: string };
    if (tag._l !== st.light) { fx.grade.set(GR[st.light]); tag._l = st.light; }
  } else world.root.visible = false;
  return (<><primitive object={world.root} dispose={null} />{post}</>);
};

export const View3D: React.FC<{ kit: Kit; shot: ShotDef | null; f: number; visible: boolean; w?: number; h?: number }> = ({ kit, shot, f, visible, w = 1920, h = 1080 }) => {
  const whip = visible && shot && has3D(shot) ? whipAt(shot, f) : 0;
  return (
  <div style={{ position: "absolute", inset: 0, opacity: visible ? 1 : 0, filter: whip > 0.01 ? "url(#flwhip)" : undefined }}>
    <svg width="0" height="0" style={{ position: "absolute" }}><filter id="flwhip" x="-12%" y="0%" width="124%" height="100%"><feGaussianBlur stdDeviation={`${(whip * 46).toFixed(1)} 0`} /></filter></svg>
    <ThreeCanvas width={w} height={h} shadows gl={{ antialias: false, stencil: false, powerPreference: "high-performance", toneMappingExposure: 1.0 }}
      camera={{ fov: 40, near: 0.05, far: 4000 }}>
      <Inner kit={kit} shot={visible ? shot : null} f={f} />
    </ThreeCanvas>
  </div>
  );
};
