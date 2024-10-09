import React, { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';
import * as Tone from 'tone';
import TWEEN from '@tweenjs/tween.js';

const Piano = () => {
  const mountRef = useRef(null);
  const [gameOver, setGameOver] = useState(false);
  const [wallSpeed, setWallSpeed] = useState(0.02);
  const ballSpeed = 0.05;

  useEffect(() => {
    // Initialize scene, camera, and renderer
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 0, 6);

    const renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    mountRef.current.appendChild(renderer.domElement);

    // Add lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);

    // Initialize Tone.js for sound
    const synth = new Tone.Synth().toDestination();

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
    const keyWidth = 0.5;
    const keyHeight = 0.2;
    const keyDepth = 2;
    const whiteKeyCount = 8;
    const whiteKeyMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const blackKeyMaterial = new THREE.MeshBasicMaterial({ color: 0x000000 });

    const notes = ['C4', 'D4', 'E4', 'F4', 'G4', 'A4', 'B4', 'C5'];
    const whiteKeys = [];
    const noteHeights = { C4: 0, D4: 0.5, E4: 1, F4: 1.5, G4: 2, A4: 2.5, B4: 3, C5: 3.5 };

    for (let i = 0; i < whiteKeyCount; i++) {
      const whiteKey = new THREE.Mesh(
        new THREE.BoxGeometry(keyWidth, keyHeight, keyDepth),
        whiteKeyMaterial
      );
      whiteKey.position.x = i * (keyWidth + 0.1) - ((whiteKeyCount - 1) * (keyWidth + 0.1)) / 2;
      whiteKey.position.y = -2;
      whiteKey.position.z = 2;
      whiteKey.userData = { note: notes[i], height: noteHeights[notes[i]], color: noteColors[notes[i]] };
      whiteKeys.push(whiteKey);
      scene.add(whiteKey);
    }

    const blackKeyOffsets = [0.75, 1.75, 3.25, 4.25, 5.25];
    const blackNotes = ['C#4', 'D#4', 'F#4', 'G#4', 'A#4'];
    const blackKeys = [];

    blackKeyOffsets.forEach((offset, index) => {
      const blackKey = new THREE.Mesh(
        new THREE.BoxGeometry(keyWidth / 2, keyHeight, keyDepth / 2),
        blackKeyMaterial
      );
      blackKey.position.x = offset * (keyWidth + 0.1) - ((whiteKeyCount - 1) * (keyWidth + 0.1)) / 2;
      blackKey.position.y = -1.9;
      blackKey.position.z = 2;
      blackKey.userData = { note: blackNotes[index], height: (index + 1) * 0.5 };
      blackKeys.push(blackKey);
      scene.add(blackKey);
    });

    // Create the 3D Ball
    const ballGeometry = new THREE.SphereGeometry(0.1, 32, 32);
    const ballMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
    const ball = new THREE.Mesh(ballGeometry, ballMaterial);
    const ballStartZ = -3;
    ball.position.set(0, -2.5, ballStartZ);
    scene.add(ball);

    let targetY = ball.position.y;

    // Create the Pathway
    const createPathway = () => {
      const pathwayMaterial = new THREE.LineBasicMaterial({ color: 0xffffff });
      const pathwayPoints = [];
      const edgePoints = [];

      for (let i = 0; i < 20; i++) {
        pathwayPoints.push(new THREE.Vector3(-1.5, -2.5, -1 - i));
        pathwayPoints.push(new THREE.Vector3(1.5, -2.5, -1 - i));
      }

      edgePoints.push(new THREE.Vector3(-1.5, -2.5, -1));
      edgePoints.push(new THREE.Vector3(-1.5, -2.5, -17));
      edgePoints.push(new THREE.Vector3(1.5, -2.5, -17));
      edgePoints.push(new THREE.Vector3(1.5, -2.5, -1));

      const pathwayGeometry = new THREE.BufferGeometry().setFromPoints(pathwayPoints);
      const pathway = new THREE.LineSegments(pathwayGeometry, pathwayMaterial);
      scene.add(pathway);

      const edgeMaterial = new THREE.LineBasicMaterial({ color: 0xff0000 });
      const edgeGeometry = new THREE.BufferGeometry().setFromPoints(edgePoints);
      const edges = new THREE.Line(edgeGeometry, edgeMaterial);
      scene.add(edges);
    };

    createPathway();

    // Create the Walls with circular hole
    const walls = [];

    const createWall = (note, height) => {
      const wallGeometry = new THREE.BoxGeometry(3, 3, 0.1);
      const wallMaterial = new THREE.MeshBasicMaterial({ color: noteColors[note] });
      const wall = new THREE.Mesh(wallGeometry, wallMaterial);

      const holeRadius = 0.5;
      const holeGeometry = new THREE.CircleGeometry(holeRadius, 32);
      const holeMaterial = new THREE.MeshBasicMaterial({ color: 0x000000 });
      const hole = new THREE.Mesh(holeGeometry, holeMaterial);
      hole.position.y = height - 1.5;
      hole.position.z = 0.05;
      hole.rotation.y = Math.PI / 2;

      wall.position.set(0, 0, -10);
      wall.userData = { note, holeHeight: height };
      scene.add(wall);
      wall.add(hole);
      walls.push(wall);
    };

    const generateWalls = () => {
      const randomIndex = Math.floor(Math.random() * whiteKeys.length);
      const randomNote = whiteKeys[randomIndex].userData.note;
      const randomHeight = whiteKeys[randomIndex].userData.height;
      createWall(randomNote, randomHeight);
    };

    const wallInterval = setInterval(generateWalls, 5000);

    // Raycasting for mouse interaction
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const onMouseClick = (event) => {
      mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
      mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
      raycaster.setFromCamera(mouse, camera);

      const intersects = raycaster.intersectObjects([...whiteKeys, ...blackKeys]);
      if (intersects.length > 0) {
        const key = intersects[0].object;
        playNoteAndMoveBall(key.userData.note, key.userData.height);
        setKeyColor(key, key.userData.color);

        setTimeout(() => {
          setKeyColor(key, 0xffffff);
        }, 200);
      }
    };

    const setKeyColor = (key, color) => {
      key.material.color.setHex(color);
    };

    const playNoteAndMoveBall = (note, height) => {
      synth.triggerAttackRelease(note, '8n');
      targetY = height;
    };

    window.addEventListener('click', onMouseClick);

    const checkCollision = (wall) => {
      const wallPosition = wall.position.z;
      const ballPositionY = ball.position.y;
      const holeHeight = wall.userData.holeHeight;

      if (wallPosition <= -0.8 && wallPosition >= -1.2) {
        if (Math.abs(ballPositionY - holeHeight) < 0.5) {
          return false;
        } else {
          return true;
        }
      }
      return false;
    };

    const animate = () => {
      if (gameOver) return;
      requestAnimationFrame(animate);

      ball.position.y += (targetY - ball.position.y) * ballSpeed;

      walls.forEach((wall, index) => {
        wall.position.z += wallSpeed;

        if (checkCollision(wall)) {
          setGameOver(true);
          clearInterval(wallInterval);
        }

        if (wall.position.z > 1) {
          scene.remove(wall);
          walls.splice(index, 1);
          setWallSpeed((prevSpeed) => prevSpeed + 0.005);
        }
      });

      TWEEN.update();
      renderer.render(scene, camera);
    };
    animate();

    const addFadingStars = () => {
      const starMaterial = new THREE.PointsMaterial({ color: 0xffffff, size: 0.05 });
      const starsArray = [];

      for (let i = 0; i < 2000; i++) {
        const starGeometry = new THREE.BufferGeometry();
        const starVertices = new Float32Array([
          THREE.MathUtils.randFloatSpread(200),
          THREE.MathUtils.randFloatSpread(200),
          THREE.MathUtils.randFloatSpread(200),
        ]);
        starGeometry.setAttribute('position', new THREE.BufferAttribute(starVertices, 3));

        const star = new THREE.Points(starGeometry, starMaterial.clone());
        star.material.opacity = 0.5 + Math.random() * 0.5;
        star.material.transparent = true;
        starsArray.push(star);
        scene.add(star);
      }

      const fadeInOut = (star) => {
        const fadeTime = Math.random() * 2000 + 1000;
        const fadingIn = !star.fadingIn;

        new TWEEN.Tween(star.material)
          .to({ opacity: fadingIn ? 1 : 0 }, fadeTime)
          .easing(TWEEN.Easing.Quadratic.InOut)
          .onComplete(() => {
            star.fadingIn = fadingIn;
            fadeInOut(star);
          })
          .start();
      };

      starsArray.forEach((star) => {
        star.fadingIn = Math.random() > 0.5;
        fadeInOut(star);
      });
    };

    addFadingStars();

    return () => {
      window.removeEventListener('click', onMouseClick);
      clearInterval(wallInterval);
      mountRef.current.removeChild(renderer.domElement);
    };
  }, [gameOver]);

  return <div ref={mountRef} />;
};

export default Piano;