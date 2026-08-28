import os
from pathlib import Path

# Katalogi i rozszerzenia do całkowitego zignorowania
EXCLUDE_DIRS = {
    '.git', 'node_modules', '.next', 'dist', 
    'build', '__pycache__', '.venv', 'venv'
}

EXCLUDE_EXTS = {
    '.png', '.jpg', '.jpeg', '.gif', '.ico', 
    '.svg', '.woff', '.woff2', '.ttf', '.eot',
    '.zip', '.tar', '.gz', '.pdf', '.exe', '.db'
}

OUTPUT_FILE = 'project_dump.txt'
ROOT_DIR = Path('.')

def should_skip(path: Path) -> bool:
    if any(part in EXCLUDE_DIRS for part in path.parts):
        return True
    if path.suffix.lower() in EXCLUDE_EXTS:
        return True
    return False

def generate_dump():
    with open(OUTPUT_FILE, 'w', encoding='utf-8') as out:
        for file_path in ROOT_DIR.rglob('*'):
            if file_path.is_file() and not should_skip(file_path):
                if file_path.name == OUTPUT_FILE or file_path.name == 'dump.py':
                    continue
                try:
                    content = file_path.read_text(encoding='utf-8', errors='replace')
                    out.write(f"=== FILE: {file_path} ===\n")
                    out.write(content)
                    out.write("\n\n" + "="*40 + "\n\n")
                except Exception as e:
                    out.write(f"=== FILE: {file_path} (ERROR READING: {e}) ===\n\n")

if __name__ == '__main__':
    generate_dump()
    print(f"Gotowe! Plik {OUTPUT_FILE} został utworzony.")