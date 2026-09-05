(() => {
    const seen = new WeakSet();

    const observer = 'IntersectionObserver' in window
        ? new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (!entry.isIntersecting) return;
                entry.target.classList.add('is-visible');
                observer.unobserve(entry.target);
            });
        }, {
            threshold: 0.12,
            rootMargin: '0px 0px -6% 0px'
        })
        : null;

    function registerReveal(el, index = 0) {
        if (!el || seen.has(el)) return;
        seen.add(el);
        el.classList.add('fx-reveal');
        if (index % 4) el.dataset.fxDelay = String(index % 4);

        if (observer) {
            observer.observe(el);
        } else {
            el.classList.add('is-visible');
        }
    }

    function enhanceMotion() {
        const sections = Array.from(document.querySelectorAll('main > section'));
        sections.forEach((section, index) => registerReveal(section, index));

        document.querySelectorAll('.hybrid-metric, .hybrid-live-card, .tile-hover').forEach((el) => {
            el.classList.add('fx-soft-glow');
            if (el.classList.contains('tile-hover-cyan') || el.classList.contains('cyan')) {
                el.classList.add('fx-soft-glow-cyan');
            }
        });
    }

    const mutationObserver = new MutationObserver(enhanceMotion);

    window.addEventListener('DOMContentLoaded', () => {
        enhanceMotion();
        const main = document.querySelector('main');
        if (main) mutationObserver.observe(main, { childList: true, subtree: true });
    });
})();
