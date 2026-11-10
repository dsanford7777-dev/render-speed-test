# Long-form #2 (Pig War) audio mix: voice + ducked music beds + sound effects anchored to the shot timeline.
# Output: mix.wav (48 kHz stereo) the length of the full video (voice + 8 s end card).
import subprocess, numpy as np, json, sys
SR = 48000
A = "/home/claude/render-speed-test/public/molasseslong/audio/"  # same YouTube Audio Library files as long-form #1 (see CREDITS.md there)
VOICE = "/home/claude/render-speed-test/public/pigwarlong/voice.mp3"
import re, math
_ts = open("/home/claude/render-speed-test/src/videos/pigwarlong/timeline.ts").read()
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
CH = {k: S0(i) for k, i in [("ch1", 12), ("ch2", 47), ("ch3", 74), ("ch4", 97), ("ch5", 114), ("ch6", 136), ("pickett", 154), ("back", 161), ("ch7", 162), ("end", 180)]}
# ---- music beds (track, start, end, level dB, fade in, fade out, source offset) ----
BEDS = [("m4_disaster", 0.0, CH["ch1"], -10, 0.2, 2.0, 0),            # Standoff: the cold open
        ("m2_history", CH["ch1"], CH["ch2"], -12, 2.0, 2.5, 0),       # A Stroll Alone: the treaty, the islands
        ("m3_warning", CH["ch2"], CH["ch3"], -9, 1.5, 2.0, 0),       # House on the Hill: the pig, the arrest threat
        ("m4_disaster", CH["ch3"], CH["ch5"], -11, 1.5, 2.0, 30),     # Standoff: soldiers, warships, the admiral
        ("m6_court", CH["ch5"], CH["ch6"], -12, 2.0, 2.0, 0),         # Searching: six weeks away, Scott
        ("m7_ending", CH["ch6"], CH["pickett"], -9, 2.0, 2.0, 0),    # Hopeful: the friendly occupation
        ("m5_aftermath", CH["pickett"], CH["back"], -6, 1.5, 2.0, 0), # The Quiet Aftermath: Pickett and Gettysburg
        ("m7_ending", CH["back"], CH["ch7"], -12, 1.5, 1.5, 70),
        ("m6_court", CH["ch7"], CH["end"], -12, 1.5, 2.0, 40),        # Searching: the Kaiser decides
        ("m7_ending", CH["end"], TOTAL, -10, 2.0, 4.0, 100)]          # Hopeful: the final count, today
for k, a, b, g, fi, fo, src in BEDS:
    place(music, M[k], a, g, dur=b - a + fo * 0.5, fin=fi, fout=fo, src=src)

