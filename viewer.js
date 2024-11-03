import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { Rhino3dmLoader } from 'three/addons/loaders/3DMLoader.js';

let camera, scene, renderer, controls, additionalModel, thirdModel;

THREE.Object3D.DEFAULT_UP.set(0, 0, 1);

init();
animate();

function init() {
    // Set up the scene
    camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, -10, 10);

    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x87CEEB); // Sky blue background

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    controls = new OrbitControls(camera, renderer.domElement);
    controls.addEventListener('change', render);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;

    // Add ambient light
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    // Add directional light
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(1, 1, 1).normalize();
    scene.add(directionalLight);

    // Load all models
    const loader = new Rhino3dmLoader();
    loader.setLibraryPath('https://cdn.jsdelivr.net/npm/rhino3dm@8.4.0/');
    
    // Load main model first
    loader.load('https://cdn.glitch.me/776fb300-9b8a-4335-bb1c-8b7b2d51fd48/LF_main_241030.3dm?v=1729465152649', function (object) {
        scene.add(object);
        
        // Load additional model after main model
        loader.load('https://cdn.glitch.global/776fb300-9b8a-4335-bb1c-8b7b2d51fd48/LF240929_sensors.3dm?v=1727645626339', function (additionalObject) {
            additionalModel = additionalObject;
            scene.add(additionalModel);
            
            // Load third model after additional model
            loader.load('https://cdn.glitch.global/776fb300-9b8a-4335-bb1c-8b7b2d51fd48/LF_kids_projections_241103.3dm?v=1730652781446', function (thirdObject) {
                thirdModel = thirdObject;
                scene.add(thirdModel);
                
                // Adjust camera after all models are loaded
                adjustCameraToFitScene();
            });
        });
    });

    // Handle window resize
    window.addEventListener('resize', onWindowResize);

    // Create and add toggle buttons
    createToggleButtons();
}

function createToggleButtons() {
    // First toggle button
    const button1 = document.createElement('button');
    button1.textContent = 'Toggle Sesors';
    button1.style.position = 'absolute';
    button1.style.top = '10px';
    button1.style.left = '10px';
    button1.style.zIndex = '1000';
    button1.addEventListener('click', toggleAdditionalModel);
    document.body.appendChild(button1);

    // Second toggle button
    const button2 = document.createElement('button');
    button2.textContent = 'Toggle Kids Projections';
    button2.style.position = 'absolute';
    button2.style.top = '40px'; // Position below the first button
    button2.style.left = '10px';
    button2.style.zIndex = '1000';
    button2.addEventListener('click', toggleThirdModel);
    document.body.appendChild(button2);

    // Add keyboard shortcuts
    document.addEventListener('keydown', function(event) {
        if (event.key.toLowerCase() === 'n') {
            toggleAdditionalModel();
        } else if (event.key.toLowerCase() === 'm') { // You can change this key to whatever you prefer
            toggleThirdModel();
        }
    });
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    render();
}

function adjustCameraToFitScene() {
    const boundingBox = new THREE.Box3().setFromObject(scene);
    const center = boundingBox.getCenter(new THREE.Vector3());
    const size = boundingBox.getSize(new THREE.Vector3());

    // Compute the radius of a sphere that would enclose the entire scene
    const radius = Math.max(size.x, size.y, size.z) * 0.5;

    // Position the camera
    const fov = camera.fov * (Math.PI / 180);
    const distanceToFit = Math.abs(radius / Math.sin(fov / 2));
    const direction = new THREE.Vector3(1, -1, 0.5).normalize();
    camera.position.copy(center).add(direction.multiplyScalar(distanceToFit * 1.5));

    // Look at the center of the scene
    camera.lookAt(center);

    // Update controls
    controls.target.copy(center);
    controls.update();

    // Update the far plane of the camera
    camera.far = distanceToFit * 4;
    camera.updateProjectionMatrix();

    render();
}

function toggleAdditionalModel() {
    if (additionalModel) {
        additionalModel.visible = !additionalModel.visible;
        render();
    }
}

function toggleThirdModel() {
    if (thirdModel) {
        thirdModel.visible = !thirdModel.visible;
        render();
    }
}

function animate() {
    requestAnimationFrame(animate);
    controls.update(); // for damping
    render();
}

function render() {
    renderer.render(scene, camera);
}

console.log('Three.js version:', THREE.REVISION);