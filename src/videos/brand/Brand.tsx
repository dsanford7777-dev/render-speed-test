// Channel art rendered from the shorts' own world: the YouTube banner (2560 x 1440; only the middle 2560 x 423 strip
// shows on desktop and the middle 1546 x 423 everywhere) and the profile picture (800 x 800, shown as a circle).
// Golden-hour harbour from the shorts' quay: Fahrenheit and the helper either side of the title, the ship on the river.
import React from "react";
import { AbsoluteFill } from "remotion";
import { loadFont } from "@remotion/google-fonts/Montserrat";
import { ShotView, useKit } from "../fahrenheit/Fahrenheit";
import { Brand } from "../fahrenheit/world";
import { D0 } from "../fahrenheit/story";
import { SHOTS } from "../fahrenheit/timeline";

const { fontFamily } = loadFont("normal", { weights: ["900", "800"], subsets: ["latin"] });
const HARBOR = 10, F = SHOTS[HARBOR - 1].a; // golden light; the ship still out of frame up river
const QUAY_Z = -33.5;

const BANNER: Brand = {
  cam: { pos: [0, D0 + 0.92, -43], look: [0, D0 + 0.92, -10], fov: 40, roll: 0 },
  people: [
    { who: "fahr", p: [3.6, D0, -31], expr: "smile", look: -1 },
    { who: "help", p: [-3.6, D0, -31], expr: "grin", look: 1 },
  ],
};
const AVATAR: Brand = {
  cam: { pos: [0, D0 + 1.52, QUAY_Z - 1.85], look: [0, D0 + 1.47, QUAY_Z], fov: 40, roll: 0 },
  people: [{ who: "help", p: [0, D0, QUAY_Z], expr: "grin" }],
};

const ink = (px: number) => ({ WebkitTextStroke: `${px}px #241726`, paintOrder: "stroke fill" as const, textShadow: `0 ${px * 0.6}px 0 #241726` });

export const BannerArt: React.FC = () => {
  const kit = useKit();
  if (!kit) return null;
  return (
    <AbsoluteFill>
      <ShotView id={HARBOR} kit={kit} alpha={1} brand={BANNER} frame={F} width={2560} height={1440} />
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", fontFamily }}>
        <div style={{ marginTop: -30, fontSize: 100, fontWeight: 900, color: "#ffd84d", letterSpacing: 2, ...ink(16) }}>PARADOX TOWN</div>
        <div style={{ marginTop: 6, fontSize: 34, fontWeight: 800, color: "#ffffff", ...ink(8) }}>Weird history, explained in 60 seconds</div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

export const AvatarArt: React.FC = () => {
  const kit = useKit();
  if (!kit) return null;
  return <ShotView id={HARBOR} kit={kit} alpha={1} brand={AVATAR} frame={F} width={800} height={800} />;
};
