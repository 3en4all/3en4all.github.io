// Tło 3D (splat z idol3D) tylko na mocniejszych komputerach; telefon i tryb oszczędny zostają przy statycznym kadrze.
import * as THREE from 'three';
import * as GS from '@mkkellogg/gaussian-splats-3d';

const mocny = () => {
    if (!matchMedia('(min-width: 1024px) and (pointer: fine)').matches) return false;
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return false;
    if ((navigator.hardwareConcurrency || 2) < 4) return false;
    if (navigator.connection && navigator.connection.saveData) return false;
    try { return !!document.createElement('canvas').getContext('webgl2'); } catch { return false; }
};

function czekajNa(id) {
    return new Promise(ok => {
        const el = document.getElementById(id);
        if (el) return ok(el);
        const mo = new MutationObserver(() => { const e = document.getElementById(id); if (e) { mo.disconnect(); ok(e); } });
        mo.observe(document.body, { childList: true, subtree: true });
    });
}

async function start() {
    const host = await czekajNa('hero3d-canvas');
    const panel = document.getElementById('hero3d');
    const renderer = new THREE.WebGLRenderer({ antialias: false, alpha: true, powerPreference: 'high-performance' });
    renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5));
    renderer.setClearColor(0x000000, 0);
    host.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(32, 1, 0.05, 50);
    const obiekt = new THREE.Group();
    obiekt.rotation.x = Math.PI; // idol: „góra” to -Y
    scene.add(obiekt);

    const viewer = new GS.DropInViewer({ sharedMemoryForWorkers: false, gpuAcceleratedSort: false });
    obiekt.add(viewer);

    const rozmiar = () => {
        const w = host.clientWidth, h = host.clientHeight;
        renderer.setSize(w, h, false);
        camera.aspect = w / h;
        // obiekt w prawej części panelu, tekst zostaje czytelny po lewej
        camera.setViewOffset(w, h, -w * 0.26, 0, w, h);
        camera.updateProjectionMatrix();
    };
    rozmiar();
    addEventListener('resize', rozmiar);

    await viewer.addSplatScene('assets/hero/plytka.splat', { format: GS.SceneFormat.Splat, showLoadingUI: false, progressiveLoad: false });
    panel.classList.add('is-live');
    setTimeout(() => { const p = panel.querySelector('.h3d-poster'); if (p) p.style.display = 'none'; }, 1500);

    let widoczny = true;
    new IntersectionObserver(([e]) => { widoczny = e.isIntersecting; }).observe(panel);
    const t0 = performance.now();
    renderer.setAnimationLoop(() => {
        if (!widoczny || document.hidden) return;
        const t = (performance.now() - t0) / 1000;
        const kat = 0.9 + Math.sin(t * 0.25) * 0.55; // powolne kołysanie, bez pełnego obrotu
        camera.position.set(Math.sin(kat) * 1.75, 1.05 + Math.sin(t * 0.17) * 0.06, Math.cos(kat) * 1.75);
        camera.lookAt(0, 0.12, 0);
        renderer.render(scene, camera);
    });
}

if (mocny()) start().catch(err => console.warn('hero3d:', err));
