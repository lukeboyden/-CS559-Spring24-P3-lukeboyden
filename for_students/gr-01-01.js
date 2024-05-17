import * as THREE from 'three';
import { OrbitControls } from '../libs/CS559-Three/examples/jsm/controls/OrbitControls.js';

// Scene, camera, and renderer setup
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1e8);
camera.position.z = 40;
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Controls for user interaction
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;

// UI component to display information about planets
const infoElement = document.getElementById('infoCard');

// Ambient light
const ambientLight = new THREE.AmbientLight(0xffffff, 0.2); // Soft white light
scene.add(ambientLight);

const celestialBodies = []; // Array to hold all celestial bodies for raycasting

// Sun setup
const sunGeometry = new THREE.SphereGeometry(696340 / 12756 / 20, 64, 64); // Scale sun radius against Earth's radius
const sunMaterial = new THREE.MeshBasicMaterial({ color: 0xffff00, emissive: 0xffff00 });
const sun = new THREE.Mesh(sunGeometry, sunMaterial);
sun.name = "Sun"; // Setting the name for the Sun
scene.add(sun);
celestialBodies.push(sun); // Add Sun to the celestial bodies array

// Sunlight as a point light
const pointLight = new THREE.PointLight(0xffffff, 5, 0);
sun.add(pointLight);

// Astronomical unit and scaling function for distances
const astronomicalUnit = 149597870.7; // in thousands of kilometers
const scaleDistance = distance => (distance / astronomicalUnit) * 10; // scale factor for scene size

// Convert degrees to radians
const toRadians = degrees => degrees * (Math.PI / 180);

// Planetary data
const planetsData = [
  { name: "Mercury", semiMajorAxis: 2, eccentricity: 0.2056, orbitalSpeed: 0.024, diameter: 4879, distance: 57900000, texture: "textures/mercury.jpg", rotationalSpeed: 10.89, inclination: toRadians(7) },
  { name: "Venus", semiMajorAxis: 3, eccentricity: 0.0067, orbitalSpeed: 0.012, diameter: 12104, distance: 108200000, texture: "textures/venus.jpg", rotationalSpeed: -6.52, inclination: toRadians(3.4) }, // Venus is in retrograde and spins very slowly
  { name: "Earth", semiMajorAxis: 4, eccentricity: 0.0167, orbitalSpeed: 0.010, diameter: 12756, distance: 149600000, texture: "textures/earth.jpg", rotationalSpeed: 1674.4, inclination: toRadians(0) },
  { name: "Mars", semiMajorAxis: 5, eccentricity: 0.0934, orbitalSpeed: 0.008, diameter: 6792, distance: 227900000, texture: "textures/mars.jpg", rotationalSpeed: 866.8, inclination: toRadians(1.9) },
  { name: "Jupiter", semiMajorAxis: 10, eccentricity: 0.0489, orbitalSpeed: 0.00131, diameter: 142984 / 3, distance: 778600000, texture: "textures/jupiter.jpg", rotationalSpeed: 45583 / 9, inclination: toRadians(1.3) }, // Divided for scaling
  { name: "Saturn", semiMajorAxis: 15, eccentricity: 0.0565, orbitalSpeed: 0.00097, diameter: 120536 / 3, distance: 1433500000, texture: "textures/saturn.jpg", rotationalSpeed: 36840 / 3, inclination: toRadians(2.5) }, // Divided for scaling
  { name: "Uranus", semiMajorAxis: 20, eccentricity: 0.0457, orbitalSpeed: 0.00068, diameter: 51118, distance: 2872500000, texture: "textures/uranus.jpg", rotationalSpeed: 14794, inclination: toRadians(0.8) },
  { name: "Neptune", semiMajorAxis: 30, eccentricity: 0.0113, orbitalSpeed: 0.00054, diameter: 49528, distance: 4495100000, texture: "textures/neptune.jpg", rotationalSpeed: 9719, inclination: toRadians(1.8) }
];

// Create planets and animate them
planetsData.forEach(planet => {
  const geometry = new THREE.SphereGeometry(0.1 * planet.semiMajorAxis, 32, 32); // Scale planets visually
  const material = new THREE.MeshPhongMaterial({ map: new THREE.TextureLoader().load(planet.texture) });
  const planetMesh = new THREE.Mesh(geometry, material);
  planetMesh.name = planet.name;
  planetMesh.position.x = planet.distance / 149597870.7 * 10; // Scaling distance
  scene.add(planetMesh);
  celestialBodies.push(planetMesh); // Add to celestial bodies array for potential interactions

  // Animate planet using Kepler's laws
  function animatePlanet() {
      requestAnimationFrame(animatePlanet);
      const time = Date.now() * 0.0001;  //<-- Adjust time to see planets orbit
      const position = getPositionAtTime(time, planet.semiMajorAxis, planet.eccentricity, planet.orbitalSpeed, planet.inclination);
      planetMesh.position.set(position.x, position.y, position.z);
  }

  animatePlanet();
});

// Add event listener for mouse clicks
renderer.domElement.addEventListener('click', onDocumentMouseDown, false);

