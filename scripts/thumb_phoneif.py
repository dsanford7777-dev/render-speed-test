# Builds the 1850 phone "what if" thumbnail (1280 x 720) from the PhoneThumb still:
#   node scripts/stills.mjs PhoneThumb 1 0 <dir>   then   python3 scripts/thumb_phoneif.py <dir>/f0000.jpg out.jpg
# One scene (the viewer in his red cap, shocked, phone in hand, on the 1850 wharf) plus a headline. Bottom-right stays clear
# for the duration badge. Font: Poppins Bold if installed (pass another .ttf as the third argument).
import sys, os
from PIL import Image, ImageDraw, ImageFont, ImageFilter, ImageEnhance
src, out = sys.argv[1], sys.argv[2]
CANDS = [sys.argv[3]] if len(sys.argv) > 3 else ["/usr/share/fonts/truetype/google-fonts/Poppins-Bold.ttf", "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"]
FONT = next(f for f in CANDS if os.path.exists(f))
INK, GOLD = (20, 16, 34), (255, 214, 64)
im = Image.open(src).convert("RGB").resize((1920, 1080), Image.LANCZOS)
im = ImageEnhance.Brightness(im).enhance(1.22); im = ImageEnhance.Color(im).enhance(1.15); im = ImageEnhance.Contrast(im).enhance(1.06)
words = [("NO", (255, 255, 255)), ("BARS", GOLD)]
f = ImageFont.truetype(FONT, 230); d = ImageDraw.Draw(im)
gap = 56; ws = [d.textlength(w, font=f) for w, _ in words]; x0 = 70; y = 150
sh = Image.new("RGBA", im.size, (0, 0, 0, 0)); ds = ImageDraw.Draw(sh); x = x0
for (w, c), wl in zip(words, ws): ds.text((x + 8, y + 14), w, font=f, fill=(0, 0, 0, 170), anchor="lm", stroke_width=24, stroke_fill=(0, 0, 0, 170)); x += wl + gap
b = sh.filter(ImageFilter.GaussianBlur(4)); im.paste(b, (0, 0), b)
d = ImageDraw.Draw(im); x = x0
for (w, c), wl in zip(words, ws): d.text((x, y), w, font=f, fill=c, anchor="lm", stroke_width=22, stroke_fill=INK); x += wl + gap
im.resize((1280, 720), Image.LANCZOS).save(out, quality=93)
# the year, in a red pill under the headline
d = ImageDraw.Draw(im); f2 = ImageFont.truetype(FONT, 120); tw = d.textlength("1850", font=f2)
d.rounded_rectangle([x0, 300, x0 + tw + 70, 450], radius=22, fill=(201, 55, 58), outline=INK, width=10)
d.text((x0 + 35, 375), "1850", font=f2, fill=(255, 255, 255), anchor="lm")
im.resize((1280, 720), Image.LANCZOS).save(out, quality=93)
