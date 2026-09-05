(() => {
    function lang() {
        return typeof getCurrentLanguage === 'function' ? getCurrentLanguage() : 'pl';
    }

    function pick(item, field) {
        if (!item) return '';
        if (lang() === 'en') {
            const en = item[`${field}_en`];
            if (en !== null && en !== undefined && String(en).trim() !== '') return en;
        }
        return item[field] ?? '';
    }

    function ui(pl, en) {
        return lang() === 'en' ? en : pl;
    }

    renderArticles = function renderArticlesI18n() {
        const grid = document.getElementById('articles-grid');
        if (!grid) return;
        if (allArticles.length === 0) {
            grid.innerHTML = `<div class="col-span-full text-center py-6 text-gray-500 text-xs">${ui('Brak publikacji w bazie wiedzy.', 'No publications in the knowledge base.')}</div>`;
            return;
        }

        grid.innerHTML = allArticles.map(a => `
            <div onclick="openArticleModal(${Number(a.id)})" class="tile-hover bg-brand-card border border-brand-border rounded-xl p-5 cursor-pointer flex flex-col justify-between space-y-3 group">
                <div class="space-y-2">
                    <div class="flex items-center justify-between text-[10px] text-emerald-400 font-mono">
                        <span>${escapeHtml(a.tags ? a.tags.join(' ') : '')}</span>
                        <span class="text-gray-500">${escapeHtml(pick(a, 'read_time') || '3 min read')}</span>
                    </div>
                    <h3 class="text-base font-bold text-white group-hover:text-emerald-400 transition">${escapeHtml(pick(a, 'title'))}</h3>
                    <p class="text-xs text-gray-400 leading-relaxed line-clamp-2">${escapeHtml(pick(a, 'summary'))}</p>
                </div>
                <div class="pt-2 border-t border-brand-border/40 flex items-center justify-between text-[11px] text-emerald-400 font-medium">
                    <span>${ui('Czytaj poradnik', 'Read article')}</span>
                    <span>&rarr;</span>
                </div>
            </div>
        `).join('');
    };

    renderResearch = function renderResearchI18n() {
        const grid = document.getElementById('research-grid');
        const searchInput = document.getElementById('research-search-input');
        if (!grid) return;
        const searchVal = searchInput ? searchInput.value.toLowerCase() : '';

        const filtered = allResearch.filter(r => {
            const title = String(pick(r, 'title')).toLowerCase();
            const summary = String(pick(r, 'summary')).toLowerCase();
            const tagsText = (r.tags ? r.tags.join(' ') : '').toLowerCase();
            return title.includes(searchVal) || summary.includes(searchVal) || tagsText.includes(searchVal);
        });

        if (allResearch.length === 0) {
            grid.innerHTML = `<div class="col-span-full text-center py-8 text-gray-500 text-xs">${ui('Brak publikacji w bazie badań.', 'No publications in the research database.')}</div>`;
            return;
        }
        if (filtered.length === 0) {
            grid.innerHTML = `<div class="col-span-full text-center py-8 text-gray-500 text-xs">${ui('Brak publikacji spełniających kryteria wyszukiwania.', 'No publications match the search criteria.')}</div>`;
            return;
        }

        grid.innerHTML = filtered.map(r => `
            <a href="${escapeHtml(pick(r, 'url') || '#')}" class="block bg-brand-card border border-brand-border hover:border-emerald-500/50 rounded-xl p-6 transition-all hover:-translate-y-1 group">
                <div class="flex gap-2 mb-3 text-xs">
                    ${r.tags ? r.tags.map((t, i) => `<span class="${i === 0 ? 'text-emerald-400' : 'text-cyan-400'}">${escapeHtml(t)}</span>`).join('') : ''}
                </div>
                <h3 class="text-lg font-bold text-white group-hover:text-emerald-400 transition-colors mb-2">${escapeHtml(pick(r, 'title'))}</h3>
                <p class="text-sm text-gray-400 line-clamp-2">${escapeHtml(pick(r, 'summary'))}</p>
            </a>
        `).join('');
    };

    renderProjects = function renderProjectsI18n() {
        const grid = document.getElementById('projects-grid');
        const searchInput = document.getElementById('search-input');
        if (!grid) return;
        const searchVal = searchInput ? searchInput.value.toLowerCase() : '';

        const filtered = allProjects.filter(p => {
            const matchesTag = currentFilter === 'ALL' || (p.tags && p.tags.includes(currentFilter));
            const title = String(pick(p, 'title')).toLowerCase();
            const description = String(pick(p, 'description')).toLowerCase();
            const tagsText = (p.tags ? p.tags.join(' ') : '').toLowerCase();
            return matchesTag && (title.includes(searchVal) || description.includes(searchVal) || tagsText.includes(searchVal));
        });

        if (filtered.length === 0) {
            grid.innerHTML = `<div class="col-span-full text-center py-12 text-gray-500 text-xs">${ui('Brak projektów spełniających kryteria wyszukiwania.', 'No projects match the search criteria.')}</div>`;
            return;
        }

        grid.innerHTML = filtered.map(p => `
            <div onclick="openProjectModal(${Number(p.id)})" class="tile-hover tile-hover-cyan bg-brand-card border border-brand-border rounded-xl p-5 cursor-pointer flex flex-col justify-between space-y-4 group">
                <div class="space-y-2">
                    <div class="text-[10px] text-emerald-400 font-mono flex flex-wrap gap-1">
                        ${p.tags ? p.tags.map(t => `<span class="bg-emerald-950/40 border border-emerald-500/20 px-1.5 py-0.5 rounded">${escapeHtml(t)}</span>`).join('') : ''}
                    </div>
                    <h3 class="text-base font-bold text-white group-hover:text-emerald-400 transition">${escapeHtml(pick(p, 'title'))}</h3>
                    <p class="text-xs text-gray-400 line-clamp-3 leading-relaxed">${escapeHtml(pick(p, 'description'))}</p>
                </div>
                <div class="pt-2 border-t border-brand-border/40 flex items-center justify-between text-[11px] text-cyan-400 font-medium">
                    <span>${ui('Zobacz szczegóły & diagram', 'View details & diagram')}</span>
                    <span>&rarr;</span>
                </div>
            </div>
        `).join('');
    };

    openProjectModal = function openProjectModalI18n(id) {
        const project = allProjects.find(p => p.id === id);
        if (!project) return;
        document.getElementById('modal-title').innerText = pick(project, 'title');
        document.getElementById('modal-tags').innerText = project.tags ? project.tags.join(' ') : '';
        document.getElementById('modal-description').innerText = pick(project, 'description');
        document.getElementById('modal-diagram').innerText = project.diagram || project.diagram_code || ui('Brak diagramu dla tego projektu.', 'No diagram is available for this project.');
        document.getElementById('project-modal')?.classList.remove('hidden');
    };

    openArticleModal = function openArticleModalI18n(id) {
        const article = allArticles.find(a => a.id === id);
        if (!article) return;
        document.getElementById('article-modal-title').innerText = pick(article, 'title');
        document.getElementById('article-modal-tags').innerText = article.tags ? article.tags.join(' ') : '';
        document.getElementById('article-modal-time').innerText = pick(article, 'read_time') || '3 min read';
        document.getElementById('article-modal-content').innerText = pick(article, 'content');
        document.getElementById('article-modal')?.classList.remove('hidden');
    };

    window.addEventListener('techm8:languagechange', () => {
        if (Array.isArray(allArticles) && allArticles.length) renderArticles();
        if (Array.isArray(allProjects) && allProjects.length) renderProjects();
        if (Array.isArray(allResearch) && allResearch.length) renderResearch();
        if (typeof loadLiveFeed === 'function') loadLiveFeed();
    });
})();
