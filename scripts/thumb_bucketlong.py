# Builds the War of the Bucket long-form thumbnail (1280 x 720) from the BucketThumb still:
#   node scripts/stills.mjs BucketThumb 1 4 <dir>   then   python3 scripts/thumb_bucketlong.py <dir>/f0004.jpg out.jpg
# One scene (Modena's bucket on its chain, big, at the left) plus a two-line headline on the right.
# Bottom-right stays clear for the duration badge.
import sys, os
from PIL import Image, ImageDraw, ImageFont, ImageFilter, ImageEnhance
src, out = sys.argv[1], sys.argv[2]
CANDS = [sys.argv[3]] if len(sys.argv) > 3 else ["/usr/share/fonts/truetype/google-fonts/Poppins-Bold.ttf", "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"]
FONT = next(f for f in CANDS if os.path.exists(f))
INK, GOLD = (20, 16, 34), (255, 214, 64)
im = Image.open(src).convert("RGB").resize((1920, 1080), Image.LANCZOS)
im = ImageEnhance.Brightness(im).enhance(1.12); im = ImageEnhance.Color(im).enhance(1.15); im = ImageEnhance.Contrast(im).enhance(1.08)
lines = [("WAR OVER", (255, 255, 255), 230), ("A BUCKET?", GOLD, 420)]
f = ImageFont.truetype(FONT, 168); x0 = 1850
sh = Image.new("RGBA", im.size, (0, 0, 0, 0)); ds = ImageDraw.Draw(sh)
for w, c, y in lines: ds.text((x0 + 8, y + 14), w, font=f, fill=(0, 0, 0, 170), anchor="rm", stroke_width=22, stroke_fill=(0, 0, 0, 170))
b = sh.filter(ImageFilter.GaussianBlur(4)); im.paste(b, (0, 0), b)
d = ImageDraw.Draw(im)
for w, c, y in lines: d.text((x0, y), w, font=f, fill=c, anchor="rm", stroke_width=20, stroke_fill=INK)
im.resize((1280, 720), Image.LANCZOS).save(out, quality=93)
