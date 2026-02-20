/**
 * Celestial Bodies Data
 * Contains realistic orbital and physical parameters for planets, moons, and other bodies
 */

const celestialData = {
  sun: {
    name: 'Sun',
    type: 'sun',
    radius: 696000,
    color: 0xFDB813,
    mass: 1989000,
    description: 'The star at the center of our solar system'
  },

  mercury: {
    name: 'Mercury',
    type: 'planet',
    radius: 3879,
    color: 0x8C7853,
    orbitDistance: 57.9e6,
    orbitPeriod: 87.97,
    rotationPeriod: 58.6,
    description: 'The smallest planet, closest to the Sun'
  },

  venus: {
    name: 'Venus',
    type: 'planet',
    radius: 6051,
    color: 0xFFC649,
    orbitDistance: 108.2e6,
    orbitPeriod: 224.7,
    rotationPeriod: 243,
    description: 'The hottest planet with a thick atmosphere'
  },

  earth: {
    name: 'Earth',
    type: 'planet',
    radius: 6371,
    color: 0x4CAF50,
    orbitDistance: 149.6e6,
    orbitPeriod: 365.25,
    rotationPeriod: 24,
    description: 'Our home planet',
    moons: [
      {
        name: 'Moon',
        radius: 1737,
        orbitDistance: 384400,
        orbitPeriod: 27.3
      }
    ]
  },

  mars: {
    name: 'Mars',
    type: 'planet',
    radius: 3389,
    color: 0xE27B58,
    orbitDistance: 227.9e6,
    orbitPeriod: 687,
    rotationPeriod: 24.6,
    description: 'The red planet',
    moons: [
      {
        name: 'Phobos',
        radius: 11,
        orbitDistance: 9376,
        orbitPeriod: 0.319
      },
      {
        name: 'Deimos',
        radius: 6,
        orbitDistance: 23463,
        orbitPeriod: 1.263
      }
    ]
  },

  jupiter: {
    name: 'Jupiter',
    type: 'planet',
    radius: 69911,
    color: 0xC88B3A,
    orbitDistance: 778.5e6,
    orbitPeriod: 4333,
    rotationPeriod: 10,
    description: 'The largest planet',
    moons: [
      {
        name: 'Io',
        radius: 1821,
        orbitDistance: 421700,
        orbitPeriod: 1.769
      },
      {
        name: 'Europa',
        radius: 1560,
        orbitDistance: 671100,
        orbitPeriod: 3.551
      },
      {
        name: 'Ganymede',
        radius: 2634,
        orbitDistance: 1070400,
        orbitPeriod: 7.155
      },
      {
        name: 'Callisto',
        radius: 2410,
        orbitDistance: 1882600,
        orbitPeriod: 16.69
      }
    ]
  },

  saturn: {
    name: 'Saturn',
    type: 'planet',
    radius: 58232,
    color: 0xF4D99B,
    orbitDistance: 1434e6,
    orbitPeriod: 10759,
    rotationPeriod: 10.7,
    description: 'The ringed planet',
    moons: [
      {
        name: 'Titan',
        radius: 2574,
        orbitDistance: 1222000,
        orbitPeriod: 15.95
      },
      {
        name: 'Rhea',
        radius: 764,
        orbitDistance: 527108,
        orbitPeriod: 4.518
      },
      {
        name: 'Iapetus',
        radius: 734,
        orbitDistance: 3561300,
        orbitPeriod: 79.33
      },
      {
        name: 'Enceladus',
        radius: 252,
        orbitDistance: 238020,
        orbitPeriod: 1.370
      }
    ]
  },

  uranus: {
    name: 'Uranus',
    type: 'planet',
    radius: 25362,
    color: 0x4FD0E7,
    orbitDistance: 2871e6,
    orbitPeriod: 30687,
    rotationPeriod: 17,
    description: 'The ice giant that rotates on its side'
  },

  neptune: {
    name: 'Neptune',
    type: 'planet',
    radius: 24622,
    color: 0x4166F5,
    orbitDistance: 4495e6,
    orbitPeriod: 60190,
    rotationPeriod: 16,
    description: 'The windiest planet'
  },

  pluto: {
    name: 'Pluto',
    type: 'dwarf',
    radius: 1188,
    color: 0xA9927D,
    orbitDistance: 5906e6,
    orbitPeriod: 90520,
    rotationPeriod: 153.3,
    description: 'Dwarf planet in the Kuiper Belt'
  },

  eris: {
    name: 'Eris',
    type: 'dwarf',
    radius: 1163,
    color: 0x8B7D6B,
    orbitDistance: 9616e6,
    orbitPeriod: 558650,
    rotationPeriod: 12.4,
    description: 'A dwarf planet beyond Neptune'
  },

  asteroidBelt: {
    name: 'Asteroid Belt',
    type: 'asteroid',
    orbitDistanceMin: 330e6,
    orbitDistanceMax: 550e6,
    description: 'Ring of asteroids between Mars and Jupiter',
    particleCount: 200
  }
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = celestialData;
}
