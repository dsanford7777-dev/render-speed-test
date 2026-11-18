# Long-form #7 (Longyearbyen) audio mix: voice + ducked music beds + sound effects anchored to the shot timeline.
# Output: mix.wav (48 kHz stereo) the length of the full video (voice + 8 s end card).
import subprocess, numpy as np, json, sys
SR = 48000
A = "/home/claude/render-speed-test/public/molasseslong/audio/"  # same YouTube Audio Library files as long-form #1 (see CREDITS.md there)
VOICE = "/home/claude/render-speed-test/public/frozenlong/voice.mp3"
import re, math
_ts = open("/home/claude/render-speed-test/src/videos/frozenlong/timeline.ts").read()
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
CH = {k: S0(i) for k, i in [("ch1", 9), ("ch2", 14), ("ch3", 22), ("ch4", 29), ("ch5", 40), ("ch6", 47), ("ch7", 58), ("ch8", 68), ("end", 77)]}
# ---- music beds (track, start, end, level dB, fade in, fade out, source offset) ----
BEDS = [("m1_coldopen", 0.0, CH["ch1"], -11, 0.2, 2.0, 0),             # Cosmic Nightmares: the dig, the virus
        ("m2_history", CH["ch1"], CH["ch2"], -12, 2.0, 2.5, 0),         # A Stroll Alone: Longyear City
        ("m3_warning", CH["ch2"], CH["ch3"], -12, 2.0, 2.0, 0),         # House on the Hill: the summer of 1918
        ("m4_disaster", CH["ch3"], CH["ch4"], -11, 1.0, 2.5, 0),        # Standoff: the last ship, the dynamite
        ("m5_aftermath", CH["ch4"], CH["ch5"], -10, 2.0, 2.5, 0),       # The Quiet Aftermath: a virus nobody kept
        ("m6_court", CH["ch5"], CH["ch6"], -12, 2.0, 2.0, 0),           # Searching: the geographer
        ("m3_warning", CH["ch6"], CH["ch7"], -12, 2.0, 2.0, 40),        # House on the Hill: the dig
        ("m7_ending", CH["ch7"], CH["ch8"], -11, 2.0, 2.5, 0),          # Hopeful: Alaska, Lucy
        ("m5_aftermath", CH["ch8"], CH["end"], -10, 2.0, 2.0, 30),      # The Quiet Aftermath: the rule
        ("m7_ending", CH["end"], TOTAL, -10, 1.5, 4.0, 100)]            # Hopeful: the end and the end card
for k, a, b, g, fi, fo, src in BEDS:
    place(music, M[k], a, g, dur=b - a + fo * 0.5, fin=fi, fout=fo, src=src)

# ---- sound effects: (time s, name, gain dB, optional dur, src offset) ----
C = []
WHIP = {"ship", "week", "frozen", "millions", "labwide", "adig51", "idea", "plane", "mail", "town2b", "shed", "hillside", "trail", "village2"}
SNOW = {"team", "town2", "crosses18", "alone", "trail", "town2b", "town2c", "crosses3", "hillside", "townwide", "townwide2", "millions", "field2"}
for g, k, t0, s in SH:
    base = g.split(":")[0]
    if base in ("y80", "n20", "age20", "nosample", "y1933", "n72", "n5", "six7", "y2005", "y1950", "acc"): C.append((t0, "impact", -8))
    elif k == "2d": C.append((t0, "pop", -13))
    elif g in WHIP: C.append((t0 - 0.1, "whoosh", -12, 1.0))
    if g in SNOW: C.append((t0, "wind", -24, 5))
def ST2(key, n=0):
    try: return T(key, n)
    except IndexError: return None
