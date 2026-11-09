// The long-form's 3D layer: one persistent canvas (the world is built once per render tab), posed per frame from the
// current shot's spec (shots3d.ts). Same render stack as the Shorts: InkPass -> lens blur -> bloom + tone map + grade.
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
import { GradeEffect, GRADES } from "../bridge/grade";
import { Kit } from "../bridge/build";
import { LWorld } from "./world3d";
import { SPECS, Light3 } from "./shots3d";
import { ShotDef } from "./timeline";

const GR: Record<Light3, typeof GRADES.day> = { day: GRADES.day, golden: GRADES.golden, winter: GRADES.day };
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
  const [handle] = useState(() => delayRender("molasseslong kit"));
  useEffect(() => { loadKit().then((k) => { setKit(k); continueRender(handle); }); }, [handle]);
  return kit;
};

export const has3D = (s: ShotDef | null | undefined) => !!s && s.k === "3d" && !!SPECS[s.g];

const Inner: React.FC<{ kit: Kit; shot: ShotDef | null; f: number }> = ({ kit, shot, f }) => {
  const { camera, scene } = useThree();
  const world = useMemo(() => new LWorld(kit), [kit]);
  const fx = useMemo(() => ({
    ink: new InkPass(scene, camera as THREE.PerspectiveCamera),
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
    const st = SPECS[shot.g](shot, f);
    world.root.visible = true;
    const target = world.update(shot.g, st, f, cam, scene);
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

export const View3D: React.FC<{ kit: Kit; shot: ShotDef | null; f: number; visible: boolean }> = ({ kit, shot, f, visible }) => (
  <div style={{ position: "absolute", inset: 0, opacity: visible ? 1 : 0 }}>
    <ThreeCanvas width={1920} height={1080} shadows gl={{ antialias: false, stencil: false, powerPreference: "high-performance", toneMappingExposure: 1.0 }}
      camera={{ fov: 40, near: 0.05, far: 1500 }}>
      <Inner kit={kit} shot={visible ? shot : null} f={f} />
    </ThreeCanvas>
  </div>
);
