import * as THREE from 'three';

const pointLight = (x = 1, y = 1, z = 1) => {
    const pointLight = new THREE.DirectionalLight(0xffffff, 1); // Increased intensity
    pointLight.position.set(x, y, z); // Position the directional light
    pointLight.castShadow = true; // Enable shadows for the point light

    return pointLight;
};

export default pointLight;