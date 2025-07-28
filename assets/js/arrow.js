
// Ukryj strzałkę po 5 sekundach
window.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        const arrow = document.querySelector('.arrow-indicator');
        if (arrow) {
            arrow.style.display = 'none';
        }
    }, 5000);
});
