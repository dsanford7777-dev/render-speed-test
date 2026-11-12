# Long-form #4 (Titanic what-if) audio mix: voice + ducked music beds + sound effects anchored to the shot timeline.
# Output: mix.wav (48 kHz stereo) the length of the full video (voice + 8 s end card).
import subprocess, numpy as np, json, sys
SR = 48000
A = "/home/claude/render-speed-test/public/molasseslong/audio/"  # same YouTube Audio Library files as long-form #1 (see CREDITS.md there)
VOICE = "/home/claude/render-speed-test/public/titanicif/voice.mp3"
import re, math
_ts = open("/home/claude/render-speed-test/src/videos/titanicif/timeline.ts").read()
ST = json.loads(re.search(r"export const SEG_TIMES: \[number, number\]\[\] = (\[.*?\]);", _ts, re.S).group(1))
WD = json.loads(re.search(r"export const WORDS: Word\[\] \| null = (\[.*?\]);\n", _ts, re.S).group(1))
VOICE_END = math.ceil((ST[-1][1] + 0.6) * 30)
TOTAL = (VOICE_END + 8 * 30) / 30
def norm(w): return re.sub(r"\.+$", "", re.sub(r"[^\w.]", "", w.lower()))
def W(seg, w):
    """onset (s) of a word in a segment (first match, as the video's wordAt)"""
    ws = [x for x in WD if x["seg"] == seg]; k = norm(w)
    hit = next((x for x in ws if norm(x["w"]) == k), None) or next((x for x in ws if norm(x["w"]).startswith(k)), None)
    assert hit, (seg, w)
    return hit["s"]
def S0(seg): return ST[seg][0]

def load(path):
    raw = subprocess.run(["ffmpeg", "-v", "error", "-i", path, "-f", "f32le", "-ac", "2", "-ar", str(SR), "-"], capture_output=True, check=True).stdout
    return np.frombuffer(raw, np.float32).reshape(-1, 2).copy()

def db(x): return 10 ** (x / 20)
N = int(TOTAL * SR)
voice = load(VOICE)[:N]
out_v = np.zeros((N, 2), np.float32); out_v[:len(voice)] = voice
music = np.zeros((N, 2), np.float32)
sfx = np.zeros((N, 2), np.float32)

def place(buf, clip, t, gain_db=0.0, dur=None, fin=0.01, fout=0.15, src=0.0):
    c = clip[int(src * SR):]
    if dur is not None: c = c[:int(dur * SR)]
    c = c * db(gain_db)
    n = len(c)
    if n == 0: return
    env = np.ones(n, np.float32)
    a, b = int(fin * SR), int(fout * SR)
    if a: env[:min(a, n)] = np.linspace(0, 1, min(a, n))
    if b: env[-min(b, n):] *= np.linspace(1, 0, min(b, n))
    c = c * env[:, None]
    i = int(t * SR)
    if i >= N: return
    m = min(n, N - i)
    buf[i:i + m] += c[:m]

S = {k: load(A + f"sfx_{k}.mp3") for k in ["burst_boom", "clank", "creak_beam", "rumble", "whoosh", "impact", "splash", "harbor", "ship_bell",
     "street", "horse", "wind", "kids", "paper", "pop", "riser", "gavel", "stamp", "wave", "wave_crash", "metal_break", "steel_twist", "creak", "collapse"]}
M = {k: load(A + f"{k}.mp3") for k in ["m1_coldopen", "m2_history", "m3_warning", "m4_disaster", "m5_aftermath", "m6_court", "m7_ending"]}

# shots (key, start s) straight from the timeline's raw list, timed as the video times them (cut 2 frames before the word)
RAW = re.findall(r'\{ s: (\d+), w: (null|"[^"]*"), k: "(3d|2d)", g: "([^"]+)" \}', _ts)
SH = []
for i, (s, w, k, g) in enumerate(RAW):
    s = int(s); t0 = 0.0 if i == 0 else (W(s, w.strip('"')) if w != "null" else S0(s)) - 2 / 30
    SH.append((g, k, t0, s))
def T(key, n=0): return [x[2] for x in SH if x[0] == key][n]

