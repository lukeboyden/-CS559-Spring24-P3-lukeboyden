// Required Libraries
import * as THREE from 'three';
import { OrbitControls } from '../libs/CS559-Three/examples/jsm/controls/OrbitControls.js';

// Scene, Camera, Renderer setup
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Lighting
const ambientLight = new THREE.AmbientLight(0x404040);
scene.add(ambientLight);
const sunLight = new THREE.PointLight(0xffffff, 1.5, 0);
scene.add(sunLight);

// Helper function to create planets
function createPlanet(size, texturePath, distanceFromSun, orbitSpeed) {
    const texture = new THREE.TextureLoader().load(texturePath);
    const material = new THREE.MeshPhongMaterial({ map: texture });
    const geometry = new THREE.SphereGeometry(size, 32, 32);
    const planet = new THREE.Mesh(geometry, material);
    scene.add(planet);
    return { planet, distanceFromSun, orbitSpeed };
}

// Planets
const sun = createPlanet(5, 'textures/sun.jpg', 0, 0);
const earth = createPlanet(1, 'textures/earth.jpg', 10, 0.01);

// Animate Planets
function animate() {
    requestAnimationFrame(animate);
    earth.planet.position.x = earth.distanceFromSun * Math.cos(Date.now() * earth.orbitSpeed);
    earth.planet.position.z = earth.distanceFromSun * Math.sin(Date.now() * earth.orbitSpeed);
    renderer.render(scene, camera);
}

// Interactivity with raycaster
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
function onMouseClick(event) {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(scene.children);
    if (intersects.length > 0) {
        console.log(`Clicked on: ${intersects[0].object.name}`);
    }
}
window.addEventListener('click', onMouseClick);

// Controls
const controls = new OrbitControls(camera, renderer.domElement);
controls.minDistance = 10;
controls.maxDistance = 50;

// Start the animation loop
animate();
