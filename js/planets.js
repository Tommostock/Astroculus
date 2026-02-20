/**
 * Planet Creation and Orbital Mechanics
 */

/**
 * Create all planets, moons, and celestial bodies
 */
function createAllPlanets(mode = 'compressed') {
  const scene = appState.scene;

  // Create Sun first
  createPlanetMesh('sun', celestialData.sun, mode);

  // Create planets
  ['mercury', 'venus', 'earth', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune'].forEach(name => {
    createPlanetMesh(name, celestialData[name], mode);
  });

  // Create dwarf planets
  ['pluto', 'eris'].forEach(name => {
    createPlanetMesh(name, celestialData[name], mode);
  });

  // Create moons for planets that have them
  createMoonsForPlanets(mode);

  // Create asteroid belt
  createAsteroidBelt(mode);

  // Create orbital paths
  createOrbitalPaths(mode);
}

/**
 * Create a single planet mesh
 */
function createPlanetMesh(name, data, mode) {
  const geometry = new THREE.IcosahedronGeometry(1, 32);
  const material = new THREE.MeshPhongMaterial({
    color: data.color,
    emissive: name === 'sun' ? data.color : 0x000000,
    shininess: 5,
    flatShading: false
  });

  const mesh = new THREE.Mesh(geometry, material);

  // Calculate position
  if (data.type === 'sun') {
    mesh.position.set(0, 0, 0);
  } else {
    const distance = getScaledDistance(data.orbitDistance, mode);
    mesh.position.set(distance, 0, 0);
  }

  // Scale radius
  const radius = getScaledRadius(data.radius, mode);
  mesh.scale.set(radius, radius, radius);

  appState.scene.add(mesh);

  // Store in appState
  appState.planets[name] = {
    data: data,
    mesh: mesh,
    mode: mode,
    angle: Math.random() * Math.PI * 2, // Random starting angle
    angularVelocity: data.orbitPeriod ? getAngularVelocity(data.orbitPeriod) : 0,
    moons: [],
    trails: []
  };

  // Add glow effect to Sun
  if (name === 'sun') {
    const glowGeometry = new THREE.IcosahedronGeometry(1.1, 32);
    const glowMaterial = new THREE.MeshBasicMaterial({
      color: data.color,
      transparent: true,
      opacity: 0.2
    });
    const glowMesh = new THREE.Mesh(glowGeometry, glowMaterial);
    glowMesh.scale.copy(mesh.scale);
    appState.scene.add(glowMesh);
  }
}

/**
 * Create moons for planets
 */
function createMoonsForPlanets(mode) {
  Object.keys(celestialData).forEach(name => {
    const data = celestialData[name];
    if (data.moons && data.moons.length > 0 && appState.planets[name]) {
      const parentPlanet = appState.planets[name];

      data.moons.forEach((moonData, idx) => {
        createMoon(name, moonData, idx, mode);
      });
    }
  });
}

/**
 * Create a single moon
 */
function createMoon(parentName, moonData, index, mode) {
  const geometry = new THREE.IcosahedronGeometry(1, 16);
  const material = new THREE.MeshPhongMaterial({
    color: 0xAAAAAA,
    shininess: 3
  });

  const mesh = new THREE.Mesh(geometry, material);

  // Scale radius
  const radius = getScaledRadius(moonData.radius, mode);
  mesh.scale.set(radius, radius, radius);

  appState.scene.add(mesh);

  const parentPlanet = appState.planets[parentName];
  const distance = getScaledDistance(moonData.orbitDistance, mode);

  // Store moon info
  const moonInfo = {
    name: moonData.name,
    data: moonData,
    parentName: parentName,
    mesh: mesh,
    mode: mode,
    orbitDistance: distance,
    angle: (index / (parentPlanet.data.moons.length)) * Math.PI * 2,
    angularVelocity: getAngularVelocity(moonData.orbitPeriod)
  };

  parentPlanet.moons.push(moonInfo);
}

/**
 * Create asteroid belt between Mars and Jupiter
 */
function createAsteroidBelt(mode) {
  const beltData = celestialData.asteroidBelt;
  const minDist = getScaledDistance(beltData.orbitDistanceMin, mode);
  const maxDist = getScaledDistance(beltData.orbitDistanceMax, mode);
  const count = beltData.particleCount;

  const geometry = new THREE.BufferGeometry();
  const positions = new Float32Array(count * 3);
  const sizes = new Float32Array(count);

  for (let i = 0; i < count; i++) {
    const angle = Math.random() * Math.PI * 2;
    const distance = minDist + Math.random() * (maxDist - minDist);
    const height = (Math.random() - 0.5) * (maxDist - minDist) * 0.2;

    positions[i * 3] = Math.cos(angle) * distance;
    positions[i * 3 + 1] = height;
    positions[i * 3 + 2] = Math.sin(angle) * distance;

    sizes[i] = Math.random() * 0.5 + 0.1;
  }

  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

  const material = new THREE.PointsMaterial({
    color: 0x888888,
    size: 1,
    sizeAttenuation: true,
    transparent: true,
    opacity: 0.6
  });

  const asteroidBelt = new THREE.Points(geometry, material);
  appState.scene.add(asteroidBelt);

  appState.asteroidBelt = asteroidBelt;
}

