import asyncio
import httpx
from bs4 import BeautifulSoup
from telegram import InlineKeyboardButton, InlineKeyboardMarkup, Update
from telegram.ext import Application, CallbackQueryHandler, ContextTypes

# ==========================================
# KONFIGURACJA MASTA BLASTA
# ==========================================
TELEGRAM_BOT_TOKEN = "8681108597:AAGksuGZ-oerGt-q9LO0AyNbuBLsiSzzbyk"
TELEGRAM_CHAT_ID = "8939198312"

FB_PAGE_ID = "100080800768994"  # Twój wyciągnięty Page ID
FB_ACCESS_TOKEN = "EAAsBq2TfiBABSdgyb2O2gg6pQkr1fW4YLnFlTxD0QRC7NIFSIINRET3RpAsSKiee0XlumNdp857Y8CjxF3NgAZBbDEl297QKXZBQ0jVn37bbZABfZAJw2FtJfZAj9QJqnMlkiNQKMMepujZAjZBQ5ZBArtZCkkiEZBDUZA3ofcx8Y7bBuyczXZCZAP2pYIi110hvaPj4u957L2QEQyH79X2TLoCcWZBKZAUTgtlbvFz0F3C18OwJVJs"

# Źródła RSS / Portale (PL + Świat)
SOURCES = [
    {"name": "Niebezpiecznik", "url": "https://niebezpiecznik.pl/feed/"},
    {"name": "Sekurak", "url": "https://sekurak.pl/feed/"},
    {"name": "Bankier", "url": "https://www.bankier.pl/rss/wiadomosci.xml"},
    {"name": "NYT Tech", "url": "https://rss.nytimes.com/services/xml/rss/nyt/Technology.xml"}
]

# Pamięć tymczasowa wygenerowanego posta
PENDING_POST = {"text": "", "url": ""}

async def fetch_latest_news():
    """Pobiera najnowszy news z zdefiniowanych źródeł."""
    async with httpx.AsyncClient(timeout=10.0) as client:
        for src in SOURCES:
            try:
                r = await client.get(src["url"])
                if r.status_code == 200:
                    soup = BeautifulSoup(r.text, "xml")
                    item = soup.find("item")
                    if item:
                        title = item.find("title").text.strip()
                        link = item.find("link").text.strip()
                        return src["name"], title, link
            except Exception as e:
                print(f"[!] Błąd pobierania ze źródła {src['name']}: {e}")
    return None, None, None

def generate_fb_post_pl(source_name, title, link):
    """Generuje gotowy tekst na FB dla szaraczków po polsku."""
    post = (
        f"🚨 UWAGA! Ważna informacja z dziś ({source_name})\n\n"
        f"📌 {title}\n\n"
        f"Warto wiedzieć, co się dzieje, żeby nie dać się zaskoczyć ani oszukać w sieci. "
        f"Przeczytajcie szczegóły i podajcie dalej znajomym!\n\n"
        f"🔗 Pełny artykuł: {link}\n\n"
        f"#Wiadomości #Bezpieczeństwo #Polska #Technologia #Informacje"
    )
    return post

async def post_to_facebook(text: str) -> bool:
    """Wysyła zatwierdzony post bezpośrednio na Facebook Fanpage przez Meta API."""
    url = f"https://graph.facebook.com/v18.0/{FB_PAGE_ID}/feed"
    payload = {
        "message": text,
        "access_token": FB_ACCESS_TOKEN
    }
    async with httpx.AsyncClient() as client:
        r = await client.post(url, data=payload)
        return r.status_code == 200

async def handle_button(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Obsługa kliknięcia przycisku na Telegramie (Zatwierdzenie / Odrzucenie)."""
    query = update.callback_query
    await query.answer()

    if query.data == "approve":
        await query.edit_message_text(text="🚀 Wysyłam post na Facebooka...")
        success = await post_to_facebook(PENDING_POST["text"])
        if success:
            await query.edit_message_text(text="✅ BOOM! Post z powodzeniem opublikowany na FB!")
        else:
            await query.edit_message_text(text="❌ Błąd publikacji na FB. Sprawdź tokeny Meta API.")
    elif query.data == "reject":
        await query.edit_message_text(text="🗑️ Post odrzucony przez Masta Blasta. Nic nie wrzucam.")

async def main():
    print("[>] Skanowanie portali i szukanie newsów dla szaraczków...")
    src_name, title, link = await fetch_latest_news()

    if not title:
        print("[!] Brak nowych ciekawszych newsów na tę chwilę.")
        return

    # Generowanie gotowca w PL
    fb_text = generate_fb_post_pl(src_name, title, link)
    PENDING_POST["text"] = fb_text
    PENDING_POST["url"] = link

    # Tworzenie aplikacji bota Telegram
    app = Application.builder().token(TELEGRAM_BOT_TOKEN).build()
    app.add_handler(CallbackQueryHandler(handle_button))

    # Wysyłanie wiadomości z przyciskami na Telegram
    keyboard = [
        [
            InlineKeyboardButton("✅ OPUBLIKUJ ON FB", callback_data="approve"),
            InlineKeyboardButton("❌ ODRZUĆ", callback_data="reject"),
        ]
    ]
    reply_markup = InlineKeyboardMarkup(keyboard)

    msg_text = (
        f"👨‍💻 **MASTA BLASTA - PROPOZYCJA POSTA NA FB**\n\n"
        f"**Źródło:** {src_name}\n\n"
        f"**Wygenerowana treść:**\n{fb_text}"
    )

    print("[+] News znaleziony! Wysyłam prośbę o akceptację na Telegram...")
    await app.bot.send_message(
        chat_id=TELEGRAM_CHAT_ID,
        text=msg_text,
        reply_markup=reply_markup,
        parse_mode="Markdown"
    )

    # Uruchomienie nasłuchu na kliknięcie przycisku
    async with app:
        await app.start()
        await app.updater.start_polling()
        # Czeka 5 minut na reakcję, po czym wyłącza nasłuch
        await asyncio.sleep(300)
        await app.updater.stop()
        await app.stop()

if __name__ == "__main__":
    asyncio.run(main())