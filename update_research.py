import os
import re
import time
import requests
from dotenv import load_dotenv
from google import genai
from google.genai import types

load_dotenv()

TARGET_DIR = r"C:\Users\wi3lk\Documents\GitHub\3en4all.github.io\research"
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
UNSPLASH_KEY = os.getenv("UNSPLASH_ACCESS_KEY")

if not GEMINI_API_KEY:
    raise ValueError("BRAK GEMINI_API_KEY w pliku .env!")

client = genai.Client(api_key=GEMINI_API_KEY)

def fetch_unsplash_image(query: str) -> str:
    if not UNSPLASH_KEY:
        return "https://images.unsplash.com/photo-1518770660439-4636190af475?w=800"
    
    url = "https://api.unsplash.com/search/photos"
    params = {"query": query, "per_page": 1, "orientation": "landscape"}
    headers = {"Authorization": f"Client-ID {UNSPLASH_KEY}"}
    
    try:
        res = requests.get(url, params=params, headers=headers, timeout=10)
        if res.status_code == 200:
            data = res.json()
            if data.get("results"):
                return data["results"][0]["urls"]["regular"]
    except Exception as e:
        print(f"[!] Błąd Unsplash '{query}': {e}", flush=True)
    
    return "https://images.unsplash.com/photo-1518770660439-4636190af475?w=800"

def process_image_placeholders(text: str) -> str:
    pattern = r"\[\[IMAGE:\s*(.*?)\]\]"
    matches = re.findall(pattern, text)
    
    for match in matches:
        query = match.strip()
        img_url = fetch_unsplash_image(query)
        markdown_img = f"\n\n![{query}]({img_url})\n*Fot. {query}*\n"
        text = text.replace(f"[[IMAGE: {match}]]", markdown_img)
        text = text.replace(f"[[IMAGE:{match}]]", markdown_img)
        
    return text

def enrich_research_file(file_path: str):
    print(f"[+] Przetwarzanie pliku: {os.path.basename(file_path)}", flush=True)
    
    with open(file_path, "r", encoding="utf-8") as f:
        original_content = f.read()

    prompt = f"""
Przeanalizuj poniższą treść pliku researchowego:
---
{original_content}
---

ZADANIE:
1. Przeanalizuj kluczowe pojęcia, tezy i luki w powyższym tekście.
2. Przeszukaj internet (wykorzystaj Google Search) w poszukiwaniu NISZOWYCH, ale w 100% REALNYCH, udokumentowanych, technicznych lub naukowych faktów/case study związanych z tematem. Unikaj banałów.
3. Znacznie poszerz i rozbuduj oryginalny content. Zachowaj oryginalny język/format pliku, ale dodaj konkretne sekcje z nowymi ustaleniami, linkami/źródłami, kodem lub architekturą jeśli dotyczy.
4. W miejscach, gdzie wizualizacja wzbogaci treść, wstaw specjalny tag obrazka w formacie: [[IMAGE: angielskie_slowa_kluczowe_do_wyszukiwania]]. Wstaw co najmniej 2-3 takie tagi w całym tekście.

Zwróć TYLKO nową, pełną, ulepszoną treść w formacie Markdown.
"""

    max_retries = 3
    for attempt in range(max_retries):
        try:
            chat = client.chats.create(
                model="gemini-2.0-flash",
                config=types.GenerateContentConfig(
                    tools=[types.Tool(google_search=types.GoogleSearch())],
                    temperature=0.3,
                )
            )
            
            response = chat.send_message(prompt)
            enriched_text = response.text
            final_content = process_image_placeholders(enriched_text)
            
            with open(file_path, "w", encoding="utf-8") as f:
                f.write(final_content)
                
            print(f"[SUCCESS] Zaktualizowano: {os.path.basename(file_path)}", flush=True)
            break

        except Exception as e:
            err_msg = str(e)
            if "429" in err_msg or "RESOURCE_EXHAUSTED" in err_msg:
                print(f"[!] Limit zapytań (429). Czekam 15s... (Próba {attempt + 1}/{max_retries})", flush=True)
                time.sleep(15)
            else:
                print(f"[ERROR] Błąd przetwarzania pliku {os.path.basename(file_path)}: {e}", flush=True)
                break

def main():
    if not os.path.exists(TARGET_DIR):
        print(f"[!] Ścieżka nie istnieje: {TARGET_DIR}", flush=True)
        return

    valid_exts = (".md", ".txt", ".markdown")
    all_files = os.listdir(TARGET_DIR)
    files = [os.path.join(TARGET_DIR, f) for f in all_files if f.lower().endswith(valid_exts)]
    
    if not files:
        print(f"[!] Brak plików w folderze {TARGET_DIR}", flush=True)
        return

    print(f"[>] Znaleziono plików: {len(files)}. Rozpoczynanie...", flush=True)
    for file_path in files:
        enrich_research_file(file_path)
        time.sleep(3)

if __name__ == "__main__":
    main()