# Long-form #5 (1929 crash what-if) audio mix: voice + ducked music beds + sound effects anchored to the shot timeline.
# Output: mix.wav (48 kHz stereo) the length of the full video (voice + 8 s end card).
import subprocess, numpy as np, json, sys
SR = 48000
A = "/home/claude/render-speed-test/public/molasseslong/audio/"  # same YouTube Audio Library files as long-form #1 (see CREDITS.md there)
VOICE = "/home/claude/render-speed-test/public/crashif/voice.mp3"
import re, math
_ts = open("/home/claude/render-speed-test/src/videos/crashif/timeline.ts").read()
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
     "street", "horse", "wind", "kids", "paper", "pop", "riser", "gavel", "stamp", "wave", "wave_crash", "metal_break", "steel_twist", "creak", "collapse", "rivets"]}
M = {k: load(A + f"{k}.mp3") for k in ["m1_coldopen", "m2_history", "m3_warning", "m4_disaster", "m5_aftermath", "m6_court", "m7_ending"]}

# shots (key, start s) straight from the timeline's raw list, timed as the video times them (cut 2 frames before the word)
RAW = re.findall(r'\{ s: (\d+), w: (null|"[^"]*"), k: "(3d|2d)", g: "([^"]+)" \}', _ts)
SH = []
for i, (s, w, k, g) in enumerate(RAW):
    s = int(s); t0 = 0.0 if i == 0 else (W(s, w.strip('"')) if w != "null" else S0(s)) - 2 / 30
    SH.append((g, k, t0, s))
def T(key, n=0): return [x[2] for x in SH if x[0] == key][n]

# chapter starts (s)
CH = {k: S0(i) for k, i in [("rew", 16), ("a1", 28), ("a2", 45), ("a3", 71), ("a4", 102), ("a5", 123), ("end", 149), ("close", 168)]}
# ---- music beds (track, start, end, level dB, fade in, fade out, source offset) ----
BEDS = [("m1_coldopen", 0.0, CH["rew"], -11, 0.2, 2.0, 0),             # Cosmic Nightmares: the hook
        ("m2_history", CH["rew"], CH["a1"], -12, 2.0, 2.5, 0),          # A Stroll Alone: September 3
        ("m6_court", CH["a1"], CH["a2"], -12, 2.0, 2.0, 0),             # Searching: tell everyone
        ("m3_warning", CH["a2"], CH["a3"], -12, 2.0, 2.0, 0),           # House on the Hill: the bankers
        ("m6_court", CH["a3"], CH["a4"], -12, 2.0, 2.0, 40),            # Searching: get rich
        ("m4_disaster", CH["a4"], CH["a5"], -11, 1.5, 2.5, 0),          # Standoff: the dip and the slide
        ("m5_aftermath", CH["a5"], CH["end"], -9, 2.0, 2.5, 0),         # The Quiet Aftermath: your street
        ("m7_ending", CH["end"], TOTAL, -10, 2.0, 4.0, 0)]              # Hopeful: what would have worked, and the end card
for k, a, b, g, fi, fo, src in BEDS:
    place(music, M[k], a, g, dur=b - a + fo * 0.5, fin=fi, fout=fo, src=src)

# ---- sound effects: (time s, name, gain dB, optional dur, src offset) ----
C = []
WHIP = {"open-wide", "forever", "thats-it", "your-line", "across", "crowd-did", "bous", "rich", "sell"}
HITS = {"d1029", "n16m", "weeks8", "problem", "doct24", "open11", "monday", "tuesday", "n100m", "trap", "djul8", "down89", "cruelest", "bankrun", "afterrun", "half", "onethird"}
STREET = {"open-wide": 6, "crowd-low": 5, "you-crowd": 4, "wake": 6, "rich": 5, "corner-say": 5, "nobody-slows": 5, "across": 5, "bous": 6, "breadline": 6, "street-people": 6,
          "tell-neighbors": 6, "run-morning": 5, "everybody-believes": 5, "your-line": 7, "lost": 5, "nobody-wanted": 5, "crowd-did": 5, "you-end": 5}