C += [
 # cold open: the shovel bites, the virus pulses
 (ST2("hook") + 0.3, "clank", -12), (ST2("hook") + 1.1, "clank", -13), (ST2("alive") + 0.2, "riser", -18, 2.5, 19.0), (ST2("solid") + 0.2, "impact", -10),
 # ch1
 (ST2("shed"), "harbor", -20, 6), (ST2("miners"), "harbor", -22, 5), (W(13, "bought") - 0.05, "stamp", -6),
 # ch2
 (W(17, "cancelled") - 0.05, "stamp", -8), (W(21, "seemed") + 1.0, "stamp", -8),
 # ch3 the last ship
 (ST2("ship"), "harbor", -18, 7), (ST2("ship") + 0.4, "ship_bell", -14, 2.5), (ST2("sick"), "wind", -24, 4), (ST2("ward"), "creak", -18, 2),
 (ST2("week"), "creak_beam", -20, 2), (ST2("oldest") + 0.2, "paper", -14, 1.5), (ST2("burned"), "wind", -24, 3),
 (ST2("hillside"), "wind", -20, 6), (ST2("frozen") + 0.36, "clank", -9), (ST2("frozen") + 0.98, "clank", -10), (ST2("dynamite"), "riser", -20, 1.6, 19.0),
 (ST2("boom") + 0.08, "burst_boom", -5, 2.5), (ST2("boom") + 0.1, "rumble", -10, 3), (ST2("crosses18"), "wind", -22, 6),
 # ch4
 (ST2("sample"), "wind", -28, 3), (ST2("army") + 0.1, "paper", -12, 1.4), (W(38, "classified") - 0.05, "stamp", -5), (W(38, "negative") - 0.05, "stamp", -5),
 (W(37, "Nothing") - 0.05, "stamp", -7), (ST2("adig51"), "wind", -22, 5),
 # ch5 the geographer
 (ST2("archives") + 0.1, "paper", -12, 1.5), (ST2("checklist"), "paper", -16, 1.2), (ST2("permits"), "paper", -16, 1.2), (ST2("flags"), "wind", -24, 3),
 # ch6 the dig
 (ST2("suits"), "wind", -24, 3), (ST2("radar"), "wind", -24, 4), (W(47, "7") - 0.05, "stamp", -7), (ST2("dig"), "wind", -22, 4), (ST2("dig") + 0.3, "clank", -14), (ST2("dig") + 1.0, "clank", -15),
 (ST2("hit") + 0.35, "impact", -6), (ST2("hit") + 0.35, "clank", -9), (ST2("summers"), "wind", -24, 5), (ST2("gone") + 0.2, "collapse", -18, 2.0), (W(57, "switched") - 0.05, "stamp", -6),
 # ch7 Alaska
 (ST2("science") + 0.1, "paper", -12, 1.4), (W(59, "needed") - 0.05, "stamp", -7), (ST2("shears") + 0.5, "clank", -12), (ST2("plane"), "wind", -18, 5), (ST2("village"), "wind", -22, 5),
 (ST2("adig"), "wind", -22, 5), (ST2("adig") + 0.4, "clank", -14), (ST2("found"), "riser", -20, 2.4, 19.0), (ST2("mail") + 0.42, "impact", -7), (ST2("reveal"), "riser", -18, 2.0, 19.0),
 # ch8 the rule, the end
 (ST2("town2b"), "wind", -20, 6), (W(74, "isn't") - 0.05, "stamp", -5), (ST2("townwide2"), "harbor", -24, 5), (ST2("gone2") + 0.2, "collapse", -20, 2.0), (ST2("village2"), "wind", -22, 5),
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
sub = subprocess.run(["ffmpeg", "-v", "error", "-y", "-f", "f32le", "-ac", "2", "-ar", str(SR), "-i", "-", "/tmp/fl/mix.wav"], input=mix.astype(np.float32).tobytes(), check=True)
sp = g > 0.9
def rms(x, m): return 20*np.log10(np.sqrt((x[m]**2).mean())+1e-9)
print("voice in speech", round(rms(out_v, sp),1), "music in speech", round(rms(music, sp),1), "music in gaps", round(rms(music, ~sp),1), "voice in gaps", round(rms(out_v, ~sp),1))
