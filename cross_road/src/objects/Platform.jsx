import * as THREE from 'three';

const platForm = (x = 1, y = 1, z = 1) => {
    const platformGeometry = new THREE.BoxGeometry(x, y, z);
    const platformMaterial = new THREE.MeshPhongMaterial({
        color: 0xff0000,
    });

    const platform = new THREE.Mesh(platformGeometry, platformMaterial);

    return platform;
};

export default platForm;