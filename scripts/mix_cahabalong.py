# Long-form #8 (Cahaba bridge wreck) audio mix: voice + ducked music beds + a few effects anchored to the shot timeline.
# Output: public/cahabalong/mix.m4a (voice + 8 s end card), -15 LUFS. Same YouTube Audio Library files as long-form #1.
#   python3 scripts/mix_cahabalong.py   (run from the repo root after the timeline is aligned)
import subprocess, numpy as np, json, re, math, os
SR = 48000
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
A = ROOT + "/public/molasseslong/audio/"
VOICE = ROOT + "/public/cahabalong/voice.mp3"
_ts = open(ROOT + "/src/videos/cahabalong/timeline.ts").read()
ST = json.loads(re.search(r"export const SEG_TIMES: \[number, number\]\[\] = (\[.*?\]);", _ts, re.S).group(1))
WD = json.loads(re.search(r"export const WORDS: Word\[\] \| null = (\[.*?\]);\n", _ts, re.S).group(1))
VOICE_END = math.ceil((ST[-1][1] + 0.6) * 30)
TOTAL = (VOICE_END + 8 * 30) / 30
def norm(w): return re.sub(r"\.+$", "", re.sub(r"[^\w.]", "", w.lower()))
def W(seg, w):
    ws = [x for x in WD if x["seg"] == seg]; k = norm(w)
    hit = next((x for x in ws if norm(x["w"]) == k), None) or next((x for x in ws if norm(x["w"]).startswith(k)), None)
    return hit["s"] if hit else (ST[seg][0] + ST[seg][1]) / 2
def S0(seg): return ST[seg][0]
SHOTS = [(g, (W(int(s), json.loads(w)) if w != "null" else S0(int(s)))) for s, w, g in re.findall(r'\{ s: (\d+), w: (null|"[^"]*"), k: "\dd", g: "([^"]+)" \}', _ts)]
def load(path):
    raw = subprocess.run(["ffmpeg", "-v", "error", "-i", path, "-f", "f32le", "-ac", "2", "-ar", str(SR), "-"], capture_output=True, check=True).stdout
    return np.frombuffer(raw, np.float32).reshape(-1, 2).copy()
def db(x): return 10 ** (x / 20)
N = int(TOTAL * SR)
voice = load(VOICE)[:N]
out_v = np.zeros((N, 2), np.float32); out_v[:len(voice)] = voice
music = np.zeros((N, 2), np.float32); sfx = np.zeros((N, 2), np.float32)
def place(buf, clip, t, gain_db=0.0, dur=None, fin=0.01, fout=0.15, src=0.0):
    c = clip[int(src * SR):]
    if dur is not None: c = c[:int(dur * SR)]
    c = c * db(gain_db); n = len(c)
    if n == 0: return
    env = np.ones(n, np.float32); a, b = int(fin * SR), int(fout * SR)
    if a: env[:min(a, n)] = np.linspace(0, 1, min(a, n))
    if b: env[-min(b, n):] *= np.linspace(1, 0, min(b, n))
    c = c * env[:, None]; i = int(t * SR)
    if i >= N: return
    m = min(n, N - i); buf[i:i + m] += c[:m]
M = {k: load(A + f"{k}.mp3") for k in ["m1_coldopen", "m2_history", "m3_warning", "m4_disaster", "m5_aftermath", "m6_court", "m7_ending"]}
S = {k: load(A + f"sfx_{k}.mp3") for k in ["collapse", "splash", "whoosh", "impact", "paper", "stamp", "rumble", "metal_break"]}
CH = {k: S0(i) for k, i in [("ch1", 8), ("ch2", 15), ("ch3", 26), ("ch4", 34), ("ch5", 43), ("ch6", 51), ("ch7", 57), ("end", 65)]}
BEDS = [("m1_coldopen", 0.0, CH["ch1"], -11, 0.2, 2.0, 0), ("m2_history", CH["ch1"], CH["ch2"], -12, 2.0, 2.5, 0), ("m3_warning", CH["ch2"], CH["ch3"], -12, 2.0, 2.0, 0),
        ("m5_aftermath", CH["ch3"], CH["ch4"], -10, 2.0, 2.5, 0), ("m4_disaster", CH["ch4"], CH["ch5"], -12, 2.0, 2.5, 0), ("m6_court", CH["ch5"], CH["ch6"], -12, 2.0, 2.0, 0),
        ("m3_warning", CH["ch6"], CH["ch7"], -12, 2.0, 2.0, 40), ("m6_court", CH["ch7"], CH["end"], -12, 2.0, 2.5, 30), ("m7_ending", CH["end"], TOTAL, -10, 1.5, 4.0, 100)]
for k, a, b, g, fi, fo, src in BEDS: place(music, M[k], a, g, dur=b - a + fo * 0.5, fin=fi, fout=fo, src=src)
FX = {"gave": ("collapse", -8, 4.0), "drop": ("metal_break", -10, 2.5), "splash": ("splash", -8, 3.0), "did": ("whoosh", -12, None), "everyone": ("paper", -10, 2.0), "reward": ("stamp", -10, None), "wheels": ("rumble", -12, 2.0), "burn": ("rumble", -14, 3.0)}
for g, t in SHOTS:
    if g in FX: k, gain, dur = FX[g]; place(sfx, S[k], t + (0.6 if g == "gave" else 0.05), gain, dur=dur, fin=0.02, fout=0.5)
v = np.abs(out_v).max(axis=1); win = int(0.05 * SR)
env = np.convolve(v, np.ones(win) / win, mode="same"); speech = (env > 0.02).astype(np.float32)
k_att, k_rel = 1 - np.exp(-1 / (0.06 * SR)), 1 - np.exp(-1 / (0.4 * SR))
g = np.empty_like(speech); s = 0.0
for i in range(0, len(speech), 240):
    target = speech[i:i + 240].max(); s += ((k_att if target > s else k_rel) * 240) * (target - s); s = min(max(s, 0.0), 1.0); g[i:i + 240] = s
music *= (1.0 - g * (1 - db(-9)))[:, None]
mix = out_v + music + sfx; peak = float(np.abs(mix).max())
mix = np.tanh(mix * 1.1) / np.tanh(1.1) if peak > 0.98 else mix
mix = mix * (0.93 / max(0.93, float(np.abs(mix).max())))
os.makedirs("/tmp/cl", exist_ok=True)
subprocess.run(["ffmpeg", "-v", "error", "-y", "-f", "f32le", "-ac", "2", "-ar", str(SR), "-i", "-", "/tmp/cl/mix.wav"], input=mix.astype(np.float32).tobytes(), check=True)
subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", "/tmp/cl/mix.wav", "-af", "loudnorm=I=-15:TP=-1.5:LRA=11", "-ar", "48000", "-c:a", "aac", "-b:a", "192k", ROOT + "/public/cahabalong/mix.m4a"], check=True)
sp = g > 0.9
def rms(x, m): return 20 * np.log10(np.sqrt((x[m] ** 2).mean()) + 1e-9)
print("total", round(TOTAL, 1), "peak", round(peak, 3), "voice", round(rms(out_v, sp), 1), "music under voice", round(rms(music, sp), 1), "music in gaps", round(rms(music, ~sp), 1), "shots", len(SHOTS))
