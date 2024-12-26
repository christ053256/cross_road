import React, { useState, useEffect, useRef } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { useNavigate } from 'react-router-dom';
import './Homepage.css';
import Scene from '../Scene.jsx';

const Homepage = () => {
    const [showScene, setShowScene] = useState(false);
    const [windowSize, setWindowSize] = useState({
        width: window.innerWidth,
        height: window.innerHeight,
    });
    const mountRef = useRef(null);
    const slimeAudioRef = useRef(new Audio('/slimebgm.mp3'));
    const vehicleAudioRef = useRef(new Audio('/vehiclebgm.mp3'));
    const vehicleAudioRef1 = useRef(new Audio('/vehiclebgm.mp3'));
    const vehicleAudioRef2 = useRef(new Audio('/vehiclebgm.mp3'));
    const vehicleAudioRef3 = useRef(new Audio('/vehiclebgm.mp3'));
    const vehicleAudioRef4 = useRef(new Audio('/vehiclebgm.mp3'));

    const navigate = useNavigate();

    const stopAllAudio = () => {
        const audioRefs = [
            slimeAudioRef,
            vehicleAudioRef,
            vehicleAudioRef1,
            vehicleAudioRef2,
            vehicleAudioRef3,
            vehicleAudioRef4
        ];
        
        audioRefs.forEach(ref => {
            if (ref.current) {
                ref.current.pause();
                ref.current.currentTime = 0;
            }
        });
    };

    useEffect(() => {
        const handleResize = () => {
            setWindowSize({
                width: window.innerWidth,
                height: window.innerHeight,
            });
        };

        window.addEventListener('resize', handleResize);
        return () => {
            window.removeEventListener('resize', handleResize);
            stopAllAudio();
        };
    }, []);

    useEffect(() => {
        if (!showScene) {
            const scene = new THREE.Scene();
            scene.background = new THREE.Color('#a8d8f0');

            const camera = new THREE.PerspectiveCamera(75, windowSize.width / windowSize.height, 0.1, 1000);
            camera.position.z = 5;

            const renderer = new THREE.WebGLRenderer({ antialias: true });
            renderer.setSize(windowSize.width, windowSize.height);
            renderer.shadowMap.enabled = true;
            mountRef.current?.appendChild(renderer.domElement);

            const light = new THREE.DirectionalLight(0xffffff, 1);
            light.position.set(5, 5, 5);
            light.castShadow = true;
            scene.add(light);

            const ambientLight = new THREE.AmbientLight(0x404040, 0.5);
            scene.add(ambientLight);

            const platformGeometry = new THREE.CircleGeometry(2, 32);
            const platformMaterial = new THREE.MeshStandardMaterial({ color: 0x6aa84f });
            const platform = new THREE.Mesh(platformGeometry, platformMaterial);
            platform.rotation.x = -Math.PI / 2;
            platform.receiveShadow = true;
            scene.add(platform);

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

                const animate = () => {
                    slime.rotation.y += 0.01;
                    renderer.render(scene, camera);
                    requestAnimationFrame(animate);
                };
                animate();
            });

            return () => {
                while (mountRef.current?.firstChild) {
                    mountRef.current.removeChild(mountRef.current.firstChild);
                }
            };
        }
    }, [showScene, windowSize]);

    const handlePlayClick = () => {
        setShowScene(true);
        const audioRefs = [
            { ref: slimeAudioRef, time: 0 },
            { ref: vehicleAudioRef, time: 0 },
            { ref: vehicleAudioRef1, time: 10 },
            { ref: vehicleAudioRef2, time: 20 },
            { ref: vehicleAudioRef3, time: 30 },
            { ref: vehicleAudioRef4, time: 40 }
        ];

        audioRefs.forEach(({ ref, time }) => {
            if (ref.current) {
                ref.current.currentTime = time;
                ref.current.loop = true;
                ref.current.volume = 0.5;
                ref.current.play().catch(console.error);
            }
        });
    };

    const handleAboutClick = () => {
        stopAllAudio();
        navigate('/about-game');
    };

    return (
        <div className="homepage-container">
            <div ref={mountRef} className="slime-background"></div>
            {!showScene ? (
                <div className="play-button-container">
                    <h1 className="slime-title">Slime on Road?</h1>
                    <button className="play-button" onClick={handlePlayClick}>Play</button>
                    <button className="play-button" onClick={handleAboutClick}>About Game</button>
                </div>
            ) : (
                <Scene />
            )}
        </div>
    );
};

export default Homepage;