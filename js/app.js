/**
 * Global Configuration & Supabase Initialization
 */
const SUPABASE_URL = 'https://yxhxrlmydbiblpninatx.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_bp2Xrh7oGCwC55rj2JTGxQ_LmlAiabw';

if (typeof supabase === 'undefined') {
    console.error('KRYTYCZNY BŁĄD: Biblioteka Supabase nie została załadowana!');
}

const supabaseClient = typeof supabase !== 'undefined' ? supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY) : null;

let allProjects = [];
let allArticles = [];
let allResearch = [];
let currentFilter = 'ALL';

function escapeHtml(value) {
    if (value === null || value === undefined) return '';
    return String(value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

async function loadComponents() {
    const includes = document.querySelectorAll('[data-include]');
    
    for (const el of includes) {
        const file = el.getAttribute('data-include').replace(/\\/g, '/');
        try {
            const resp = await fetch(file);
            if (resp.ok) {
                el.outerHTML = await resp.text();
            } else {
                el.innerHTML = `<div class="text-red-400 text-xs p-4">Błąd ładowania komponentu ${escapeHtml(file)}</div>`;
            }
        } catch (err) {
            console.error(`Błąd wczytywania ${file}:`, err);
        }
    }

    fetchArticles();
    fetchProjects();
    fetchResearch();
    runHealthCheck();
}

async function handleContactSubmit(e) {
    e.preventDefault();
    e.stopPropagation();

    if (!supabaseClient) {
        console.error('Brak klienta Supabase.');
        return;
    }

    const emailInput = document.getElementById('contact-email');
    const messageInput = document.getElementById('contact-message');
    const submitBtn = document.getElementById('contact-submit-btn');
    const statusDiv = document.getElementById('contact-status');

    if (!emailInput || !messageInput) {
        console.error('Nie znaleziono pól formularza #contact-email lub #contact-message w DOM.');
        return;
    }

    const email = emailInput.value.trim();
    const message = messageInput.value.trim();

    if (!email || !message) {
        if (statusDiv) {
            statusDiv.className = 'text-xs text-amber-400 font-mono mt-2';
            statusDiv.innerText = 'Wypełnij wszystkie pola!';
        }
        return;
    }

    try {
        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.innerText = '[ Wysyłanie... ]';
        }
        if (statusDiv) {
            statusDiv.className = 'text-xs text-slate-400 font-mono mt-2';
            statusDiv.innerText = 'Zapisywanie w węźle Supabase...';
        }

        const senderName = email.split('@')[0] || 'Anonim';

        const { data, error } = await supabaseClient
            .from('messages')
            .insert([{ 
                sender_name: senderName,
                email: email, 
                message: message, 
                created_at: new Date().toISOString() 
            }])
            .select();

        if (error) throw error;

        if (statusDiv) {
            statusDiv.className = 'text-xs text-emerald-400 font-mono mt-2';
            statusDiv.innerText = '✔ Wiadomość wysłana pomyślnie!';
        }

        emailInput.value = '';
        messageInput.value = '';
    } catch (err) {
        console.error('Błąd wysyłania formularza do Supabase:', err);
        if (statusDiv) {
            statusDiv.className = 'text-xs text-rose-400 font-mono mt-2';
            statusDiv.innerText = '✖ Błąd: ' + (err.message || 'Odrzucono połączenie');
        }
    } finally {
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.innerText = '[ Wyślij Wiadomość ]';
        }
    }
}

