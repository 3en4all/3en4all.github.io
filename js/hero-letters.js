// Nagłówek hero jako litery-klocki 3D: lekkie kołysanie + co chwilę jedna litera wysuwa się do ekranu.
(() => {
    const GRAD = [[110, 231, 183], [103, 232, 249], [196, 181, 253]]; // emerald-300, cyan-300, violet-300
    const mix = (a, b, t) => a.map((v, i) => Math.round(v + (b[i] - v) * t));
    const gradAt = t => t < .5 ? mix(GRAD[0], GRAD[1], t * 2) : mix(GRAD[1], GRAD[2], (t - .5) * 2);
    const rgb = c => `rgb(${c.join(',')})`;
    const ruch = () => !matchMedia('(prefers-reduced-motion: reduce)').matches;
    let timer = null;

    function tekst(el) {
        const lang = (window.getCurrentLanguage && window.getCurrentLanguage()) === 'en' ? 'data-en' : 'data-pl';
        return el.getAttribute(lang) ?? el.textContent;
    }

    function litera(ch, kolor, cien) {
        const s = document.createElement('span');
        s.className = ch === ' ' ? 'k3 sp' : 'k3';
        s.style.setProperty('--t', (5 + Math.random() * 4).toFixed(2) + 's');
        s.style.setProperty('--dl', (-Math.random() * 8).toFixed(2) + 's');
        s.style.setProperty('--rx', (3 + Math.random() * 5).toFixed(1) + 'deg');
        s.style.setProperty('--ry', (Math.random() < .5 ? -1 : 1) * (4 + Math.random() * 6) + 'deg');
        const i = document.createElement('i');
        if (ch !== ' ') {
            i.dataset.c = ch;
            i.style.setProperty('--c', kolor);
            i.style.setProperty('--d', cien);
        }
        s.appendChild(i);
        return s;
    }

    // Słowa w osobnych blokach nowrap, żeby wiersz łamał się między słowami, nie w środku.
    function dodaj(cel, txt, kolorFn) {
        const n = Math.max(txt.length - 1, 1);
        let w = null;
        [...txt].forEach((ch, idx) => {
            if (ch === ' ') { w = null; cel.appendChild(litera(' ')); return; }
            if (!w) { w = document.createElement('span'); w.className = 'k3w'; cel.appendChild(w); }
            const [k, c] = kolorFn(idx / n);
            w.appendChild(litera(ch, k, c));
        });
    }

    function zbuduj(h1) {
        const layer = h1.querySelector('.k3-layer');
        const zr = h1.querySelectorAll('.h3d-src [data-pl]');
        if (!layer || zr.length < 3) return;
        layer.textContent = '';
        const bialy = () => ['#ffffff', '#4b5563'];
        dodaj(layer, tekst(zr[0]), bialy);
        layer.appendChild(document.createElement('br'));
        dodaj(layer, tekst(zr[1]), bialy);
        dodaj(layer, tekst(zr[2]), t => { const c = gradAt(t); return [rgb(c), rgb(c.map(v => Math.round(v * .35)))]; });
        h1.classList.add('k3-on');
    }

    function wysuwaj(h1) {
        clearInterval(timer);
        if (!ruch()) return;
        timer = setInterval(() => {
            if (document.hidden) return;
            const lit = h1.querySelectorAll('.k3 i[data-c]');
            if (!lit.length) return;
            const el = lit[Math.floor(Math.random() * lit.length)];
            el.classList.add('pop');
            setTimeout(() => el.classList.remove('pop'), 1100);
        }, 1400);
    }

    function start() {
        const h1 = document.querySelector('#hero3d h1');
        if (!h1) return false;
        zbuduj(h1);
        wysuwaj(h1);
        window.addEventListener('techm8:languagechange', () => zbuduj(h1));
        return true;
    }

    if (!start()) {
        const mo = new MutationObserver(() => { if (start()) mo.disconnect(); });
        mo.observe(document.documentElement, { childList: true, subtree: true });
    }
})();
