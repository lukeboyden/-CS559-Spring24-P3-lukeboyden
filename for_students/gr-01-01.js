// Required Libraries
import * as THREE from 'three';
import { OrbitControls } from '../libs/CS559-Three/examples/jsm/controls/OrbitControls.js';

// Scene setup
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 10000);
camera.position.set(-100, 50, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Sun representation
const sunGeometry = new THREE.SphereGeometry(5, 32, 32); // Adjust size as necessary
const sunMaterial = new THREE.MeshBasicMaterial({
    emissive: 0xffff00, // Bright yellow
    emissiveIntensity: 1
});
const sunMesh = new THREE.Mesh(sunGeometry, sunMaterial);
scene.add(sunMesh);

// Sunlight as a point light source
const sunlight = new THREE.PointLight(0xffffff, 1.5, 5000);
sunMesh.add(sunlight); // Ensures the light emanates from the center of the Sun mesh

// Ambient light
const ambientLight = new THREE.AmbientLight(0x404040, 0.5);
scene.add(ambientLight);
// Helper function to load textures
function loadTexture(planetName, baseFilename) {
    return new THREE.TextureLoader().load(`textures/${baseFilename}`);
}

const solarSystemData = {
  "planets": [
      {
          "name": "Mercury",
          "diameter": 4879, // kilometers
          "distanceFromParent": 57900000, // kilometers
          "orbitalPeriod": 88, // days
          "_3d": {
              "textures": {
                  "base": "mercury.jpg"
              }
          }
      },
      {
          "name": "Venus",
          "diameter": 12104,
          "distanceFromParent": 108200000,
          "orbitalPeriod": 224.7,
          "_3d": {
              "textures": {
                  "base": "venus.png"
              }
          }
      },
      {
          "name": "Earth",
          "diameter": 12756,
          "distanceFromParent": 149600000,
          "orbitalPeriod": 365.25,
          "_3d": {
              "textures": {
                  "base": "earth.jpg"
              }
          }
      },
      {
          "name": "Mars",
          "diameter": 6792,
          "distanceFromParent": 227900000,
          "orbitalPeriod": 687,
          "_3d": {
              "textures": {
                  "base": "mars.jpg"
              }
          }
      },
      {
          "name": "Jupiter",
          "diameter": 142984,
          "distanceFromParent": 778600000,
          "orbitalPeriod": 4331,
          "_3d": {
              "textures": {
                  "base": "jupiter.jpg"
              }
          }
      },
      {
          "name": "Saturn",
          "diameter": 120536,
          "distanceFromParent": 1433500000,
          "orbitalPeriod": 10747,
          "_3d": {
              "textures": {
                  "base": "saturn.jpg"
              }
          }
      },
      {
          "name": "Uranus",
          "diameter": 51118,
          "distanceFromParent": 2872500000,
          "orbitalPeriod": 30589,
          "_3d": {
              "textures": {
                  "base": "uranus.jpg"
              }
          }
      },
      {
          "name": "Neptune",
          "diameter": 49528,
          "distanceFromParent": 4495100000,
          "orbitalPeriod": 59800,
          "_3d": {
              "textures": {
                  "base": "neptune.jpg"
              }
          }
      },
  ]
};

const distanceScale = 1 / 149597870.7; // AU to units
const sizeScale = 1; // Size scaling for visibility

solarSystemData.planets.forEach(planet => {
    const geometry = new THREE.SphereGeometry((planet.diameter / 12756) * sizeScale, 32, 32);
    const material = new THREE.MeshPhongMaterial({
        map: loadTexture(planet.name, planet._3d.textures.base)
    });
    const planetMesh = new THREE.Mesh(geometry, material);
    planetMesh.position.x = planet.distanceFromParent * distanceScale;
    scene.add(planetMesh);

    // Animation function for the planet
    const orbitSpeed = 0.1 / planet.orbitalPeriod; // Simplified orbit speed
    function animatePlanet() {
        requestAnimationFrame(animatePlanet);
        planetMesh.position.x = Math.cos(Date.now() * orbitSpeed) * planet.distanceFromParent * distanceScale;
        planetMesh.position.z = Math.sin(Date.now() * orbitSpeed) * planet.distanceFromParent * distanceScale;
    }
    animatePlanet();
});

// Controls for interaction
const controls = new OrbitControls(camera, renderer.domElement);
controls.minDistance = 0;
controls.maxDistance = 150000;

// Animation loop for rendering
function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
}
animate();

