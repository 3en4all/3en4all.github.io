(() => {
    const LIVE_REFRESH_MS = 5 * 60 * 1000;

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
            return new Intl.DateTimeFormat('pl-PL', {
                day: '2-digit',
                month: '2-digit',
                hour: '2-digit',
                minute: '2-digit'
            }).format(new Date(value));
        } catch (_) {
            return '';
        }
    }

    function renderPrimary(item, accent) {
        if (!item) return '<div class="text-sm text-gray-500">Brak aktywnego wpisu.</div>';
        return `
            <h3 class="text-lg font-bold text-white mb-2">${esc(item.title)}</h3>
            <p class="text-sm text-gray-300 leading-relaxed">${esc(item.body)}</p>
            <div class="mt-3 text-[10px] font-mono ${accent}">${esc(formatDate(item.published_at))}</div>
        `;
    }

    function renderProjectLog(items) {
        if (!items.length) return '<div class="text-sm text-gray-500">Brak wpisów w dzienniku.</div>';
        return items.slice(0, 8).map(item => `
            <div class="relative pl-5 border-l border-emerald-500/30">
                <span class="absolute -left-1 top-1.5 w-2 h-2 rounded-full bg-emerald-400"></span>
                <div class="text-[10px] font-mono text-gray-500 mb-1">${esc(formatDate(item.published_at))}</div>
                <h4 class="text-sm font-semibold text-white mb-1">${esc(item.title)}</h4>
                <p class="text-xs text-gray-400 leading-relaxed">${esc(item.body)}</p>
            </div>
        `).join('');
    }

    function renderAiPulse(items) {
        if (!items.length) return '<div class="text-sm text-gray-500">Brak wpisów AI Pulse.</div>';
        return items.slice(0, 5).map(item => {
            const source = item.source_url
                ? `<a href="${esc(item.source_url)}" target="_blank" rel="noopener noreferrer" class="text-[10px] text-cyan-400 hover:text-cyan-300">Źródło: ${esc(item.source_label || 'link')} ↗</a>`
                : '';
            return `
                <article class="border-b border-brand-border/60 pb-4 last:border-0 last:pb-0">
                    <div class="text-[10px] font-mono text-gray-500 mb-1">${esc(formatDate(item.published_at))}</div>
                    <h4 class="text-sm font-semibold text-white mb-2">${esc(item.title)}</h4>
                    <p class="text-xs text-gray-400 leading-relaxed mb-2">${esc(item.body)}</p>
                    ${source}
                </article>
            `;
        }).join('');
    }

    async function loadLiveFeed() {
        const root = document.getElementById('live-techm8');
        if (!root || typeof supabaseClient === 'undefined' || !supabaseClient) return false;

        try {
            const { data, error } = await supabaseClient
                .from('live_updates')
                .select('id,kind,title,body,source_url,source_label,published_at,priority')
                .eq('is_active', true)
                .order('priority', { ascending: false })
                .order('published_at', { ascending: false })
                .limit(30);

            if (error) throw error;
            const items = data || [];
            const now = items.filter(x => x.kind === 'NOW')[0];
            const next = items.filter(x => x.kind === 'NEXT')[0];
            const projectLog = items.filter(x => x.kind === 'PROJECT_LOG')
                .sort((a, b) => new Date(b.published_at) - new Date(a.published_at));
            const aiPulse = items.filter(x => x.kind === 'AI_PULSE')
                .sort((a, b) => new Date(b.published_at) - new Date(a.published_at));

            const nowEl = document.getElementById('live-now');
            const nextEl = document.getElementById('live-next');
            const logEl = document.getElementById('live-project-log');
            const pulseEl = document.getElementById('live-ai-pulse');
            const updateEl = document.getElementById('live-last-update');

            if (nowEl) nowEl.innerHTML = renderPrimary(now, 'text-emerald-400');
            if (nextEl) nextEl.innerHTML = renderPrimary(next, 'text-cyan-400');
            if (logEl) logEl.innerHTML = renderProjectLog(projectLog);
            if (pulseEl) pulseEl.innerHTML = renderAiPulse(aiPulse);
            if (updateEl) updateEl.textContent = `Ostatnia synchronizacja: ${formatDate(new Date().toISOString())}`;
            return true;
        } catch (err) {
            console.error('Błąd Live TechM8:', err);
            const updateEl = document.getElementById('live-last-update');
            if (updateEl) updateEl.textContent = 'Live feed: chwilowo offline';
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
        console.warn('Live TechM8: komponent nie został zamontowany.');
    }

    window.loadLiveFeed = loadLiveFeed;
    window.addEventListener('load', startWhenMounted);
})();
