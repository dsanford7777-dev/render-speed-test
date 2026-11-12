# Builds the 60 Hz long-form thumbnail (1280 x 720) from the HertzThumb still:
#   node scripts/stills.mjs HertzThumb 1 0 <dir>   then   python3 scripts/thumb_hertzlong.py <dir>/f0000.jpg out.jpg
# Adds the two big number boards and the headline. Font: Poppins Bold (pass another .ttf as the third argument).
import sys
from PIL import Image, ImageDraw, ImageFont, ImageFilter
src, out = sys.argv[1], sys.argv[2]
FONT = sys.argv[3] if len(sys.argv) > 3 else "/usr/share/fonts/truetype/google-fonts/Poppins-Bold.ttf"
INK, BLUE, RED, GOLD = (30, 22, 40), (47, 95, 181), (201, 55, 58), (255, 210, 63)
im = Image.open(src).convert("RGB").resize((1920, 1080), Image.LANCZOS)
im = Image.eval(im, lambda v: min(255, int(v * 1.04)))

def board(cx, cy, w, h, col, text, tilt):
    pad = 60
    L = Image.new("RGBA", (w + 2 * pad, h + 2 * pad + 40), (0, 0, 0, 0)); d = ImageDraw.Draw(L)
    d.rounded_rectangle([pad + 10, pad + 22, pad + w + 10, pad + h + 22], 34, fill=(0, 0, 0, 120))          # drop shadow
    d.rounded_rectangle([pad, pad, pad + w, pad + h], 34, fill=col, outline=INK, width=14)
    d.rounded_rectangle([pad + 22, pad + 22, pad + w - 22, pad + h - 22], 20, outline=(255, 255, 255, 70), width=5)
    f = ImageFont.truetype(FONT, int(h * 0.86))
    d.text((pad + w / 2, pad + h / 2 + h * 0.02), text, font=f, fill="white", anchor="mm", stroke_width=14, stroke_fill=INK)
    L = L.rotate(tilt, resample=Image.BICUBIC, expand=True)
    im.paste(L, (int(cx - L.width / 2), int(cy - L.height / 2)), L)

def legs(cx, cy, w, h):
    d = ImageDraw.Draw(im)
    for x in (cx - w * 0.3, cx + w * 0.3): d.line([(x, cy + h / 2 - 10), (x, 1000)], fill=INK, width=20)

for cx, col, t, tilt in ((455, BLUE, "60", 4), (1465, RED, "50", -4)):
    legs(cx, 700, 620, 400); board(cx, 700, 620, 400, col, t, tilt)

# headline, top centre
d = ImageDraw.Draw(im)
f = ImageFont.truetype(FONT, 150)
words = [("NOBODY", GOLD), ("CHOSE THIS", (255, 255, 255))]
gap = 44; ws = [d.textlength(w, font=f) for w, _ in words]; x = (1920 - sum(ws) - gap) / 2
sh = Image.new("RGBA", im.size, (0, 0, 0, 0)); ds = ImageDraw.Draw(sh)
xx = x
for (w, c), wl in zip(words, ws):
    ds.text((xx + 6, 122 + 12), w, font=f, fill=(0, 0, 0, 150), anchor="lm", stroke_width=20, stroke_fill=(0, 0, 0, 150)); xx += wl + gap
im.paste(sh.filter(ImageFilter.GaussianBlur(3)), (0, 0), sh.filter(ImageFilter.GaussianBlur(3)))
d = ImageDraw.Draw(im)
for (w, c), wl in zip(words, ws):
    d.text((x, 122), w, font=f, fill=c, anchor="lm", stroke_width=20, stroke_fill=INK); x += wl + gap
im.resize((1280, 720), Image.LANCZOS).save(out, quality=93)
