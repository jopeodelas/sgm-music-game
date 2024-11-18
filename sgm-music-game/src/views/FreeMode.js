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

    const synth = new Tone.Synth().toDestination();
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

    // Criar as teclas brancas
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
      whiteKey.position.y = -1.5; // Ajustar para não sobrepor o ícone de gravação
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

    // Criar as teclas pretas
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
      blackKey.position.y = -1.4; // Ajustar alinhamento com as teclas brancas
      blackKey.position.z = 2;
      blackKey.userData = {
        note: blackNotes[index],
        color: noteColors[blackNotes[index]],
      };
      blackKeys.push(blackKey);
      scene.add(blackKey);
    });

    // Função para tocar notas e mudar cores
    const playNoteAndChangeColor = (key) => {
      const { note, color } = key.userData;
      synth.triggerAttackRelease(note, "8n");

      if (whiteKeys.includes(key)) {
        key.material.color.setHex(color);
        setTimeout(() => key.material.color.setHex(0xffffff), 200);
      } else if (blackKeys.includes(key)) {
        key.material.color.setHex(0x555555);
        setTimeout(() => key.material.color.setHex(0x000000), 200);
      }
    };

    // Detectar cliques nas teclas
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const onMouseClick = (event) => {
      mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
      mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
      raycaster.setFromCamera(mouse, camera);

      const intersects = raycaster.intersectObjects(
        [...whiteKeys, ...blackKeys],
        false
      );
      if (intersects.length > 0) {
        playNoteAndChangeColor(intersects[0].object);
      }
    };

    window.addEventListener("click", onMouseClick);

    const animate = () => {
      requestAnimationFrame(animate);
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      window.removeEventListener("click", onMouseClick);
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
      {/* Ícones no topo */}
      <div
        style={{
          position: "absolute",
          top: "10px",
          left: "10px",
          zIndex: 1,
        }}
        onClick={() => navigate("/homepage")}
      >
        <img
          src={isDarkMode ? GobackWhite : GobackBlack}
          alt="Go Back"
          style={{ width: "50px", height: "50px" }} // Reduzir o tamanho do ícone
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
          style={{ width: "50px", height: "50px" }} // Reduzir o tamanho do ícone
        />
      </div>
      {/* Ícone de gravação no centro inferior */}
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
          style={{ width: "60px", height: "60px" }} // Reduzir o tamanho do ícone
        />
      </div>
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
      <div
        ref={mountRef}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
        }}
      />
    </div>
  );
};

export default FreeMode;
