# Long-form #1 audio mix: voice + ducked music beds + sound effects anchored to the shot timeline.
# Output: mix.wav (48 kHz stereo) the length of the full video (voice + 8 s end card).
import subprocess, numpy as np, json, sys
SR = 48000
A = "/home/claude/render-speed-test/public/molasseslong/audio/"
VOICE = "/home/claude/render-speed-test/public/molasseslong/voice.mp3"
TOTAL = 20400 / 30  # frames of the composition

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

S = {k: load(A + f"sfx_{k}.mp3") for k in ["burst_steel", "burst_boom", "rivets", "clank", "creak", "creak_beam", "wave", "wave_crash", "collapse",
     "metal_break", "steel_twist", "rumble", "whoosh", "impact", "mud", "mud_run", "splash", "harbor", "ship_bell", "hose", "street", "horse", "wind",
     "kids", "paper", "pop", "riser", "gavel", "stamp"]}
M = {k: load(A + f"{k}.mp3") for k in ["m1_coldopen", "m2_history", "m3_warning", "m4_disaster", "m5_aftermath", "m6_court", "m7_ending"]}

# ---- music beds (start, end, level dB, fade in, fade out, source offset) ----
BEDS = [("m1_coldopen", 0.0, 43.1, -9, 0.3, 2.0, 0), ("m2_history", 43.1, 178.8, -12, 2.0, 2.5, 0),
        ("m3_warning", 178.8, 237.9, -10, 1.5, 2.0, 0), ("m4_disaster", 237.9, 299.6, -10, 2.0, 0.3, 0),
        ("m4_disaster", 307.5, 353.6, -12, 1.0, 2.0, 62), ("m5_aftermath", 353.6, 483.5, -2, 2.5, 2.5, 0),
        ("m6_court", 483.5, 584.6, -12, 2.0, 2.0, 0), ("m7_ending", 584.6, TOTAL, -10, 2.0, 4.0, 0)]
for k, a, b, g, fi, fo, src in BEDS:
    place(music, M[k], a, g, dur=b - a + fo * 0.5, fin=fi, fout=fo, src=src)

# ---- sound effects: (time s, name, gain dB, optional dur, src offset) ----
C = [
 # cold open
 (1.8, "creak", -12, 4), (5.6, "riser", -14, 1.0, 19.0), (6.5, "burst_steel", -4), (6.5, "burst_boom", -3), (8.5, "wave", -8, 3.0),
 (10.3, "whoosh", -6, 1.2), (12.1, "impact", -5), (14.6, "creak_beam", -14, 4), (21.7, "whoosh", -6, 1.2), (24.8, "pop", -12),
 (31.1, "stamp", -6), (33.5, "paper", -10, 2.0), (37.4, "impact", -6), (39.8, "steel_twist", -9, 3.0),
 # 1919 street + harbor
 (43.1, "street", -24, 31), (47.0, "horse", -18, 8), (74.0, "harbor", -20, 16), (76.9, "ship_bell", -14),
 (86.4, "street", -24, 14, 40), (90.4, "horse", -18, 9, 5), (110.6, "paper", -12, 2.0), (115.9, "pop", -12), (132.0, "stamp", -8),
 (166.3, "clank", -10), (171.7, "pop", -12),
 # warning signs
 (178.8, "wind", -26, 10), (182.1, "creak", -12, 5), (189.8, "street", -25, 7, 80), (197.0, "kids", -22, 6), (200.8, "creak_beam", -10, 6),
 (215.0, "clank", -12), (226.8, "creak", -14, 3.5, 8),
 # the day
 (237.9, "wind", -18, 15, 10), (252.8, "harbor", -22, 12, 60), (280.5, "creak_beam", -10, 5, 15), (287.8, "street", -24, 4.5, 120),
 (292.3, "kids", -22, 3, 60), (294.9, "rumble", -10, 4.8), (297.5, "riser", -14, 2.2, 18.0), (299.7, "rivets", -6, 5.5),
 (305.2, "burst_steel", -2), (305.2, "burst_boom", -1), (307.9, "wave", -4, 5), (312.3, "wave_crash", -8, 6), (318.1, "wave", -5, 6, 20),
 (324.2, "metal_break", -8, 6), (330.9, "steel_twist", -7, 3), (333.9, "collapse", -5), (336.3, "collapse", -7), (339.3, "collapse", -5),
 (339.6, "metal_break", -12, 4, 30), (346.1, "splash", -6, 3),
 # aftermath
 (353.6, "wind", -26, 14, 25), (367.6, "mud", -12, 6), (386.4, "mud", -14, 4, 8), (390.2, "mud_run", -12, 4), (394.0, "mud", -12, 4.5, 14),
 (398.6, "impact", -8), (407.5, "horse", -20, 3), (416.6, "pop", -12), (420.1, "mud_run", -12, 4.5, 8), (432.0, "pop", -12),
 (434.6, "harbor", -20, 9, 120), (437.0, "ship_bell", -18), (444.2, "hose", -12, 3.0), (447.3, "hose", -10, 3.8, 10), (451.1, "mud", -14, 3.4, 4),
 (454.5, "street", -26, 4, 150),
 # who's to blame
 (487.7, "pop", -12), (492.3, "stamp", -6), (496.3, "gavel", -8, 1.2), (505.6, "pop", -12), (510.6, "paper", -10, 2.0), (514.2, "paper", -12, 1.6, 6),
 (526.7, "gavel", -9, 1.2, 4), (534.4, "pop", -12), (549.7, "gavel", -9, 1.2, 8), (563.5, "stamp", -5), (576.2, "pop", -12),
 # today
 (614.6, "street", -26, 8, 20), (622.6, "street", -24, 14, 60), (637.4, "kids", -20, 19, 100), (656.9, "creak", -16, 5, 4),
 (662.0, "wave", -8, 4.5), (666.5, "impact", -7),
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
for a,b,name in [(0,43,'cold open'),(43,178,'history'),(300,353,'flood'),(353,483,'aftermath'),(584,672,'ending')]:
    m=np.zeros(N,bool); m[int(a*SR):int(b*SR)]=True
    print(name, 'voice', round(rms(out_v, m&sp),1), 'music', round(rms(music, m&sp),1), 'sfx', round(rms(sfx, m),1))
