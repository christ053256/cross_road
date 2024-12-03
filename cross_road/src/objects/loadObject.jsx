import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

/**
 * Loads a GLTF model of a player and scales it.
 * @param {string} url - The URL of the GLTF model.
 * @param {number} x - The scale factor along the X-axis.
 * @param {number} y - The scale factor along the Y-axis.
 * @param {number} z - The scale factor along the Z-axis.
 * @param {function} onProgress - Optional callback for loading progress.
 * @returns {Promise<THREE.Group>} A promise that resolves with the loaded object.
 */
const loadObject = (url, x = 1, y = 1, z = 1, onProgress) => {
  const loader = new GLTFLoader();

  // Validate parameters
  if (typeof x !== 'number' || typeof y !== 'number' || typeof z !== 'number') {
    return Promise.reject(new Error('Scale factors must be numbers.'));
  }

  return new Promise((resolve, reject) => {
    loader.load(
      url,
      (gltf) => {
        const object = gltf.scene;
        object.scale.set(x, y, z);
        resolve(object); // Resolve with the loaded object
      },
      (xhr) => {
        // Call the onProgress callback if provided
        if (onProgress) {
          const percentComplete = (xhr.loaded / xhr.total) * 100;
          onProgress(percentComplete);
        }
      },
      (error) => {
        console.error('Error loading GLTF model:', error);
        reject(new Error(`Failed to load GLTF model: ${error.message}`));
      }
    );
  });
};

export default loadObject;