# ---- sound effects: (time s, name, gain dB, optional dur, src offset), anchored to words ----
C = [
 # cold open: wind over the island, the warship, the pig, the title
 (0.0, "wind", -24, 6), (W(2, "warships"), "harbor", -20, 4), (W(2, "2,000") - 0.1, "pop", -12), (W(5, "pig") - 0.1, "impact", -6),
 (W(6, "Pig") - 0.2, "whoosh", -8, 1.2), (W(7, "13"), "pop", -12), (W(9, "nobody"), "stamp", -8), (W(11, "Almost"), "pop", -10),
 # ch1: the treaty
 (W(13, "treaty"), "paper", -10, 1.8), (W(17, "line") - 0.2, "whoosh", -12, 1.0), (W(22, "Singular") - 0.05, "stamp", -6),
 (W(24, "two"), "pop", -12), (W(28, "Haro"), "pop", -14), (W(29, "Rosario"), "pop", -14), (W(35, "sheep"), "street", -28, 3, 10),
 (W(38, "4,000"), "pop", -12),
 # ch2: the pig
 (S0(47), "wind", -26, 8), (W(51, "shot") - 0.02, "burst_boom", -10, 1.2), (W(51, "shot") - 0.02, "impact", -5), (W(54, "13"), "pop", -12),
 (W(58, "$10"), "pop", -12), (W(59, "$100"), "impact", -10), (W(63, "made"), "stamp", -7), (W(67, "trespassing"), "stamp", -6),
 (W(69, "arrest"), "clank", -12), (W(72, "army") if False else S0(73), "paper", -12, 1.5),
 # ch3: soldiers and a warship
 (S0(75), "horse", -24, 6), (W(76, "64"), "pop", -12), (S0(78), "harbor", -20, 6), (S0(82), "harbor", -18, 8, 20), (S0(83), "ship_bell", -14),
 (W(87, "Leave"), "impact", -6), (W(89, "Bunker"), "pop", -12), (W(92, "171"), "pop", -12), (W(93, "461"), "pop", -12), (W(93, "14"), "clank", -12),
 (W(95, "2,000"), "rumble", -16, 3),
 # ch4: the admiral
 (S0(102), "harbor", -20, 6, 40), (W(103, "refused"), "impact", -6), (W(103, "refused"), "stamp", -10), (W(106, "Don't"), "pop", -12),
 (W(107, "Don't"), "pop", -12), (W(108, "Hold"), "pop", -12), (S0(109), "riser", -18, 3.5, 19.0), (S0(113), "wind", -24, 6),
 # ch5: six weeks away
 (W(116, "telegraph"), "stamp", -10), (S0(117), "harbor", -22, 5, 80), (W(118, "September") if False else S0(118), "paper", -12, 1.5),
 (W(124, "Winfield"), "pop", -12), (W(127, "shocking") if False else S0(127), "paper", -12, 1.5), (W(128, "6"), "ship_bell", -16),
 (W(130, "letters"), "paper", -12, 2.0), (W(134, "agreed"), "stamp", -6), (W(135, "rebuked"), "stamp", -7),
 # ch6: the friendliest occupation
 (S0(136), "horse", -24, 5, 10), (W(141, "13"), "pop", -12), (S0(144), "wind", -26, 6), (S0(148), "street", -26, 6, 30),
 (S0(150), "kids", -26, 5), (W(151, "horse"), "horse", -18, 3, 20), (S0(155), "rumble", -16, 4), (W(159, "Pickett's"), "impact", -6),
 # ch7: the Kaiser
 (W(163, "Treaty"), "paper", -10, 1.6), (W(169, "compromise"), "stamp", -10), (W(170, "appeal"), "stamp", -10),
 (W(175, "ruling"), "gavel", -8, 1.2), (W(176, "Haro"), "whoosh", -10, 1.0), (W(177, "United"), "pop", -10), (S0(178), "wind", -24, 5),
 # ending
 (W(181, "1859"), "pop", -14), (W(182, "13"), "pop", -14), (W(183, "2"), "pop", -14), (W(184, "2,000"), "pop", -14),
 (W(186, "1"), "impact", -6), (W(186, "pig"), "stamp", -8), (S0(188), "street", -28, 5, 60), (W(192, "border"), "whoosh", -10, 1.0),
 (S0(193), "wind", -24, 5),
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
sub = subprocess.run(["ffmpeg", "-v", "error", "-y", "-f", "f32le", "-ac", "2", "-ar", str(SR), "-i", "-", "/home/claude/work/mix.wav"], input=mix.astype(np.float32).tobytes(), check=True)
sp = g > 0.9
def rms(x, m): return 20*np.log10(np.sqrt((x[m]**2).mean())+1e-9)
print("voice in speech", round(rms(out_v, sp),1), "music in speech", round(rms(music, sp),1), "music in gaps", round(rms(music, ~sp),1), "voice in gaps", round(rms(out_v, ~sp),1))
for a,b,name in [(0,CH['ch1'],'cold open'),(CH['ch2'],CH['ch3'],'pig'),(CH['ch3'],CH['ch5'],'standoff'),(CH['ch6'],CH['ch7'],'camps'),(CH['end'],TOTAL,'ending')]:
    m=np.zeros(N,bool); m[int(a*SR):int(b*SR)]=True
    print(name, 'voice', round(rms(out_v, m&sp),1), 'music', round(rms(music, m&sp),1), 'sfx', round(rms(sfx, m),1))
