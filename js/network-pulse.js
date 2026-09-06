(() => {
    const BASE_VALUE = 2357;
    const START_UTC_MS = Date.UTC(2026, 8, 6, 8, 0, 0);
    const HOUR_MS = 60 * 60 * 1000;

    const hourlyIncrement = (hourIndex) => {
        let x = (hourIndex + 1) * 1103515245 + 12345;
        x = (x >>> 0) ^ ((x >>> 16) & 0xffff);
        return (x % 17) + 1;
    };

    const calculatePulse = (nowMs = Date.now()) => {
        const elapsedHours = Math.max(0, Math.floor((nowMs - START_UTC_MS) / HOUR_MS));
        let value = BASE_VALUE;
        for (let i = 0; i < elapsedHours; i += 1) value += hourlyIncrement(i);
        return value;
    };

    const renderPulse = () => {
        const target = document.getElementById('network-pulse-value');
        if (!target) return;
        target.textContent = new Intl.NumberFormat('pl-PL').format(calculatePulse());
    };

    const scheduleRefresh = () => {
        renderPulse();
        const now = Date.now();
        const delay = HOUR_MS - (now % HOUR_MS) + 1000;
        window.setTimeout(() => {
            renderPulse();
            window.setInterval(renderPulse, HOUR_MS);
        }, delay);
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', scheduleRefresh, { once: true });
    } else {
        scheduleRefresh();
    }
})();
