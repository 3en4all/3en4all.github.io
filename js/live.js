(() => {
    const LIVE_REFRESH_MS = 5 * 60 * 1000;
    const PROJECT_LOG_PREVIEW = 5;
    const AI_PULSE_PREVIEW = 3;
    let showProjectArchive = false;
    let showAiArchive = false;
    let cachedProjectLog = [];
    let cachedAiPulse = [];

    function currentLang() {
        return typeof getCurrentLanguage === 'function' ? getCurrentLanguage() : 'pl';
    }

    function pick(item, field) {
        if (!item) return '';
        if (currentLang() === 'en') {
            const en = item[`${field}_en`];
            if (en !== null && en !== undefined && String(en).trim() !== '') return en;
        }
        return item[field] ?? '';
    }

    function ui(pl, en) {
        return currentLang() === 'en' ? en : pl;
    }

    function safeUrl(value) {
        const raw = String(value ?? '').trim();
        if (!raw) return '';
        try {
            const parsed = new URL(raw, window.location.origin);
            return (parsed.protocol === 'http:' || parsed.protocol === 'https:') ? raw : '';
        } catch (e) {
            return '';
        }
    }

    function esc(value) {
        if (value === null || value === undefined) return '';
        return String(value)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    function formatDate(value) {
        if (!value) return '';
        try {
            return new Intl.DateTimeFormat(currentLang() === 'en' ? 'en-GB' : 'pl-PL', {
                day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit'
            }).format(new Date(value));
        } catch (_) {
            return '';
        }
    }

    function renderPrimary(item, accent) {
        if (!item) return `<div class="text-sm text-gray-500">${ui('Brak aktywnego wpisu.', 'No active entry.')}</div>`;
        return `<h3 class="text-lg font-bold text-white mb-2">${esc(pick(item, 'title'))}</h3>
            <p class="text-sm text-gray-300 leading-relaxed">${esc(pick(item, 'body'))}</p>
            <div class="mt-3 text-[10px] font-mono ${accent}">${esc(formatDate(item.published_at))}</div>`;
    }

    function bindPrimaryCards() {
        document.querySelectorAll('.live-primary-card').forEach(card => {
            if (card.dataset.bound === '1') return;
            card.dataset.bound = '1';
            card.setAttribute('role', 'button');
            card.setAttribute('tabindex', '0');
            card.setAttribute('aria-expanded', 'false');

            const indicator = card.querySelector('[data-live-indicator]');
            const toggle = () => {
                const willExpand = card.dataset.expanded !== '1';
                card.dataset.expanded = willExpand ? '1' : '0';
                card.setAttribute('aria-expanded', willExpand ? 'true' : 'false');

                if (willExpand) {
                    card.style.maxHeight = '32rem';
                    card.style.overflowY = 'auto';
                    card.style.overflowX = 'hidden';
                    if (indicator) indicator.textContent = 'ZWIŃ ↑';
                } else {
                    card.style.maxHeight = '9rem';
                    card.style.overflow = 'hidden';
                    if (indicator) indicator.textContent = 'ROZWIŃ ↓';
                }
            };

            card.style.maxHeight = '9rem';
            card.style.overflow = 'hidden';
            card.addEventListener('click', toggle);
            card.addEventListener('keydown', event => {
                if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    toggle();
                }
            });
        });
    }

    function renderProjectLog(items) {
        if (!items.length) return `<div class="text-sm text-gray-500">${ui('Brak wpisów w dzienniku.', 'No project-log entries.')}</div>`;
        const visible = showProjectArchive ? items : items.slice(0, PROJECT_LOG_PREVIEW);
        return visible.map(item => `<div class="relative pl-5 border-l border-emerald-500/30">
                <span class="absolute -left-1 top-1.5 w-2 h-2 rounded-full bg-emerald-400"></span>
                <div class="text-[10px] font-mono text-gray-500 mb-1">${esc(formatDate(item.published_at))}</div>
                <h4 class="text-sm font-semibold text-white mb-1">${esc(pick(item, 'title'))}</h4>
                <p class="text-xs text-gray-400 leading-relaxed">${esc(pick(item, 'body'))}</p>
            </div>`).join('');
    }

    function renderAiPulse(items) {
        if (!items.length) return `<div class="text-sm text-gray-500">${ui('Brak wpisów AI Pulse.', 'No AI Pulse entries.')}</div>`;
        const visible = showAiArchive ? items : items.slice(0, AI_PULSE_PREVIEW);
        return visible.map(item => {
            const sourceUrl = safeUrl(item.source_url);
            const source = sourceUrl
                ? `<a href="${esc(sourceUrl)}" target="_blank" rel="noopener noreferrer" class="text-[10px] text-cyan-400 hover:text-cyan-300">${ui('Źródło', 'Source')}: ${esc(pick(item, 'source_label') || 'link')} ↗</a>`
                : '';
            return `<article class="border-b border-brand-border/60 pb-4 last:border-0 last:pb-0">
                    <div class="text-[10px] font-mono text-gray-500 mb-1">${esc(formatDate(item.published_at))}</div>
                    <h4 class="text-sm font-semibold text-white mb-2">${esc(pick(item, 'title'))}</h4>
                    <p class="text-xs text-gray-400 leading-relaxed mb-2">${esc(pick(item, 'body'))}</p>
                    ${source}
                </article>`;
        }).join('');
    }


    function updateArchiveButton(button, expanded, hasMore, plCollapsed, enCollapsed) {
        if (!button) return;
        button.classList.toggle('hidden', !hasMore);
        const label = button.querySelector('[data-more-label]');
        if (label) {
            label.textContent = expanded ? ui('Pokaż mniej ↑', 'Show less ↑') : ui(plCollapsed, enCollapsed);
        }
        button.setAttribute('aria-expanded', String(expanded));
    }

    function bindArchiveButtons() {
        const logButton = document.getElementById('project-log-more');
        const pulseButton = document.getElementById('ai-pulse-more');

        if (logButton && logButton.dataset.bound !== '1') {
            logButton.dataset.bound = '1';
            logButton.addEventListener('click', () => {
                showProjectArchive = !showProjectArchive;
                const logEl = document.getElementById('live-project-log');
                if (logEl) logEl.innerHTML = renderProjectLog(cachedProjectLog);
                updateArchiveButton(logButton, showProjectArchive, cachedProjectLog.length > PROJECT_LOG_PREVIEW, 'Starsze wpisy ↓', 'Older entries ↓');
            });
        }

        if (pulseButton && pulseButton.dataset.bound !== '1') {
            pulseButton.dataset.bound = '1';
            pulseButton.addEventListener('click', () => {
                showAiArchive = !showAiArchive;
                const pulseEl = document.getElementById('live-ai-pulse');
                if (pulseEl) pulseEl.innerHTML = renderAiPulse(cachedAiPulse);
                updateArchiveButton(pulseButton, showAiArchive, cachedAiPulse.length > AI_PULSE_PREVIEW, 'Starsze aktualności ↓', 'Older updates ↓');
            });
        }

        updateArchiveButton(logButton, showProjectArchive, cachedProjectLog.length > PROJECT_LOG_PREVIEW, 'Starsze wpisy ↓', 'Older entries ↓');
        updateArchiveButton(pulseButton, showAiArchive, cachedAiPulse.length > AI_PULSE_PREVIEW, 'Starsze aktualności ↓', 'Older updates ↓');
    }

    async function loadLiveFeed() {
        const root = document.getElementById('live-techm8');
        if (!root || typeof supabaseClient === 'undefined' || !supabaseClient) return false;
        try {
            const { data, error } = await supabaseClient
                .from('live_updates')
                .select('id,kind,title,title_en,body,body_en,source_url,source_label,source_label_en,published_at,priority,is_active')
                .order('published_at', { ascending: false })
                .limit(100);
            if (error) throw error;
            const items = data || [];
            const now = items.filter(x => x.kind === 'NOW' && x.is_active).sort((a, b) => (b.priority || 0) - (a.priority || 0))[0];
            const next = items.filter(x => x.kind === 'NEXT' && x.is_active).sort((a, b) => (b.priority || 0) - (a.priority || 0))[0];
            const projectLog = items.filter(x => x.kind === 'PROJECT_LOG').sort((a, b) => new Date(b.published_at) - new Date(a.published_at));
            const aiPulse = items.filter(x => x.kind === 'AI_PULSE').sort((a, b) => new Date(b.published_at) - new Date(a.published_at));
            cachedProjectLog = projectLog;
            cachedAiPulse = aiPulse;

            const nowEl = document.getElementById('live-now');
            const nextEl = document.getElementById('live-next');
            const logEl = document.getElementById('live-project-log');
            const pulseEl = document.getElementById('live-ai-pulse');
            const updateEl = document.getElementById('live-last-update');
            if (nowEl) nowEl.innerHTML = renderPrimary(now, 'text-emerald-400');
            if (nextEl) nextEl.innerHTML = renderPrimary(next, 'text-cyan-400');
            if (logEl) logEl.innerHTML = renderProjectLog(projectLog);
            if (pulseEl) pulseEl.innerHTML = renderAiPulse(aiPulse);
            if (updateEl) updateEl.textContent = `${ui('Ostatnia synchronizacja', 'Last sync')}: ${formatDate(new Date().toISOString())}`;
            bindPrimaryCards();
            bindArchiveButtons();
            return true;
        } catch (err) {
            console.error('Live TechM8 error:', err);
            const updateEl = document.getElementById('live-last-update');
            if (updateEl) updateEl.textContent = ui('Live feed: chwilowo offline', 'Live feed: temporarily offline');
            return false;
        }
    }

    async function startWhenMounted() {
        for (let attempt = 0; attempt < 50; attempt += 1) {
            if (document.getElementById('live-techm8')) {
                await loadLiveFeed();
                setInterval(loadLiveFeed, LIVE_REFRESH_MS);
                return;
            }
            await new Promise(resolve => setTimeout(resolve, 100));
        }
    }

    window.loadLiveFeed = loadLiveFeed;
    window.addEventListener('techm8:languagechange', () => {
        const logEl = document.getElementById('live-project-log');
        const pulseEl = document.getElementById('live-ai-pulse');
        if (logEl) logEl.innerHTML = renderProjectLog(cachedProjectLog);
        if (pulseEl) pulseEl.innerHTML = renderAiPulse(cachedAiPulse);
        bindArchiveButtons();
    });
    window.addEventListener('load', startWhenMounted);
})();
