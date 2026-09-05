(() => {
    const params = new URLSearchParams(window.location.search);
    const article = params.get('article') || 'ukryta-symetria';
    const safeArticle = article.replace(/[^a-z0-9-_]/gi, '');
    const contentPath = `content/${safeArticle}.md`;

    const articleEl = document.getElementById('research-article');
    const titleEl = document.getElementById('research-title');
    const tagsEl = document.getElementById('research-tags');
    const descriptionMeta = document.querySelector('meta[name="description"]');

    function parseFrontMatter(raw) {
        const normalized = raw.replace(/\r\n/g, '\n');
        if (!normalized.startsWith('---\n')) return { meta: {}, body: normalized };
        const end = normalized.indexOf('\n---\n', 4);
        if (end === -1) return { meta: {}, body: normalized };

        const header = normalized.slice(4, end).split('\n');
        const body = normalized.slice(end + 5);
        const meta = {};

        for (const line of header) {
            const idx = line.indexOf(':');
            if (idx === -1) continue;
            const key = line.slice(0, idx).trim();
            let value = line.slice(idx + 1).trim();
            if (value.startsWith('[') && value.endsWith(']')) {
                try { value = JSON.parse(value.replace(/'/g, '"')); } catch (_) {}
            } else {
                value = value.replace(/^"|"$/g, '');
            }
            meta[key] = value;
        }

        return { meta, body };
    }

    function inline(text) {
        return text
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/\*\*(.+?)\*\*/g, '<strong class="text-white">$1</strong>')
            .replace(/`([^`]+)`/g, '<code class="px-1 py-0.5 rounded bg-black/30 text-brand-cyan">$1</code>');
    }

    function renderMarkdown(md) {
        const lines = md.replace(/\r\n/g, '\n').split('\n');
        const out = [];
        let paragraph = [];
        let listOpen = false;
        let quoteOpen = false;
        let quoteHeaderRendered = false;
        let headingIndex = 0;

        function flushParagraph() {
            if (!paragraph.length) return;
            out.push(`<p>${inline(paragraph.join(' '))}</p>`);
            paragraph = [];
        }

        function closeList() {
            if (listOpen) {
                out.push('</ul>');
                listOpen = false;
            }
        }

        function closeQuote() {
            if (quoteOpen) {
                out.push('</div>');
                quoteOpen = false;
                quoteHeaderRendered = false;
            }
        }

        for (const rawLine of lines) {
            const line = rawLine.trimEnd();
            const trimmed = line.trim();

            if (!trimmed) {
                flushParagraph();
                closeList();
                closeQuote();
                continue;
            }

            if (trimmed.startsWith('>')) {
                flushParagraph();
                closeList();

                if (!quoteOpen) {
                    out.push('<div class="bg-brand-cardBg border border-brand-emerald/30 rounded-xl p-6 glow-emerald">');
                    quoteOpen = true;
                }

                const q = trimmed.replace(/^>\s?/, '');
                if (!q) continue;

                if (!quoteHeaderRendered && /^\*\*(.+)\*\*$/.test(q)) {
                    const heading = q.replace(/^\*\*(.+)\*\*$/, '$1');
                    out.push(`<h3 class="text-sm font-semibold text-brand-emerald uppercase tracking-wider mb-3 flex items-center gap-2"><i class="bi bi-lightning-charge-fill"></i>${inline(heading)}</h3>`);
                    quoteHeaderRendered = true;
                    continue;
                }

                if (q.startsWith('- ')) {
                    out.push(`<div class="flex items-start gap-2 text-sm text-gray-300 mb-2"><span class="text-brand-cyan">►</span><span>${inline(q.slice(2))}</span></div>`);
                } else {
                    out.push(`<div class="text-sm text-gray-300 mb-2">${inline(q)}</div>`);
                }
                continue;
            }

            closeQuote();

            if (/^##\s+/.test(trimmed)) {
                flushParagraph();
                closeList();
                const borderClass = headingIndex % 2 === 0 ? 'border-brand-emerald' : 'border-brand-cyan';
                headingIndex += 1;
                out.push(`<h2 class="text-xl font-bold text-white border-l-4 ${borderClass} pl-4 mt-8 mb-4">${inline(trimmed.replace(/^##\s+/, ''))}</h2>`);
                continue;
            }

            if (/^#\s+/.test(trimmed)) {
                flushParagraph();
                closeList();
                out.push(`<h1 class="text-3xl md:text-5xl font-bold text-white leading-tight">${inline(trimmed.replace(/^#\s+/, ''))}</h1>`);
                continue;
            }

            if (trimmed.startsWith('- ')) {
                flushParagraph();
                if (!listOpen) {
                    out.push('<ul class="space-y-2 text-sm text-gray-300">');
                    listOpen = true;
                }
                out.push(`<li class="flex items-start gap-2"><span class="text-brand-cyan">►</span><span>${inline(trimmed.slice(2))}</span></li>`);
                continue;
            }

            paragraph.push(trimmed);
        }

        flushParagraph();
        closeList();
        closeQuote();
        return out.join('\n');
    }

    fetch(contentPath)
        .then((resp) => {
            if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
            return resp.text();
        })
        .then((raw) => {
            const { meta, body } = parseFrontMatter(raw);
            const title = meta.title || safeArticle;
            const tags = Array.isArray(meta.tags) ? meta.tags : [];

            document.title = `${title} | TechM8 Research`;
            if (titleEl) titleEl.textContent = title;
            if (descriptionMeta && meta.description) descriptionMeta.setAttribute('content', meta.description);

            if (tagsEl) {
                tagsEl.innerHTML = tags.map((tag, index) => {
                    const cls = index === 0
                        ? 'bg-brand-emerald/10 text-brand-emerald border-brand-emerald/30'
                        : index === 1
                            ? 'bg-brand-cyan/10 text-brand-cyan border-brand-cyan/30'
                            : 'bg-gray-800 text-gray-300 border-gray-700';
                    return `<span class="border px-2.5 py-1 rounded-full ${cls}">${inline(tag)}</span>`;
                }).join('');
            }

            if (articleEl) articleEl.innerHTML = renderMarkdown(body);
        })
        .catch((err) => {
            if (articleEl) {
                articleEl.innerHTML = `<div class="border border-red-500/30 bg-red-950/20 text-red-300 rounded-xl p-6 text-sm">Nie udało się wczytać artykułu: ${inline(err.message)}</div>`;
            }
        });
})();
