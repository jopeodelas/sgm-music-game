import React, { useRef, useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import * as THREE from "three";
import * as Tone from "tone";
import Background from "../components/Background";
import { useNavigate } from "react-router-dom";
import ABCJS from "abcjs";
import "../styles/Settings.css";

// Importar os ícones
import GobackBlack from "../assets/icons/Goback-freemode-black.svg";
import GobackWhite from "../assets/icons/Goback-freemode-white.svg";
import Heart from "../assets/icons/heart.svg";
import SettingsIcon from "../assets/icons/settings.svg";
import Settings from "../components/Settings";
import settingsIconWhite from "../assets/icons/settings-white.svg";

const SightTrainer = () => {
  const location = useLocation();
  const [randomizedNotes] = useState([]);
  const [lives, setLives] = useState(3)
  const [score, setScore] = useState(0);
  const lifes = useRef(null);
  const [showSettings, setShowSettings] = useState(false);
  const [volume, setVolume] = useState(
    parseInt(localStorage.getItem("volume"), 10) || 50
  );

  const [sheetNotes, setNotes] = useState([
    "C",
    "D",
    "E",
    "F",
    "G",
    "A",
    "B",
    "c",
    "d",
    "e",
    "f",
  ]);

  const notes = ["C4",
    "D4",
    "E4",
    "F4",
    "G4",
    "A4",
    "B4",
    "C5",
    "D5",
    "E5",
    "F5",]

  const noteMap = {
    C4: "C",
    D4: "D",
    E4: "E",
    F4: "F",
    G4: "G",
    A4: "A",
    B4: "B",
    C5: "c",
    D5: "d",
    E5: "e",
    F5: "f",
  };
  const navigate = useNavigate();
  const mountRef = useRef(null);
  const [isDarkMode, setIsDarkMode] = useState(
    localStorage.getItem("darkMode") === "true"
  );


  const handleSettingsToggle = () => {
    setShowSettings(!showSettings);
    const settingsIcon = document.getElementById("settingsIcon");
    if (settingsIcon) {
      settingsIcon.style.fill = isDarkMode ? "white" : "black";
    }
  };


  useEffect(() => {
    // Configuração básica da cena e da câmera
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.set(0, 0, 6);

    const renderer = new THREE.WebGLRenderer({ alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x000000, 0);
    const mountNode = mountRef.current;
    mountNode.appendChild(renderer.domElement);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);



    // Inicializar o sintetizador apenas uma vez
    const synth = new Tone.PolySynth(Tone.Synth, {
      envelope: {
        attack: 0.01,
        decay: 0.2,
        sustain: 0.5,
        release: 2, // O som se desvanecerá ao longo de 2 segundos ao soltar a tecla
      },
    }).toDestination();
    const volumeSetting = parseInt(localStorage.getItem("volume"), 10) || 50;
    synth.volume.value = Tone.gainToDb(volumeSetting / 100);

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
      D5: 0x4682b4,
      "C#5": 0x483d8b,
      E5: 0xff6347,
      "D#5": 0x9acd32,
      F5: 0x93f043,
    };
    const keyMap = {
      a: "C4",
      s: "D4",
      d: "E4",
      f: "F4",
      g: "G4",
      h: "A4",
      j: "B4",
      k: "C5",
      l: "D5",
      ç: "E5",
      º: "F5",
      w: "C#4",
      e: "D#4",
      t: "F#4",
      y: "G#4",
      u: "A#4",
      o: "C#5",
      p: "D#5"
    };

    const createPiano = () => {
      const whiteKeyMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });
      const blackKeyMaterial = new THREE.MeshBasicMaterial({ color: 0x000000 });
      const keyWidth = 0.55;
      const keyHeight = 0.22;
      const keyDepth = 2.2;
      const whiteKeys = [];
      const blackKeys = [];

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
        scene.add(whiteKey);

        // Add outline to white keys
        const outline = new THREE.Mesh(
          whiteKey.geometry.clone(),
          new THREE.MeshBasicMaterial({ color: 0x000000, side: THREE.BackSide })
        );
        outline.scale.set(1.05, 1.05, 1.02);
        whiteKey.add(outline);
      }

      const blackKeyOffsets = [0.75, 1.75, 3.25, 4.25, 5.25, 7.25, 8.25];
      const blackNotes = ["C#4", "D#4", "F#4", "G#4", "A#4", "C#5", "D#5"];

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
        scene.add(blackKey);
      });

      return { whiteKeys, blackKeys };
    };

    const { whiteKeys, blackKeys } = createPiano();

    // Função para tocar notas e mudar cores
    const playNoteAndChangeColor = async (key) => {
      const { note, color } = key.userData;

      console.log(note)
      checkAnswer(note)
      // Iniciar o contexto de áudio
      if (Tone.context.state !== "running") {
        await Tone.start();
      }

      synth.triggerAttack(note, undefined, 0.8); // Volume inicial a 80%
      key.material.color.setHex(color);
    };

    const releaseNote = (key) => {
      const { note } = key.userData;
      synth.triggerRelease(note);
      key.material.color.setHex(whiteKeys.includes(key) ? 0xffffff : 0x000000);
    };

    // Detectar cliques e teclado
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    let currentKey = null; // Variável para controlar qual tecla está pressionada pelo rato

    const onMouseDown = (event) => {
      mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
      mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
      raycaster.setFromCamera(mouse, camera);

      const intersects = raycaster.intersectObjects(
        [...whiteKeys, ...blackKeys],
        false
      );
      if (intersects.length > 0) {
        const key = intersects[0].object;
        key.isPressed = true;
        currentKey = key;
        playNoteAndChangeColor(key);
      }
    };

    const onMouseMove = (event) => {
      if (!currentKey) return;

      mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
      mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
      raycaster.setFromCamera(mouse, camera);

      const intersects = raycaster.intersectObjects(
        [...whiteKeys, ...blackKeys],
        false
      );
      if (intersects.length > 0) {
        const key = intersects[0].object;
        if (key !== currentKey) {
          releaseNoteWithFadeOut(currentKey);
          currentKey.isPressed = false;
          currentKey = key;
          key.isPressed = true;
          playNoteAndChangeColor(key);
        }
      } else {
        releaseNoteWithFadeOut(currentKey);
        currentKey.isPressed = false;
        currentKey = null;
      }
    };

    const onMouseUp = () => {
      if (currentKey) {
        releaseNoteWithFadeOut(currentKey);
        currentKey.isPressed = false;
        currentKey = null;
      }
    };

    const handleKeyPress = (event) => {
      const note = keyMap[event.key.toLowerCase()];
      if (note) {
        const key = [...whiteKeys, ...blackKeys].find(
          (k) => k.userData.note === note
        );
        if (key && !key.isPressed) {
          key.isPressed = true;
          playNoteAndChangeColor(key);
        }
      }
    };

    const handleKeyRelease = (event) => {
      const note = keyMap[event.key.toLowerCase()];
      if (note) {
        const key = [...whiteKeys, ...blackKeys].find(
          (k) => k.userData.note === note
        );
        if (key && key.isPressed) {
          key.isPressed = false;
          releaseNoteWithFadeOut(key);
        }
      }
    };

    const releaseNoteWithFadeOut = (key) => {
      const { note } = key.userData;
      synth.triggerRelease(note);
      key.material.color.setHex(whiteKeys.includes(key) ? 0xffffff : 0x000000);
    };

    window.addEventListener("mousedown", onMouseDown);
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
    window.addEventListener("keydown", handleKeyPress);
    window.addEventListener("keyup", handleKeyRelease);

    const animate = () => {
      requestAnimationFrame(animate);
      renderer.render(scene, camera);
    };
    animate();


    return () => {
      window.removeEventListener("mousedown", onMouseDown);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
      window.removeEventListener("keydown", handleKeyPress);
      window.removeEventListener("keyup", handleKeyRelease);
      mountNode.removeChild(renderer.domElement);
    };
  }, [isDarkMode]);

  const generateRandomNote = () => {
    const randomNote = sheetNotes[Math.floor(Math.random() * sheetNotes.length)]
    setNotes((prevNotes) => [...prevNotes, randomNote])
    return randomNote
  };


  const renderNotes = () => {
    const note = generateRandomNote()
    randomizedNotes.push(note)
    console.log(note)
    const abcNotation = `X:1\nL:1/4\nK:C\n${randomizedNotes.join(" ")}`;
    ABCJS.renderAbc("sheet", abcNotation, {
      staffwidth: 800,
      scale: 2,

    });
  }

  const [check, setCheck] = useState(false)
  const checkAnswer = (note) => {
    if (randomizedNotes.length !== 0) {
      const notePlayed = noteMap[note]
      console.log(notePlayed + " " + randomizedNotes[0])
      if (notePlayed == randomizedNotes[0]) {
        randomizedNotes.shift();
        console.log(randomizedNotes)
        setScore((prev) => prev + 10)
      }
      else {
        setLives((prevLives) => {
          if (prevLives === 1) {
            console.log("SCORE: " + score)
            setCheck((check) => !check)
            console.log(check)
            return prevLives;
          } else {
            return prevLives - 1;
          }
        });
      }
      renderNotes()
    }
  }


  useEffect(() => {
    for (let i = 0; i < 5; i++) renderNotes();
  }, []);

  return (
    <>
      {/* Ícones */}
      <div style={{ position: "absolute", top: "10px", left: "10px", zIndex: 1, }} onClick={() => navigate("/")}>
        <img src={isDarkMode ? GobackWhite : GobackBlack} alt="Go Back" style={{
            width: "75px",
            height: "75px",
            marginLeft: "20px",
            marginTop: "20px",
          }}/>
      </div>
      <div style={style.lifes} ref={lifes}>
        <img
          id="settingsIcon"
          alt="Settings"
          src={isDarkMode ? settingsIconWhite : SettingsIcon}
          onClick={handleSettingsToggle}
          style={{
            width: "75px",
            height: "75px",
          }}
        />
        <div>
          {Array.from({ length: lives }).map((_, index) => (
            check ? navigate("/gameover", { state: { score } }) :
              <img
                key={index}
                src={Heart}
                alt={`Heart ${index + 1}`}
                style={{
                  width: "50px",
                  height: "50px",
                }}
              />
          ))
          }
        </div>
        <h3 style={{ color: isDarkMode ? "#ffffff" : "#000000" }}>Score: {score}</h3>
      </div>
      <Background darkMode={isDarkMode} />
      <div id="sheet" style={
        {
          position: "relative",
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          top: "100px",
          height: "200px",
          width: "100%",
          color: isDarkMode ? "#ffffff" : "#000000"
        }
      } />
      <div ref={mountRef} style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%" }} />
      {showSettings && (
        <Settings
          onClose={handleSettingsToggle}
          darkMode={isDarkMode}
          onDarkModeToggle={() => setIsDarkMode(!isDarkMode)}
          onVolumeChange={setVolume}
        />
      )}
    </>
  );
};

const style = {
  lifes: {
    position: "absolute",
    top: "10px",
    right: "10px",
    display: "flex",
    flexDirection: "column",
    zIndex: 1,
    alignItems:"center"
  }
}
export default SightTrainer;