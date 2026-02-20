/**
 * User Interface
 * Info panel, controls, and UI updates
 */

function createUI() {
  const uiHTML = `
    <!-- Info Panel -->
    <div id="info-panel" class="info-panel hidden">
      <button id="close-panel" class="close-btn">✕</button>
      <h2 id="body-name">-</h2>
      <div class="info-item">
        <span class="label">Type:</span>
        <span id="body-type">-</span>
      </div>
      <div class="info-item">
        <span class="label">Radius:</span>
        <span id="body-radius">-</span>
      </div>
      <div class="info-item">
        <span class="label">Distance from Sun:</span>
        <span id="body-distance">-</span>
      </div>
      <div class="info-item">
        <span class="label">Orbital Period:</span>
        <span id="body-period">-</span>
      </div>
      <div class="info-item">
        <span class="label">Description:</span>
        <p id="body-description">-</p>
      </div>
    </div>

    <!-- Control Panel -->
    <div id="control-panel" class="control-panel">
      <div class="controls-row">
        <button id="reset-btn" class="control-btn" title="Reset view (R)">↺ Reset</button>
        <button id="scale-btn" class="control-btn" title="Toggle scale (S)">📏 Compressed</button>
        <button id="anim-btn" class="control-btn" title="Play/Pause (Space)">⏸ Pause</button>
      </div>

      <div class="controls-row">
        <label>Animation Speed:</label>
        <input id="speed-slider" type="range" min="0.1" max="10" step="0.1" value="1">
        <span id="speed-label">1x</span>
      </div>

      <div class="controls-row help">
        <small>Drag to rotate • Scroll to zoom • Click planets • R=reset • S=scale • Space=play/pause • ESC=deselect</small>
      </div>
    </div>

    <!-- Hover Label -->
    <div id="hover-label" class="hover-label hidden"></div>
  `;

  const container = document.body;
  const div = document.createElement('div');
  div.innerHTML = uiHTML;
  container.appendChild(div);

  // Setup event listeners with null checks
  const closePanel = document.getElementById('close-panel');
  if (closePanel) {
    closePanel.addEventListener('click', () => {
      appState.selectedBody = null;
      updateUISelection();
    });
  }

  const resetBtn = document.getElementById('reset-btn');
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      resetCamera(appState.camera);
      appState.selectedBody = null;
      updateUISelection();
    });
  }

  const scaleBtn = document.getElementById('scale-btn');
  if (scaleBtn) {
    scaleBtn.addEventListener('click', switchScaleMode);
  }

  const animBtn = document.getElementById('anim-btn');
  if (animBtn) {
    animBtn.addEventListener('click', toggleAnimation);
  }

  const speedSlider = document.getElementById('speed-slider');
  if (speedSlider) {
    speedSlider.addEventListener('input', (e) => {
      const speed = parseFloat(e.target.value);
      setAnimationSpeed(speed);
      const speedLabel = document.getElementById('speed-label');
      if (speedLabel) {
        speedLabel.textContent = speed.toFixed(1) + 'x';
      }
    });
  }
}

/**
 * Update info panel with selected body info
 */
function updateUISelection() {
  const panel = document.getElementById('info-panel');
  const body = appState.selectedBody;

  if (!panel) {
    console.error('Info panel element not found');
    return;
  }

  if (!body) {
    panel.classList.add('hidden');
    return;
  }

  panel.classList.remove('hidden');

  const name = body.name || body.data.name;
  const data = body.data;

  const nameEl = document.getElementById('body-name');
  if (nameEl) nameEl.textContent = name;

  const typeEl = document.getElementById('body-type');
  if (typeEl) typeEl.textContent = data.type.charAt(0).toUpperCase() + data.type.slice(1);

  const radiusEl = document.getElementById('body-radius');
  if (radiusEl) radiusEl.textContent = formatNumber(data.radius) + ' km';

  const distEl = document.getElementById('body-distance');
  if (distEl) {
    distEl.textContent = data.orbitDistance ? formatDistance(data.orbitDistance) : '-';
  }

  const periodEl = document.getElementById('body-period');
  if (periodEl) {
    periodEl.textContent = data.orbitPeriod ? formatPeriod(data.orbitPeriod) : '-';
  }

  const descEl = document.getElementById('body-description');
  if (descEl) descEl.textContent = data.description || '-';
}

/**
 * Update scale mode button
 */
function updateUIScaleMode(mode) {
  const btn = document.getElementById('scale-btn');
  if (mode === 'compressed') {
    btn.textContent = '📏 Compressed';
  } else {
    btn.textContent = '📏 Realistic';
  }
}

/**
 * Update animation button
 */
function updateUIAnimationButton() {
  const btn = document.getElementById('anim-btn');
  if (appState.isAnimating) {
    btn.textContent = '▶ Play';
  } else {
    btn.textContent = '⏸ Pause';
  }
}

/**
 * Update labels button
 */
function updateUILabelsButton() {
  // TODO: Implement label visibility toggle UI
}

/**
 * Show label at cursor position
 */
function showLabelAtCursor(name, event) {
  const label = document.getElementById('hover-label');
  const data = celestialData[name];

  label.textContent = data.name;
  label.style.left = (event.clientX + 10) + 'px';
  label.style.top = (event.clientY + 10) + 'px';
  label.classList.remove('hidden');

  // Hide label after mouse moves away (handled by CSS transition)
}

/**
 * Hide hover label
 */
function hideLabelOnMouseOut() {
  const label = document.getElementById('hover-label');
  label.classList.add('hidden');
}

// Hide label when mouse leaves window
document.addEventListener('mouseleave', hideLabelOnMouseOut);
