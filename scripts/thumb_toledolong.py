# Builds the Toledo War long-form thumbnail (1280 x 720) from the ToledoThumb still:
#   node scripts/stills.mjs ToledoThumb 1 4 <dir>   then   python3 scripts/thumb_toledolong.py <dir>/f0004.jpg out.jpg
# One scene (the two militias face to face in Toledo's street) plus a two-line headline on the left.
# two-line headline on the left. Bottom-right stays clear for the duration badge.
import sys, os
from PIL import Image, ImageDraw, ImageFont, ImageFilter, ImageEnhance
src, out = sys.argv[1], sys.argv[2]
CANDS = [sys.argv[3]] if len(sys.argv) > 3 else ["/usr/share/fonts/truetype/google-fonts/Poppins-Bold.ttf", "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"]
FONT = next(f for f in CANDS if os.path.exists(f))
INK, GOLD = (20, 16, 34), (255, 214, 64)
im = Image.open(src).convert("RGB").resize((1920, 1080), Image.LANCZOS)
im = ImageEnhance.Brightness(im).enhance(1.12); im = ImageEnhance.Color(im).enhance(1.15); im = ImageEnhance.Contrast(im).enhance(1.08)
lines = [("LOST TOLEDO", (255, 255, 255), 190), ("GOT RICH", GOLD, 370)]
f = ImageFont.truetype(FONT, 168); x0 = 70
sh = Image.new("RGBA", im.size, (0, 0, 0, 0)); ds = ImageDraw.Draw(sh)
for w, c, y in lines: ds.text((x0 + 8, y + 14), w, font=f, fill=(0, 0, 0, 170), anchor="lm", stroke_width=22, stroke_fill=(0, 0, 0, 170))
b = sh.filter(ImageFilter.GaussianBlur(4)); im.paste(b, (0, 0), b)
d = ImageDraw.Draw(im)
for w, c, y in lines: d.text((x0, y), w, font=f, fill=c, anchor="lm", stroke_width=20, stroke_fill=INK)
im.resize((1280, 720), Image.LANCZOS).save(out, quality=93)
