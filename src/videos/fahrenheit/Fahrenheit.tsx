// "The Salt Bucket Behind America's Thermometer" (Paradox Town #1). Same render stack as the bridge short:
// InkPass -> lens blur -> bloom + neutral tone map + grade, cards for the cast; captions as a React overlay on top.
// Narration audio is muxed in later (public/fahrenheit/voice.mp3 when it exists, see Root.tsx).
import React, { useEffect, useMemo, useState } from "react";
import * as THREE from "three";
import { AbsoluteFill, Audio, continueRender, delayRender, getInputProps, staticFile, useCurrentFrame } from "remotion";
import { ThreeCanvas } from "@remotion/three";
import { useThree } from "@react-three/fiber";
import { EffectComposer } from "@react-three/postprocessing";
import { BlendFunction, BloomEffect, ToneMappingEffect, ToneMappingMode } from "postprocessing";
import { loadKit } from "../bridge/world";
import { InkPass, noInkFallback } from "../bridge/ink";
import { LensBlur } from "../bridge/lensblur";
import { GradeEffect, GRADES, GradeParams } from "../bridge/grade";
import { Kit } from "../bridge/build";
import { FWorld } from "./world";
import { TOTAL, SHOTS, layersAt, Light } from "./timeline";
import { DOF } from "./story";
import { Captions } from "./Captions";

export const FAHRENHEIT_FRAMES = TOTAL;

/** night grade: cool blue mids and shadows, gentle S, a heavier vignette (the candle stays warm through the bloom) */
const GRADE_NIGHT: GradeParams = {
  ky: [0, 0.085, 0.24, 0.52, 0.79, 0.93, 1],
  sat: [1.0, 1.08, 1.1],
  tintS: [0.035, -0.012], tintM: [0.02, -0.006], tintH: [-0.01, 0.006],
  vig: [0.26, 0.38],
};
const GR: Record<Light, GradeParams> = { day: GRADES.day, golden: GRADES.golden, night: GRADE_NIGHT };

const makeBloom = () => {
  const b = new BloomEffect({ blendFunction: BlendFunction.ADD, intensity: 0.6, luminanceThreshold: 1.0, luminanceSmoothing: 0.2, mipmapBlur: true, levels: 6, radius: 0.6 });
  const mip = b.mipmapBlurPass, setSize = mip.setSize.bind(mip);
  mip.setSize = (w: number, h: number) => setSize(Math.round((1920 * w) / Math.max(h, 1)), 1920);
  return b;
};
const fwd = new THREE.Vector3(), fpt = new THREE.Vector3();

const useKit = () => {
  const [kit, setKit] = useState<Kit | null>(null);
  const [handle] = useState(() => delayRender("fahrenheit kit"));
  useEffect(() => { loadKit().then((k) => { setKit(k); continueRender(handle); }); }, [handle]);
  return kit;
};

const QA = !!(getInputProps() as { qa?: boolean }).qa;
const Inner: React.FC<{ id: number; kit: Kit; alpha: number }> = ({ id, kit, alpha }) => {
  const f = useCurrentFrame();
  const { camera, scene } = useThree();
  const world = useMemo(() => new FWorld(kit), [kit]);
  const target = useMemo(() => new THREE.Vector3(), []);
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
  target.copy(world.update(id, f, cam, scene));
  noInkFallback(world.root);
  // framing check mode (scripts/qa.mjs): report what's wrong with this frame; cross-fades are judged on the shot underneath
  if (QA && alpha > 0.99) console.log(`QA|${f}|${id}|${JSON.stringify(world.qa(id, f, cam))}`);
  cam.getWorldDirection(fwd);
  fx.lens.focus = Math.max(0.3, fpt.copy(target).sub(cam.position).dot(fwd));
  fx.lens.cInf = DOF[id] ?? 0;
  const light = SHOTS[id - 1].light, tag = fx.grade as unknown as { _l?: string };
  if (tag._l !== light) { fx.grade.set(GR[light]); tag._l = light; }
  return (<><primitive object={world.root} dispose={null} />{post}</>);
};

const ShotView: React.FC<{ id: number; kit: Kit; alpha: number }> = ({ id, kit, alpha }) => (
  <AbsoluteFill style={{ opacity: alpha }}>
    <ThreeCanvas width={1080} height={1920} shadows gl={{ antialias: false, stencil: false, powerPreference: "high-performance", toneMappingExposure: 1.0 }}
      camera={{ fov: 40, near: 0.05, far: 1500 }}>
      <Inner id={id} kit={kit} alpha={alpha} />
    </ThreeCanvas>
  </AbsoluteFill>
);

export const FahrenheitShort: React.FC = () => {
  const f = useCurrentFrame();
  const kit = useKit();
  const voice = (getInputProps() as { voice?: boolean }).voice;
  if (!kit) return null;
  return (
    <AbsoluteFill style={{ background: "#cfe3f2" }}>
      {layersAt(f).map((l, i) => <ShotView key={i ? "over" : "base"} id={l.id} kit={kit} alpha={l.alpha} />)}
      <Captions />
      {voice ? <Audio src={staticFile("fahrenheit/voice.mp3")} /> : null}
    </AbsoluteFill>
  );
};
