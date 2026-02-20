/**
 * Camera Controls and Interaction
 * Handles mouse drag, scroll zoom, click selection, and keyboard shortcuts
 */

let isDragging = false;
let previousMousePosition = { x: 0, y: 0 };
let lastHoverUpdate = 0;

function setupControls(container, camera) {
  // Validate inputs
  if (!camera || !appState.scene) {
    console.error('Camera or scene not initialized');
    return;
  }

  // Mouse drag to rotate camera
  const onMouseDown = (e) => {
    isDragging = true;
    previousMousePosition = { x: e.clientX, y: e.clientY };
  };

  const onMouseMove = (e) => {
    // Drag handling
    if (isDragging) {
      const deltaX = e.clientX - previousMousePosition.x;
      const deltaY = e.clientY - previousMousePosition.y;

      // Rotate camera around scene center
      const radius = camera.position.length();
      if (radius < 0.1) return; // Prevent gimbal lock

      const theta = Math.atan2(camera.position.z, camera.position.x) + deltaX * 0.005;
      const phi = Math.acos(camera.position.y / radius) + deltaY * 0.005;

      const clampedPhi = Math.max(0.1, Math.min(Math.PI - 0.1, phi)); // Clamp to avoid gimbal lock

      const newRadius = radius;
      camera.position.x = newRadius * Math.sin(clampedPhi) * Math.cos(theta);
      camera.position.y = newRadius * Math.cos(clampedPhi);
      camera.position.z = newRadius * Math.sin(clampedPhi) * Math.sin(theta);

      camera.lookAt(0, 0, 0);

      previousMousePosition = { x: e.clientX, y: e.clientY };
    }

    // Hover label handling (throttled to prevent excessive raycasting)
    if (!isDragging && Date.now() - (lastHoverUpdate || 0) > 100) {
      const intersected = getIntersectedObject(e, camera, appState.scene);
      if (intersected) {
        Object.keys(appState.planets).forEach(name => {
          if (appState.planets[name].mesh === intersected) {
            updateLabelOnHover(name, e);
          }
        });
      } else {
        hideLabelOnMouseOut();
      }
      lastHoverUpdate = Date.now();
    }
  };

  document.addEventListener('mousedown', onMouseDown);
  document.addEventListener('mousemove', onMouseMove);

  document.addEventListener('mouseup', () => {
    isDragging = false;
  });

  // Scroll to zoom
  document.addEventListener('wheel', (e) => {
    e.preventDefault();

    const currentRadius = camera.position.length();
    const zoomSpeed = 0.1;
    const direction = e.deltaY > 0 ? 1 : -1;
    const newRadius = currentRadius + direction * zoomSpeed * currentRadius;

    // Clamp zoom distance based on scale mode
    const minZoom = appState.scaleMode === 'realistic' ? 0.1 : 1;
    const maxZoom = appState.scaleMode === 'realistic' ? 500 : 150;

    if (newRadius > minZoom && newRadius < maxZoom) {
      const ratio = newRadius / currentRadius;
      camera.position.multiplyScalar(ratio);
      camera.lookAt(0, 0, 0);
    }
  }, { passive: false });

  // Click to select planet
  document.addEventListener('click', (e) => {
    const intersected = getIntersectedObject(e, camera, appState.scene);
    if (intersected) {
      // Find which planet was clicked
      let selectedBody = null;
      Object.keys(appState.planets).forEach(name => {
        if (appState.planets[name].mesh === intersected) {
          selectedBody = appState.planets[name];
          selectedBody.name = name;
        }
      });

      // Also check moons
      if (!selectedBody) {
        Object.values(appState.planets).forEach(planetInfo => {
          planetInfo.moons.forEach(moon => {
            if (moon.mesh === intersected) {
              selectedBody = moon;
            }
          });
        });
      }

      if (selectedBody) {
        selectBody(selectedBody);
      }
    }
  });

  // Keyboard shortcuts
  document.addEventListener('keydown', (e) => {
    switch (e.key.toUpperCase()) {
      case ' ':
        e.preventDefault();
        toggleAnimation();
        break;
      case 'R':
        resetCamera(camera);
        appState.selectedBody = null;
        updateUISelection();
        break;
      case 'S':
        switchScaleMode();
        break;
      case 'L':
        toggleLabels();
        break;
      case 'T':
        toggleOrbitalTrails();
        break;
      case 'ESCAPE':
        appState.selectedBody = null;
        updateUISelection();
        break;
    }
  });

}

/**
 * Select a body and show its info
 */
function selectBody(body) {
  appState.selectedBody = body;

  // Focus camera on body
  if (body.mesh) {
    focusOnBody(body, appState.camera);
  }

  updateUISelection();
}

/**
 * Toggle labels visibility
 */
function toggleLabels() {
  appState.labelsVisible = !appState.labelsVisible;
  updateUILabelsButton();
}

/**
 * Toggle orbital trails
 */
function toggleOrbitalTrails() {
  appState.trailsVisible = !appState.trailsVisible;
  // TODO: Implement trail rendering
}

/**
 * Update label on hover (calls UI function)
 */
function updateLabelOnHover(name, event) {
  showLabelAtCursor(name, event);
}
