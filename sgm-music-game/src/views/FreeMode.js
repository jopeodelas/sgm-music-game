import React, { useRef, useEffect, useState } from "react";
import * as THREE from "three";
import * as Tone from "tone";
import Background from "../components/Background";
import { useNavigate } from "react-router-dom";

// Importar os ícones
import GobackBlack from "../assets/icons/Goback-freemode-black.svg";
import GobackWhite from "../assets/icons/Goback-freemode-white.svg";
import CloudBlack from "../assets/icons/Cloud-freemode-black.svg";
import CloudWhite from "../assets/icons/Cloud-freemode-white.svg";
import RecordInicial from "../assets/icons/Record-freemode-inicial.svg";
import RecordFinal from "../assets/icons/Record-freemode-final.svg";

const FreeMode = () => {
  const navigate = useNavigate();
  const mountRef = useRef(null);
  const [isDarkMode, setIsDarkMode] = useState(
    localStorage.getItem("darkMode") === "true"
  );
  const [isRecording, setIsRecording] = useState(false); // Controle do estado de gravação

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
        release: 1, // O som se desvanecerá ao longo de 2 segundos ao soltar a tecla
      },
    }).toDestination();
    const volumeSetting = parseInt(localStorage.getItem("volume"), 10) || 50;
    synth.volume.value = Tone.gainToDb(volumeSetting / 100);

    // Configurar as cores para as notas
    const noteColors = {
      C4: 0xff0000,
      D4: 0x00ff00,
      E4: 0x0000ff,
      F4: 0xffff00,
      G4: 0xff00ff,
      A4: 0x00ffff,
      B4: 0xffa500,
      C5: 0x800080,
      "C#4": 0x444444,
      "D#4": 0x444444,
      "F#4": 0x444444,
      "G#4": 0x444444,
      "A#4": 0x444444,
    };

    // Mapeamento de teclas do teclado para notas
    const keyMap = {
      a: "C4",
      s: "D4",
      d: "E4",
      f: "F4",
      g: "G4",
      h: "A4",
      j: "B4",
      k: "C5",
      w: "C#4",
      e: "D#4",
      r: "F#4",
      t: "G#4",
      y: "A#4",
    };

    // Criar teclas brancas
    const keyWidth = 0.55;
    const keyHeight = 0.22;
    const keyDepth = 2.2;
    const whiteKeys = [];
    const whiteKeyMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });

    const notes = ["C4", "D4", "E4", "F4", "G4", "A4", "B4", "C5"];
    for (let i = 0; i < notes.length; i++) {
      const whiteKey = new THREE.Mesh(
        new THREE.BoxGeometry(keyWidth, keyHeight, keyDepth),
        whiteKeyMaterial.clone()
      );
      whiteKey.position.x =
        i * (keyWidth + 0.1) - ((notes.length - 1) * (keyWidth + 0.1)) / 2;
      whiteKey.position.y = -1.2; // Ajustado para centralizar melhor o piano
      whiteKey.position.z = 2;
      whiteKey.userData = {
        note: notes[i],
        color: noteColors[notes[i]],
      };
      whiteKeys.push(whiteKey);
      scene.add(whiteKey);

      const outline = new THREE.Mesh(
        whiteKey.geometry.clone(),
        new THREE.MeshBasicMaterial({ color: 0x000000, side: THREE.BackSide })
      );
      outline.scale.set(1.05, 1.05, 1.02);
      whiteKey.add(outline);
    }

    // Criar teclas pretas
    const blackKeys = [];
    const blackKeyOffsets = [0.75, 1.75, 3.25, 4.25, 5.25];
    const blackNotes = ["C#4", "D#4", "F#4", "G#4", "A#4"];
    const blackKeyMaterial = new THREE.MeshBasicMaterial({ color: 0x000000 });

    blackKeyOffsets.forEach((offset, index) => {
      const blackKey = new THREE.Mesh(
        new THREE.BoxGeometry(keyWidth / 1.8, keyHeight, keyDepth / 1.8),
        blackKeyMaterial.clone()
      );
      blackKey.position.x =
        offset * (keyWidth + 0.1) - ((notes.length - 1) * (keyWidth + 0.1)) / 2;
      blackKey.position.y = -1.1; // Ajustar alinhamento com as teclas brancas
      blackKey.position.z = 2;
      blackKey.userData = {
        note: blackNotes[index],
        color: noteColors[blackNotes[index]],
      };
      blackKeys.push(blackKey);
      scene.add(blackKey);
    });

    // Função para tocar notas e mudar cores
    const playNoteAndChangeColor = async (key) => {
      const { note, color } = key.userData;

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

  const handleRecordClick = () => {
    if (isRecording) {
      console.log("Parando gravação...");
      // Lógica para parar a gravação
    } else {
      console.log("Iniciando gravação...");
      // Lógica para iniciar a gravação
    }
    setIsRecording(!isRecording);
  };

  return (
    <div style={{ position: "relative", width: "100%", height: "100vh" }}>
      {/* Ícones */}
      <div
        style={{
          position: "absolute",
          top: "10px",
          left: "10px",
          zIndex: 1,
        }}
        onClick={() => navigate("/")}
      >
        <img
          src={isDarkMode ? GobackWhite : GobackBlack}
          alt="Go Back"
          style={{ width: "100px", height: "100px" }}
        />
      </div>
      <div
        style={{
          position: "absolute",
          top: "10px",
          right: "10px",
          zIndex: 1,
        }}
      >
        <img
          src={isDarkMode ? CloudWhite : CloudBlack}
          alt="Cloud"
          style={{ width: "100px", height: "100px" }}
        />
      </div>
      <div
        style={{
          position: "absolute",
          bottom: "20px",
          left: "50%",
          transform: "translateX(-50%)",
          zIndex: 1,
        }}
        onClick={handleRecordClick}
      >
        <img
          src={isRecording ? RecordFinal : RecordInicial}
          alt="Record"
          style={{ width: "100px", height: "100px" }}
        />
      </div>
      <Background darkMode={isDarkMode} />
      <div
        ref={mountRef}
        style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%" }}
      />
    </div>
  );
};

export default FreeMode;
