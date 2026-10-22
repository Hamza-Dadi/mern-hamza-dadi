// ===== Application MERN — Frontend JavaScript =====
// Gestion des appels API avec basculement automatique (Partie 4 & Partie 8)

// Configuration centralisée des backends
const API_CONFIG = {
    // Backend Principal : Railway (ou localhost:3000 en dev)
    PRIMARY_URL: (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
        ? 'http://localhost:3000'
        : 'https://mern-hamza-dadi-production.up.railway.app',

    // Backend de Secours : Vercel
    BACKUP_URL: (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
        ? 'http://localhost:3000'
        : 'https://mern-hamza-dadi-backend.vercel.app',

    // Délai maximal par requête avant bascule (en millisecondes)
    TIMEOUT_MS: 4000
};

// Sélecteurs DOM
const serverStatus = document.getElementById('serverStatus');
const statusText = document.getElementById('statusText');
const activeBackendText = document.getElementById('activeBackendText');
const backendBadge = document.getElementById('backendBadge');
const errorBanner = document.getElementById('errorBanner');
const successBanner = document.getElementById('successBanner');
const itemForm = document.getElementById('itemForm');
const itemNameInput = document.getElementById('itemName');
const itemDescInput = document.getElementById('itemDesc');
const btnSubmit = document.getElementById('btnSubmit');
const btnRefresh = document.getElementById('btnRefresh');
const itemsTable = document.getElementById('itemsTable');
const itemsBody = document.getElementById('itemsBody');
const itemsCount = document.getElementById('itemsCount');
const loadingIndicator = document.getElementById('loadingIndicator');
const emptyMessage = document.getElementById('emptyMessage');

// Protection anti-doublon (Test D)
let isSubmitting = false;

// Fonctions d'affichage des alertes
function showError(message) {
    errorBanner.textContent = message;
    errorBanner.style.display = 'block';
    setTimeout(() => {
        errorBanner.style.display = 'none';
    }, 6000);
}

function showSuccess(message) {
    successBanner.textContent = message;
    successBanner.style.display = 'block';
    setTimeout(() => {
        successBanner.style.display = 'none';
    }, 4000);
}

function showWarning(message) {
    showError(`⚠️ ${message}`);
}

// Mise à jour de l'UI
function setServerStatus(status, text) {
    const dot = serverStatus.querySelector('.status-dot');
    dot.className = `status-dot ${status}`;
    statusText.textContent = text;
}

function updateBackendBadge(name, state = 'normal') {
    activeBackendText.textContent = name;
    backendBadge.className = 'backend-badge';
    if (state === 'backup' || name.includes('Secours') || name.includes('Vercel')) {
        backendBadge.classList.add('backup');
    } else if (state === 'offline' || name.includes('Hors ligne')) {
        backendBadge.classList.add('offline');
    }
}

/**
 * Fonction de requête résiliente avec basculement automatique (Partie 8)
 * - Tente le backend principal (Railway).
 * - En cas d'échec (timeout AbortController, erreur réseau, HTTP 4xx/5xx),
 *   bascule automatiquement vers le backend de secours (Vercel).
 */
async function fetchWithFailover(endpoint, options = {}) {
    const targets = [
        { name: 'Railway (Principal)', baseUrl: API_CONFIG.PRIMARY_URL },
        { name: 'Vercel (Secours)', baseUrl: API_CONFIG.BACKUP_URL }
    ];

    let lastError = null;

    for (let i = 0; i < targets.length; i++) {
        const target = targets[i];
        const fullUrl = `${target.baseUrl}${endpoint}`;

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.TIMEOUT_MS);

        try {
            console.log(`[Failover] Tentative sur ${target.name} : ${fullUrl}`);
            const response = await fetch(fullUrl, {
                ...options,
                signal: controller.signal
            });
            clearTimeout(timeoutId);

            // Vérification de response.ok
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error || `Erreur HTTP ${response.status}`);
            }

            // Succès
            updateBackendBadge(target.name, i === 0 ? 'normal' : 'backup');
            setServerStatus('connected', `Connecté (${target.name})`);
            return response;
        } catch (err) {
            clearTimeout(timeoutId);
            const isTimeout = err.name === 'AbortError';
            const reason = isTimeout ? `Timeout (> ${API_CONFIG.TIMEOUT_MS}ms)` : err.message;
            console.warn(`[Failover] Échec sur ${target.name} : ${reason}`);
            lastError = new Error(`${target.name} : ${reason}`);

            if (i === 0 && targets.length > 1) {
                showWarning(`Principal indisponible (${reason}). Bascule vers le secours...`);
            }
        }
    }

    // Échec sur les deux backends (Test C)
    setServerStatus('error', 'Tous les backends hors service');
    updateBackendBadge('Hors ligne', 'offline');
    throw new Error(`Tous les backends sont inaccessibles (${lastError ? lastError.message : 'inconnu'})`);
}

