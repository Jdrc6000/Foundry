import sys
from pathlib import Path

# very dirty past-josh, very dirty indeed...
sys.path.insert(0, str(Path("/path/to/local/anvil/install")))

# the dirty fix above (lookin at you past-josh) will cover this up at runtime, so do not fret
from src.lexer.lexer import Lexer
from src.parser.parser import Parser
from src.generator.html_generator import Generator

posts_dir = Path(__file__).parent / "posts"
for md_file in posts_dir.glob("*.md"):
    text = md_file.read_text()
    tokens = Lexer(text).get_tokens()
    tree = Parser(tokens).parse()
    html = Generator(tree).generate()
    md_file.with_suffix(".html").write_text(html)
    print(f"Built {md_file.stem}.html")