# chapter starts (s)
CH = {k: S0(i) for k, i in [("ch1", 16), ("ch2", 40), ("ch3", 58), ("ch4", 76), ("ch5", 98), ("ch6", 120), ("a5", 148), ("end", 165), ("close", 177)]}
# ---- music beds (track, start, end, level dB, fade in, fade out, source offset) ----
BEDS = [("m1_coldopen", 0.0, CH["ch1"], -11, 0.2, 2.0, 0),             # Cosmic Nightmares: the hook
        ("m2_history", CH["ch1"], CH["ch2"], -12, 2.0, 2.5, 0),         # A Stroll Alone: Southampton
        ("m6_court", CH["ch2"], CH["ch3"], -12, 2.0, 2.0, 0),           # Searching: the captain
        ("m3_warning", CH["ch3"], CH["ch4"], -12, 2.0, 2.0, 0),         # House on the Hill: the lookouts
        ("m6_court", CH["ch4"], CH["ch5"], -12, 2.0, 2.0, 40),          # Searching: the wireless room
        ("m4_disaster", CH["ch5"], CH["ch6"], -10, 1.0, 2.5, 0),        # Standoff: the iceberg
        ("m5_aftermath", CH["ch6"], CH["a5"], -9, 2.0, 2.5, 0),         # The Quiet Aftermath: the empty seats
        ("m7_ending", CH["a5"], CH["end"], -11, 2.0, 2.5, 0),           # Hopeful: attempt 5
        ("m5_aftermath", CH["end"], CH["close"], -9, 2.0, 2.0, 30),     # The Quiet Aftermath: 2:20
        ("m7_ending", CH["close"], TOTAL, -10, 1.5, 4.0, 100)]          # Hopeful: the answer and the end card
for k, a, b, g, fi, fo, src in BEDS:
    place(music, M[k], a, g, dur=b - a + fo * 0.5, fin=fi, fout=fo, src=src)

# ---- sound effects: (time s, name, gain dB, optional dur, src offset) ----
C = []
WHIP = {"open-wide", "ship-reveal", "stranger", "knots", "lookouts-trust", "dark-ahead", "almost", "finished", "boat-hang", "thats-it", "ship-leave", "freezing"}
for g, k, t0, s in SH:
    base = g.split(":")[0]
    if base == "attempt": C.append((t0, "impact", -7))
    elif base == "fail": C += [(t0, "whoosh", -14, 0.6), (W(s, "failed") - 0.05, "stamp", -5)]
    elif base in ("t1139", "t1139b", "t1240", "t220", "n1500", "six", "n472", "why", "shutup", "cruelest", "problem"): C.append((t0, "impact", -8))
    elif k == "2d": C.append((t0, "pop", -13))
    elif g in WHIP: C.append((t0 - 0.1, "whoosh", -12, 1.0))