/**
 * Create orbital path lines
 */
function createOrbitalPaths(mode) {
  ['mercury', 'venus', 'earth', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune', 'pluto', 'eris'].forEach(name => {
    const data = celestialData[name];
    const distance = getScaledDistance(data.orbitDistance, mode);

    const points = [];
    for (let i = 0; i <= 64; i++) {
      const angle = (i / 64) * Math.PI * 2;
      points.push(
        new THREE.Vector3(Math.cos(angle) * distance, 0, Math.sin(angle) * distance)
      );
    }

    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    const material = new THREE.LineBasicMaterial({
      color: 0x444444,
      transparent: true,
      opacity: 0.3,
      linewidth: 1
    });

    const orbit = new THREE.Line(geometry, material);
    appState.scene.add(orbit);
    appState.orbits[name] = orbit;
  });
}

/**
 * Update all orbital positions based on time
 */
function updateOrbitalPositions(elapsedTime) {
  const scene = appState.scene;

  // Update planet positions
  Object.keys(appState.planets).forEach(name => {
    const planetInfo = appState.planets[name];
    const data = planetInfo.data;

    if (data.type === 'sun') {
      // Sun doesn't move
      return;
    }

    // Update angle
    if (data.orbitPeriod) {
      planetInfo.angle += planetInfo.angularVelocity;
    }

    // Calculate new position
    const distance = getScaledDistance(data.orbitDistance, appState.scaleMode);
    const x = Math.cos(planetInfo.angle) * distance;
    const z = Math.sin(planetInfo.angle) * distance;

    planetInfo.mesh.position.set(x, 0, z);

    // Update moons
    planetInfo.moons.forEach(moon => {
      moon.angle += moon.angularVelocity;
      const moonX = Math.cos(moon.angle) * moon.orbitDistance;
      const moonZ = Math.sin(moon.angle) * moon.orbitDistance;

      moon.mesh.position.set(
        planetInfo.mesh.position.x + moonX,
        0,
        planetInfo.mesh.position.z + moonZ
      );
    });
  });
}

/**
 * Switch between scale modes
 */
function switchScaleMode() {
  const newMode = appState.scaleMode === 'compressed' ? 'realistic' : 'compressed';
  appState.scaleMode = newMode;

  // Recalculate and update all positions and scales
  Object.keys(appState.planets).forEach(name => {
    const planetInfo = appState.planets[name];
    const data = planetInfo.data;

    if (data.type !== 'sun') {
      const distance = getScaledDistance(data.orbitDistance, newMode);
      const angle = planetInfo.angle;
      const x = Math.cos(angle) * distance;
      const z = Math.sin(angle) * distance;
      planetInfo.mesh.position.set(x, 0, z);
    }

    // Update scale
    const radius = getScaledRadius(data.radius, newMode);
    planetInfo.mesh.scale.set(radius, radius, radius);

    // Update moons
    planetInfo.moons.forEach(moon => {
      const moonDist = getScaledDistance(moon.data.orbitDistance, newMode);
      moon.orbitDistance = moonDist;

      const moonX = Math.cos(moon.angle) * moonDist;
      const moonZ = Math.sin(moon.angle) * moonDist;

      moon.mesh.position.set(
        planetInfo.mesh.position.x + moonX,
        0,
        planetInfo.mesh.position.z + moonZ
      );

      const moonRadius = getScaledRadius(moon.data.radius, newMode);
      moon.mesh.scale.set(moonRadius, moonRadius, moonRadius);
    });
  });

  // Update orbital paths
  Object.keys(appState.orbits).forEach(name => {
    const data = celestialData[name];
    const distance = getScaledDistance(data.orbitDistance, newMode);

    const points = [];
    for (let i = 0; i <= 64; i++) {
      const angle = (i / 64) * Math.PI * 2;
      points.push(
        new THREE.Vector3(Math.cos(angle) * distance, 0, Math.sin(angle) * distance)
      );
    }

    appState.orbits[name].geometry.dispose();
    appState.orbits[name].geometry = new THREE.BufferGeometry().setFromPoints(points);
  });

  updateUIScaleMode(newMode);
}

/**
 * Toggle animation play/pause
 */
function toggleAnimation() {
  appState.isAnimating = !appState.isAnimating;
  updateUIAnimationButton();
}

/**
 * Update animation speed
 */
function setAnimationSpeed(factor) {
  appState.animationSpeed = factor;

  // Recalculate angular velocities
  Object.keys(appState.planets).forEach(name => {
    const planetInfo = appState.planets[name];
    if (planetInfo.data.orbitPeriod) {
      planetInfo.angularVelocity = getAngularVelocity(planetInfo.data.orbitPeriod, factor);
    }

    planetInfo.moons.forEach(moon => {
      moon.angularVelocity = getAngularVelocity(moon.data.orbitPeriod, factor);
    });
  });
}