for g, k, t0, s in SH:
    base = g.split(":")[0]
    if base == "attempt": C.append((t0, "impact", -7))
    elif base == "fail": C += [(t0, "whoosh", -14, 0.6), (W(s, "failed") - 0.05, "stamp", -5)]
    elif base == "draw": C += [(t0, "whoosh", -14, 0.6), (W(s, "draw") - 0.05, "stamp", -5)]
    elif base in HITS: C.append((t0, "impact", -8))
    elif k == "2d": C.append((t0, "pop", -13))
    elif g in WHIP: C.append((t0 - 0.1, "whoosh", -12, 1.0))
    if g in STREET: C.append((t0, "street", -23, STREET[g]))
C += [
 # cold open
 (T("floor-panic"), "paper", -10, 2.5), (T("floor-panic") + 0.1, "kids", -22, 3), (T("newsstand") + 0.2, "paper", -12, 1.4), (T("didnt-matter") + 0.6, "paper", -12, 1.2),
 # September 3
 (T("wake") + 0.1, "impact", -9), (T("rich"), "kids", -22, 4), (T("forever"), "wind", -24, 4),
 # attempt 1
 (W(30, "crash") - 0.05, "impact", -8), (T("babson-speech"), "gavel", -12), (T("news-runs"), "paper", -12, 2.0), (W(37, "drops"), "creak", -14, 1.2),
 # attempt 2
 (T("ticker"), "rivets", -16, 4), (T("nobody-knows"), "paper", -13, 2.5), (T("sell"), "kids", -18, 3), (T("sell") + 0.1, "paper", -9, 2.4), (T("pool") + 0.4, "clank", -13), (T("pool") + 1.2, "clank", -13),
 (W(59, "$205") - 0.05, "gavel", -6), (T("floor-cheer"), "kids", -18, 3), (W(66, "13") - 0.05, "collapse", -12, 2.5), (W(67, "12") - 0.05, "collapse", -12, 2.5), (T("bankers-fail"), "paper", -13, 2.5),
 # attempt 3
 (T("you-win"), "kids", -22, 2.5), (T("you-win") + 0.1, "paper", -11, 2.0), (T("bank-in"), "clank", -14), (T("bank-gone") + 0.1, "gavel", -6), (W(83, "no") - 0.05, "stamp", -7),
 (W(89, "bankrupt") - 0.05, "stamp", -6), (T("gold") + 0.3, "clank", -11), (T("gold") + 1.0, "clank", -11), (T("gold-taken") + 0.3, "clank", -12), (T("gold-taken") + 1.1, "clank", -12),
 (T("mattress") + 0.5, "paper", -13, 1.6), (W(99, "mattress") - 0.05, "stamp", -8), (T("guard"), "wind", -26, 4),
 # attempt 4
 (T("buy") + 0.5, "paper", -12, 1.4), (T("breadline"), "wind", -24, 6), (W(118, "$4") - 0.05, "stamp", -8), (T("you-ruined"), "wind", -24, 4),
 # attempt 5
 (T("thats-it"), "wind", -22, 5), (W(134, "Take") - 0.05, "impact", -9), (T("run-morning"), "kids", -20, 4), (T("bank-shut") + 0.9, "gavel", -5), (T("bank-shut") + 1.0, "clank", -8),
 (W(143, "run") - 0.05, "stamp", -7), (T("everybody-believes"), "kids", -20, 4), (T("your-line"), "wind", -22, 6),
 # ending
 (W(152, "debt") - 0.05, "impact", -9), (T("lost"), "wind", -24, 4), (W(166, "myth") - 0.05, "stamp", -6), (W(170, "problem") - 0.05, "impact", -8), (T("crowd-did"), "kids", -20, 4),
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
sub = subprocess.run(["ffmpeg", "-v", "error", "-y", "-f", "f32le", "-ac", "2", "-ar", str(SR), "-i", "-", "/tmp/cr/mix.wav"], input=mix.astype(np.float32).tobytes(), check=True)
sp = g > 0.9
def rms(x, m): return 20*np.log10(np.sqrt((x[m]**2).mean())+1e-9)
print("voice in speech", round(rms(out_v, sp),1), "music in speech", round(rms(music, sp),1), "music in gaps", round(rms(music, ~sp),1), "voice in gaps", round(rms(out_v, ~sp),1))
