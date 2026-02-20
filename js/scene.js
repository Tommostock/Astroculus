/**
 * Three.js Scene Setup
 * Handles scene, camera, renderer, lighting, and background
 */

function initScene(container) {
  // Scene
  const scene = new THREE.Scene();
  appState.scene = scene;

  // Camera
  const width = window.innerWidth;
  const height = window.innerHeight;
  const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000000);
  camera.position.set(0, 50, 80);
  camera.lookAt(0, 0, 0);
  appState.camera = camera;

  // Renderer
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setSize(width, height);
  renderer.setClearColor(0x000000, 1);
  renderer.shadowMap.enabled = true;
  container.appendChild(renderer.domElement);
  appState.renderer = renderer;

  // Lighting
  const ambientLight = new THREE.AmbientLight(0x404040, 1);
  scene.add(ambientLight);

  // Directional light from the Sun
  const sunLight = new THREE.PointLight(0xFFFFFF, 2, 0);
  sunLight.position.set(0, 0, 0);
  sunLight.castShadow = true;
  sunLight.shadow.mapSize.width = 2048;
  sunLight.shadow.mapSize.height = 2048;
  scene.add(sunLight);

  // Starfield background
  createStarfield(scene);

  // Handle window resize
  window.addEventListener('resize', debounce(() => {
    const newWidth = window.innerWidth;
    const newHeight = window.innerHeight;
    camera.aspect = newWidth / newHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(newWidth, newHeight);
  }, 250));

  return { scene, camera, renderer };
}

/**
 * Create starfield background using particle system
 */
function createStarfield(scene) {
  const geometry = new THREE.BufferGeometry();
  const starCount = 1000;
  const positions = new Float32Array(starCount * 3);

  for (let i = 0; i < starCount * 3; i += 3) {
    positions[i] = (Math.random() - 0.5) * 200000; // x
    positions[i + 1] = (Math.random() - 0.5) * 200000; // y
    positions[i + 2] = (Math.random() - 0.5) * 200000; // z
  }

  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

  const material = new THREE.PointsMaterial({
    color: 0xFFFFFF,
    size: 100,
    sizeAttenuation: true,
    transparent: true,
    opacity: 0.8
  });

  const stars = new THREE.Points(geometry, material);
  scene.add(stars);
}

/**
 * Render function to be called in animation loop
 */
function render() {
  appState.renderer.render(appState.scene, appState.camera);
}
