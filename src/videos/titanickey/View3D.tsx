// The Titanic key Short's 3D layer (forked from the Titanic long-form's, 9:16). The world is the long-form's TWorld plus
// this Short's props (props.ts).
// Original notes: the Titanic "what if" long-form's 3D layer: one persistent canvas (the world is built once per render tab), posed per frame from the
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
import { TWorld, addCast } from "../titanicif/world3d";
import { ROOM_O, NEST } from "../titanicif/story3d";
import { SPECS, specAt, whipAt, ShotDef } from "./story";
import { KeyProps } from "./props";
import { CAST } from "./cast";

/** night grade (as the Fahrenheit short's): cool blue mids and shadows, gentle S, a heavier vignette; lit windows stay warm through the bloom */
const GRADE_NIGHT: GradeParams = { ky: [0, 0.085, 0.24, 0.52, 0.79, 0.93, 1], sat: [1.0, 1.08, 1.1], tintS: [0.035, -0.012], tintM: [0.02, -0.006], tintH: [-0.01, 0.006], vig: [0.26, 0.38] };
const GR: Record<"day" | "golden" | "night", GradeParams> = { day: GRADES.day, golden: GRADES.golden, night: GRADE_NIGHT };
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
  const [handle] = useState(() => delayRender("titanickey kit"));
  useEffect(() => { loadKit().then((k) => { setKit(k); continueRender(handle); }); }, [handle]);
  return kit;
};

export const has3D = (s: ShotDef | null | undefined) => !!s && s.k === "3d" && !!SPECS[s.g];

const Inner: React.FC<{ kit: Kit; shot: ShotDef | null; f: number }> = ({ kit, shot, f }) => {
  const { camera, scene } = useThree();
  const world = useMemo(() => { CAST.forEach(([k, o, seed]) => addCast(k, o, seed)); return new TWorld(kit); }, [kit]);
  const props = useMemo(() => new KeyProps(world.root, NEST, [ROOM_O[0] - 3.6, ROOM_O[1], ROOM_O[2] + 3.22], [ROOM_O[0] + 0.5, ROOM_O[1] + 0.8, ROOM_O[2] + 0.6]), [world]);
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
    const st = specAt(shot, f);
    world.root.visible = true;
    props.update(st);
    const target = world.update(shot.id, st, f, cam, scene, (ff) => SPECS[shot.g](shot, ff).cam, shot.a, shot.b);
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

export const View3D: React.FC<{ kit: Kit; shot: ShotDef | null; f: number; visible: boolean }> = ({ kit, shot, f, visible }) => {
  const wipe = visible && shot && has3D(shot) ? SPECS[shot.g](shot, f).wipe : undefined;
  const whip = visible && shot && has3D(shot) ? whipAt(shot, f) : 0;
  return (
  <div style={{ position: "absolute", inset: 0, opacity: visible ? 1 : 0, filter: whip > 0.01 ? "url(#tkwhip)" : undefined }}>
    <svg width="0" height="0" style={{ position: "absolute" }}><filter id="tkwhip" x="-12%" y="0%" width="124%" height="100%"><feGaussianBlur stdDeviation={`${(whip * 46).toFixed(1)} 0`} /></filter></svg>
    <ThreeCanvas width={1080} height={1920} shadows gl={{ antialias: false, stencil: false, powerPreference: "high-performance", toneMappingExposure: 1.0 }}
      camera={{ fov: 40, near: 0.05, far: 4000 }}>
      <Inner kit={kit} shot={visible ? shot : null} f={f} />
    </ThreeCanvas>
    {wipe && wipe.a > 0 ? <div style={{ position: "absolute", inset: 0, background: wipe.color, opacity: wipe.a }} /> : null}
  </div>
  );
};
