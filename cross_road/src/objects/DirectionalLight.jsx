import * as THREE from 'three';

const directionalLight = (x = 1, y = 1, z = 1) => {
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1); // Increased intensity
    directionalLight.position.set(x, y, z); // Position the directional light
    directionalLight.castShadow = true; // Enable shadow casting
    directionalLight.shadow.mapSize.width = 1024; // Shadow map width
    directionalLight.shadow.mapSize.height = 1024; // Shadow map height
    directionalLight.shadow.camera.near = 0.1; // Near clipping plane for shadows
    directionalLight.shadow.camera.far = 50; // Far clipping plane for shadows
    directionalLight.shadow.camera.left = -50; // Left edge of the shadow camera
    directionalLight.shadow.camera.right = 50; // Right edge of the shadow camera
    directionalLight.shadow.camera.top = 50; // Top edge of the shadow camera
    directionalLight.shadow.camera.bottom = -50; // Bottom edge of the shadow camera
    //add some bias to prevent shadow acne
    directionalLight.shadow.bias = -0.005;

    return directionalLight;
};

export default directionalLight;