// 1. Vérification de santé : GET /api/health
async function checkHealth() {
    try {
        const res = await fetchWithFailover('/api/health');
        const data = await res.json();
        console.log('[API Health]', data);
    } catch (err) {
        showError(err.message);
    }
}

// 2. Récupération des éléments : GET /api/items
async function loadItems() {
    loadingIndicator.style.display = 'block';
    emptyMessage.style.display = 'none';

    try {
        const res = await fetchWithFailover('/api/items');
        const items = await res.json();
        renderItems(items);
    } catch (err) {
        showError(`Erreur chargement : ${err.message}`);
        loadingIndicator.style.display = 'none';
    }
}

// Rendu des éléments dans le tableau
function renderItems(items) {
    loadingIndicator.style.display = 'none';
    itemsBody.innerHTML = '';
    itemsCount.textContent = items ? items.length : 0;

    if (!items || items.length === 0) {
        emptyMessage.style.display = 'block';
        return;
    }

    emptyMessage.style.display = 'none';
    items.forEach(item => {
        const tr = document.createElement('tr');
        const dateStr = item.createdAt
            ? new Date(item.createdAt).toLocaleDateString('fr-FR', {
                year: 'numeric', month: 'short', day: 'numeric',
                hour: '2-digit', minute: '2-digit'
            })
            : '—';

        tr.innerHTML = `
            <td><strong>${escapeHtml(item.name)}</strong></td>
            <td>${item.description ? escapeHtml(item.description) : '<em>Aucune description</em>'}</td>
            <td><small>${dateStr}</small></td>
        `;
        itemsBody.appendChild(tr);
    });
}

function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

// 3. Ajout d'un élément : POST /api/items (avec formulaire vide et validation)
itemForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Protection anti-doublon (Test D)
    if (isSubmitting) return;

    const name = itemNameInput.value.trim();
    const description = itemDescInput.value.trim();

    if (!name) {
        showError('Le nom de l\'élément est obligatoire.');
        return;
    }

    isSubmitting = true;
    btnSubmit.disabled = true;
    btnSubmit.textContent = 'Enregistrement...';

    const idempotencyKey = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

    try {
        const res = await fetchWithFailover('/api/items', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Idempotency-Key': idempotencyKey
            },
            body: JSON.stringify({ name, description })
        });

        const createdItem = await res.json();
        showSuccess(`Élément "${createdItem.name}" ajouté avec succès !`);

        // Réinitialiser le formulaire
        itemForm.reset();
        await loadItems();
    } catch (err) {
        showError(`Échec de l'enregistrement : ${err.message}`);
    } finally {
        isSubmitting = false;
        btnSubmit.disabled = false;
        btnSubmit.textContent = 'Ajouter l\'élément';
    }
});

btnRefresh.addEventListener('click', () => {
    checkHealth();
    loadItems();
});

// Lancement au chargement
document.addEventListener('DOMContentLoaded', () => {
    checkHealth();
    loadItems();
});
