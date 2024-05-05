// Required Libraries
import * as THREE from 'three';
import { OrbitControls } from '../libs/CS559-Three/examples/jsm/controls/OrbitControls.js';

// Scene setup
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1e8);
camera.position.z = 20;

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Ambient light
const ambientLight = new THREE.AmbientLight(0xffffff, 0.2); // Soft white light
scene.add(ambientLight);

// Sun settings
const sunGeometry = new THREE.SphereGeometry(696340 / 12756 / 50, 64, 64); // Sun radius scaled against Earth's radius
const sunMaterial = new THREE.MeshBasicMaterial({ color: 0xffff00, emissive: 0xffff00 });
const sun = new THREE.Mesh(sunGeometry, sunMaterial);
scene.add(sun);

// Point light for the Sun
const pointLight = new THREE.PointLight(0xffffff, 1.5, 0);
sun.add(pointLight);

// Utility for loading textures
const loadTexture = path => new THREE.TextureLoader().load(path);

// Scaled distance from the Sun function
const astronomicalUnit = 149597870.7; // in thousands of kilometers
const scaleDistance = distance => (distance / astronomicalUnit) * 10; // scale factor for manageable scene size

// Data for planets
const planetsData = [
    { name: "Mercury", diameter: 4879, distance: 57900000, texture: "textures/mercury.jpg" },
    { name: "Venus", diameter: 12104, distance: 108200000, texture: "textures/venus.jpg" },
    { name: "Earth", diameter: 12756, distance: 149600000, texture: "textures/earth.jpg" },
    { name: "Mars", diameter: 6792, distance: 227900000, texture: "textures/mars.jpg" },
    { name: "Jupiter", diameter: 142984, distance: 778600000, texture: "textures/jupiter.jpg" },
    { name: "Saturn", diameter: 120536, distance: 1433500000, texture: "textures/saturn.jpg" },
    { name: "Uranus", diameter: 51118, distance: 2872500000, texture: "textures/uranus.jpg" },
    { name: "Neptune", diameter: 49528, distance: 4495100000, texture: "textures/neptune.jpg" }
];

// Create planets
planetsData.forEach(planet => {
    const planetGeometry = new THREE.SphereGeometry(planet.diameter / 12756, 32, 32); // Using Earth's diameter as base unit
    const planetMaterial = new THREE.MeshPhongMaterial({
        map: loadTexture(planet.texture)
    });
    const planetMesh = new THREE.Mesh(planetGeometry, planetMaterial);
    planetMesh.position.x = scaleDistance(planet.distance); // Positioning planets
    scene.add(planetMesh);
});

// Controls
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;

// Animation loop
function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
    controls.update();
}
animate();