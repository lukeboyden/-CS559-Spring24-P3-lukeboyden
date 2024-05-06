// Required Libraries
import * as THREE from 'three';
import { OrbitControls } from '../libs/CS559-Three/examples/jsm/controls/OrbitControls.js';

const infoElement = document.createElement('div');
infoElement.id = 'infoCard';  // Use the new CSS styles
document.body.appendChild(infoElement);

// Scene, camera, and renderer setup
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1e8);
camera.position.z = 40;

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

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
const pointLight = new THREE.PointLight(0xffffff, 1.5, 0);
sun.add(pointLight);

// Load texture function
const loadTexture = path => new THREE.TextureLoader().load(path);

// Astronomical unit and scaling function for distances
const astronomicalUnit = 149597870.7; // in thousands of kilometers
const scaleDistance = distance => (distance / astronomicalUnit) * 10; // scale factor for scene size

// Planetary data
const planetsData = [
    { name: "Mercury", diameter: 4879, distance: 57900000, orbitalSpeed: 0.00474, texture: "textures/mercury.jpg" },
    { name: "Venus", diameter: 12104, distance: 108200000, orbitalSpeed: 0.00350, texture: "textures/venus.jpg" },
    { name: "Earth", diameter: 12756, distance: 149600000, orbitalSpeed: 0.00298, texture: "textures/earth.jpg" },
    { name: "Mars", diameter: 6792, distance: 227900000, orbitalSpeed: 0.00241, texture: "textures/mars.jpg" },
    { name: "Jupiter", diameter: 142984 / 3, distance: 778600000, orbitalSpeed: 0.00131, texture: "textures/jupiter.jpg" },
    { name: "Saturn", diameter: 120536 / 3, distance: 1433500000, orbitalSpeed: 0.00097, texture: "textures/saturn.jpg" },
    { name: "Uranus", diameter: 51118, distance: 2872500000, orbitalSpeed: 0.00068, texture: "textures/uranus.jpg" },
    { name: "Neptune", diameter: 49528, distance: 4495100000, orbitalSpeed: 0.00054, texture: "textures/neptune.jpg" }
];

// Create planets and add them to interactiveObjects
planetsData.forEach(planet => {
    const geometry = new THREE.SphereGeometry(planet.diameter / 12756 * 0.5, 32, 32); // Scale planets
    const material = new THREE.MeshPhongMaterial({
        map: loadTexture(planet.texture)
    });
    const planetMesh = new THREE.Mesh(geometry, material);
    planetMesh.name = planet.name;  // Important for identification in raycaster
    planetMesh.position.x = scaleDistance(planet.distance); // Position planets
    scene.add(planetMesh);
    celestialBodies.push(planetMesh); // Add each planet to the celestial bodies array

    // Orbital motion
    function animatePlanet() {
        requestAnimationFrame(animatePlanet);
        planetMesh.rotation.y += 0.001; // Axial rotation
        planetMesh.position.x = Math.cos(Date.now() * 0.0001 * planet.orbitalSpeed) * scaleDistance(planet.distance);
        planetMesh.position.z = Math.sin(Date.now() * 0.0001 * planet.orbitalSpeed) * scaleDistance(planet.distance);
    }
    animatePlanet();
});
// Controls for user interaction
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;

// Function to update planetary positions for orbits
function updatePlanetaryOrbits() {
  const currentTime = Date.now() * 0.0001;  // Current time factor for animation speed

  planetsData.forEach((planet, index) => {
      const planetMesh = scene.children.find(obj => obj.name === planet.name);
      if (planetMesh) {
          // Circular orbit calculation
          planetMesh.position.x = Math.cos(currentTime * planet.orbitalSpeed) * scaleDistance(planet.distance);
          planetMesh.position.z = Math.sin(currentTime * planet.orbitalSpeed) * scaleDistance(planet.distance);
      }
  });
}

// Add event listener for mouse clicks
renderer.domElement.addEventListener('click', onDocumentMouseDown, false);

function onDocumentMouseDown(event) {
    event.preventDefault();

    // Calculate mouse position in normalized device coordinates (-1 to +1)
    const rect = renderer.domElement.getBoundingClientRect();
    const mouse = new THREE.Vector2();
    mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    // Update and display information for the clicked planet
    let foundPlanet = false;
    celestialBodies.forEach(planet => {
        const vector = planet.position.clone().project(camera);
        // Check if the mouse click is near the planet's position
        if (Math.abs(mouse.x - vector.x) < 0.05 && Math.abs(mouse.y - vector.y) < 0.05) {
            showPlanetInfo(planet.name);
            foundPlanet = true;
        }
    });

    if (!foundPlanet) {
        infoElement.style.display = 'none';
    }
}

function showPlanetInfo(name) {
    const description = getDescription(name);
    infoElement.innerHTML = `<strong>${name}</strong><br>${description}`;
    infoElement.style.display = 'block';
}

// Styling for the information display box
infoElement.style.position = 'absolute';
infoElement.style.top = '10px';
infoElement.style.right = '10px';
infoElement.style.width = '300px';
infoElement.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
infoElement.style.color = 'white';
infoElement.style.padding = '10px';
infoElement.style.borderRadius = '5px';
infoElement.style.display = 'none';  // Start hidden



// Descriptions for celestial bodies
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

// Continue with the existing animate function
function animate() {
  requestAnimationFrame(animate);
  updatePlanetaryOrbits();  // Continue updating positions in the orbit
  renderer.render(scene, camera);
  controls.update();
}

animate();