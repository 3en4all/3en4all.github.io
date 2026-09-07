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
    ['Architektura TechM8', 'TechM8 Architecture'],
    ['[ Poznaj Nasz Stos ]', '[ Explore The Stack ]'],
    ["[ Status Node'ów ]", '[ Node Status ]'],
    ['[ Dołącz / Kontakt ]', '[ Join / Contact ]'],
    ['// Co dzieje się teraz', '// What is happening now'],
    ['Synchronizacja...', 'Syncing...'],
    ['Ładowanie aktualnego statusu...', 'Loading current status...'],
    ['Ładowanie kolejnych kroków...', 'Loading next steps...'],
    ['Ładowanie dziennika...', 'Loading project log...'],
    ['Co warto dziś wiedzieć', 'What matters today'],
    ['Ładowanie AI Pulse...', 'Loading AI Pulse...'],
    ['Tech Insights & Baza Wiedzy', 'Tech Insights & Knowledge Base'],
    ['Ładowanie artykułów z bazy danych...', 'Loading articles from the database...'],
    ['Czytaj poradnik', 'Read article'],
    ['Baza wiedzy jest obecnie aktualizowana.', 'The knowledge base is currently being updated.'],
    ['Brak publikacji w bazie wiedzy.', 'No publications in the knowledge base.'],
    ['Rejestr Projektów', 'Project Registry'],
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
    ['Profil Zawodowy & Bio', 'Professional Profile & Bio'],
    ['Główne Kompetencje:', 'Core Competencies:'],
    ['Proxmox VE & Wirtualizacja', 'Proxmox VE & Virtualization'],
    ['Sieci Cisco & OpenWrt', 'Cisco Networks & OpenWrt'],
    ['Architektura / Diagram Rozwiązania:', 'Architecture / Solution Diagram:'],
    ['Zamknij', 'Close'],
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
    if (translated !== core) {
      const next = leading + translated + trailing;
      if (node.nodeValue !== next) node.nodeValue = next;
    }
  }

  function translateElement(el, lang) {
    if (!(el instanceof Element) || el.matches('script, style, code, pre')) return;
    const placeholder = el.getAttribute('placeholder');
    if (placeholder) {
      const next = translateValue(placeholder, lang);
      if (next !== placeholder) el.setAttribute('placeholder', next);
    }
    const title = el.getAttribute('title');
    if (title) {
      const next = translateValue(title, lang);
      if (next !== title) el.setAttribute('title', next);
    }
  }

  function applyExplicitElement(el) {
    if (!(el instanceof Element)) return;
    if (el.matches('[data-pl][data-en]')) {
      const value = el.getAttribute(currentLang === 'en' ? 'data-en' : 'data-pl');
      if (value !== null && el.textContent !== value) el.textContent = value;
    }
    if (el.matches('[data-placeholder-pl][data-placeholder-en]')) {
      const value = el.getAttribute(currentLang === 'en' ? 'data-placeholder-en' : 'data-placeholder-pl') || '';
      if (el.getAttribute('placeholder') !== value) el.setAttribute('placeholder', value);
    }
  }

  function applyExplicitCopy(root = document) {
    if (root instanceof Element) applyExplicitElement(root);
    root.querySelectorAll?.('[data-pl][data-en], [data-placeholder-pl][data-placeholder-en]').forEach(applyExplicitElement);
  }

  function updateButtons() {
    document.querySelectorAll('[data-lang-btn]').forEach(btn => {
      const active = btn.dataset.langBtn === currentLang;
      btn.setAttribute('aria-pressed', String(active));
      btn.classList.toggle('text-emerald-300', active);
      btn.classList.toggle('bg-emerald-500/10', active);
      btn.classList.toggle('text-gray-500', !active);
      btn.classList.toggle('hover:text-cyan-300', !active);
    });
  }

  function applyLanguage(lang, emit = true) {
    currentLang = supported.includes(lang) ? lang : 'pl';
    localStorage.setItem(STORAGE_KEY, currentLang);
    document.documentElement.lang = currentLang;

    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    let node;
    while ((node = walker.nextNode())) {
      const parent = node.parentElement;
      if (!parent || parent.matches('script, style, code, pre') || parent.matches('[data-pl][data-en]')) continue;
      translateTextNode(node, currentLang);
    }
    document.querySelectorAll('[placeholder], [title]').forEach(el => translateElement(el, currentLang));
    applyExplicitCopy(document);
    updateButtons();

    if (emit) window.dispatchEvent(new CustomEvent('techm8:languagechange', { detail: { language: currentLang } }));
  }

  window.setLanguage = lang => applyLanguage(lang, true);
  window.getCurrentLanguage = () => currentLang;

  document.addEventListener('DOMContentLoaded', () => {
    applyLanguage(currentLang, false);

    const observer = new MutationObserver(mutations => {
      for (const mutation of mutations) {
        mutation.addedNodes.forEach(node => {
          if (node.nodeType === Node.TEXT_NODE) {
            const parent = node.parentElement;
            if (!parent?.matches('[data-pl][data-en]')) translateTextNode(node, currentLang);
            return;
          }
          if (node.nodeType !== Node.ELEMENT_NODE) return;

          translateElement(node, currentLang);
          applyExplicitCopy(node);

          const walker = document.createTreeWalker(node, NodeFilter.SHOW_TEXT);
          let child;
          while ((child = walker.nextNode())) {
            const parent = child.parentElement;
            if (!parent?.matches('[data-pl][data-en]')) translateTextNode(child, currentLang);
          }
          node.querySelectorAll?.('[placeholder], [title]').forEach(el => translateElement(el, currentLang));
        });
      }
      updateButtons();
    });

    observer.observe(document.body, { childList: true, subtree: true });
  });
})();