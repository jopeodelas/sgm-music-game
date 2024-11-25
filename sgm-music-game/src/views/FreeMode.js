import React, { useRef, useEffect, useState } from "react";
import * as THREE from "three";
import * as Tone from "tone";
// import Background from "../components/BackgroundThree";
import { useNavigate } from "react-router-dom";
import { saveAs } from "file-saver";
import ReactDOM from "react-dom";
import "../styles/FreeMode.css";
import "../styles/Settings.css";

// Importar os ícones
import GobackBlack from "../assets/icons/Goback-freemode-black.svg";
import GobackWhite from "../assets/icons/Goback-freemode-white.svg";
import CloudBlack from "../assets/icons/Cloud-freemode-black.svg";
import CloudWhite from "../assets/icons/Cloud-freemode-white.svg";
import RecordInicial from "../assets/icons/Record-freemode-inicial.svg";
import RecordFinal from "../assets/icons/Record-freemode-final.svg";
import closeIcon from "../assets/icons/close2.svg";
import playIcon from "../assets/icons/play.svg";
import downloadIcon from "../assets/icons/download.svg";
import SettingsIcon from "../assets/icons/settings.svg";
import Settings from "../components/Settings";
import settingsIconWhite from "../assets/icons/settings-white.svg";

const FreeMode = () => {
  const navigate = useNavigate();
  const mountRef = useRef(null);
  const [isDarkMode, setIsDarkMode] = useState(
    localStorage.getItem("darkMode") === "true"
  );
  const [isRecording, setIsRecording] = useState(false); // Controle do estado de gravação
  const [recordings, setRecordings] = useState([]); // Lista de gravações
  const [recordStartTime, setRecordStartTime] = useState(null);
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const timerRef = useRef(null);
  const [elapsedTime, setElapsedTime] = useState(1);
  const audioDestinationRef = useRef(null); // Referência para o destino de áudio
  const [recordFinishTime, setRecordFinishTime] = useState(null);
  const [showSettings, setShowSettings] = useState(false);
  const [volume, setVolume] = useState(
    parseInt(localStorage.getItem("volume"), 10) || 50
  );
  const audioRef = useRef(null);

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
    scene.background = new THREE.Color(isDarkMode ? 0x000000 : 0xffffff);

    const numStars = 5000;
    const starsGeometry = new THREE.BufferGeometry();
    const positions = [];
    const colors = [];
    const starMaterial = new THREE.PointsMaterial({
      size: 2,
      vertexColors: true,
    });

    // Generate random positions and colors for the stars
    for (let i = 0; i < numStars; i++) {
      positions.push(Math.random() * 2000 - 1000); // X
      positions.push(Math.random() * 2000 - 1000); // Y
      positions.push(Math.random() * 2000 - 1000); // Z

      // Colors based on dark mode
      const color = new THREE.Color(isDarkMode ? "white" : "black");
      colors.push(color.r, color.g, color.b);
    }

    starsGeometry.setAttribute(
      "position",
      new THREE.Float32BufferAttribute(positions, 3)
    );
    starsGeometry.setAttribute(
      "color",
      new THREE.Float32BufferAttribute(colors, 3)
    );

    const stars = new THREE.Points(starsGeometry, starMaterial);
    scene.add(stars);

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

    // Criar um MediaStreamDestination e conectar ao sintetizador para capturar áudio
    const audioDestination = Tone.context.createMediaStreamDestination();
    synth.connect(audioDestination);
    audioDestinationRef.current = audioDestination; // Armazenar referência no ref

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
      t: "F#4",
      y: "G#4",
      u: "A#4",
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

      stars.rotation.x += 0.0002;
      stars.rotation.y += 0.0002;

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

  const handleRecordClick = async () => {
    if (isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setElapsedTime(1);

      clearInterval(timerRef.current);

      const recordFinishTime = new Date();
      setRecordFinishTime(recordFinishTime);

      const durationInSeconds = Math.round(
        (recordFinishTime.getTime() - recordStartTime.getTime()) / 1000
      );

      mediaRecorderRef.current.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "video/webm" });
        const url = URL.createObjectURL(blob);

        const recordingData = {
          url,
          name: `Recording ${recordings.length + 1}`,
          createdAt: recordStartTime.toLocaleString(),
          duration: `${durationInSeconds}`,
          startTime: recordStartTime.toLocaleTimeString(),
          finishTime: recordFinishTime.toLocaleTimeString(),
        };

        setRecordings((prevRecordings) => [...prevRecordings, recordingData]);
        chunksRef.current = [];
      };
    } else {
      const now = new Date();
      setRecordStartTime(now);
      setIsRecording(true);

      timerRef.current = setInterval(() => {
        const elapsedSeconds =
          Math.round((new Date().getTime() - now.getTime()) / 1000) + 1;
        setElapsedTime(elapsedSeconds);
      }, 1000);

      const canvasStream = mountRef.current.children[0].captureStream(30);
      const audioStream = audioDestinationRef.current.stream;

      const combinedStream = new MediaStream([
        ...canvasStream.getVideoTracks(),
        ...audioStream.getAudioTracks(),
      ]);

      mediaRecorderRef.current = new MediaRecorder(combinedStream, {
        mimeType: "video/webm",
      });

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorderRef.current.start();
    }
  };

  const showCloudRecordings = () => {
    // Criar uma janela modal para as gravações
    const modal = (
      <div
        style={{
          position: "fixed",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          backgroundColor: "#fff",
          padding: "20px",
          boxShadow: "0px 0px 10px rgba(0, 0, 0, 0.5)",
          zIndex: 10,
          width: "600px",
          maxHeight: "80vh",
          overflowY: "auto",
          border: "4px solid #aaa",
          borderRadius: "6px",
          boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginTop: "-20px",
          }}
        >
          <img
            src={CloudBlack}
            alt="Cloud"
            style={{ width: "35px", height: "35px", marginRight: "15px" }}
          />
          <h1>Saved Recordings</h1>
        </div>
        <img
          onClick={() =>
            document.body.removeChild(
              document.getElementById("modal-container")
            )
          }
          alt="Close"
          src={closeIcon}
          style={{
            width: "50px",
            height: "50px",
            position: "absolute",
            top: "10px",
            right: "10px",
            cursor: "pointer",
          }}
        ></img>
        <div>
          {recordings.length > 0 ? (
            recordings.map((rec, index) => (
              <div
                key={index}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  borderBottom: "1px solid #ccc",
                  padding: "10px 0",
                }}
              >
                <video
                  src={rec.url}
                  width="100"
                  height="60"
                  controls
                  style={{ marginRight: "20px" }}
                />
                <div style={{ flexGrow: 1 }}>
                  <div>
                    <strong>{rec.name}</strong>
                  </div>
                  <div>Created: {rec.createdAt}</div>
                  <div>Duration: {rec.duration}s</div>
                </div>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "row", // Alinhamento horizontal
                    alignItems: "center", // Centraliza verticalmente
                  }}
                >
                  <img
                    src={playIcon}
                    onClick={() => window.open(rec.url)}
                    alt="Play"
                    style={{ width: "30px", height: "30px", cursor: "pointer" }}
                  ></img>
                  <img
                    src={downloadIcon}
                    onClick={() => saveAs(rec.url, `${rec.name}.webm`)}
                    alt="Download"
                    style={{
                      width: "40px",
                      height: "40px",
                      cursor: "pointer",
                      marginLeft: "10px",
                    }}
                  ></img>
                </div>
              </div>
            ))
          ) : (
            <div style={{ textAlign: "center", fontSize: "24px" }}>
              No recordings available.
            </div>
          )}
        </div>
      </div>
    );

    const modalContainer = document.createElement("div");
    modalContainer.id = "modal-container";
    modalContainer.style.position = "fixed";
    modalContainer.style.top = "0";
    modalContainer.style.left = "0";
    modalContainer.style.width = "100%";
    modalContainer.style.height = "100%";
    modalContainer.style.backgroundColor = "rgba(0, 0, 0, 0.7)";
    modalContainer.style.zIndex = "9";
    document.body.appendChild(modalContainer);

    ReactDOM.render(modal, modalContainer);
  };

  return (
    <div
      style={{ position: "relative", width: "100%", height: "100vh" }}
      class="corpo"
    >
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
          style={{
            width: "75px",
            height: "75px",
            marginLeft: "20px",
            marginTop: "20px",
          }}
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
          style={{
            width: "75px",
            height: "75px",
            marginRight: "20px",
            marginTop: "20px",
            cursor: "pointer",
          }}
          onClick={showCloudRecordings}
        />
        <img
          id="settingsIcon"
          style={{
            width: "75px",
            height: "75px",
            marginRight: "20px",
            marginTop: "20px",
          }}
          alt="Settings"
          src={isDarkMode ? settingsIconWhite : SettingsIcon}
          onClick={handleSettingsToggle}
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
          style={{
            width: "100px",
            height: "100px",
            transform: !isRecording ? "scale(0.8)" : "none",
          }}
        />
      </div>
      {isRecording && (
        <div
          style={{
            position: "absolute",
            top: "10px",
            left: "50%",
            transform: "translateX(-50%)",
            color: isDarkMode ? "#fff" : "#000",
            fontSize: "2rem",
            zIndex: 2,
          }}
        >
          {`0:${elapsedTime < 10 ? "0" : ""}${elapsedTime}`}
        </div>
      )}
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
      {showSettings && (
        <Settings
          onClose={handleSettingsToggle}
          darkMode={isDarkMode}
          onDarkModeToggle={() => setIsDarkMode(!isDarkMode)}
        />
      )}
    </div>
  );
};

export default FreeMode;
