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
const sunGeometry = new THREE.SphereGeometry(1, 6.4, 6.4); // Adjust size as necessary
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
const ambientLight = new THREE.AmbientLight(0x404040, 5);
scene.add(ambientLight);

// Load texture function
function loadTexture(planetName) {
    return new THREE.TextureLoader().load(`textures/${planetName}.jpg`);
}

// Planetary data and creation
const planets = [
    { name: 'Mercury', diameter: 0.383, distance: 0.39, orbitalSpeed: 0.0001 },
    //{ name: 'Venus', diameter: 0.949, distance: 0.72, orbitalSpeed: 0.00008 },
    { name: 'Earth', diameter: 1, distance: 1, orbitalSpeed: 0.00007 },
    { name: 'Mars', diameter: 0.532, distance: 1.52, orbitalSpeed: 0.00006 },
    { name: 'Jupiter', diameter: 11.21, distance: 5.2, orbitalSpeed: 0.00005 },
    { name: 'Saturn', diameter: 9.45, distance: 9.58, orbitalSpeed: 0.00004 },
    { name: 'Uranus', diameter: 4.01, distance: 19.22, orbitalSpeed: 0.00003 },
    { name: 'Neptune', diameter: 3.88, distance: 30.05, orbitalSpeed: 0.00002 }
];

const sizeScale = 1; // Adjust as needed
const distanceScale = 5; // Adjust as needed for visibility

planets.forEach(planet => {
    const geometry = new THREE.SphereGeometry(planet.diameter * sizeScale, 32, 32);
    const material = new THREE.MeshPhongMaterial({
        map: loadTexture(planet.name)
    });
    const planetMesh = new THREE.Mesh(geometry, material);
    planetMesh.position.x = planet.distance * distanceScale; // Positioning planets
    scene.add(planetMesh);

    // Simple orbit animation
    function animatePlanet() {
        requestAnimationFrame(animatePlanet);
        planetMesh.position.x = Math.cos(Date.now() * planet.orbitalSpeed) * planet.distance * distanceScale;
        planetMesh.position.z = Math.sin(Date.now() * planet.orbitalSpeed) * planet.distance * distanceScale;
    }
    animatePlanet();
});

// Controls for interactive camera movement
const controls = new OrbitControls(camera, renderer.domElement);
controls.minDistance = 0;
controls.maxDistance = 15000;

// Rendering loop
function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
}
animate();
