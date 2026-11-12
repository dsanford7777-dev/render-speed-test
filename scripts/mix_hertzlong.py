# Long-form #3 (60 Hz) audio mix: voice + ducked music beds + sound effects anchored to the shot timeline.
# Output: mix.wav (48 kHz stereo) the length of the full video (voice + 8 s end card).
import subprocess, numpy as np, json, sys
SR = 48000
A = "/home/claude/render-speed-test/public/molasseslong/audio/"  # same YouTube Audio Library files as long-form #1 (see CREDITS.md there)
VOICE = "/home/claude/render-speed-test/public/hertzlong/voice.mp3"
import re, math
_ts = open("/home/claude/render-speed-test/src/videos/hertzlong/timeline.ts").read()
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
     "street", "horse", "wind", "kids", "paper", "pop", "riser", "gavel", "stamp"]}
M = {k: load(A + f"{k}.mp3") for k in ["m1_coldopen", "m2_history", "m3_warning", "m4_disaster", "m5_aftermath", "m6_court", "m7_ending"]}

# chapter starts (s)
CH = {k: S0(i) for k, i in [("ch1", 13), ("ch2", 33), ("ch3", 64), ("ch4", 92), ("ch5", 125), ("ch6", 148), ("end", 162), ("close", 176)]}
# ---- music beds (track, start, end, level dB, fade in, fade out, source offset) ----
BEDS = [("m1_coldopen", 0.0, CH["ch1"], -11, 0.2, 2.0, 0),             # the hook and the promise
        ("m2_history", CH["ch1"], CH["ch2"], -12, 2.0, 2.5, 0),         # A Stroll Alone: what the number means
        ("m6_court", CH["ch2"], CH["ch3"], -12, 2.0, 2.0, 0),           # Searching: Pittsburgh looks for a number
        ("m2_history", CH["ch3"], CH["ch4"], -12, 2.0, 2.0, 45),        # A Stroll Alone: Berlin
        ("m7_ending", CH["ch4"], CH["ch5"], -11, 2.0, 2.0, 0),          # Hopeful: Los Angeles and its clocks
        ("m6_court", CH["ch5"], CH["ch6"], -12, 2.0, 2.0, 40),          # Searching: Tokyo and Osaka
        ("m4_disaster", CH["ch6"], CH["end"], -10, 1.5, 2.5, 0),        # Standoff: March 2011
        ("m5_aftermath", CH["end"], CH["close"], -9, 2.0, 2.0, 0),      # The Quiet Aftermath: too late to fix
        ("m7_ending", CH["close"], TOTAL, -10, 1.5, 4.0, 100)]          # Hopeful: the loop and the end card
for k, a, b, g, fi, fo, src in BEDS:
    place(music, M[k], a, g, dur=b - a + fo * 0.5, fin=fi, fout=fo, src=src)

