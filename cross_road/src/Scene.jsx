import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import './Scene.css';

// Objects Import
import directionalLight from './objects/DirectionalLight';
import pointLight from './objects/PointLight';
import loadObject from './objects/loadObject';
import platForm from './objects/Platform';

//Sky background: texture loader
const background = new THREE.TextureLoader().load('blue-sky.png');
let camera, scene, renderer;

//Display Score Board
const Scoreboard = ({ score, hit, speed }) => (
  <div className="scoreboard">
    <h2>Level: {score+1}</h2>
    <h2>Hits Taken: {hit}</h2>
    <h2>Car Speed: {speed}</h2>
  </div>
);

// Resize handling
const handleResize = () => {
  const width = window.innerWidth;
  const height = window.innerHeight;
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
  renderer.setSize(width, height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
};

//Main Scene
const Scene = () => {
  //Variables initialization
  const mountRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0); // State for loading progress
  const [carSpeed, setCarSpeed] = useState(0.5); // state of Car speed
  const [score, setScore] = useState(0); // state of score
  const [hit, setHit] = useState(0); // state of player being hit by a vehicle


  //For Car objects and Position
  let activeCars = new Set();
  let allCars = new Set();

  let myPlayer; // Player hit box
  const speed = 0.3; //Player speed
  const keysPressed = {}; // Player's keys
  const sensitivity = 0.0005;  // Mouse sensitivity (for yaw and pitch)
  let yaw = 0;
  let pitch = 0;
  let isJumping = false;
  let verticalVelocity = 0;
  const gravity = -0.0085;

  // New variable for dashing
  let isDashing = false;
  const dashDistance = 5; // Dash forward 3 blocks
  const dashCooldown = 3000; // Time (in ms) before the dash can be used again
  let lastDashTime = 0; // Store the last time the dash was used

  useEffect(() => {
    // Initialize scene, camera, and renderer
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 5, 4); // Adjusted camera position for better visibility

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
   
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    mountRef.current.appendChild(renderer.domElement);

    // Lighting setup
    const ambientLight = new THREE.AmbientLight(0x404040);
    scene.add(ambientLight);
    const directLight = directionalLight(0, 100, 0);
    const pointlight = pointLight(10, 10, 10);
    scene.add(directLight);
    //scene.add(ambientLight);
    scene.add(pointlight);

    // Add a Hemisphere Light for ambient illumination
    const hemisphereLight = new THREE.HemisphereLight(0xffeeb1, 0x080820, 0.5); // Light from above
    scene.add(hemisphereLight);

    const skyGeometry = new THREE.SphereGeometry(window.innerHeight, 50, 50);  // Adjust radius to suit your scene
    const skyMaterial = new THREE.MeshBasicMaterial({
      map: background,  // Assuming 'background' is the texture you've loaded
      side: THREE.BackSide // To make the texture appear on the inside of the sphere
    });

    // Create the mesh
    const sky = new THREE.Mesh(skyGeometry, skyMaterial);
    scene.add(sky);

    window.addEventListener('resize', handleResize);

    // Create platform and add to scene
    const platformWidth = 500; // x
    const platformHeight = 10; // y
    const platformLength = 300;// z
    const platform = platForm(platformWidth, platformHeight, platformLength+300);
    const groundLevel = platformHeight-4.409;
    scene.add(platform);

    async function loadRoad(x = 0, z = 0, sx = 3, sz = 0.25) {
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


    async function spawnCar(x = 0, z = 0, sx = 4, sy = 4, sz = 4, rotation = Math.PI) {
      try {
        const vehicles = ['car-police.glb', 'car-ambulance-pickup.glb', 'car-taxi.glb', 'car-baywatch.glb', 'car-tow-truck.glb', 'car-truck-dump.glb'];
        const car = await loadObject(vehicles[Math.floor(Math.random() * vehicles.length)], sx, sy, sz, setLoadingProgress);
        setLoading(false);
        car.position.set(x, groundLevel - 0.6, z);
        car.castShadow = true;
        car.receiveShadow = true;
        car.rotation.y = rotation;
    
        platform.add(car);
        carMove(car);
    
        // Add the car to the active set
        activeCars.add(car.position.z);
        // Set a timeout to remove the car after a period of time
        setTimeout(() => {
          removeGLBModel(car);
          activeCars.delete(car.position.z); // Remove from active cars once it's gone
        }, 6000); // Remove car after 6 seconds
      } catch (error) {
        console.error('Error loading vehicle:', error);
        setLoading(false);
      }
    }

    async function loadBuilding(buildingPath, x = 0, z = 0, y = 0, sx = 0.5, sy = 0.5, sz = 0.5, rotation = Math.PI) {
      try {
        //const buildingGLB = 'asia_building.glb';
        const bulding = await loadObject(buildingPath, sx, sy, sz, setLoadingProgress);
        setLoading(false);
        bulding.position.set(x, y, z);
        bulding.castShadow = true;
        bulding.receiveShadow = true;
        bulding.rotation.y = rotation;
    
        platform.add(bulding);

      } catch (error) {
        console.error('Error loading building:', error);
        setLoading(false);
      }
    }

    function carMove(car, targetZ = 254) {
      const moveInterval = setInterval(() => {
        // Move the car along the Z-axis towards the targetZ
        if (car.position.z > -(targetZ) && car.rotation.y === Math.PI) {
          car.position.z -= carSpeed; // Move the car towards targetZ
        } else if (car.position.z < targetZ && car.rotation.y === (2 * Math.PI)) {
          car.position.z += carSpeed; 
        } else {
          // Car has reached its destination, remove it from the scene
          clearInterval(moveInterval);
          removeGLBModel(car);
          activeCars.delete(car.position.z); // Ensure the car is no longer active
        }
        allCars.add(car);
      }, 8);
    }

    function removeGLBModel(model) {
      // Traverse through all children of the model
      model.traverse((child) => {
          if (child.isMesh) {
              // Dispose geometry
              child.geometry.dispose();
              
              // Dispose materials and their textures
              if (child.material) {
                  if (Array.isArray(child.material)) {
                      child.material.forEach((material) => {
                          disposeMaterial(material);
                      });
                  } else {
                      disposeMaterial(child.material);
                  }
              }
          }
      });
      // Remove the model from its parent
      if (model.parent) {
          model.parent.remove(model);
      }
    }
  
    // Helper function to dispose materials and their textures
    function disposeMaterial(material) {
        if (material.map) material.map.dispose(); // Dispose texture map
        if (material.lightMap) material.lightMap.dispose(); // Dispose light map
        if (material.bumpMap) material.bumpMap.dispose(); // Dispose bump map
        if (material.normalMap) material.normalMap.dispose(); // Dispose normal map
        if (material.specularMap) material.specularMap.dispose(); // Dispose specular map
        material.dispose(); // Finally dispose the material itself
    }

    // Load Player model (only once)
    async function loadPlayer() {
      try {
        const player = await loadObject('slime.glb', 1, 1, 1, setLoadingProgress); // Load player model with progress callback
        setLoading(false); // Set loading to false after first render
        player.position.y = groundLevel;
        player.position.x = -(platformWidth/2)-10;
        player.castShadow = true;
        platform.add(player);
        myPlayer = new THREE.Box3().setFromObject(player);

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
            camera.position.y = groundLevel+2.5;
            // Ensure the player is always facing the direction of yaw
            player.rotation.y = yaw + Math.PI;
        }

        function checkCollision(){
          const playerBox = new THREE.Box3().setFromObject(player);
          allCars.forEach((car) => {
            const carBox = new THREE.Box3().setFromObject(car);
            if (playerBox.intersectsBox(carBox)) {
              //Restart here all
              player.position.x = -(platformWidth/2)-10;
              player.position.z = 0;
              setHit((prev) => {
                const newHit = prev + 1;
                return newHit;
              });
              alert('You got hit.');
              const movement = ['w', 's', 'a', 'd', 'arrowUp', 'arrowDown', 'arrowRight', 'arrowLeft'];
              movement.forEach((keys) =>{
                keysPressed[keys] = false;
              });
            }
          });
          allCars = new Set();
        }

        function finishLine() {
          if (player.position.x >= 170) {
            // Update the score
            setScore((prevScore) => prevScore + 1);
      
            // Increase speed (optional)
            setCarSpeed((prevSpeed) => prevSpeed + 0.05);

            // Reset player position
            player.position.x = -(platformWidth / 2) - 10;
            player.position.z = 0;
            alert('God Job!.');
              const movement = ['w', 's', 'a', 'd', 'arrowUp', 'arrowDown', 'arrowRight', 'arrowLeft'];
              movement.forEach((keys) =>{
                keysPressed[keys] = false;
            });
        }
        }
        

        // Handle player movement and jumping logic
        function handleMovement() {
          // Move player based on key input
          if(player.position.x)
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
          finishLine();
          // Clamp player position within platform boundaries (optional, you can change the bounds as needed)
          //player max
          player.position.x = Math.max(-247.64, Math.min(247.64, player.position.x));
          player.position.z = Math.max(-47.90 , Math.min(47.90 , player.position.z));

          //console.log(`x:${player.position.x} z:${player.position.z}`);
          // Handle jump (vertical movement)
          if (isJumping) {
            player.position.y += verticalVelocity; // Update player’s vertical position
            verticalVelocity += gravity; // Apply gravity
            
            player.scale.set(0.7, 0.7, 1);

            // Check if the player lands back on the ground
            if (player.position.y <= groundLevel) {
              player.position.y = groundLevel; // Stop at ground level
              isJumping = false; // End jump
              verticalVelocity = 0; // Reset vertical velocity
              player.scale.set(1,1,1);
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
            }
            isDashing = false;//reset state
          }
          
        }

        

        
        // Animation loop
        function animate() {
          //console.log(`X: ${player.position.x}\nZ:${player.position.z}`);
          requestAnimationFrame(animate); // Recursive call for animation loop

          handleMovement(); // Update player’s position
          checkCollision();
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


    //Loading building and with their corresponding position
    roadx.forEach((value) => {
      loadRoad(value, 0);
      loadBuilding('tunnel.glb',value, -205, groundLevel+8, 4, 4, 4);
      loadBuilding('tunnel.glb',value, 205, groundLevel+8, 4, 4, 4);
    });
    

    let buildingZ = [];
    for(let i = -160; i <= 160; i+=80){
      buildingZ.push(i);
    }


    buildingZ.forEach((z)=>{
      //async function loadBuilding(buildingPath, x = 0, z = 0, y = 0, sx = 0.5, sy = 0.5, sz = 0.5, rotation = Math.PI)
      loadBuilding('asia_building.glb',-300, z, groundLevel-0.8);
      loadBuilding('asia_building.glb',300, z, groundLevel-0.8);
      loadBuilding('chicago_buildings.glb',z, -230, groundLevel+6, 1, 1, 1, 2* Math.PI);
      loadBuilding('asia_building.glb',z, 350, groundLevel-0.8);
    });


    setInterval(() => {
      roadx.forEach((value) => {
        // Randomly decide if a car spawns in a particular lane, avoiding intersections
        if (Math.random() > 0.5) {
          const spawnPosition1 = value - 10;
          if (!activeCars.has(spawnPosition1)) {
            spawnCar(spawnPosition1, -200, 4, 4, 4, 2 * Math.PI);
            activeCars.add(spawnPosition1); // Mark position as occupied
            setTimeout(() => activeCars.delete(spawnPosition1)
            , 1500); // Free position after car is gone
            
          }
        }

        if (Math.random() > 0.5) {
          const spawnPosition2 = value + 10;
          if (!activeCars.has(spawnPosition2)) {
            spawnCar(spawnPosition2, 200, 4, 4, 4, Math.PI);
            activeCars.add(spawnPosition2); // Mark position as occupied
            setTimeout(() => 
              activeCars.delete(spawnPosition2), 1500); // Free position after car is gone
          }
        }
      });
    }, Math.floor((Math.random() * 1000) + 700));

    

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
      if (mountRef.current) {
        mountRef.current.removeChild(renderer.domElement);
      }
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('mousemove', onMouseMove);
      renderer.domElement.removeEventListener('click', onClick);
    
      if (renderer) {
        renderer.dispose();
      }
    };    
  }, []); // The empty dependency array ensures that this effect runs only once



  return (
    <div>
      <Scoreboard score={score} hit={hit} speed={Math.round(carSpeed*10)} />
      <div ref={mountRef} />
      {loading && <div className="loading-indicator">Loading... {loadingProgress.toFixed(2)}%</div>}
    </div>
  );
};



export default Scene;