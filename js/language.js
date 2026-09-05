(() => {
  const STORAGE_KEY = 'techm8-language';
  const supported = ['pl', 'en'];
  let currentLang = supported.includes(localStorage.getItem(STORAGE_KEY)) ? localStorage.getItem(STORAGE_KEY) : 'pl';

  const pairs = [
    ['O mnie', 'About'],
    ['Node Status', 'Node Status'],
    ['System Architecture & Development', 'System Architecture & Development'],
    ['Infrastruktura IT, Python &', 'IT Infrastructure, Python &'],
    ['Automatyzacja AI', 'AI Automation'],
    ['Profesjonalny ekosystem technologiczny łączący 19+ lat praktyki w administracji systemami IT, środowiskach Homelab oraz nowoczesnym programowaniu i przepływach pracy AI.', 'A professional technology ecosystem combining 19+ years of hands-on IT systems administration, Homelab environments, modern development and AI workflows.'],
    ['// Architektura TechM8', '// TechM8 Architecture'],
    ['Ekosystem rozwiązań IT, Python Dev & AI Automation', 'IT solutions, Python Development & AI Automation ecosystem'],
    ['[ Poznaj Nasz Stos ]', '[ Explore The Stack ]'],
    ["[ Status Node'ów ]", '[ Node Status ]'],
    ['[ Dołącz / Kontakt ]', '[ Join / Contact ]'],
    ['// Co dzieje się teraz', '// What is happening now'],
    ['Bieżące prace, AI Pulse, dziennik projektów i najbliższe kroki. Ta część strony jest zasilana dynamicznie z Supabase.', 'Current work, AI Pulse, project log and next steps. This section is powered dynamically by Supabase.'],
    ['Synchronizacja...', 'Syncing...'],
    ['Ładowanie aktualnego statusu...', 'Loading current status...'],
    ['Ładowanie kolejnych kroków...', 'Loading next steps...'],
    ['Ładowanie dziennika...', 'Loading project log...'],
    ['Co warto dziś wiedzieć', 'What matters today'],
    ['Ładowanie AI Pulse...', 'Loading AI Pulse...'],
    ['// Tech Insights & Baza Wiedzy', '// Tech Insights & Knowledge Base'],
    ['Artykuły techniczne, poradniki architektoniczne i Dobre Praktyki IT', 'Technical articles, architecture guides and IT best practices'],
    ['Ładowanie artykułów z bazy danych...', 'Loading articles from the database...'],
    ['Czytaj poradnik', 'Read article'],
    ['Baza wiedzy jest obecnie aktualizowana.', 'The knowledge base is currently being updated.'],
    ['Brak publikacji w bazie wiedzy.', 'No publications in the knowledge base.'],
    ['// Rejestr Projektów', '// Project Registry'],
    ['Dynamiczna lista wdrożeń pobierana z bazy Supabase', 'Dynamic list of implementations loaded from Supabase'],
    ['Wszystkie', 'All'],
    ['Ładowanie projektów z bazy danych...', 'Loading projects from the database...'],
    ['Brak projektów spełniających kryteria wyszukiwania.', 'No projects match the search criteria.'],
    ['Nie udało się załadować projektów z bazy Supabase.', 'Could not load projects from Supabase.'],
    ['Zobacz szczegóły & diagram', 'View details & diagram'],
    ['Lab & Research', 'Lab & Research'],
    ['Opracowania popularnonaukowe, kosmologia i fizyka teoretyczna', 'Popular science, cosmology and theoretical physics'],
    ['Ładowanie publikacji z bazy danych...', 'Loading publications from the database...'],
    ['Baza badań jest obecnie aktualizowana.', 'The research database is currently being updated.'],
    ['Brak publikacji w bazie badań.', 'No publications in the research database.'],
    ['Brak publikacji spełniających kryteria wyszukiwania.', 'No publications match the search criteria.'],
    ['// Skontaktuj się', '// Contact'],
    ['Skontaktuj się', 'Contact'],
    ['Wyślij wiadomość bezpośrednio do systemu TechM8', 'Send a message directly to the TechM8 system'],
    ['Imię / Nazwa', 'Name'],
    ['Adres E-mail', 'Email address'],
    ['Treść wiadomości', 'Message'],
    ['Wyślij Wiadomość', 'Send Message'],
    ['[ Wyślij Wiadomość ]', '[ Send Message ]'],
    ['[ Wysyłanie... ]', '[ Sending... ]'],
    ['Wypełnij wszystkie pola!', 'Please fill in all fields!'],
    ['Zapisywanie w węźle Supabase...', 'Saving to Supabase node...'],
    ['✔ Wiadomość wysłana pomyślnie!', '✔ Message sent successfully!'],
    ['TechM8 © 2026. Wszelkie prawa zastrzeżone.', 'TechM8 © 2026. All rights reserved.'],
    ['Szukaj projektu...', 'Search projects...'],
    ['Szukaj w Lab & Research...', 'Search Lab & Research...']
  ];

  const plToEn = new Map(pairs);
  const enToPl = new Map(pairs.map(([pl, en]) => [en, pl]));

  function translateValue(value, lang) {
    if (!value) return value;
    const map = lang === 'en' ? plToEn : enToPl;
    return map.get(value) || value;
  }

  function translateTextNode(node, lang) {
    const raw = node.nodeValue;
    if (!raw || !raw.trim()) return;
    const leading = raw.match(/^\s*/)?.[0] || '';
    const trailing = raw.match(/\s*$/)?.[0] || '';
    const core = raw.trim();
    const translated = translateValue(core, lang);
    if (translated !== core) node.nodeValue = leading + translated + trailing;
  }

  function translateElement(el, lang) {
    if (!(el instanceof Element)) return;
    if (el.matches('script, style, code, pre')) return;
    const placeholder = el.getAttribute('placeholder');
    if (placeholder) el.setAttribute('placeholder', translateValue(placeholder, lang));
    const title = el.getAttribute('title');
    if (title) el.setAttribute('title', translateValue(title, lang));
  }

  function applyLanguage(lang) {
    currentLang = supported.includes(lang) ? lang : 'pl';
    localStorage.setItem(STORAGE_KEY, currentLang);
    document.documentElement.lang = currentLang;

    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    let node;
    while ((node = walker.nextNode())) {
      const parent = node.parentElement;
      if (!parent || parent.matches('script, style, code, pre')) continue;
      translateTextNode(node, currentLang);
    }
    document.querySelectorAll('[placeholder], [title]').forEach(el => translateElement(el, currentLang));

    document.querySelectorAll('[data-lang-btn]').forEach(btn => {
      const active = btn.dataset.langBtn === currentLang;
      btn.setAttribute('aria-pressed', String(active));
      btn.classList.toggle('text-emerald-300', active);
      btn.classList.toggle('bg-emerald-500/10', active);
      btn.classList.toggle('text-gray-500', !active);
    });
  }

  window.setLanguage = applyLanguage;
  window.getCurrentLanguage = () => currentLang;

  document.addEventListener('DOMContentLoaded', () => {
    applyLanguage(currentLang);
    const observer = new MutationObserver(mutations => {
      for (const mutation of mutations) {
        mutation.addedNodes.forEach(node => {
          if (node.nodeType === Node.TEXT_NODE) {
            translateTextNode(node, currentLang);
          } else if (node.nodeType === Node.ELEMENT_NODE) {
            translateElement(node, currentLang);
            const walker = document.createTreeWalker(node, NodeFilter.SHOW_TEXT);
            let child;
            while ((child = walker.nextNode())) translateTextNode(child, currentLang);
            node.querySelectorAll?.('[placeholder], [title]').forEach(el => translateElement(el, currentLang));
          }
        });
      }
    });
    observer.observe(document.body, { childList: true, subtree: true });
  });
})();
