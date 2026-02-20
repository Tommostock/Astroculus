/**
 * Main Application Entry Point
 * Initializes the 3D Solar System Explorer
 */

let animationId;

async function init() {
  try {
    // Create container if needed
    let container = document.getElementById('canvas-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'canvas-container';
      container.style.width = '100%';
      container.style.height = '100%';
      document.body.insertBefore(container, document.body.firstChild);
    }

    // Initialize Three.js scene
    initScene(container);

    // Verify scene was created
    if (!appState.scene || !appState.camera || !appState.renderer) {
      throw new Error('Failed to initialize Three.js scene');
    }

    // Create UI elements
    createUI();

    // Verify UI elements exist before proceeding
    if (!document.getElementById('close-panel') || !document.getElementById('info-panel')) {
      console.warn('Some UI elements may not have loaded, continuing anyway');
    }

    // Create all planets and celestial bodies
    createAllPlanets('compressed');

    // Setup controls (will validate camera internally)
    setupControls(container, appState.camera);

    // Start animation loop
    animate();

    console.log('✓ Solar System Explorer initialized');
    console.log('Controls:');
    console.log('  Drag to rotate');
    console.log('  Scroll to zoom');
    console.log('  Click to select planets');
    console.log('  R - Reset view');
    console.log('  S - Toggle scale mode');
    console.log('  Space - Play/Pause');
    console.log('  L - Toggle labels');
    console.log('  T - Toggle trails');
  } catch (error) {
    console.error('Failed to initialize Solar System Explorer:', error);
    document.body.innerHTML = '<div style="display:flex;align-items:center;justify-content:center;height:100vh;background:#000;color:#fff;font-family:Arial"><div style="text-align:center"><h1>Initialization Error</h1><p>' + error.message + '</p><p>Check the browser console for details.</p></div></div>';
  }
}

/**
 * Animation loop
 */
function animate() {
  animationId = requestAnimationFrame(animate);

  if (appState.isAnimating) {
    appState.time++;
    updateOrbitalPositions(appState.time);
  }

  render();
}

/**
 * Window resize handler
 */
window.addEventListener('resize', debounce(() => {
  const width = window.innerWidth;
  const height = window.innerHeight;
  appState.camera.aspect = width / height;
  appState.camera.updateProjectionMatrix();
  appState.renderer.setSize(width, height);
}, 250));

// Start the application when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