async function fetchArticles() {
    const grid = document.getElementById('articles-grid');
    if (!grid || !supabaseClient) return;

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
        <div onclick="openArticleModal(${Number(a.id)})" class="tile-hover bg-brand-card border border-brand-border rounded-xl p-5 cursor-pointer flex flex-col justify-between space-y-3 group">
            <div class="space-y-2">
                <div class="flex items-center justify-between text-[10px] text-emerald-400 font-mono">
                    <span>${escapeHtml(a.tags ? a.tags.join(' ') : '')}</span>
                    <span class="text-gray-500">${escapeHtml(a.read_time || '3 min read')}</span>
                </div>
                <h3 class="text-base font-bold text-white group-hover:text-emerald-400 transition">${escapeHtml(a.title)}</h3>
                <p class="text-xs text-gray-400 leading-relaxed line-clamp-2">${escapeHtml(a.summary)}</p>
            </div>
            <div class="pt-2 border-t border-brand-border/40 flex items-center justify-between text-[11px] text-emerald-400 font-medium">
                <span>Czytaj poradnik</span>
                <span>&rarr;</span>
            </div>
        </div>
    `).join('');
}

async function fetchResearch() {
    const grid = document.getElementById('research-grid');
    if (!grid || !supabaseClient) return;

    try {
        const { data, error } = await supabaseClient
            .from('research')
            .select('*')
            .order('id', { ascending: false });

        if (error) throw error;
        allResearch = data || [];
        renderResearch();
    } catch (err) {
        console.error('Błąd pobierania publikacji Lab & Research:', err);
        grid.innerHTML = `<div class="col-span-full text-center py-8 text-gray-500 text-xs">Baza badań jest obecnie aktualizowana.</div>`;
    }
}

function renderResearch() {
    const grid = document.getElementById('research-grid');
    const searchInput = document.getElementById('research-search-input');
    if (!grid) return;

    const searchVal = searchInput ? searchInput.value.toLowerCase() : '';

    const filtered = allResearch.filter(r => {
        const title = (r.title || '').toLowerCase();
        const summary = (r.summary || '').toLowerCase();
        const tagsText = (r.tags ? r.tags.join(' ') : '').toLowerCase();
        return title.includes(searchVal) || summary.includes(searchVal) || tagsText.includes(searchVal);
    });

    if (allResearch.length === 0) {
        grid.innerHTML = `<div class="col-span-full text-center py-8 text-gray-500 text-xs">Brak publikacji w bazie badań.</div>`;
        return;
    }

    if (filtered.length === 0) {
        grid.innerHTML = `<div class="col-span-full text-center py-8 text-gray-500 text-xs">Brak publikacji spełniających kryteria wyszukiwania.</div>`;
        return;
    }

    grid.innerHTML = filtered.map(r => `
        <a href="${escapeHtml(r.url || '#')}" class="block bg-brand-card border border-brand-border hover:border-emerald-500/50 rounded-xl p-6 transition-all hover:-translate-y-1 group">
            <div class="flex gap-2 mb-3 text-xs">
                ${r.tags ? r.tags.map((t, i) => `<span class="${i === 0 ? 'text-emerald-400' : 'text-cyan-400'}">${escapeHtml(t)}</span>`).join('') : ''}
            </div>
            <h3 class="text-lg font-bold text-white group-hover:text-emerald-400 transition-colors mb-2">
                ${escapeHtml(r.title)}
            </h3>
            <p class="text-sm text-gray-400 line-clamp-2">
                ${escapeHtml(r.summary)}
            </p>
        </a>
    `).join('');
}

function filterResearch() { renderResearch(); }

async function fetchProjects() {
    const grid = document.getElementById('projects-grid');
    if (!grid || !supabaseClient) return;

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

function renderProjects() {
    const grid = document.getElementById('projects-grid');
    const searchInput = document.getElementById('search-input');
    if (!grid) return;

    const searchVal = searchInput ? searchInput.value.toLowerCase() : '';

    const filtered = allProjects.filter(p => {
        const matchesTag = currentFilter === 'ALL' || (p.tags && p.tags.includes(currentFilter));
        const title = (p.title || '').toLowerCase();
        const description = (p.description || '').toLowerCase();
        const tagsText = (p.tags ? p.tags.join(' ') : '').toLowerCase();
        return matchesTag && (title.includes(searchVal) || description.includes(searchVal) || tagsText.includes(searchVal));
    });

    if (filtered.length === 0) {
        grid.innerHTML = `<div class="col-span-full text-center py-12 text-gray-500 text-xs">Brak projektów spełniających kryteria wyszukiwania.</div>`;
        return;
    }

    grid.innerHTML = filtered.map(p => `
        <div onclick="openProjectModal(${Number(p.id)})" class="tile-hover tile-hover-cyan bg-brand-card border border-brand-border rounded-xl p-5 cursor-pointer flex flex-col justify-between space-y-4 group">
            <div class="space-y-2">
                <div class="text-[10px] text-emerald-400 font-mono flex flex-wrap gap-1">
                    ${p.tags ? p.tags.map(t => `<span class="bg-emerald-950/40 border border-emerald-500/20 px-1.5 py-0.5 rounded">${escapeHtml(t)}</span>`).join('') : ''}
                </div>
                <h3 class="text-base font-bold text-white group-hover:text-emerald-400 transition">${escapeHtml(p.title)}</h3>
                <p class="text-xs text-gray-400 line-clamp-3 leading-relaxed">${escapeHtml(p.description)}</p>
            </div>
            <div class="pt-2 border-t border-brand-border/40 flex items-center justify-between text-[11px] text-cyan-400 font-medium">
                <span>Zobacz szczegóły & diagram</span>
                <span>&rarr;</span>
            </div>
        </div>
    `).join('');
}

function setFilter(tag) {
    currentFilter = tag;
    document.querySelectorAll('.tag-btn').forEach(btn => {
        if (btn.innerText.includes(tag) || (tag === 'ALL' && btn.innerText.includes('Wszystkie'))) {
            btn.className = 'tag-btn active-tag px-3 py-1 rounded-md border border-emerald-500 bg-emerald-500/20 text-emerald-300 text-xs font-mono';
        } else {
            btn.className = 'tag-btn px-3 py-1 rounded-md border border-brand-border bg-brand-card text-gray-400 hover:border-gray-500 text-xs font-mono';
        }
    });
    renderProjects();
}

function filterProjects() { renderProjects(); }

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

async function runHealthCheck() {
    const indicator = document.getElementById('health-indicator');
    const text = document.getElementById('health-text');
    if (!indicator || !text) return;
    if (!supabaseClient) {
        indicator.className = 'w-2 h-2 rounded-full bg-red-500';
        text.innerText = 'Offline';
        return;
    }

    text.innerText = 'Pinging...';
    indicator.className = 'w-2 h-2 rounded-full bg-yellow-500 animate-ping';

    const start = performance.now();
    try {
        const { error } = await supabaseClient.from('projects').select('id').limit(1);
        const duration = Math.round(performance.now() - start);
        if (error) throw error;
        indicator.className = 'w-2 h-2 rounded-full bg-emerald-500';
        text.innerText = `Online (${duration}ms)`;
    } catch (err) {
        indicator.className = 'w-2 h-2 rounded-full bg-red-500';
        text.innerText = 'Offline';
    }
}

document.addEventListener('DOMContentLoaded', loadComponents);