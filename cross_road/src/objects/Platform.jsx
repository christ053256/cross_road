import * as THREE from 'three';

const platForm = (x = 1, y = 1, z = 1) => {
    const platformGeometry = new THREE.BoxGeometry(x+300, y, z);
    const platformMaterial = new THREE.MeshStandardMaterial({
        color: '#08f71d',
    });

    const platform = new THREE.Mesh(platformGeometry, platformMaterial);
    platform.receiveShadow = true;
    return platform;
};

export default platForm;