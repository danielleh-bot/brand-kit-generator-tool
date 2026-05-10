#!/usr/bin/env python3
"""Bundle index.html + styles.css + src/*.js + app.js into a single
self-contained studio.html that can be opened with no server (file:// works).

Run: python3 build.py
"""
import re
import pathlib

ROOT = pathlib.Path(__file__).parent

def strip_module_syntax(text: str) -> str:
    text = re.sub(r'^\s*import\s+.*?;\s*\n', '', text, flags=re.MULTILINE)
    text = re.sub(r'^\s*export\s+', '', text, flags=re.MULTILINE)
    return text

def main() -> None:
    index_html = (ROOT / "index.html").read_text()
    styles_css = (ROOT / "styles.css").read_text()

    # Concatenate JS in dependency order.
    pieces = []
    for rel in ("src/utils.js", "src/css.js", "src/prototype.js", "app.js"):
        body = (ROOT / rel).read_text()
        pieces.append(f"// ---------- {rel} ----------\n{strip_module_syntax(body)}")
    bundled_js = "\n\n".join(pieces)

    out = index_html.replace(
        '<link rel="stylesheet" href="./styles.css" />',
        f'<style>\n{styles_css}\n</style>'
    ).replace(
        '<script src="./app.js" type="module"></script>',
        f'<script>\n{bundled_js}\n</script>'
    )

    target = ROOT / "studio.html"
    target.write_text(out)
    print(f"wrote {target} ({len(out):,} bytes)")

if __name__ == "__main__":
    main()
