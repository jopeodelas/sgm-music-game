import React, { useEffect, useState, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Background from "../components/Background";
import * as Tone from "tone";
import * as THREE from "three";

const ToneRunnerGameOverMenu = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const mountRef = useRef(null);
    const [score, setScore] = useState(() => {
        const savedScore = parseInt(localStorage.getItem('score'), 10);
        return isNaN(savedScore) ? (location.state?.score || 0) : savedScore;
    });
    const [isDarkMode, setIsDarkMode] = useState(localStorage.getItem("darkMode") === "true" || false);
    const volumeSetting = parseInt(localStorage.getItem("volume"), 10) || 50;
    const [scene, setScene] = useState(null);
    const [renderer, setRenderer] = useState(null);

    useEffect(() => {
        const style = document.createElement("style");
        style.textContent = `
            .game-over-menu {
                position: absolute;
                top: 0;
                left: 0;

                height: 100vh;
                display: flex;
                flex-direction: column;
                justify-content: flex-top;
                align-items: center;
                overflow: hidden;
                z-index: 10;
            }
            .game-over-title {
                font-size: 10vh;
                font-weight: bold;
                text-transform: uppercase;
                color: ${isDarkMode ? "white" : "black"};
                margin-bottom: 2vh;
                position: absolute;
                z-index: 15;
            }
            .score-text {
                font-size: 4vh;
                color: ${isDarkMode ? "white" : "black"};
                margin-top: 20vh;
                position: absolute;
                z-index: 15;
            }
            .button-container {
                display: flex;
                gap: 2vw;
                margin-top: -35vh;
                position: absolute;
                z-index: 15;
            }
            .game-over-button {
                background-color: ${isDarkMode ? "white" : "black"};
                color: ${isDarkMode ? "black" : "white"};
                padding: 1.5vh 3vw;
                border-radius: 2vw;
                font-size: 2.5vh;
                cursor: pointer;
                border: none;
                transition: transform 0.3s;
            }
            .game-over-button:hover {
                transform: scale(1.05);
            }
            .dark .game-over-button {
                background-color: white;
                color: black;
            }
        `;
        document.head.appendChild(style);

        // Configura Three.js para o piano animado
        const newScene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        camera.position.set(0, 0, 6);

        const newRenderer = new THREE.WebGLRenderer({ alpha: true });
        newRenderer.setSize(window.innerWidth, window.innerHeight);
        newRenderer.setClearColor(0x000000, 0);
        const mountNode = mountRef.current;
        mountNode.appendChild(newRenderer.domElement);
        setScene(newScene);
        setRenderer(newRenderer);

        // Configura o sintetizador Tone.js com o volume baseado nas configurações
        const synth = new Tone.Synth().toDestination();
        synth.volume.value = Tone.gainToDb(volumeSetting / 100);
        const notes = ["C4", "D4", "E4", "F4", "G4", "A4", "B4", "C5"];

        // Cria o piano
        const createPiano = () => {
            const whiteKeyMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });
            const blackKeyMaterial = new THREE.MeshBasicMaterial({ color: 0x000000 });
            const keyWidth = 0.55;
            const keyHeight = 0.22;
            const keyDepth = 2.2;
            const whiteKeys = [];
            const blackKeys = [];

            const noteHeights = {
                C4: -1.2,
                D4: -0.9,
                E4: -0.6,
                F4: -0.3,
                G4: 0.0,
                A4: 0.3,
                B4: 0.6,
                C5: 0.9,
            };

            for (let i = 0; i < notes.length; i++) {
                const whiteKey = new THREE.Mesh(
                    new THREE.BoxGeometry(keyWidth, keyHeight, keyDepth),
                    whiteKeyMaterial.clone()
                );
                whiteKey.position.x = i * (keyWidth + 0.1) - ((notes.length - 1) * (keyWidth + 0.1)) / 2;
                whiteKey.position.y = -2;
                whiteKey.position.z = 2;
                whiteKey.userData = { note: notes[i] };
                whiteKeys.push(whiteKey);
                newScene.add(whiteKey);

                // Add outline to white keys
                const outline = new THREE.Mesh(whiteKey.geometry.clone(), new THREE.MeshBasicMaterial({ color: 0x000000, side: THREE.BackSide }));
                outline.scale.set(1.05, 1.05, 1.02);
                whiteKey.add(outline);
            }

            const blackKeyOffsets = [0.75, 1.75, 3.25, 4.25, 5.25];
            const blackNotes = ["C#4", "D#4", "F#4", "G#4", "A#4"];

            blackKeyOffsets.forEach((offset, index) => {
                const blackKey = new THREE.Mesh(
                    new THREE.BoxGeometry(keyWidth / 1.8, keyHeight, keyDepth / 1.8),
                    blackKeyMaterial.clone()
                );
                blackKey.position.x = offset * (keyWidth + 0.1) - ((notes.length - 1) * (keyWidth + 0.1)) / 2;
                blackKey.position.y = -1.9;
                blackKey.position.z = 2;
                blackKey.userData = { note: blackNotes[index] };
                blackKeys.push(blackKey);
                newScene.add(blackKey);
            });

            return { whiteKeys, blackKeys };
        };

        const { whiteKeys, blackKeys } = createPiano();

        // Função para tocar o piano automaticamente
        const playPiano = async () => {
            await Tone.start();
            let index = 0;
            const playNote = () => {
                const key = [...whiteKeys, ...blackKeys][index % (whiteKeys.length + blackKeys.length)];
                synth.triggerAttackRelease(key.userData.note, "8n");
                key.material.color.setHex(0xffff00);

                setTimeout(() => {
                    if (whiteKeys.includes(key)) {
                        key.material.color.setHex(0xffffff);
                    } else {
                        key.material.color.setHex(0x000000);
                    }
                }, 200);

                index++;
                if (index < (whiteKeys.length + blackKeys.length) * 3) {
                    setTimeout(playNote, 300);
                }
            };
            playNote();
        };
        playPiano();

        // Renderiza a animação do piano
        const animate = () => {
            requestAnimationFrame(animate);
            newRenderer.render(newScene, camera);
        };
        animate();

        return () => {
            newRenderer.dispose();
            document.head.removeChild(style);
        };
    }, []);

    return (
        <div className="game-over-menu" ref={mountRef}>
            <Background darkMode={isDarkMode} style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", zIndex: -1 }} />
            <h1 className="game-over-title">GAME OVER</h1>
            <p className="score-text">Score: {score}</p>
            <div className="button-container">
                <button className="game-over-button" onClick={() => navigate("/tonerunner")}>Play Again</button>
                <button className="game-over-button" onClick={() => navigate("/")}>Main Menu</button>
            </div>
        </div>
    );
};

export default ToneRunnerGameOverMenu;
