/**
 * Utility Functions for Solar System Explorer
 */

// Global state
const appState = {
  scaleMode: 'compressed', // 'compressed' or 'realistic'
  isAnimating: true,
  animationSpeed: 1,
  selectedBody: null,
  time: 0,
  scene: null,
  camera: null,
  renderer: null,
  planets: {},
  orbits: {},
  trails: {}
};

/**
 * Calculate scaled distance based on scale mode
 * Compressed: logarithmic scaling so all objects visible
 * Realistic: true AU distances
 */
function getScaledDistance(distance, mode = appState.scaleMode) {
  if (mode === 'realistic') {
    // Convert km to units (1 unit = 1 million km)
    return distance / 1e6;
  } else {
    // Compressed: log scale for visibility
    // Ensures all objects fit in view while maintaining relative positions
    const AU = 149.6e6; // 1 AU in km
    const distanceAU = distance / AU;
    const compressed = Math.log(distanceAU + 1) * 5;
    return compressed;
  }
}

/**
 * Calculate planet radius for rendering
 * Real radii would be invisible, so we scale them up in compressed mode
 */
function getScaledRadius(radius, mode = appState.scaleMode) {
  if (mode === 'realistic') {
    // Convert km to units (1 unit = 1 million km)
    return Math.max(radius / 1e6, 0.01); // Minimum size for visibility
  } else {
    // Compressed: scale up for visibility while maintaining relative sizes
    return Math.max(radius / 50000, 0.2); // Scales all planets proportionally
  }
}

/**
 * Convert orbital period (Earth days) to angular velocity (radians per frame)
 * Assumes 60 FPS
 */
function getAngularVelocity(periodInDays, speedFactor = appState.animationSpeed) {
  const framesPerDay = 60 * 60 * 24 * speedFactor;
  const framesPerOrbit = periodInDays * framesPerDay;
  return (2 * Math.PI) / framesPerOrbit;
}

/**
 * Format large numbers for display
 */
function formatNumber(num) {
  if (num >= 1e9) return (num / 1e9).toFixed(1) + ' B';
  if (num >= 1e6) return (num / 1e6).toFixed(1) + ' M';
  if (num >= 1e3) return (num / 1e3).toFixed(1) + ' K';
  return num.toFixed(1);
}

/**
 * Format distance in km or AU for display
 */
function formatDistance(km) {
  const AU = 149.6e6;
  if (km > AU * 1.5) {
    return (km / AU).toFixed(2) + ' AU';
  }
  return formatNumber(km) + ' km';
}

/**
 * Format orbital period for display
 */
function formatPeriod(days) {
  if (days > 365.25) {
    return (days / 365.25).toFixed(1) + ' years';
  }
  return formatNumber(days) + ' days';
}

/**
 * Create a glow effect for selected planets
 */
function createGlowMaterial(color) {
  return new THREE.MeshBasicMaterial({
    color: color,
    transparent: true,
    opacity: 0.3
  });
}

/**
 * Raycaster for picking objects with mouse
 */
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

function getIntersectedObject(event, camera, scene) {
  // Calculate mouse position in normalized device coordinates
  const rect = event.target.getBoundingClientRect();
  mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
  mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

  raycaster.setFromCamera(mouse, camera);

  // Get all clickable planet objects
  const clickableObjects = Object.values(appState.planets)
    .filter(p => p && p.mesh)
    .map(p => p.mesh);

  const intersects = raycaster.intersectObjects(clickableObjects);
  return intersects.length > 0 ? intersects[0].object : null;
}

/**
 * Smooth camera transition to focus on a body
 */
function focusOnBody(body, camera) {
  const targetDistance = getScaledRadius(body.radius) * 5;
  const targetPosition = {
    x: body.mesh.position.x + targetDistance,
    y: body.mesh.position.y + targetDistance,
    z: body.mesh.position.z + targetDistance
  };

  const startPosition = {
    x: camera.position.x,
    y: camera.position.y,
    z: camera.position.z
  };

  let progress = 0;
  const duration = 30; // frames

  function animate() {
    progress++;
    const t = Math.min(progress / duration, 1);
    const easeT = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t; // ease-in-out

    camera.position.x = startPosition.x + (targetPosition.x - startPosition.x) * easeT;
    camera.position.y = startPosition.y + (targetPosition.y - startPosition.y) * easeT;
    camera.position.z = startPosition.z + (targetPosition.z - startPosition.z) * easeT;

    camera.lookAt(body.mesh.position);

    if (progress < duration) {
      requestAnimationFrame(animate);
    }
  }

  animate();
}

/**
 * Reset camera to overview position
 */
function resetCamera(camera) {
  const resetPosition = { x: 0, y: 50, z: 80 };
  const startPosition = {
    x: camera.position.x,
    y: camera.position.y,
    z: camera.position.z
  };

  let progress = 0;
  const duration = 30;

  function animate() {
    progress++;
    const t = Math.min(progress / duration, 1);
    const easeT = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;

    camera.position.x = startPosition.x + (resetPosition.x - startPosition.x) * easeT;
    camera.position.y = startPosition.y + (resetPosition.y - startPosition.y) * easeT;
    camera.position.z = startPosition.z + (resetPosition.z - startPosition.z) * easeT;

    camera.lookAt(0, 0, 0);

    if (progress < duration) {
      requestAnimationFrame(animate);
    }
  }

  animate();
}

/**
 * Debounce function for window resize
 */
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}
