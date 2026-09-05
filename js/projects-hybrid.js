(() => {
    const FLAGSHIP_RE = /ai\s*research\s*engine|airesearchengine/i;

    function upgradeProjects() {
        const grid = document.getElementById('projects-grid');
        if (!grid) return;

        const cards = Array.from(grid.children).filter(el => el.querySelector?.('h3'));
        const count = document.getElementById('projects-visible-count');
        if (count) count.textContent = String(cards.length);

        cards.forEach(card => {
            const title = card.querySelector('h3')?.textContent || '';
            if (!FLAGSHIP_RE.test(title)) return;
            if (card.dataset.flagshipEnhanced === '1') return;

            card.dataset.flagshipEnhanced = '1';
            card.classList.add('md:col-span-2', 'lg:col-span-3', 'relative', 'overflow-hidden');
            card.classList.remove('rounded-xl');
            card.classList.add('rounded-2xl', 'p-6', 'sm:p-8', 'border-emerald-500/30');
            card.style.background = 'linear-gradient(135deg, rgba(6,78,59,.20), rgba(13,17,23,.96) 48%, rgba(8,51,68,.16))';

            const badgeRow = document.createElement('div');
            badgeRow.className = 'flex flex-wrap items-center gap-2 mb-4 text-[10px] font-mono uppercase tracking-[0.14em]';
            badgeRow.innerHTML = `
                <span class="text-emerald-300 border border-emerald-500/30 bg-emerald-500/10 rounded-full px-3 py-1.5">Flagship system</span>
                <span class="text-cyan-300 border border-cyan-500/25 bg-cyan-500/10 rounded-full px-3 py-1.5">Alpha accepted</span>
            `;

            const content = card.firstElementChild;
            if (content) content.prepend(badgeRow);

            const titleEl = card.querySelector('h3');
            if (titleEl) {
                titleEl.classList.remove('text-base');
                titleEl.classList.add('text-2xl', 'sm:text-3xl', 'tracking-[-0.03em]');
            }

            const desc = card.querySelector('p');
            if (desc) {
                desc.classList.remove('text-xs', 'line-clamp-3');
                desc.classList.add('text-sm', 'max-w-4xl');
            }

            const footer = card.lastElementChild;
            if (footer) {
                footer.classList.add('mt-3');
                const label = footer.querySelector('span:first-child');
                if (label) label.textContent = 'Otwórz architekturę i szczegóły';
            }
        });
    }

    const observer = new MutationObserver(upgradeProjects);
    observer.observe(document.documentElement, { subtree: true, childList: true });

    document.addEventListener('DOMContentLoaded', upgradeProjects);
    setTimeout(upgradeProjects, 300);
})();