// Function to calculate position using Kepler's laws for any planet
function getPositionAtTime(t, semiMajorAxis, eccentricity, speed, inclination) {
  const theta = t * speed; // Adjust theta by orbital speed to simulate time progression
  const r = semiMajorAxis * (1 - eccentricity ** 2) / (1 + eccentricity * Math.cos(theta));
  const x = r * Math.cos(theta);
  const y = r * Math.sin(theta) * Math.sin(inclination); // Apply inclination to the y-axis
  const z = r * Math.sin(theta) * Math.cos(inclination); // Apply inclination to the z-axis
  return new THREE.Vector3(x, y, z);
}

/**
 * Handles mouse click events on the renderer's DOM element to detect if a celestial body was clicked.
 * It calculates the mouse's position in normalized device coordinates and checks against the positions of planets.
 * @param {MouseEvent} event - The mouse event object.
 */
function onDocumentMouseDown(event) {
    event.preventDefault();
    // Calculate mouse position in normalized device coordinates (-1 to +1)
    const rect = renderer.domElement.getBoundingClientRect();
    const mouse = new THREE.Vector2(
        ((event.clientX - rect.left) / rect.width) * 2 - 1,
        -((event.clientY - rect.top) / rect.height) * 2 + 1
    );
    // Identify and display information if a celestial body is clicked
    let foundPlanet = false;
    celestialBodies.forEach(planet => {
        const vector = planet.position.clone().project(camera);
        if (Math.abs(mouse.x - vector.x) < 0.05 && Math.abs(mouse.y - vector.y) < 0.05) {
            showPlanetInfo(planet.name);
            foundPlanet = true;
        }
    });
    // Hide the information element if no planet is found
    if (!foundPlanet) {
        infoElement.style.display = 'none';
    }
}

/**
 * Displays the information box with details about the planet.
 * This includes calling `getDescription` to fetch the descriptive text.
 * @param {string} name - The name of the planet.
 */
function showPlanetInfo(name) {
    const description = getDescription(name);
    infoElement.innerHTML = `<strong>${name}</strong><br>${description}`;
    infoElement.style.display = 'block';
}

/**
 * Updates the positions of all planets in their orbits based on the current time.
 * This function is part of the main animation loop to continuously update each planet's position.
 */
function updatePlanetaryOrbits() {
    const currentTime = Date.now() * 0.0001 * simulationSpeed;  // Current time factor for animation speed
    planetsData.forEach(planet => {
        const planetMesh = scene.children.find(obj => obj.name === planet.name);
        if (planetMesh) {
            // Calculate and update position for circular orbits
            const x = Math.cos(currentTime * planet.orbitalSpeed) * scaleDistance(planet.distance);
            const y = Math.sin(currentTime * planet.orbitalSpeed) * scaleDistance(planet.distance) * Math.sin(planet.inclination);
            const z = Math.sin(currentTime * planet.orbitalSpeed) * scaleDistance(planet.distance) * Math.cos(planet.inclination);
            planetMesh.position.set(x, y, z);
            // Update rotation about its own axis
            planetMesh.rotation.y += planet.rotationalSpeed * 0.000001;
        }
    });
}

/**
 * Retrieves a descriptive text for a celestial body based on its name.
 * It provides educational content about each body displayed in the 3D scene.
 * @param {string} name - The name of the celestial body.
 * @return {string} - Description of the celestial body.
 */
function getDescription(name) {
    switch (name) {
        case 'Sun':
            return 'A vibrant and massive star at the center of the solar system, emitting intense light and heat.';
        case 'Mercury':
            return 'A small, rocky planet closest to the sun, with a barren, crater-pocked surface and no atmosphere.';
        case 'Venus':
            return 'Shrouded in thick, toxic clouds that trap heat in a runaway greenhouse effect.';
        case 'Earth':
            return 'A vibrant world teeming with life, characterized by blue oceans, green forests, and varied climates.';
        case 'Mars':
            return 'A cold, desert world with a thin atmosphere, primarily composed of carbon dioxide.';
        case 'Jupiter':
            return 'A colossal planet with a deep, thick atmosphere of hydrogen and helium.';
        case 'Saturn':
            return 'Known for its stunning rings composed of ice and rock debris.';
        case 'Uranus':
            return 'An ice giant with a pale cyan hue due to methane in its atmosphere.';
        case 'Neptune':
            return 'A deep blue planet, showing signs of dynamic weather patterns including the fastest winds in the solar system.';
        default:
            return 'No information available.';
    }
}

/**
 * The main animation loop function that is called recursively to update the scene.
 * It handles the rendering of the scene, updates the camera controls, and updates planetary orbits.
 */
let simulationSpeed = 1.0;
const speedControl = document.getElementById('speedControl');
speedControl.addEventListener('input', (event) => {
    simulationSpeed = event.target.value;
});

function animate() {
    requestAnimationFrame(animate);
    updatePlanetaryOrbits();  // Continue updating positions in the orbit
    renderer.render(scene, camera);
    controls.update();
}

animate(); // Initiate the animation loop
