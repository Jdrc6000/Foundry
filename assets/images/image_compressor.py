import os
from pathlib import Path
from PIL import Image

QUALITY = 82 # (75-85 is the sweet spot for web)
MAX_WIDTH = 1920
MAX_HEIGHT = 1920
SUPPORTED = {".jpg", ".jpeg", ".png", ".gif", ".bmp", ".tiff", ".webp"}

def compress_image(src_path: Path, out_dir: Path):
    with Image.open(src_path) as img:
        original_size = src_path.stat().st_size

        # Convert palette/RGBA images cleanly
        if img.mode in ("P", "RGBA") and src_path.suffix.lower() not in (".png",):
            img = img.convert("RGB")
        elif img.mode == "P":
            img = img.convert("RGBA")

        # Resize if larger than max dimensions (keeps aspect ratio)
        img.thumbnail((MAX_WIDTH, MAX_HEIGHT), Image.LANCZOS)

        ext = src_path.suffix.lower()
        out_path = out_dir / src_path.name

        save_kwargs = {}
        if ext in (".jpg", ".jpeg"):
            save_kwargs = {"quality": QUALITY, "optimize": True, "progressive": True}
            if img.mode == "RGBA":
                img = img.convert("RGB")
            img.save(out_path, "JPEG", **save_kwargs)
        elif ext == ".png":
            save_kwargs = {"optimize": True, "compress_level": 9}
            img.save(out_path, "PNG", **save_kwargs)
        elif ext == ".webp":
            img.save(out_path, "WEBP", quality=QUALITY, method=6)
        else:
            # Convert anything else to JPEG
            out_path = out_path.with_suffix(".jpg")
            if img.mode == "RGBA":
                img = img.convert("RGB")
            img.save(out_path, "JPEG", quality=QUALITY, optimize=True, progressive=True)

        new_size = out_path.stat().st_size
        saved_pct = (1 - new_size / original_size) * 100

        return original_size, new_size, saved_pct

script_dir = Path(__file__).parent

images = [
    f for f in script_dir.iterdir()
    if f.is_file() and f.suffix.lower() in SUPPORTED
]

if not images:
    print("No images found in the script's directory.")
    exit(0)

print(f"Found {len(images)} image(s). Compressing...\n")

total_original = 0
total_new = 0

for img_path in sorted(images):
    try:
        orig, new, pct = compress_image(img_path, script_dir)
        total_original += orig
        total_new += new
        status = f"↓ {pct:.1f}%" if pct > 0 else f"↑ {abs(pct):.1f}% (already small)"
        print(f"  {img_path.name:<40} {orig/1024:>7.1f} KB → {new/1024:>7.1f} KB  {status}")
    except Exception as e:
        print(f"[error] {img_path.name}: {e}")

total_saved = (1 - total_new / total_original) * 100 if total_original else 0
print(f"\n{'─'*65}")
print(f"  Total: {total_original/1024:.1f} KB → {total_new/1024:.1f} KB  "
    f"(saved {total_saved:.1f}%)")
print(f"\nOptimized images saved to: {script_dir}/")