# ---- sound effects: (time s, name, gain dB, optional dur, src offset), anchored to words ----
C = [
 # cold open
 (W(0, "60") - 0.05, "impact", -8), (S0(1) - 0.15, "whoosh", -10, 1.0), (W(1, "50") - 0.05, "impact", -8), (W(2, "Nobody"), "stamp", -8),
 (W(3, "treaty"), "pop", -12), (W(4, "vote"), "pop", -12), (W(5, "committee"), "pop", -12), (W(6, "Berlin") - 0.1, "whoosh", -12, 0.8),
 (W(7, "both"), "pop", -10), (W(9, "disaster") - 0.05, "stamp", -6), (S0(10), "wind", -24, 6), (W(11, "split") - 0.05, "impact", -8), (W(12, "too"), "stamp", -8),
 # ch1
 (S0(13), "pop", -12), (W(14, "doesn't"), "stamp", -10), (S0(15), "whoosh", -14, 1.0), (W(17, "60"), "pop", -12), (S0(18), "pop", -12), (W(19, "50"), "pop", -12),
 (S0(20) - 0.1, "whoosh", -12, 0.8), (W(22, "1880s"), "pop", -12), (S0(23), "pop", -14), (S0(24), "wind", -26, 5), (W(26, "133"), "pop", -11), (W(27, "125"), "pop", -11),
 (W(28, "87"), "pop", -11), (W(29, "1906"), "stamp", -10), (W(32, "hated"), "impact", -8),
 # ch2
 (W(33, "motor") - 0.1, "whoosh", -10, 0.8), (W(33, "motor"), "impact", -9), (W(36, "streetcars"), "pop", -13), (W(36, "elevators"), "pop", -13), (W(38, "problem"), "stamp", -8),
 (W(39, "badly"), "clank", -9), (W(39, "badly") + 0.3, "creak_beam", -14, 1.5), (W(40, "lower"), "pop", -12), (W(45, "1890"), "pop", -12), (W(46, "60") - 0.05, "impact", -5),
 (W(46, "60") - 0.05, "stamp", -8), (W(47, "50"), "pop", -12), (W(49, "60"), "stamp", -8), (W(53, "final"), "stamp", -8), (S0(54), "splash", -18, 3), (W(55, "25"), "pop", -11),
 (W(59, "50"), "pop", -12), (W(60, "60"), "pop", -11), (W(62, "ordered"), "stamp", -9),
 # ch3
 (S0(64), "whoosh", -12, 1.4), (S0(65), "splash", -20, 3), (W(66, "kilometers") - 0.4, "pop", -11), (W(68, "worked") - 0.05, "impact", -7), (W(69, "40"), "pop", -11),
 (W(73, "50") - 0.05, "impact", -7), (S0(75), "paper", -12, 1.6), (W(78, "proved"), "stamp", -6), (W(82, "split"), "impact", -8), (W(84, "numbers"), "pop", -12), (W(85, "10"), "pop", -11),
 (W(86, "stings"), "stamp", -8), (S0(91), "impact", -8),
 # ch4
 (W(93, "wasn't") - 0.05, "stamp", -5), (W(94, "50"), "pop", -11), (W(96, "island"), "pop", -12), (S0(98), "rumble", -18, 2.5), (W(99, "60"), "pop", -11), (W(101, "1936"), "pop", -12),
 (W(102, "18"), "pop", -12), (S0(105) - 0.05, "impact", -5), (S0(105), "clank", -12), (S0(107), "whoosh", -12, 1.2), (W(108, "12"), "pop", -10), (S0(109), "street", -26, 5),
 (S0(111), "horse", -24, 3), (W(113, "bigger"), "clank", -10), (W(113, "bigger") + 0.5, "impact", -8), (W(114, "475,000"), "pop", -10), (W(115, "380,000"), "pop", -10),
 (W(116, "58,000"), "pop", -10), (W(117, "$34"), "impact", -7), (W(119, "1948"), "stamp", -8), (W(122, "12"), "pop", -12), (W(123, "third"), "pop", -12), (S0(124), "riser", -18, 3.0, 19.0),
 # ch5
 (W(125, "Tokyo's"), "pop", -12), (W(127, "AEG") - 0.05, "impact", -8), (W(128, "50"), "stamp", -9), (W(129, "Osaka's"), "pop", -12), (W(131, "General") - 0.05, "impact", -8),
 (W(132, "60"), "stamp", -9), (W(134, "Two"), "pop", -12), (S0(137), "whoosh", -14, 1.2), (W(140, "met") - 0.05, "impact", -6), (W(141, "never"), "stamp", -8),
 (S0(144), "clank", -10), (S0(144) + 0.2, "burst_boom", -16, 1.2), (S0(145), "whoosh", -12, 1.2), (W(146, "1965"), "pop", -12),
 # ch6
 (S0(148), "impact", -6), (W(148, "massive") - 0.1, "rumble", -9, 5), (W(149, "shut"), "clank", -10), (S0(150), "wind", -22, 5), (S0(153), "rumble", -18, 3), (W(154, "gigawatt") - 0.3, "pop", -11),
 (S0(155), "impact", -9), (W(157, "rolling") - 0.05, "stamp", -5), (S0(158), "clank", -12), (S0(159), "creak_beam", -16, 1.5), (S0(160), "wind", -24, 4), (W(161, "115"), "impact", -7),
 # ending
 (W(163, "2021"), "pop", -12), (W(166, "one"), "pop", -12), (W(167, "half"), "rumble", -18, 2.5), (S0(168), "clank", -14), (S0(169), "whoosh", -13, 1.2), (W(170, "60"), "pop", -11),
 (W(171, "50"), "pop", -11), (W(172, "better"), "stamp", -9), (W(175, "stop"), "pop", -10), (W(176, "60") - 0.05, "impact", -8), (W(177, "50") - 0.05, "impact", -8), (S0(178), "whoosh", -12, 1.4),
]
for c in C:
    t, k, g = c[0], c[1], c[2]
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
sub = subprocess.run(["ffmpeg", "-v", "error", "-y", "-f", "f32le", "-ac", "2", "-ar", str(SR), "-i", "-", "/tmp/hz/mix.wav"], input=mix.astype(np.float32).tobytes(), check=True)
sp = g > 0.9
def rms(x, m): return 20*np.log10(np.sqrt((x[m]**2).mean())+1e-9)
print("voice in speech", round(rms(out_v, sp),1), "music in speech", round(rms(music, sp),1), "music in gaps", round(rms(music, ~sp),1), "voice in gaps", round(rms(out_v, ~sp),1))
