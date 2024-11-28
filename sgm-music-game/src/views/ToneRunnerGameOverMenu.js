import React, { useEffect, useState, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Background from "../components/Background";
import * as THREE from "three";
import mainAudioFile from "../assets/audio/MIAU.mp3";
import Settings from "../components/Settings";

const ToneRunnerGameOverMenu = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const mountRef = useRef(null);
  const [score, setScore] = useState(() => {
    const savedScore = parseInt(localStorage.getItem("score"), 10);
    return isNaN(savedScore) ? location.state?.score || 0 : savedScore;
  });
  const [isDarkMode, setIsDarkMode] = useState(
    localStorage.getItem("darkMode") === "true" || false
  );
  const [volume, setVolume] = useState(() => {
    const savedVolume = parseInt(localStorage.getItem("volume"), 10);
    return isNaN(savedVolume) ? 20 : savedVolume;
  });
  const [scene, setScene] = useState(null);
  const [renderer, setRenderer] = useState(null);
  const [showSettings, setShowSettings] = useState(false);
  const mainAudioRef = useRef(null);

  useEffect(() => {
    const style = document.createElement("style");
    style.textContent = `
            @font-face {
  font-family: "Poppins-SemiBold";
  src: url("../assets/fonts/Poppins-SemiBold.ttf") format("truetype");
  font-weight: normal;
  font-style: normal;
}

@font-face {
  font-family: "Poppins-Regular";
  src: url("../assets/fonts/Poppins-Regular.ttf") format("truetype");
  font-weight: normal;
  font-style: normal;
}

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
                font-family: "Poppins-Semibold";
            }
            .score-text {
                font-size: 6vh;
                color: ${isDarkMode ? "white" : "black"};
                margin-top: 25vh;
                position: absolute;
                z-index: 15;
            }
            .button-container {
                display: flex;
                gap: 2vw;
                margin-top: -30vh;
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
                font-family: "Poppins-Semibold";
            }
            .game-over-button:hover {
                transform: scale(1.05);
            }
            .dark .game-over-button {
                background-color: black;
                color: white;
            }`;
    document.head.appendChild(style);

    // Configura Three.js para o piano animado
    const newScene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.set(0, 0, 6);

    const newRenderer = new THREE.WebGLRenderer({ alpha: true });
    newRenderer.setSize(window.innerWidth, window.innerHeight);
    newRenderer.setClearColor(0x000000, 0);
    const mountNode = mountRef.current;
    mountNode.appendChild(newRenderer.domElement);
    setScene(newScene);
    setRenderer(newRenderer);

    // Definir cores para as notas
    const noteColors = {
      C4: 0xff0000,
      D4: 0x00ff00,
      E4: 0x0000ff,
      F4: 0xffff00,
      G4: 0xff00ff,
      A4: 0x00ffff,
      B4: 0xffa500,
      C5: 0x800080,
      "C#4": 0x8b0000,
      "D#4": 0x006400,
      "F#4": 0x00008b,
      "G#4": 0x8b008b,
      "A#4": 0x008b8b,
      E3: 0x4682b4,
      "G#3": 0x483d8b,
      B3: 0xff6347,
      "D#3": 0x9acd32,
    };

    // Cria o piano, incluindo teclas pretas
    const createPiano = () => {
      const whiteKeyMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });
      const blackKeyMaterial = new THREE.MeshBasicMaterial({ color: 0x000000 });
      const keyWidth = 0.55;
      const keyHeight = 0.22;
      const keyDepth = 2.2;
      const whiteKeys = [];
      const blackKeys = [];

      const notes = [
        "E3",
        "G#3",
        "B3",
        "C4",
        "D4",
        "E4",
        "F4",
        "G4",
        "A4",
        "B4",
        "C5",
      ];

      for (let i = 0; i < notes.length; i++) {
        const whiteKey = new THREE.Mesh(
          new THREE.BoxGeometry(keyWidth, keyHeight, keyDepth),
          whiteKeyMaterial.clone()
        );
        whiteKey.position.x =
          i * (keyWidth + 0.1) - ((notes.length - 1) * (keyWidth + 0.1)) / 2;
        whiteKey.position.y = -2;
        whiteKey.position.z = 2;
        whiteKey.userData = {
          note: notes[i],
          color: noteColors[notes[i]],
          active: false,
        };
        whiteKeys.push(whiteKey);
        newScene.add(whiteKey);

        // Add outline to white keys
        const outline = new THREE.Mesh(
          whiteKey.geometry.clone(),
          new THREE.MeshBasicMaterial({ color: 0x000000, side: THREE.BackSide })
        );
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
        blackKey.position.x =
          offset * (keyWidth + 0.1) -
          ((notes.length - 1) * (keyWidth + 0.1)) / 2;
        blackKey.position.y = -1.9;
        blackKey.position.z = 2;
        blackKey.userData = {
          note: blackNotes[index],
          color: noteColors[blackNotes[index]],
          active: false,
        };
        blackKeys.push(blackKey);
        newScene.add(blackKey);
      });

      return { whiteKeys, blackKeys };
    };

    const { whiteKeys, blackKeys } = createPiano();

    const noteEvents = [
      // Adicionando uma espera inicial de 3 segundos

      // Primeira sequência de notas (partitura fornecida)
      { note: "E3", action: "press", timestamp: 3000 },
      { note: "E3", action: "release", timestamp: 4500 },
      { note: "G#3", action: "press", timestamp: 4500 },
      { note: "G#3", action: "release", timestamp: 6000 },

      // Acorde de A maior
      { note: "A3", action: "press", timestamp: 6000 },
      { note: "C#4", action: "press", timestamp: 6000 },
      { note: "E4", action: "press", timestamp: 6000 },
      { note: "A3", action: "release", timestamp: 7500 },
      { note: "C#4", action: "release", timestamp: 7500 },
      { note: "E4", action: "release", timestamp: 7500 },

      // E maior
      { note: "E3", action: "press", timestamp: 7500 },
      { note: "B3", action: "press", timestamp: 7500 },
      { note: "E4", action: "press", timestamp: 7500 },
      { note: "E3", action: "release", timestamp: 9000 },
      { note: "B3", action: "release", timestamp: 9000 },
      { note: "E4", action: "release", timestamp: 9000 },

      // G#m
      { note: "G#3", action: "press", timestamp: 9000 },
      { note: "B3", action: "press", timestamp: 9000 },
      { note: "D#4", action: "press", timestamp: 9000 },
      { note: "G#3", action: "release", timestamp: 10500 },
      { note: "B3", action: "release", timestamp: 10500 },
      { note: "D#4", action: "release", timestamp: 10500 },

      // Acorde de A maior
      { note: "A3", action: "press", timestamp: 10500 },
      { note: "C#4", action: "press", timestamp: 10500 },
      { note: "E4", action: "press", timestamp: 10500 },
      { note: "A3", action: "release", timestamp: 12000 },
      { note: "C#4", action: "release", timestamp: 12000 },
      { note: "E4", action: "release", timestamp: 12000 },

      // E maior
      { note: "E3", action: "press", timestamp: 12000 },
      { note: "B3", action: "press", timestamp: 12000 },
      { note: "E4", action: "press", timestamp: 12000 },
      { note: "E3", action: "release", timestamp: 13500 },
      { note: "B3", action: "release", timestamp: 13500 },
      { note: "E4", action: "release", timestamp: 13500 },

      // G#m
      { note: "G#3", action: "press", timestamp: 13500 },
      { note: "B3", action: "press", timestamp: 13500 },
      { note: "D#4", action: "press", timestamp: 13500 },
      { note: "G#3", action: "release", timestamp: 15000 },
      { note: "B3", action: "release", timestamp: 15000 },
      { note: "D#4", action: "release", timestamp: 15000 },

      // A maior novamente
      { note: "A3", action: "press", timestamp: 15000 },
      { note: "C#4", action: "press", timestamp: 15000 },
      { note: "E4", action: "press", timestamp: 15000 },
      { note: "A3", action: "release", timestamp: 16500 },
      { note: "C#4", action: "release", timestamp: 16500 },
      { note: "E4", action: "release", timestamp: 16500 },

      // E maior novamente
      { note: "E3", action: "press", timestamp: 16500 },
      { note: "B3", action: "press", timestamp: 16500 },
      { note: "E4", action: "press", timestamp: 16500 },
      { note: "E3", action: "release", timestamp: 18000 },
      { note: "B3", action: "release", timestamp: 18000 },
      { note: "E4", action: "release", timestamp: 18000 },

      // G#m novamente
      { note: "G#3", action: "press", timestamp: 18000 },
      { note: "B3", action: "press", timestamp: 18000 },
      { note: "D#4", action: "press", timestamp: 18000 },
      { note: "G#3", action: "release", timestamp: 19500 },
      { note: "B3", action: "release", timestamp: 19500 },
      { note: "D#4", action: "release", timestamp: 19500 },

      // Concluindo com A maior
      { note: "A3", action: "press", timestamp: 19500 },
      { note: "C#4", action: "press", timestamp: 19500 },
      { note: "E4", action: "press", timestamp: 19500 },
      { note: "A3", action: "release", timestamp: 21000 },
      { note: "C#4", action: "release", timestamp: 21000 },
      { note: "E4", action: "release", timestamp: 21000 },
    ];

    // Repetir até atingir 1:49 minutos (109 segundos)
    const totalDurationMs = 109 * 1000;
    let currentDurationMs = noteEvents[noteEvents.length - 1]?.timestamp || 0;

    // Criar uma cópia dos eventos iniciais e repetir até completar 109 segundos
    const originalEvents = [...noteEvents];
    while (currentDurationMs < totalDurationMs) {
      originalEvents.forEach((event) => {
        if (event.note !== "wait") {
          const newEvent = {
            ...event,
            timestamp: event.timestamp + currentDurationMs,
          };
          noteEvents.push(newEvent);
        }
      });
      currentDurationMs = noteEvents[noteEvents.length - 1]?.timestamp || 0;
    }

    // Função para tocar as notas sincronizadas com os timestamps
    const playNotesWithTimestamps = (noteEvents) => {
      noteEvents.forEach((event) => {
        setTimeout(() => {
          if (event.note === "wait") {
            return;
          }
          const { note, action } = event;
          const key = [...whiteKeys, ...blackKeys].find(
            (k) => k.userData.note === note
          );
          if (key) {
            if (action === "press") {
              key.userData.active = true;
              key.material.color.setHex(key.userData.color);
            } else if (action === "release") {
              key.userData.active = false;
              key.material.color.setHex(
                whiteKeys.includes(key) ? 0xffffff : 0x000000
              );
            }
          }
        }, event.timestamp);
      });
    };

    // Tocar o áudio e sincronizar as notas
    if (!mainAudioRef.current) {
      const mainAudio = new Audio(mainAudioFile);
      mainAudio.volume = volume / 100; // Ajusta o volume com base no valor armazenado
      mainAudio.loop = true; // Loop para garantir que a música continue
      mainAudioRef.current = mainAudio;

      const handleCanPlayThrough = () => {
        mainAudio.play().catch((error) => {
          console.error("Erro ao tentar tocar o áudio principal:", error);
        });
        playNotesWithTimestamps(noteEvents);
      };

      mainAudio.addEventListener("canplaythrough", handleCanPlayThrough);
    }

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

  useEffect(() => {
    if (mainAudioRef.current) {
      mainAudioRef.current.volume = volume === 0 ? 0 : volume / 100; // Atualiza o volume sem parar a música e muta se volume for 0
    }
  }, [volume]);

  useEffect(() => {
    const style = document.createElement("style");
    style.textContent = `
      .game-over-title {
        color: ${isDarkMode ? "white" : "black"};
      }
      .score-text {
        color: ${isDarkMode ? "white" : "black"};
      }
      .game-over-button {
        background-color: ${isDarkMode ? "white" : "black"};
        color: ${isDarkMode ? "black" : "white"};
      }`;
    document.head.appendChild(style);

    return () => {
      document.head.removeChild(style);
    };
  }, [isDarkMode]);

  const handleNavigation = (path) => {
    if (mainAudioRef.current) {
      mainAudioRef.current.pause();
      mainAudioRef.current.currentTime = 0;
      mainAudioRef.current.src = "";
      mainAudioRef.current = null;
    }
    navigate(path);
  };

  return (
    <div className="game-over-menu" ref={mountRef}>
      <Background
        darkMode={isDarkMode}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          zIndex: -1,
        }}
      />
      <h1 className="game-over-title">GAME OVER</h1>
      <p className="score-text">Score: {score}</p>
      <div className="button-container">
        <button
          className="game-over-button"
          onClick={() => handleNavigation("/tonerunner")}
        >
          Play Again
        </button>
        <button
          className="game-over-button"
          onClick={() => handleNavigation("/")}
        >
          Main Menu
        </button>
      </div>
      <button
        className="game-over-button"
        style={{ marginTop: '55vh', position: 'absolute', zIndex: 15 }}
        onClick={() => setShowSettings(true)}
      >
        Settings
      </button>
      {showSettings && (
        <Settings
          onVolumeChange={(newVolume) => setVolume(newVolume)}
          onClose={() => setShowSettings(false)}
          darkMode={isDarkMode}
          onDarkModeToggle={() => setIsDarkMode((prevMode) => !prevMode)}
        />
      )}
    </div>
  );
};

export default ToneRunnerGameOverMenu;
