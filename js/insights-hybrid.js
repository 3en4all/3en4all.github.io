(() => {
    let enhancing = false;

    function enhanceInsights() {
        if (enhancing) return;
        const grid = document.getElementById('articles-grid');
        if (!grid) return;

        const cards = Array.from(grid.children).filter(el => el.querySelector?.('h3'));
        if (!cards.length) return;

        enhancing = true;
        observer.disconnect();

        try {
            cards.forEach((card, index) => {
                if (card.dataset.insightsV2 === '1') return;
                card.dataset.insightsV2 = '1';
                card.classList.add('relative', 'overflow-hidden', 'rounded-2xl');

                const title = card.querySelector('h3');
                const summary = card.querySelector('p');
                const footer = card.lastElementChild;

                if (index === 0) {
                    card.classList.add('lg:col-span-2', 'lg:row-span-2', 'p-6', 'sm:p-8', 'border-emerald-500/25');
                    card.style.background = 'linear-gradient(145deg, rgba(6,78,59,.16), rgba(13,17,23,.96) 52%, rgba(8,51,68,.10))';
                    if (title) {
                        title.classList.remove('text-base');
                        title.classList.add('text-2xl', 'sm:text-3xl', 'tracking-[-0.035em]');
                    }
                    if (summary) {
                        summary.classList.remove('text-xs', 'line-clamp-2');
                        summary.classList.add('text-sm', 'sm:text-base', 'leading-7', 'max-w-3xl');
                    }
                    const badge = document.createElement('div');
                    badge.className = 'text-[10px] font-mono uppercase tracking-[0.18em] text-amber-300 mb-3';
                    badge.textContent = 'Featured insight';
                    card.firstElementChild?.prepend(badge);
                    if (footer) footer.classList.add('mt-6');
                } else if (index <= 2) {
                    card.classList.add('p-5', 'border-cyan-500/15');
                    if (title) title.classList.add('text-lg');
                    if (summary) summary.classList.add('leading-6');
                } else {
                    card.classList.add('p-5', 'lg:col-span-1');
                }
            });
        } finally {
            observer.observe(grid, { childList: true });
            enhancing = false;
        }
    }

    const observer = new MutationObserver(enhanceInsights);
    document.addEventListener('DOMContentLoaded', () => {
        const grid = document.getElementById('articles-grid');
        if (grid) observer.observe(grid, { childList: true });
        enhanceInsights();
    });
    setTimeout(() => {
        const grid = document.getElementById('articles-grid');
        if (grid) observer.observe(grid, { childList: true });
        enhanceInsights();
    }, 350);
})();
