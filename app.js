document.addEventListener('DOMContentLoaded', () => {
    // Referencias al DOM
    const modelViewer = document.getElementById('ar-model');
    const arButton = document.getElementById('ar-button-trigger');
    const arStatusToast = document.getElementById('ar-status-toast');
    const arStatusText = document.getElementById('ar-status-text');
    const helpModal = document.getElementById('help-modal');
    const helpBtn = document.getElementById('help-btn');
    const closeHelpBtn = document.getElementById('close-help-btn');
    const closeHelpIcon = document.getElementById('close-help');
    const panel = document.getElementById('panel');
    const panelScrim = document.getElementById('panel-scrim');
    const openPanelBtn = document.getElementById('open-panel');
    const closePanelBtn = document.getElementById('close-panel');
    const interactionHint = document.getElementById('interaction-hint');
    const missingOverlay = document.getElementById('model-missing');
    const loadingSpinner = document.getElementById('loading-spinner');

    // --- Modelo aún no disponible ---
    // Si monarca.glb no existe (o falla la descarga), se muestra el placeholder.
    // Cuando el archivo se suba, esta misma página lo carga sin cambios.
    modelViewer.addEventListener('error', () => {
        loadingSpinner.style.display = 'none';
        missingOverlay.classList.remove('hidden');
        arButton.style.display = 'none';
        interactionHint.classList.add('hint-hidden');
    });

    // --- Lógica AR ---

    // Verificar soporte AR para mostrar/ocultar botón
    modelViewer.addEventListener('ar-status', () => {
        if (!modelViewer.canActivateAR) {
            arButton.style.display = 'none';
            const noArMsg = document.createElement('div');
            noArMsg.className = 'no-ar-msg';
            noArMsg.textContent = 'Tu navegador no soporta AR. Usa la vista 3D interactiva.';
            arButton.parentElement.appendChild(noArMsg);
        }
    });

    function startAR() {
        if (window.monarcaTrack) window.monarcaTrack('ar_launch', { modelo: 'Monarca' });
        hideHint();
        arStatusToast.style.opacity = '1';
        arStatusText.textContent = 'Iniciando cámara y buscando superficie...';

        modelViewer.activateAR().catch((error) => {
            console.error('Error al iniciar AR:', error);
            arStatusText.textContent = 'No se pudo iniciar AR en este dispositivo.';
            setTimeout(() => { arStatusToast.style.opacity = '0'; }, 3000);
        });
    }
    arButton.addEventListener('click', startAR);

    // Estado de la sesión AR
    modelViewer.addEventListener('ar-status', (event) => {
        const status = event.detail.status;
        if (status === 'session-started') {
            arStatusText.textContent = 'Apunta a una superficie plana...';
        } else if (status === 'object-placed') {
            arStatusText.textContent = 'Modelo colocado. Muévelo con dos dedos.';
            setTimeout(() => { arStatusToast.style.opacity = '0'; }, 2500);
        } else if (status === 'failed') {
            arStatusText.textContent = 'No se pudo detectar superficie o se perdió el seguimiento.';
            setTimeout(() => { arStatusToast.style.opacity = '0'; }, 4000);
        } else if (status === 'not-presenting') {
            arStatusToast.style.opacity = '0';
        }
    });

    // --- Barra de progreso de carga ---
    const loadBar = document.getElementById('load-bar');
    const loadPct = document.getElementById('load-pct');
    modelViewer.addEventListener('progress', (event) => {
        const pct = Math.round((event.detail.totalProgress || 0) * 100);
        if (loadBar) loadBar.style.width = pct + '%';
        if (loadPct) loadPct.textContent = pct < 100 ? `Cargando modelo… ${pct}%` : 'Preparando escena…';
    });

    modelViewer.addEventListener('load', () => {
        loadingSpinner.style.display = 'none';
        missingOverlay.classList.add('hidden');
        if (window.monarcaTrack) window.monarcaTrack('model_view', { modelo: 'Monarca' });
    });
    modelViewer.addEventListener('model-visibility', (event) => {
        if (event.detail.visible) loadingSpinner.style.display = 'none';
    });

    // --- Modal de ayuda ---
    function toggleHelp(show) {
        helpModal.classList.toggle('hidden', !show);
    }
    helpBtn.addEventListener('click', () => toggleHelp(true));
    closeHelpBtn.addEventListener('click', () => toggleHelp(false));
    closeHelpIcon.addEventListener('click', () => toggleHelp(false));
    helpModal.addEventListener('click', (e) => {
        if (e.target === helpModal) toggleHelp(false);
    });

    // --- Panel lateral (drawer) ---
    function togglePanel(show) {
        panel.classList.toggle('open', show);
        panel.setAttribute('aria-hidden', show ? 'false' : 'true');
        panelScrim.classList.toggle('hidden', !show);
    }
    openPanelBtn.addEventListener('click', () => togglePanel(true));
    closePanelBtn.addEventListener('click', () => togglePanel(false));
    panelScrim.addEventListener('click', () => togglePanel(false));

    // Cerrar con tecla Escape (accesibilidad)
    document.addEventListener('keydown', (e) => {
        if (e.key !== 'Escape') return;
        if (!helpModal.classList.contains('hidden')) toggleHelp(false);
        if (panel.classList.contains('open')) togglePanel(false);
    });

    // --- Pista de interacción: se auto-oculta ---
    function hideHint() { if (interactionHint) interactionHint.classList.add('hint-hidden'); }
    setTimeout(hideHint, 5000);
    document.getElementById('stage').addEventListener('pointerdown', hideHint, { once: true });

    // --- Encuadre según la forma de la pantalla ---
    // En vertical, el ancho del terreno (82 m) obliga a alejar la cámara y el
    // edificio queda diminuto. En ese caso acercamos y bajamos el objetivo
    // para que la torre ocupe la pantalla alta y estrecha.
    const mqPortrait = window.matchMedia('(max-width: 640px) and (orientation: portrait)');
    let userMovedCamera = false;
    modelViewer.addEventListener('camera-change', (e) => {
        if (e.detail && e.detail.source === 'user-interaction') userMovedCamera = true;
    });
    function applyFraming() {
        // Si el visitante ya movió la cámara, no le cambiamos la vista bajo los pies
        if (userMovedCamera) return;
        if (mqPortrait.matches) {
            // En vertical el ancho del terreno obliga a alejarse: encuadramos la torre
            modelViewer.setAttribute('camera-target', '1.5m 18m 0.4m');
            modelViewer.setAttribute('camera-orbit', '30deg 74deg 72%');
        } else {
            modelViewer.setAttribute('camera-target', '1.5m 19m 0.4m');
            modelViewer.setAttribute('camera-orbit', '30deg 75deg 105%');
        }
    }
    applyFraming();
    mqPortrait.addEventListener('change', applyFraming);
});
