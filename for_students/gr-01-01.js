// Required Libraries
import * as THREE from 'three';
import { OrbitControls } from '../libs/CS559-Three/examples/jsm/controls/OrbitControls.js';

// Scene, camera, and renderer setup
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1e8);
camera.position.z = 40;
const renderer = new THREE.WebGLRenderer();
renderer.setSize(1920, 1080);
document.body.appendChild(renderer.domElement);

// Controls for user interaction
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;

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

// Add event listener for mouse clicks
renderer.domElement.addEventListener('click', onDocumentMouseDown, false);

// UI component to display information about planets
const infoElement = document.createElement('div');
infoElement.id = 'infoCard';  // Use the new CSS styles
document.body.appendChild(infoElement);

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

/**
 * Handles the animation of planetary rotation and orbit. It recursively calls itself
 * to continuously update the position and rotation of a planet based on real-time.
 * This function is defined within the forEach loop to capture each planetMesh instance.
 */
function animatePlanet() {
    requestAnimationFrame(animatePlanet);
    // Simulate axial rotation
    planetMesh.rotation.y += 0.001;
    // Calculate and update position for orbital movement
    planetMesh.position.x = Math.cos(Date.now() * 0.0001 * planet.orbitalSpeed) * scaleDistance(planet.distance);
    planetMesh.position.z = Math.sin(Date.now() * 0.0001 * planet.orbitalSpeed) * scaleDistance(planet.distance);
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
    const currentTime = Date.now() * 0.0001;  // Current time factor for animation speed
    planetsData.forEach(planet => {
        const planetMesh = scene.children.find(obj => obj.name === planet.name);
        if (planetMesh) {
            // Calculate and update position for circular orbits
            planetMesh.position.x = Math.cos(currentTime * planet.orbitalSpeed) * scaleDistance(planet.distance);
            planetMesh.position.z = Math.sin(currentTime * planet.orbitalSpeed) * scaleDistance(planet.distance);
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
function animate() {
    requestAnimationFrame(animate);
    updatePlanetaryOrbits();  // Continue updating positions in the orbit
    renderer.render(scene, camera);
    controls.update();
}

animate(); // Initiate the animation loop