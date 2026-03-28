#!/usr/bin/env python3
"""
Genera favicon.ico (16x16, 32x32, 48x48), favicon-16x16.png, favicon-32x32.png
i apple-touch-icon.png (180x180) a partir de la imatge de l'escut blau.
"""
from PIL import Image
import os

# Rutes
SRC = "/home/ubuntu/webdev-static-assets/favicon-shield-512.png"
OUT_DIR = "/home/ubuntu/consultasit/client/public"

os.makedirs(OUT_DIR, exist_ok=True)

# Obrir la imatge original (fons blanc, cal eliminar-lo per tenir transparència)
img = Image.open(SRC).convert("RGBA")

# Eliminar el fons blanc (píxels molt clars → transparents)
dades = img.getdata()
nous_dades = []
for pixel in dades:
    r, g, b, a = pixel
    # Si el píxel és molt clar (quasi blanc), fer-lo transparent
    if r > 230 and g > 230 and b > 230:
        nous_dades.append((255, 255, 255, 0))
    else:
        nous_dades.append(pixel)
img.putdata(nous_dades)

# favicon-16x16.png
img_16 = img.resize((16, 16), Image.LANCZOS)
img_16.save(os.path.join(OUT_DIR, "favicon-16x16.png"), "PNG")
print("✓ favicon-16x16.png")

# favicon-32x32.png
img_32 = img.resize((32, 32), Image.LANCZOS)
img_32.save(os.path.join(OUT_DIR, "favicon-32x32.png"), "PNG")
print("✓ favicon-32x32.png")

# favicon.ico (multi-resolució: 16, 32, 48)
img_48 = img.resize((48, 48), Image.LANCZOS)
img.resize((16, 16), Image.LANCZOS).save(
    os.path.join(OUT_DIR, "favicon.ico"),
    format="ICO",
    sizes=[(16, 16), (32, 32), (48, 48)]
)
print("✓ favicon.ico (16x16, 32x32, 48x48)")

# apple-touch-icon.png (180x180, fons blanc per a iOS)
apple_bg = Image.new("RGBA", (180, 180), (255, 255, 255, 255))
img_180 = img.resize((160, 160), Image.LANCZOS)
# Centrar l'escut sobre fons blanc
offset = ((180 - 160) // 2, (180 - 160) // 2)
apple_bg.paste(img_180, offset, img_180)
apple_bg = apple_bg.convert("RGB")
apple_bg.save(os.path.join(OUT_DIR, "apple-touch-icon.png"), "PNG")
print("✓ apple-touch-icon.png (180x180)")

print("\nTots els favicons generats correctament a:", OUT_DIR)
