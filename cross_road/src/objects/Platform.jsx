import * as THREE from 'three';

const platForm = (x = 1, y = 1, z = 1) => {
    const platformGeometry = new THREE.BoxGeometry(x, y, z);
    const platformMaterial = new THREE.MeshPhongMaterial({
        color: '#08f71d',
    });

    const platform = new THREE.Mesh(platformGeometry, platformMaterial);

    return platform;
};

export default platForm;