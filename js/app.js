const SUPABASE_URL = 'https://yxhxrlmydbiblpninatx.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_bp2Xrh7oGCwC55rj2JTGxQ_LmlAiabw';

const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

let allProjects = [];
let allArticles = [];
let currentFilter = 'ALL';

// DYNAMICZNY LOADER SEKCJI HTML (DATA-INCLUDE)
async function loadComponents() {
    const includes = document.querySelectorAll('[data-include]');
    for (const el of includes) {
        const file = el.getAttribute('data-include');
        try {
            const resp = await fetch(file);
            if (resp.ok) {
                el.outerHTML = await resp.text();
            } else {
                el.innerHTML = `<div class="text-red-400 text-xs">Błąd ładowania komponentu ${file}</div>`;
            }
        } catch (err) {
            console.error(`Błąd wczytywania ${file}:`, err);
        }
    }
    
    // Inicjalizacja danych po załadowaniu drzewa DOM komponentów
    fetchArticles();
    fetchProjects();
    runHealthCheck();
}

// POBIERANIE ARTYKUŁÓW Z SUPABASE
async function fetchArticles() {
    const grid = document.getElementById('articles-grid');
    if (!grid) return;

    try {
        const { data, error } = await supabaseClient
            .from('articles')
            .select('*')
            .order('id', { ascending: false });

        if (error) throw error;

        allArticles = data || [];
        renderArticles();
    } catch (err) {
        console.error('Błąd pobierania artykułów:', err);
        grid.innerHTML = `<div class="col-span-full text-center py-6 text-gray-500 text-xs">Baza wiedzy jest obecnie aktualizowana.</div>`;
    }
}

function renderArticles() {
    const grid = document.getElementById('articles-grid');
    if (!grid) return;

    if (allArticles.length === 0) {
        grid.innerHTML = `<div class="col-span-full text-center py-6 text-gray-500 text-xs">Brak publikacji w bazie wiedzy.</div>`;
        return;
    }

    grid.innerHTML = allArticles.map(a => `
        <div onclick="openArticleModal(${a.id})" class="bg-brand-card/60 border border-brand-border rounded-xl p-5 hover:border-emerald-500/50 transition duration-300 cursor-pointer flex flex-col justify-between space-y-3 group">
            <div class="space-y-2">
                <div class="flex items-center justify-between text-[10px] text-emerald-400 font-mono">
                    <span>${a.tags ? a.tags.join(' ') : ''}</span>
                    <span class="text-gray-500">${a.read_time || '3 min read'}</span>
                </div>
                <h3 class="text-base font-bold text-white group-hover:text-emerald-400 transition">${a.title}</h3>
                <p class="text-xs text-gray-400 leading-relaxed line-clamp-2">${a.summary}</p>
            </div>
            <div class="pt-2 border-t border-brand-border/40 flex items-center justify-between text-[11px] text-emerald-400 font-medium">
                <span>Czytaj poradnik</span>
                <span>&rarr;</span>
            </div>
        </div>
    `).join('');
}

// POBIERANIE PROJEKTÓW Z SUPABASE
async function fetchProjects() {
    const grid = document.getElementById('projects-grid');
    if (!grid) return;

    try {
        const { data, error } = await supabaseClient
            .from('projects')
            .select('*')
            .order('id', { ascending: true });

        if (error) throw error;

        allProjects = data || [];
        renderProjects();
    } catch (err) {
        console.error('Błąd pobierania projektów:', err);
        grid.innerHTML = `<div class="col-span-full text-center py-12 text-red-400 text-xs">Nie udało się załadować projektów z bazy Supabase.</div>`;
    }
}

// RENDEROWANIE KART PROJEKTÓW
function renderProjects() {
    const grid = document.getElementById('projects-grid');
    const searchInput = document.getElementById('search-input');
    if (!grid || !searchInput) return;

    const searchVal = searchInput.value.toLowerCase();

    const filtered = allProjects.filter(p => {
        const matchesTag = currentFilter === 'ALL' || (p.tags && p.tags.includes(currentFilter));
        const matchesSearch = p.title.toLowerCase().includes(searchVal) || 
                              p.description.toLowerCase().includes(searchVal) ||
                              (p.tags && p.tags.join(' ').toLowerCase().includes(searchVal));
        return matchesTag && matchesSearch;
    });

    if (filtered.length === 0) {
        grid.innerHTML = `<div class="col-span-full text-center py-12 text-gray-500 text-xs">Brak projektów spełniających kryteria wyszukiwania.</div>`;
        return;
    }

    grid.innerHTML = filtered.map(p => `
        <div onclick="openProjectModal(${p.id})" class="bg-brand-card border border-brand-border rounded-xl p-5 hover:border-emerald-500/50 transition duration-300 cursor-pointer flex flex-col justify-between space-y-4 group">
            <div class="space-y-2">
                <div class="text-[10px] text-emerald-400 font-mono flex flex-wrap gap-1">
                    ${p.tags ? p.tags.map(t => `<span class="bg-emerald-950/40 border border-emerald-500/20 px-1.5 py-0.5 rounded">${t}</span>`).join('') : ''}
                </div>
                <h3 class="text-base font-bold text-white group-hover:text-emerald-400 transition">${p.title}</h3>
                <p class="text-xs text-gray-400 line-clamp-3 leading-relaxed">${p.description}</p>
            </div>
            <div class="pt-2 border-t border-brand-border/40 flex items-center justify-between text-[11px] text-cyan-400 font-medium">
                <span>Zobacz szczegóły & diagram</span>
                <span>&rarr;</span>
            </div>
        </div>
    `).join('');
}

