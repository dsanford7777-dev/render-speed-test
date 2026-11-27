// The Timothy Dexter long-form's 3D shots: the Short's four sets and cast (../dexter), re-shot for 16:9.
// Short specs are reused through R(): the shot is played on the Short's own clock (so a kick timed to a word lands at the
// same moment after the cut), and the camera's vertical field of view is narrowed so the framing keeps roughly the
// portrait shot's width. The long-form's own shots are written for 16:9 directly.
// Cameras sit on the -z side looking toward +z (world +x is screen LEFT). Nobody is shown hurt.
import { SPECS as FS, SHOTS as SSH, St3, Cam, ShotDef as FShot, V3, smooth, L3, move, secs, P, walker, add, rain, stack, fire, holdUp, statues, mourners, head, DEX_HOOK, SHOP_D, DEX_T, M1_T, M2_T, M3_T, M4_T, TBL, LAMP_K, DESK_P, BOARD, CANDLE_K, DEXSTAT, DOOR, WIFE, WR, STAT_Y, ARCH_Y, Mn } from "../dexter/story";
import { Rv, Rm, SHOP, CRATES, FIRE, BLD_Z, ARCH_Z, COLS, DEX_COL, COFFIN, HOUSE_Z, DESK, SHIP, TAVERN } from "../dexter/place";
import { ShotDef } from "./timeline";

const vfov = (v: number) => (2 * Math.atan(0.74 * Math.tan((v * Math.PI) / 360)) * 180) / Math.PI;
const wide = (c: Cam): Cam => ({ ...c, fov: vfov(c.fov) });
/** a Short spec, re-shot for 16:9 on the Short's clock */
const R = (k: string, mod?: (st: St3, s: ShotDef, f: number) => St3) => (s: ShotDef, f: number): St3 => {
  const S = SSH.find((x) => x.g === k)!, off = S.a - s.a;
  const s2: FShot = { id: s.id, g: k, a: s.a + off, b: s.b + off, k: "3d" }, st = FS[k](s2, f + off), w = { ...st, cam: wide(st.cam) };
  return mod ? mod(w, s, f) : w;
};
const tt = (s: ShotDef, f: number) => secs(f - s.a);
/** pull the camera back (k > 1) along its line of sight */
const far = (st: St3, k: number): St3 => ({ ...st, cam: { ...st.cam, pos: L3(st.cam.look, st.cam.pos, k) } });
/** aim the camera lower (subjects sit higher in frame, clear of the captions) */
const up = (st: St3, dy: number): St3 => ({ ...st, cam: { ...st.cam, look: add(st.cam.look, 0, -dy, 0) } });
const mv = (s: ShotDef, f: number, a: Partial<Cam> & { pos: V3; look: V3 }, b: Partial<Cam> & { pos: V3; look: V3 }) => move(a, b, f, s.a, s.b, smooth, 0);
const WALK = 0.22;

