from pathlib import Path

main_path = Path("/Users/joshuacarter/Desktop/Coding/Code Vault/projects/foundry")
txt_path = main_path / "vibe-coded.txt"

full = ""
total_loc = 0

included_extensions = (".py", ".html", ".css", ".js")

for file_path in sorted(main_path.rglob("*")):  # get all files
    if file_path.suffix.lower() not in included_extensions:
        continue  # skip files not in the list
    if file_path.name == txt_path.name or file_path.name == "vibe-coder.py" or file_path.name == "__init__.py":
        continue
    if any(part == ".venv" for part in file_path.parts):
        continue

    content_text = file_path.read_text(encoding="utf-8")
    
    content = f"--- {file_path.relative_to(main_path)} ---\n{content_text}\n\n"

    current_loc = content_text.count("\n") + 1
    full += content
    total_loc += current_loc

    print(f"({file_path.parent.name}) {file_path.name} LOC: {current_loc}")

print(f"LOC: {total_loc}")

txt_path.write_text(full, encoding="utf-8")