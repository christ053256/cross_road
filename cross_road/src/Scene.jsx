import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import './Scene.css';

// Import objects below here!
import directionalLight from './objects/DirectionalLight';
import pointLight from './objects/PointLight';
import loadObject from './objects/loadObject';
import platForm from './objects/Platform';

const Scene = () => {
  const mountRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0); // State for loading progress
  let camera, scene, renderer;

  const speed = 0.3;
  const keysPressed = {};
  const sensitivity = 0.0005;  // Mouse sensitivity (for yaw and pitch)
  let yaw = 0;
  let pitch = 0;
  let isJumping = false;
  let verticalVelocity = 0;
  const gravity = -0.0085;

  // New variable for dashing
  let isDashing = false;
  const dashDistance = 5; // Dash forward 3 blocks
  const dashCooldown = 500; // Time (in ms) before the dash can be used again
  let lastDashTime = 0; // Store the last time the dash was used

  useEffect(() => {
    // Initialize scene, camera, and renderer
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 5, 4); // Adjusted camera position for better visibility

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    mountRef.current.appendChild(renderer.domElement);

    // Lighting setup
    const ambientLight = new THREE.AmbientLight(0x404040);
    const directLight = directionalLight(5, 10, 7.5);
    const pointlight = pointLight(10, 10, 10);
    scene.add(directLight);
    scene.add(ambientLight);
    scene.add(pointlight);

    // Add a Hemisphere Light for ambient illumination
    const hemisphereLight = new THREE.HemisphereLight(0xffeeb1, 0x080820, 0.5); // Light from above
    scene.add(hemisphereLight);

    // Resize handling
    const handleResize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    };

    window.addEventListener('resize', handleResize);

    // Create platform and add to scene
    const platformWidth = 500; // x
    const platformHeight = 10; // y
    const platformLength = 100;// z
    const platform = platForm(platformWidth, platformHeight, platformLength);
    const groundLevel = platformHeight-4.409;
    scene.add(platform);

    async function loadRoad(x = 0, z = 0, sx = 0.39355, sz = 0.25) {
      try {
        const road = await loadObject('lowpoly_road.glb', sx, 0.05, sz, setLoadingProgress); // Load player model with progress callback
        setLoading(false); // Set loading to false after first render
        road.position.y = groundLevel-0.68;
        road.castShadow = true;
        road.receiveShadow = true;
        road.rotation.y = Math.PI/2;

        road.position.x = x;
        road.position.z = z;
        platform.add(road);

      } catch (error) {
        console.error('Error loading player:', error);
        setLoading(false); // Stop loading indicator on error
      }
    }

    // Load Player model (only once)
    async function loadPlayer() {
      try {
        const player = await loadObject('slime.glb', 1, 1, 1, setLoadingProgress); // Load player model with progress callback
        setLoading(false); // Set loading to false after first render
        player.position.y = groundLevel;
        player.position.x = (platformWidth/2)-10;
        player.castShadow = true;
        player.receiveShadow = true;
        platform.add(player);

        // Movement and camera update
        function updateCamera() {
            // Position the camera behind the player based on yaw (left/right)
            const cameraDistance = 6;  // Distance between the player and camera
            const heightOffset = 2.5;
            
            // Adjust the camera position relative to the player's rotation
            camera.position.x = player.position.x - Math.sin(player.rotation.y) * cameraDistance; // Behind player on the x-axis
            camera.position.z = player.position.z - Math.cos(player.rotation.y) * cameraDistance; // Behind player on the z-axis
            camera.position.y = player.position.y + heightOffset;   // Adjust camera height based on pitch
          
            camera.lookAt(player.position); // Always look at the player
          
            // Ensure the player is always facing the direction of yaw
            player.rotation.y = yaw + Math.PI;
          }
          

        // Handle player movement and jumping logic
        function handleMovement() {
          // console.log(`x:${player.position.x} z:${player.position.z}`);
          // Move player based on key input
          if (keysPressed['d'] || keysPressed['ArrowRight']) {
            player.position.x += speed * Math.sin(yaw); // Move in the direction of yaw
            player.position.z += speed * Math.cos(yaw);
          }

          if (keysPressed['a'] || keysPressed['ArrowLeft']) {
            player.position.x -= speed * Math.sin(yaw); // Move backward
            player.position.z -= speed * Math.cos(yaw);
          }

          if (keysPressed['s'] || keysPressed['ArrowDown']) {
            player.position.x -= speed * Math.cos(yaw); // Move left
            player.position.z += speed * Math.sin(yaw);
          }

          if (keysPressed['w'] || keysPressed['ArrowUp']) {
            player.position.x += speed * Math.cos(yaw); // Move right
            player.position.z -= speed * Math.sin(yaw);
          }

          player.rotation.y = yaw + ((Math.PI)/2.1);

          // Clamp player position within platform boundaries (optional, you can change the bounds as needed)
          player.position.x = Math.max(-247.64, Math.min(247.64, player.position.x));
          player.position.z = Math.max(-47.90 , Math.min(47.90 , player.position.z));

          // Handle jump (vertical movement)
          if (isJumping) {
            player.position.y += verticalVelocity; // Update player’s vertical position
            verticalVelocity += gravity; // Apply gravity

            // Check if the player lands back on the ground
            if (player.position.y <= groundLevel) {
              player.position.y = groundLevel; // Stop at ground level
              isJumping = false; // End jump
              verticalVelocity = 0; // Reset vertical velocity
            }
          }

          // Dash forward if the dash key (Q) is pressed
          if (isDashing) {
            const currentTime = Date.now();
            // Dash only if enough time has passed
            if (currentTime - lastDashTime >= dashCooldown) {
              lastDashTime = currentTime; // Update dash time
              const dashOffset = dashDistance; // Dash forward by 3 blocks
              player.position.x += dashOffset * Math.cos(yaw);
              player.position.z -= dashOffset * Math.sin(yaw);
              isDashing = false; // Reset dash state
            }
          }
        }

        // Animation loop
        function animate() {
          requestAnimationFrame(animate); // Recursive call for animation loop

          handleMovement(); // Update player’s position
          updateCamera(); // Update camera to always look at the player

          renderer.render(scene, camera); // Render the scene
        }

        animate(); // Start animation loop after loading the player

      } catch (error) {
        console.error('Error loading player:', error);
        setLoading(false); // Stop loading indicator on error
      }
    }

    loadPlayer(); // Start loading the player model only once
    let roadx = [];
    for (let index = -((platformWidth/2.5)); index < ((platformWidth/2.5)); index+=50) {
      roadx.push(index);
    }

    roadx.forEach((value) => {
      loadRoad(value, 0);
    });

  
    
    // Keyboard controls
    function handleKeyDown(event) {
      keysPressed[event.key] = true;
      if (event.key === ' ' && !isJumping) {
        isJumping = true;
        verticalVelocity = 0.2; // Initial jump velocity
      }
      if (event.key === 'q' && !isDashing) {
        isDashing = true; // Activate dash
      }
    }

    function handleKeyUp(event) {
      keysPressed[event.key] = false;
    }

    // Mouse control (to look around using mouse movement)
    function onMouseMove(event) {
      if (document.pointerLockElement === renderer.domElement) {
        yaw -= event.movementX * sensitivity; // Horizontal rotation (yaw)
        pitch -= event.movementY * sensitivity; // Vertical rotation (pitch)

        // Limit vertical rotation (pitch) to a max of 90 degrees up and down
        pitch = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, pitch));
      }
    }

    // Pointer lock for mouse control
    function onClick() {
      renderer.domElement.requestPointerLock();
    }

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('mousemove', onMouseMove);
    renderer.domElement.addEventListener('click', onClick);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('mousemove', onMouseMove);
      renderer.domElement.removeEventListener('click', onClick);
      mountRef.current.removeChild(renderer.domElement);
      if (renderer) {
        renderer.dispose();
      }
    };
  }, []); // The empty dependency array ensures that this effect runs only once

  return (
    <div>
      <div ref={mountRef} />
      {loading && <div className="loading-indicator">Loading... {loadingProgress.toFixed(2)}%</div>}
    </div>
  );
};

export default Scene;
