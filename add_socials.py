import os
import shutil

FB_URL = "https://www.facebook.com/profile.php?id=61588740009580"
LI_URL = "https://www.linkedin.com/in/jacek-grodnicki-0a68a7170"

# Blok HTML z wbudowanymi SVG i stylem
SOCIALS_HTML = f"""
<!-- TechM8 Social Media Links -->
<style>
  .techm8-socials {{
    display: flex;
    gap: 15px;
    align-items: center;
    margin-top: 15px;
  }}
  .techm8-socials a {{
    color: inherit;
    text-decoration: none;
    transition: opacity 0.2s ease;
  }}
  .techm8-socials a:hover {{
    opacity: 0.7;
  }}
  .techm8-socials svg {{
    width: 24px;
    height: 24px;
    fill: currentColor;
  }}
</style>
<div class="techm8-socials">
  <a href="{FB_URL}" target="_blank" rel="noopener noreferrer" title="Facebook TechM8">
    <svg viewBox="0 0 24 24"><path d="M9 8H6v4h3v12h5V12h3.642L18 8h-4V6.333C14 5.374 14.5 5 15.5 5H18V0h-3.808C10.592 0 9 1.847 9 5.252V8z"/></svg>
  </a>
  <a href="{LI_URL}" target="_blank" rel="noopener noreferrer" title="LinkedIn Jacek Grodnicki">
    <svg viewBox="0 0 24 24"><path d="M4.98 3.5c0 1.381-1.11 2.5-2.48 2.5s-2.48-1.119-2.48-2.5c0-1.38 1.11-2.5 2.48-2.5s2.48 1.12 2.48 2.5zm.02 4.5h-5v16h5v-16zm7.982 0h-4.968v16h4.969v-8.399c0-4.67 6.029-5.052 6.029 0v8.399h4.988v-10.131c0-7.88-8.922-7.593-11.018-3.714v-2.155z"/></svg>
  </a>
</div>
"""

TARGET_FILES = [
    os.path.join("components", "contact.html"),
    os.path.join("components", "about-brand.html")
]

def apply_socials():
    for rel_path in TARGET_FILES:
        if not os.path.exists(rel_path):
            print(f"[SKIP] Plik nie istnieje: {rel_path}")
            continue

        with open(rel_path, "r", encoding="utf-8") as f:
            content = f.read()

        if "techm8-socials" in content:
            print(f"[INFO] Linki już są w pliku: {rel_path}")
            continue

        # Backup
        shutil.copyfile(rel_path, rel_path + ".bak")

        # Wstawiamy przed </section> lub na końcu pliku
        if "</section>" in content:
            updated = content.replace("</section>", f"{SOCIALS_HTML}\n</section>")
        elif "</footer>" in content:
            updated = content.replace("</footer>", f"{SOCIALS_HTML}\n</footer>")
        else:
            updated = content + f"\n{SOCIALS_HTML}"

        with open(rel_path, "w", encoding="utf-8") as f:
            f.write(updated)

        print(f"[SUCCESS] Zaktualizowano: {rel_path} (backup: {rel_path}.bak)")

if __name__ == "__main__":
    apply_socials()