import React, { useRef, useEffect, useState } from "react";
import { useLocation } from 'react-router-dom';
import * as THREE from "three";
import * as Tone from "tone";
import TWEEN from "@tweenjs/tween.js";
import Background from "../components/Background";
import { useNavigate } from 'react-router-dom';

const Piano = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [score, setScore] = useState(location.state?.score || 0);
  const mountRef = useRef(null);
  const [gameOver, setGameOver] = useState(false);
  const [wallSpeed, setWallSpeed] = useState(0.02);
  const ballSpeed = 0.1;

  // Carregar as configurações do localStorage
  const volumeSetting = parseInt(localStorage.getItem("volume"), 10) || 50;
  const isDarkMode = localStorage.getItem("darkMode") === "true";

  // Sincronizar o score com o localStorage
  useEffect(() => {
    localStorage.setItem("score", score);
    console.log("Score sincronizado com o localStorage:", score);
  }, [score]);

  useEffect(() => {
    const handleKeyPress = (event) => {
      const keyMap = {
        'a': 'C4',
        's': 'D4',
        'd': 'E4',
        'f': 'F4',
        'g': 'G4',
        'h': 'A4',
        'j': 'B4',
        'k': 'C5',
        'w': 'C#4',
        'e': 'D#4',
        'r': 'F#4',
        't': 'G#4',
        'y': 'A#4'
      };

      const note = keyMap[event.key.toLowerCase()];
      if (note) {
        const key = [...whiteKeys, ...blackKeys].find(k => k.userData.note === note);
        if (key) {
          playNoteAndMoveBall(key.userData.note, key.userData.height);
          setKeyColor(key, key.userData.color);

          setTimeout(() => {
            if (whiteKeys.includes(key)) {
              setKeyColor(key, 0xffffff);
            }
          }, 200);
        }
      }
    };

    window.addEventListener("keydown", handleKeyPress);

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
    renderer.setClearColor(0x000000, 0); // Transparente para deixar o background visível
    const mountNode = mountRef.current;
    mountNode.appendChild(renderer.domElement);

    // Definir luz e cor de acordo com o modo escuro
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);

    // Inicializar o sintetizador Tone.js e aplicar volume conforme as settings
    const synth = new Tone.Synth().toDestination();
    synth.volume.value = Tone.gainToDb(volumeSetting / 100); // Aplicar o volume baseado na configuração

    // Note colors
    const noteColors = {
      C4: 0xff0000,
      D4: 0x00ff00,
      E4: 0x0000ff,
      F4: 0xffff00,
      G4: 0xff00ff,
      A4: 0x00ffff,
      B4: 0xffa500,
      C5: 0x800080,
    };

    // Piano keys setup
    const keyWidth = 0.55;
    const keyHeight = 0.22;
    const keyDepth = 2.2;
    const whiteKeyCount = 8;
    const whiteKeyMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const blackKeyMaterial = new THREE.MeshBasicMaterial({ color: 0x000000 });

    const notes = ["C4", "D4", "E4", "F4", "G4", "A4", "B4", "C5"];
    const whiteKeys = [];
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

    for (let i = 0; i < whiteKeyCount; i++) {
      const whiteKey = new THREE.Mesh(
        new THREE.BoxGeometry(keyWidth, keyHeight, keyDepth),
        whiteKeyMaterial.clone()
      );
      whiteKey.position.x =
        i * (keyWidth + 0.1) - ((whiteKeyCount - 1) * (keyWidth + 0.1)) / 2;
      whiteKey.position.y = -2;
      whiteKey.position.z = 2;
      whiteKey.userData = {
        note: notes[i],
        height: noteHeights[notes[i]],
        color: noteColors[notes[i]],
      };
      whiteKeys.push(whiteKey);
      scene.add(whiteKey);

      // Add outline to white keys
      const outline = new THREE.Mesh(whiteKey.geometry.clone(), new THREE.MeshBasicMaterial({ color: 0x000000, side: THREE.BackSide }));
      outline.scale.set(1.05, 1.05, 1.02);
      whiteKey.add(outline);
    }

    const blackKeyOffsets = [0.75, 1.75, 3.25, 4.25, 5.25];
    const blackNotes = ["C#4", "D#4", "F#4", "G#4", "A#4"];
    const blackKeys = [];

    blackKeyOffsets.forEach((offset, index) => {
      const blackKey = new THREE.Mesh(
        new THREE.BoxGeometry(keyWidth / 1.8, keyHeight, keyDepth / 1.8),
        blackKeyMaterial.clone()
      );
      blackKey.position.x =
        offset * (keyWidth + 0.1) -
        ((whiteKeyCount - 1) * (keyWidth + 0.1)) / 2;
      blackKey.position.y = -1.9;
      blackKey.position.z = 2;
      blackKey.userData = {
        note: blackNotes[index],
        height: (index + 1) * 0.2,
        color: 0x000000,
      };
      blackKeys.push(blackKey);
      scene.add(blackKey);
    });

    // Create the 3D Ball
    const ballGeometry = new THREE.SphereGeometry(0.25, 32, 32);
    const ballMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
    const ball = new THREE.Mesh(ballGeometry, ballMaterial);
    ball.position.set(0, -2.3, -1.8);
    ball.frustumCulled = false; // Disable frustum culling to prevent disappearing
    scene.add(ball);

    // Add outline to the ball
    const ballOutline = new THREE.Mesh(ball.geometry.clone(), new THREE.MeshBasicMaterial({ color: 0x000000, side: THREE.BackSide }));
    ballOutline.scale.set(1.15, 1.15, 1.15);
    ball.add(ballOutline);

    let targetY = ball.position.y;

    // Create the Pathway
    const createPathway = () => {
      const pathwayMaterial = new THREE.LineBasicMaterial({ color: isDarkMode ? 0xffffff : 0x000000 });
      const pathwayPoints = [];
      const edgePoints = [];

      for (let i = 0; i < 20; i++) {
        pathwayPoints.push(new THREE.Vector3(-1.8, -2.5, -1 - i));
        pathwayPoints.push(new THREE.Vector3(1.8, -2.5, -1 - i));
      }

      edgePoints.push(new THREE.Vector3(-1.8, -2.5, -1));
      edgePoints.push(new THREE.Vector3(-1.8, -2.5, -17));
      edgePoints.push(new THREE.Vector3(1.8, -2.5, -17));
      edgePoints.push(new THREE.Vector3(1.8, -2.5, -1));

      const pathwayGeometry = new THREE.BufferGeometry().setFromPoints(pathwayPoints);
      const pathway = new THREE.LineSegments(pathwayGeometry, pathwayMaterial);
      scene.add(pathway);

      const edgeMaterial = new THREE.LineBasicMaterial({ color: isDarkMode ? 0xffffff : 0x000000 });
      const edgeGeometry = new THREE.BufferGeometry().setFromPoints(edgePoints);
      const edges = new THREE.Line(edgeGeometry, edgeMaterial);
      scene.add(edges);
    };

    createPathway();

    // Create the Walls with circular hole
    const walls = [];

    const createWall = (note, height) => {
      // Define the wall shape with a hole
      const wallShape = new THREE.Shape();
      wallShape.moveTo(-1.8, -1.8);
      wallShape.lineTo(1.8, -1.8);
      wallShape.lineTo(1.8, 1.8);
      wallShape.lineTo(-1.8, 1.8);
      wallShape.lineTo(-1.8, -1.8);

      // Create the hole in the wall
      const holePath = new THREE.Path();
      holePath.arc(0, height + 0.15, 0.25, 0, Math.PI * 2, true);
      wallShape.holes.push(holePath);

      // Create geometry from shape
      const wallGeometry = new THREE.ShapeGeometry(wallShape);
      const wallMaterial = new THREE.MeshBasicMaterial({
        color: noteColors[note],
        side: THREE.DoubleSide,
      });
      const wall = new THREE.Mesh(wallGeometry, wallMaterial);
      wall.position.set(0, 0, -10);
      wall.frustumCulled = false; // Disable frustum culling for walls
      wall.userData = {
        note,
        holeHeight: height,
        passed: false,
        removed: false,
      };
      scene.add(wall);
      walls.push(wall);
    };

    const generateWalls = () => {
      if (walls.length < 5) {  // Limit the number of walls in the scene to improve performance
        const randomIndex = Math.floor(Math.random() * whiteKeys.length);
        const randomNote = whiteKeys[randomIndex].userData.note;
        const randomHeight = whiteKeys[randomIndex].userData.height;
        createWall(randomNote, randomHeight);
      }
    };

    const wallInterval = setInterval(generateWalls, 5000);

    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const onMouseClick = (event) => {
      mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
      mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
      raycaster.setFromCamera(mouse, camera);
      
      const intersects = raycaster.intersectObjects([...whiteKeys, ...blackKeys], false);
      if (intersects.length > 0) {
        const key = intersects[0].object;
        playNoteAndMoveBall(key.userData.note, key.userData.height);
        setKeyColor(key, key.userData.color);

        setTimeout(() => {
          if (whiteKeys.includes(key)) {
            setKeyColor(key, 0xffffff);
          } 
        }, 200);
      }
    };

    const setKeyColor = (key, color) => {
      if (!blackKeys.includes(key)) {
        key.material.color.setHex(color);
      }
      key.children.forEach(child => {
        if (child.material && child.material.color) {
          child.material.color.setHex(0x000000); // Keep outline color always black
        }
      });
    };

    const playNoteAndMoveBall = (note, height) => {
      synth.triggerAttackRelease(note, "8n");
      targetY = THREE.MathUtils.clamp(height + 0.15, -1.5, 1.5);
    };

    window.addEventListener("click", onMouseClick);

    const checkCollision = (wall) => {
      const wallPosition = wall.position.z;
      const ballPositionY = ball.position.y;
      const holeHeight = wall.userData.holeHeight;
      if (wallPosition <= -0.8 && wallPosition >= -1.2) {
        if (Math.abs(ballPositionY - holeHeight) < 0.2) {
          wall.userData.passed = true;
          setScore(prevScore => prevScore + 1);
          return false;
        } else {
          setGameOver(true);
          clearInterval(wallInterval);
          navigate("/tonerunnergameovermenu", { state: { score } }); // Redirecionar para o menu de Game Over
          return true;
        }
      }
      return false;
    };

    const animate = () => {
      requestAnimationFrame(animate);

      // Smoothly interpolate the ball position towards the target
      ball.position.y = THREE.MathUtils.lerp(ball.position.y, targetY, ballSpeed);
      ball.position.y = THREE.MathUtils.clamp(ball.position.y, -2.5, 1.5);

      walls.forEach((wall) => {
        if (wall && !wall.userData.removed) {
          wall.position.z += wallSpeed;

          if (checkCollision(wall)) {
            return;
          }

          if (wall.userData.passed && !wall.userData.removed) {
            wall.userData.removed = true;
            scene.remove(wall);
            setWallSpeed((prevSpeed) => prevSpeed + 0.005);
          }
        }
      });

      // Filter out removed walls
      const filteredWalls = walls.filter((wall) => wall && !wall.userData.removed);
      walls.length = 0;
      walls.push(...filteredWalls);

      TWEEN.update();
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      window.removeEventListener("keydown", handleKeyPress);
      window.removeEventListener("click", onMouseClick);
      clearInterval(wallInterval);
      mountNode.removeChild(renderer.domElement);
    };
  }, [gameOver]);

  return (
    <div style={{ position: "relative", width: "100%", height: "100vh" }}>
      <div style={{ position: "absolute", top: "10px", left: "10px", color: isDarkMode ? "white" : "black", fontSize: "24px", zIndex: 1 }}>Score: {score}</div>
      <Background darkMode={isDarkMode} style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", zIndex: -1 }} />
      <div ref={mountRef} style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%" }} />
    </div>
  );
};

export default Piano;