// FILTROWANIE
function setFilter(tag) {
    currentFilter = tag;
    document.querySelectorAll('.tag-btn').forEach(btn => {
        if (btn.innerText.includes(tag) || (tag === 'ALL' && btn.innerText.includes('Wszystkie'))) {
            btn.className = 'tag-btn active-tag px-3 py-1 rounded-md border border-emerald-500 bg-emerald-500/20 text-emerald-300';
        } else {
            btn.className = 'tag-btn px-3 py-1 rounded-md border border-brand-border bg-brand-card text-gray-400 hover:border-gray-500';
        }
    });
    renderProjects();
}

function filterProjects() {
    renderProjects();
}

// OBSŁUGA MODALI
function openBioModal() { document.getElementById('bio-modal')?.classList.remove('hidden'); }
function closeBioModal() { document.getElementById('bio-modal')?.classList.add('hidden'); }

function openProjectModal(id) {
    const project = allProjects.find(p => p.id === id);
    if (!project) return;
    document.getElementById('modal-title').innerText = project.title;
    document.getElementById('modal-tags').innerText = project.tags ? project.tags.join(' ') : '';
    document.getElementById('modal-description').innerText = project.description;
    document.getElementById('modal-diagram').innerText = project.diagram || 'Brak diagramu dla tego projektu.';
    document.getElementById('project-modal')?.classList.remove('hidden');
}
function closeProjectModal() { document.getElementById('project-modal')?.classList.add('hidden'); }

function openArticleModal(id) {
    const article = allArticles.find(a => a.id === id);
    if (!article) return;
    document.getElementById('article-modal-title').innerText = article.title;
    document.getElementById('article-modal-tags').innerText = article.tags ? article.tags.join(' ') : '';
    document.getElementById('article-modal-time').innerText = article.read_time || '3 min read';
    document.getElementById('article-modal-content').innerText = article.content;
    document.getElementById('article-modal')?.classList.remove('hidden');
}
function closeArticleModal() { document.getElementById('article-modal')?.classList.add('hidden'); }

// HEALTH CHECK
async function runHealthCheck() {
    const indicator = document.getElementById('health-indicator');
    const text = document.getElementById('health-text');
    if (!indicator || !text) return;

    text.innerText = 'Pinging...';
    indicator.className = 'w-2 h-2 rounded-full bg-yellow-500 animate-ping';

    const start = performance.now();
    try {
        const { data, error } = await supabaseClient.from('projects').select('id').limit(1);
        const duration = Math.round(performance.now() - start);
        if (error) throw error;
        indicator.className = 'w-2 h-2 rounded-full bg-emerald-500';
        text.innerText = `Online (${duration}ms)`;
    } catch (err) {
        indicator.className = 'w-2 h-2 rounded-full bg-red-500';
        text.innerText = 'Offline';
    }
}

// WYSYŁANIE FORMULARZA
async function handleContactSubmit(e) {
    e.preventDefault();
    const btn = document.getElementById('contact-submit-btn');
    const status = document.getElementById('contact-status');

    const name = document.getElementById('contact-name').value;
    const email = document.getElementById('contact-email').value;
    const message = document.getElementById('contact-message').value;

    btn.disabled = true;
    btn.innerText = 'Wysyłanie...';

    try {
        const { error } = await supabaseClient
            .from('messages')
            .insert([{ name, email, message }]);

        if (error) throw error;

        status.innerText = 'Wiadomość została wysłana pomyślnie!';
        status.className = 'text-xs text-emerald-400 font-medium block';
        document.getElementById('contact-form').reset();
    } catch (err) {
        console.error(err);
        status.innerText = 'Błąd podczas wysyłania wiadomości.';
        status.className = 'text-xs text-red-400 font-medium block';
    } finally {
        btn.disabled = false;
        btn.innerText = 'Wyślij Wiadomość';
    }
}

// RUN
window.addEventListener('DOMContentLoaded', loadComponents);