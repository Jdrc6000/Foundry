import sys
from pathlib import Path

# very dirty past-josh, very dirty indeed...
sys.path.insert(0, str(Path("/path/to/local/anvil/install")))

# the dirty fix above (lookin at you past-josh) will cover this up at runtime, so do not fret
from build_html import build

BASE_DIR = Path(__file__).parent
posts_dir = BASE_DIR / "posts"

finished = [line for line in build(posts_dir)]
for line in finished:
    print(line)

print("Built all files")