C += [
 # cold open
 (T("open-wide"), "wave", -22, 6), (T("you-deck"), "wind", -26, 3), (W(3, "iceberg") - 0.05, "impact", -6), (W(4, "gone") - 0.05, "stamp", -6), (T("ship-night-pass"), "wave", -22, 4),
 (T("didnt-matter"), "wind", -24, 3),
 # ch1 Southampton
 (T("dock-wake"), "harbor", -20, 9), (T("ship-reveal"), "ship_bell", -16, 2.5), (T("boarding"), "street", -24, 5), (T("grab"), "street", -26, 8), (T("he-laughs"), "kids", -24, 3.5),
 (T("stranger"), "harbor", -22, 9), (T("ship-leave"), "ship_bell", -14, 3), (T("ship-leave") + 0.3, "wave", -22, 5),
 # ch2 the captain
 (T("days-near"), "wave", -24, 4), (T("smith-paper") + 0.1, "paper", -12, 1.4), (T("knots"), "wave", -18, 5), (T("lookouts-trust"), "wind", -24, 5),
 # ch3 the lookouts
 (T("nest"), "wind", -22, 9), (W(63, "locked"), "clank", -10), (W(66, "pocket") - 0.1, "clank", -13), (T("search"), "wind", -26, 3), (T("no-moon"), "wind", -24, 9), (T("no-binoc"), "wind", -26, 4),
 # ch4 the wireless room
 (T("fixing") + 0.3, "clank", -12), (T("buried"), "paper", -13, 2.5), (T("hundreds"), "paper", -9, 2.4), (W(86, "never"), "stamp", -8), (T("set-aside") + 0.2, "paper", -12, 1.2),
 (T("californian"), "wind", -22, 8), (W(92, "switches") + 0.25, "clank", -11), (T("note") + 0.15, "paper", -12, 3),
 # ch5 the iceberg
 (T("back-deck"), "wind", -24, 3), (W(100, "rings") - 0.05, "ship_bell", -8, 1.3), (W(100, "rings") + 0.4, "ship_bell", -8, 1.3), (W(100, "rings") + 0.85, "ship_bell", -8, 1.6),
 (T("iceberg-ahead") + 0.1, "impact", -5), (T("iceberg-ahead"), "riser", -16, 3.0, 19.0), (T("turn") + 0.1, "creak", -10, 1.5), (T("swing"), "wave", -18, 4), (T("almost"), "rumble", -14, 3),
 (T("scrape") + 0.2, "impact", -4), (T("scrape") + 0.2, "metal_break", -9, 2.6), (T("scrape") + 0.8, "steel_twist", -13, 2.2), (T("ice-play"), "kids", -24, 4),
 (W(110, "5") - 0.05, "stamp", -6), (W(114, "survived"), "stamp", -8), (W(115, "not") - 0.05, "impact", -6), (W(119, "hour") - 0.05, "impact", -7),
 # ch6 the empty seats
 (T("thats-it"), "wind", -22, 6), (T("save-ship"), "creak_beam", -16, 2), (T("finished"), "creak", -12, 2.2), (T("finished"), "wave", -20, 3), (T("boats-row"), "wind", -26, 3),
 (W(135, "28") - 0.05, "stamp", -8), (W(136, "12") - 0.05, "stamp", -8), (T("boat-hang"), "creak_beam", -12, 2.5), (T("boat-hang"), "wind", -22, 8), (W(143, "cancelled") - 0.05, "stamp", -5),
 (T("half-empty"), "creak", -14, 2), (T("half-empty") + 1.2, "splash", -18, 2), (W(151, "Get") - 0.05, "impact", -9), (T("take-seat"), "creak_beam", -18, 2),
 (T("distress") + 0.2, "clank", -12), (T("rockets") + 0.15, "burst_boom", -17, 1.4), (T("rockets") + 1.0, "burst_boom", -17, 1.4), (T("cal2"), "wind", -24, 8),
 # ending
 (T("under"), "steel_twist", -9, 3), (T("under") + 0.4, "collapse", -12, 3), (T("under") + 1.8, "wave_crash", -14, 3), (T("freezing"), "wind", -20, 4), (T("carpathia"), "ship_bell", -14, 2.5),
 (T("carpathia"), "harbor", -22, 5), (T("few-seats"), "harbor", -22, 4), (T("you-end"), "harbor", -22, 4), (W(179, "problem") - 0.05, "impact", -8), (T("act"), "wind", -24, 4),
]
for c in C:
    t, k, g = max(0.0, c[0]), c[1], c[2]
    dur = c[3] if len(c) > 3 else None
    src = c[4] if len(c) > 4 else 0.0
    long = dur is not None and dur > 3
    place(sfx, S[k], t, g, dur=dur, fin=0.4 if long else 0.005, fout=0.8 if long else 0.1, src=src)

# ---- duck music + ambient effects under the voice (envelope follower on the voice) ----
v = np.abs(out_v).max(axis=1)
win = int(0.05 * SR)
env = np.convolve(v, np.ones(win) / win, mode="same")
speech = (env > 0.02).astype(np.float32)
# smooth the gate: fast attack (60 ms), slow release (400 ms)
k_att, k_rel = 1 - np.exp(-1 / (0.06 * SR)), 1 - np.exp(-1 / (0.4 * SR))
g = np.empty_like(speech); s = 0.0
for i in range(0, len(speech), 240):  # step in 5 ms blocks for speed
    target = speech[i:i + 240].max()
    s += ((k_att if target > s else k_rel) * 240) * (target - s)
    s = min(max(s, 0.0), 1.0)
    g[i:i + 240] = s
duck = 1.0 - g * (1 - db(-9))  # music sits 9 dB lower while he talks
music *= duck[:, None]

mix = out_v + music + sfx
peak = np.abs(mix).max()
# soft limiter so the bursts don't clip
mix = np.tanh(mix * 1.1) / np.tanh(1.1) if peak > 0.98 else mix
mix = mix * (0.93 / max(0.93, float(np.abs(mix).max())))
print("peak before", round(float(peak), 3), "after", round(float(np.abs(mix).max()), 3))
sub = subprocess.run(["ffmpeg", "-v", "error", "-y", "-f", "f32le", "-ac", "2", "-ar", str(SR), "-i", "-", "/tmp/tt/mix.wav"], input=mix.astype(np.float32).tobytes(), check=True)
sp = g > 0.9
def rms(x, m): return 20*np.log10(np.sqrt((x[m]**2).mean())+1e-9)
print("voice in speech", round(rms(out_v, sp),1), "music in speech", round(rms(music, sp),1), "music in gaps", round(rms(music, ~sp),1), "voice in gaps", round(rms(out_v, ~sp),1))