export const SPECS: Record<string, (s: ShotDef, f: number) => St3> = {
  // ---------------- straight from the Short ----------------
  hook: R("hook"), tropics: R("tropics"), money: R("money"), shop: R("shop", (st) => up(st, 0.7)), spell: R("spell", (st) => far(st, 1.4)), war: R("war"), buy: R("buy", (st) => far(st, 1.4)), paid: R("paid"), rich: R("rich", (st) => far(st, 1.4)),
  laugh: R("laugh"), advice: R("advice", (st) => far(st, 1.25)), worst: R("worst", (st) => far(st, 1.3)), coal: R("coal", (st) => far(st, 1.4)), load: R("load"), strike: R("strike"), sold: R("sold"), pans: R("pans"), shipped: R("shipped"),
  cook: R("cook", (st) => up(st, 0.45)), cleared: R("cleared"), mansion: R("mansion", (st) => far(st, 1.2)), lord: R("lord"), statues: R("statues", (st) => ({ ...st, people: statues((_n, i) => i >= 3 && [4, 8, 10].includes(i - 3)) })), himself: R("himself", (st) => up(far(st, 1.6), 0.2)), sign: R("sign"),
  coffin: R("coffin"), crowd: R("crowd"), wife: R("wife"), hiding: R("hiding", (st) => far(st, 1.3)), caned: R("caned"), book: R("book"), readers: R("readers"), punct: R("punct"), pepper: R("pepper"),

  // ---------------- the long-form's own ----------------
  // ...and Bibles to the West Indies: the schooner at the island wharf, crates going aboard
  shipped2: (s, f) => ({ light: "tropic", dof: 0.3, focus: Rv(SHIP[0] - 4, 1.5, SHIP[2]), pans3: true,
    people: [P("s1", WR(12.2, 22.5), "grin", 1), P("s3", WR(10.6, 24.2), "neutral", -1)],
    cam: mv(s, f, { pos: WR(5.5, 12, 3.0), look: Rv(SHIP[0] - 3, 2.5, SHIP[2]), fov: 36, roll: 0.03 }, { pos: WR(5.0, 13, 3.6), look: Rv(SHIP[0] - 2, 2.6, SHIP[2]), fov: 36, roll: -0.02 }),
    subjects: [["the schooner", Rv(SHIP[0] - 4, 2, SHIP[2]), 1.5]] }),
  // If you like weird history, subscribe (card on the right): Dexter with his bed warmer, kept to the left of frame
  foolL: (s, f) => { const p = DEX_HOOK;
    return { light: "tropic", dof: 1, focus: head(p), pans3: true, people: [P("dexter", p, "grin", 0, { hw: [holdUp(p).hand] })], pans: [holdUp(p)],
      cam: mv(s, f, { pos: add(p, -1.2, 1.35, -3.6), look: add(p, -0.95, 1.25, 0), fov: 36, roll: 0.02 }, { pos: add(p, -1.1, 1.35, -3.3), look: add(p, -0.9, 1.25, 0), fov: 36, roll: -0.02 }),
      subjects: [["Dexter", head(p), 0.2]] }; },
  // In 1769 he moved to Newburyport: the port from above the wharf, the street and the stores, people about
  portwide: (s, f) => ({ light: "port", dof: 0, focus: Rv(-10, 2, 5),
    people: [walker("t1", Rv(-6, 0, 0)[0], 0, -1.0, -0.9, tt(s, f)), walker("s2", Rv(-16, 0, 0)[0], 0, 1.6, 1.1, tt(s, f)), P("t3", Rv(-12.4, WALK, 4.4), "grin", 1), P("m4", Rv(-13.4, WALK, 4.6), "neutral", -1)],
    cam: mv(s, f, { pos: Rv(14, 7.5, 12), look: Rv(-14, 1.2, 3), fov: 36, roll: 0.02 }, { pos: Rv(13, 6.5, 10), look: Rv(-16, 1.4, 3), fov: 36, roll: -0.02 }),
    subjects: [["the street", Rv(-12, 1.0, 0), 2]] }),
  // ...full of ship owners and old money: two merchants on the board walk, a sailor passing
  money2: (s, f) => ({ light: "port", dof: 0.7, focus: Rv(TAVERN.x + 1, 1.5, 4.4),
    people: [P("m1", Rv(TAVERN.x + 0.6, WALK, 4.3), "stern", 1), P("m3", Rv(TAVERN.x + 1.5, WALK, 4.5), "grin", -1), walker("s1", Rv(TAVERN.x - 3, 0, 0)[0], 0, 1.4, 1.0, tt(s, f))],
    cam: mv(s, f, { pos: Rv(TAVERN.x + 1.2, 1.5, -2.2), look: Rv(TAVERN.x + 1.0, 1.7, 4.5), fov: 38, roll: 0.03 }, { pos: Rv(TAVERN.x + 0.9, 1.5, -1.8), look: Rv(TAVERN.x + 1.0, 1.7, 4.5), fov: 38, roll: -0.02 }),
    subjects: [["the merchants", Rv(TAVERN.x + 1, 1.6, 4.4), 0.4]] }),
  // The next year, he married Elizabeth Frothingham: the two of them before his shop
  couple: (s, f) => { const a = add(SHOP_D, 0.45, 0, 0), b = add(SHOP_D, -0.45, 0, 0.1);
    return { light: "port", dof: 0.8, focus: L3(head(a), head(b), 0.5), people: [P("dexterw", a, "grin", -1, { facing: -1 }), P("wife", b, "neutral", 1, { facing: 1 })],
      cam: mv(s, f, { pos: add(SHOP_D, 0.2, 1.3, -4.4), look: add(SHOP_D, 0, 1.5, 0.4), fov: 38, roll: -0.03 }, { pos: add(SHOP_D, 0.1, 1.35, -3.9), look: add(SHOP_D, 0, 1.5, 0.4), fov: 38, roll: 0.02 }),
      subjects: [["Dexter", head(a), 0.2], ["Elizabeth", head(b), 0.2]] }; },
  // She ran a little shop of her own: Elizabeth at the next door along, the hides behind
  wifeshop: (s, f) => { const b = Rv(SHOP[0] + 3.4, WALK, 4.5);
    return { light: "port", dof: 0.8, focus: head(b), people: [P("wife", b, "grin", 0), P("t4", Rv(SHOP[0] + 4.4, WALK, 4.2), "neutral", -1)],
      cam: mv(s, f, { pos: Rv(SHOP[0] + 3.4, 1.4, -2.8), look: Rv(SHOP[0] + 3.4, 1.7, 5), fov: 38, roll: 0.03 }, { pos: Rv(SHOP[0] + 3.3, 1.4, -2.4), look: Rv(SHOP[0] + 3.4, 1.7, 5), fov: 38, roll: -0.02 }),
      subjects: [["Elizabeth", head(b), 0.2], ["the hides", Rv(SHOP[0] + 1.75, 1.9, BLD_Z - 0.62), 0.3]] }; },
  // ...for pennies on the dollar: the stacks of notes on the table, close and low
  war2: (s, f) => ({ light: "tavern", dof: 1, focus: TBL, key: LAMP_K, cards: [...stack(add(TBL, 0.2, 0, -0.1), 10), ...stack(add(TBL, -0.25, 0, 0.15), 8), ...stack(add(TBL, 0.05, 0, 0.35), 6)],
    cam: mv(s, f, { pos: add(TBL, 0.6, 0.35, -1.6), look: add(TBL, 0, 0.0, 0), fov: 36, roll: 0.04 }, { pos: add(TBL, 0.4, 0.45, -1.4), look: add(TBL, 0, 0.0, 0), fov: 36, roll: -0.03 }),
    subjects: [["the paper money", add(TBL, 0, 0.02, 0), 0.2]] }),
  // ...more than twice the coins: the merchants laughing, from behind Dexter
  laugh2: R("laugh", (st) => far(st, 1.15)),
  // Newcastle... his ships arrived: the schooner at the Newcastle quay, grey
  ncwide: (s, f) => ({ light: "newcastle", dof: 0, focus: Rv(SHIP[0] - 4, 2, SHIP[2]), people: [P("mn1", WR(10.4, 12.2), "stern", 1), P("mn2", WR(11.8, 12.8), "stern", -1)],
    cam: mv(s, f, { pos: WR(4.5, 4.0, 2.6), look: Rv(SHIP[0] - 4, 1.8, SHIP[2]), fov: 40, roll: 0.02 }, { pos: WR(4.0, 4.8, 3.2), look: Rv(SHIP[0] - 3, 1.9, SHIP[2]), fov: 40, roll: -0.02 }),
    subjects: [["the schooner", Rv(SHIP[0] - 4, 2, SHIP[2]), 1.5], ["the strike board", Rv(11, 2.25, 10.33), 0.3]] }),
  // ...in his own book: Dexter at his desk, the page board behind him, wider
  book2: R("book", (st) => far(st, 1.15)),
  // Did it all happen like that? Dexter on the wharf, whistling innocently
  fool2: (s, f) => { const p = DEX_HOOK;
    return { light: "tropic", dof: 1, focus: head(p), pans3: true, people: [P("dexter", p, "whistle", 0, { hw: [holdUp(p).hand], headTilt: 0.08 })], pans: [holdUp(p)],
      cam: mv(s, f, { pos: add(p, 1.4, 1.4, -3.6), look: add(p, -0.2, 1.3, 0), fov: 38, roll: -0.03 }, { pos: add(p, 0.9, 1.4, -3.3), look: add(p, -0.2, 1.3, 0), fov: 38, roll: 0.02 }),
      subjects: [["Dexter", head(p), 0.2]] }; },
  // ...a grand mansion on High Street: slow crane along the front, the minarets and the gold eagle
  mansion2: (s, f) => ({ light: "mansion", dof: 0, focus: Mn(0, 8, HOUSE_Z), people: statues((_n, i) => i < 3),
    cam: mv(s, f, { pos: Mn(-15, 3.5, -15), look: Mn(0, 8, HOUSE_Z), fov: 40, roll: 0.02 }, { pos: Mn(-9, 6.5, -16), look: Mn(0, 9.5, HOUSE_Z), fov: 40, roll: -0.02 }),
    subjects: [["the mansion", Mn(0, 6, HOUSE_Z - 0.2), 3]] }),
  // ...Washington, with John Adams and Thomas Jefferson: the arch, slow push in
  arch: (s, f) => ({ light: "mansion", dof: 0.4, focus: Mn(0, ARCH_Y + 1, ARCH_Z), people: statues((n) => ["washington", "adams", "jefferson"].includes(n)),
    cam: mv(s, f, { pos: Mn(0.6, 2.6, ARCH_Z - 9.5), look: Mn(0, ARCH_Y + 0.6, ARCH_Z), fov: 34, roll: 0.02 }, { pos: Mn(0.3, 2.9, ARCH_Z - 8.0), look: Mn(0, ARCH_Y + 0.8, ARCH_Z), fov: 34, roll: -0.02 }),
    subjects: [["Washington", head(Mn(0, ARCH_Y, ARCH_Z)), 0.2]] }),
  // Around them, Napoleon, Pitt, Franklin...: along the far row of columns
  statues2: (s, f) => ({ light: "mansion", dof: 0, focus: Mn(-6, 5, 7), people: statues((_n, i) => i >= 3 && COLS[i - 3][0] < 0 && COLS[i - 3][1] > 5),
    cam: mv(s, f, { pos: Mn(1.0, 2.0, -3.4), look: Mn(-7.0, 5.0, 9.5), fov: 40, roll: -0.03 }, { pos: Mn(0.8, 2.2, -1.6), look: Mn(-7.2, 5.2, 11.5), fov: 40, roll: 0.02 }),
    subjects: [["the statues", Mn(-4.2, STAT_Y + 1, 7.5), 0.5]] }),
  // ...a fine mahogany coffin: the coffin, close and low
  coffin2: (s, f) => ({ light: "wake", dof: 1, focus: Mn(0, 1.1, COFFIN[2]),
    cam: mv(s, f, { pos: Mn(-1.6, 0.9, COFFIN[2] - 2.2), look: Mn(0, 1.05, COFFIN[2]), fov: 36, roll: 0.03 }, { pos: Mn(-1.2, 0.95, COFFIN[2] - 2.0), look: Mn(0, 1.05, COFFIN[2]), fov: 36, roll: -0.02 }),
    subjects: [["the coffin", Mn(0, 1.0, COFFIN[2] - 0.44), 0.1]] }),
  // Dexter watched from hiding: from the porch, behind a column, past him to the crowd
  peek: (s, f) => { const me = Mn(1.65, 0.8, HOUSE_Z - 2.3);
    return { light: "wake", dof: 0.6, focus: head(me), people: [P("dexter", me, "grin", -1, { headTilt: 0.15 })],
      cam: mv(s, f, { pos: Mn(3.2, 1.9, HOUSE_Z - 4.6), look: add(me, -0.3, 1.5, 0), fov: 40, roll: 0.03 }, { pos: Mn(3.0, 1.9, HOUSE_Z - 4.2), look: add(me, -0.3, 1.5, 0), fov: 40, roll: -0.02 }),
      subjects: [["Dexter", head(me), 0.2]] }; },
  // Nine years later, the Great September Gale knocked his statues down: grey, dust and leaves blowing, a statue tipping
  gale: (s, f) => { const t0 = tt(s, f), tip = Math.min(1.3, 0.25 * t0 * t0);
    const puffs = Array.from({ length: 24 }, (_, i) => { const u = ((t0 * 0.6 + i / 24) % 1); return { p: Mn(12 - 26 * u, 1 + 5 * ((i * 0.37) % 1) + 1.5 * u, 2 + 10 * ((i * 0.61) % 1)), s: 1.5 + 2 * u, c: [0.7, 0.68, 0.64] as [number, number, number], a: 0.4 * Math.sin(Math.PI * u) }; });
    // most of the columns stand empty now: only a few statues are left up
    const keep = statues((_n, i) => [3 + 6, 3 + 8, 3 + 10].includes(i)); void tip;
    return { light: "wake", dof: 0, focus: Mn(0, 4, 6), people: keep, puffs,
      cam: mv(s, f, { pos: Mn(-1.0, 2.2, -2.0), look: Mn(5.0, 4.4, 9), fov: 42, roll: 0.05 }, { pos: Mn(-1.2, 2.3, -1.4), look: Mn(5.2, 4.4, 9.5), fov: 42, roll: -0.04 }),
      subjects: [["the statues", Mn(6.3, STAT_Y + 1, 10), 0.5]] }; },
  // ...his house still stands on High Street: the house today, no statues, grey sky, the street empty
  today: (s, f) => ({ light: "wake", dof: 0, focus: Mn(0, 6, HOUSE_Z),
    cam: mv(s, f, { pos: Mn(6, 1.8, -12), look: Mn(0, 6, HOUSE_Z), fov: 38, roll: 0.02 }, { pos: Mn(3, 2.2, -12.5), look: Mn(0, 6.5, HOUSE_Z), fov: 38, roll: -0.02 }),
    subjects: [["the mansion", Mn(0, 6, HOUSE_Z - 0.2), 3]] }),
  // If you like stories like this one, subscribe (card on the right): Dexter grinning, kept to the left
  luckyL: (s, f) => { const p = DEX_HOOK;
    return { light: "tropic", dof: 1, focus: head(p), pans3: true, people: [P("dexter", p, "laugh", 0, { hw: [holdUp(p).hand] })], pans: [holdUp(p)],
      cam: mv(s, f, { pos: add(p, -1.3, 1.35, -3.4), look: add(p, -0.95, 1.25, 0), fov: 36, roll: -0.02 }, { pos: add(p, -1.2, 1.35, -3.1), look: add(p, -0.9, 1.25, 0), fov: 36, roll: 0.02 }),
      subjects: [["Dexter", head(p), 0.2]] }; },
  // the thumbnail: Dexter holding up the bed warmer, the island wharf behind
  thumb: () => { const p = DEX_HOOK; return { light: "tropic", dof: 1, focus: head(p), pans3: true, people: [P("dexter", p, "grin", 0, { hw: [holdUp(p).hand] })], pans: [holdUp(p)],
    cam: { pos: add(p, 0.9, 1.4, -3.4), look: add(p, 0.55, 1.45, 0), fov: 40, roll: 0.02 } }; },
};
void rain; void fire; void mourners; void CRATES; void FIRE; void COLS; void DEX_COL; void DESK; void DEXSTAT; void DOOR; void WIFE; void M1_T; void M2_T; void M3_T; void M4_T; void DESK_P; void BOARD; void CANDLE_K; void Rm;
/** every shot is hand-held: a slow sway on top of its move */
export const specAt = (s: ShotDef, f: number): St3 => {
  const st = SPECS[s.g](s, f), c = st.cam;
  const d = Math.hypot(c.pos[0] - c.look[0], c.pos[1] - c.look[1], c.pos[2] - c.look[2]), id = s.id, sw = 0.0026 * Math.min(d, 60);
  return { ...st, focus: st.focus ?? c.look, cam: { ...c, look: [c.look[0] + sw * Math.sin(f * 0.21 + id), c.look[1] + sw * 0.8 * Math.sin(f * 0.17 + 1.3 * id), c.look[2] + sw * Math.sin(f * 0.13 + 2.1 * id)] } };
};
const WHIP = new Set(["tropics", "shop", "war", "laugh", "coal", "strike", "pans", "cook", "mansion", "coffin", "hiding", "book", "readers", "portwide", "ncwide", "gale"]);
export const whipAt = (s: ShotDef, f: number) => (WHIP.has(s.g) ? Math.max(0, 1 - Math.abs(f - (s.a + 2)) / 4) : 0);
