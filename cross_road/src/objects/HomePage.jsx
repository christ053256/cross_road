import React, { useState, useEffect, useRef } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import './Homepage.css';
import Scene from '../Scene.jsx';

const Homepage = () => {
    const [showScene, setShowScene] = useState(false);
    const [windowSize, setWindowSize] = useState({
        width: window.innerWidth,
        height: window.innerHeight,
    });
    const mountRef = useRef(null);
    const slimeAudioRef = useRef(new Audio('/slimebgm.mp3')); // Reference for the first audio
    const vehicleAudioRef = useRef(new Audio('/vehiclebgm.mp3')); // Reference for the second audio
    const vehicleAudioRef1 = useRef(new Audio('/vehiclebgm.mp3'));
    const vehicleAudioRef2 = useRef(new Audio('/vehiclebgm.mp3'));
    const vehicleAudioRef3 = useRef(new Audio('/vehiclebgm.mp3'));
    const vehicleAudioRef4 = useRef(new Audio('/vehiclebgm.mp3'));

    useEffect(() => {
        // Function to update the window size
        const handleResize = () => {
            setWindowSize({
                width: window.innerWidth,
                height: window.innerHeight,
            });
        };

        // Add event listener for resize
        window.addEventListener('resize', handleResize);

        // Cleanup listener on component unmount
        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    useEffect(() => {
        if (!showScene) {
            // THREE.js Setup
            const scene = new THREE.Scene();
            scene.background = new THREE.Color('#a8d8f0');

            const camera = new THREE.PerspectiveCamera(75, windowSize.width / windowSize.height, 0.1, 1000);
            camera.position.z = 5;

            const renderer = new THREE.WebGLRenderer({ antialias: true });
            renderer.setSize(windowSize.width, windowSize.height);
            renderer.shadowMap.enabled = true;
            mountRef.current.appendChild(renderer.domElement);

            // Light
            const light = new THREE.DirectionalLight(0xffffff, 1);
            light.position.set(5, 5, 5);
            light.castShadow = true;
            scene.add(light);

            const ambientLight = new THREE.AmbientLight(0x404040, 0.5);
            scene.add(ambientLight);

            // Platform
            const platformGeometry = new THREE.CircleGeometry(2, 32);
            const platformMaterial = new THREE.MeshStandardMaterial({ color: 0x6aa84f });
            const platform = new THREE.Mesh(platformGeometry, platformMaterial);
            platform.rotation.x = -Math.PI / 2;
            platform.receiveShadow = true;
            scene.add(platform);

            // Slime Model
            const loader = new GLTFLoader();
            loader.load('slime.glb', (gltf) => {
                const slime = gltf.scene;
                slime.traverse((node) => {
                    if (node.isMesh) {
                        node.castShadow = true;
                    }
                });
                slime.position.y = 1;
                scene.add(slime);

                // Animation
                const animate = () => {
                    slime.rotation.y += 0.01;
                    renderer.render(scene, camera);
                    requestAnimationFrame(animate);
                };
                animate();
            });

            // Cleanup
            return () => {
                while (mountRef.current.firstChild) {
                    mountRef.current.removeChild(mountRef.current.firstChild);
                }
            };
        }
    }, [showScene, windowSize]); // Re-run this effect if windowSize changes

    const handlePlayClick = () => {
        setShowScene(true);
        slimeAudioRef.current.loop = true;
        slimeAudioRef.current.volume = 0.5;
        slimeAudioRef.current.play(); // Play the first background music

        vehicleAudioRef.current.loop = true;
        vehicleAudioRef.current.volume = 0.5;
        vehicleAudioRef.current.play(); // Play the second background music

        vehicleAudioRef1.current.currentTime = 10;
        vehicleAudioRef1.current.loop = true;
        vehicleAudioRef1.current.volume = 0.5;
        vehicleAudioRef1.current.play(); // Play the second background music

        vehicleAudioRef2.current.currentTime = 20;
        vehicleAudioRef2.current.loop = true;
        vehicleAudioRef2.current.volume = 0.5;
        vehicleAudioRef2.current.play(); // Play the second background music

        vehicleAudioRef3.current.currentTime = 30;
        vehicleAudioRef3.current.loop = true;
        vehicleAudioRef3.current.volume = 0.5;
        vehicleAudioRef3.current.play(); // Play the second background music

        vehicleAudioRef4.current.currentTime = 40;
        vehicleAudioRef4.current.loop = true;
        vehicleAudioRef4.current.volume = 0.5;
        vehicleAudioRef4.current.play(); // Play the second background music
    };

    return (
        <div className="homepage-container">
            <div ref={mountRef} className="slime-background"></div>
            {!showScene ? (
                <div className="play-button-container">
                    <h1 className="slime-title">Slime on Road?</h1>
                    <button className="play-button" onClick={handlePlayClick}>Play</button>
                </div>
            ) : (
                <Scene />
            )}
        </div>
    );
};

export default Homepage;
