import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Background from "../components/Background";
import "../styles/ToneRunnerGameOverMenu.css";
import * as Tone from "tone";
import * as THREE from "three";

const ToneRunnerGameOverMenu = () => {
    const navigate = useNavigate();
    const [score, setScore] = useState(0);
    const [isDarkMode, setIsDarkMode] = useState(localStorage.getItem("darkMode") === "true" || false);
    const volumeSetting = parseInt(localStorage.getItem("volume"), 10) || 50;
    const [scene, setScene] = useState(null);
    const [renderer, setRenderer] = useState(null);

    useEffect(() => {
        // Carregar o score do localStorage
        const savedScore = parseInt(localStorage.getItem("score"), 10) || 0;
        setScore(savedScore);

        // Configurar o sintetizador Tone.js com o volume ajustado
        const synth = new Tone.Synth().toDestination();
        synth.volume.value = Tone.gainToDb(volumeSetting / 100);

        // Criar animação do piano
        const createPiano = () => { /* ... configuração do piano com Three.js */ };

        // Definir função de reprodução automática do piano
        const playPiano = () => { /* ... lógica para tocar as notas automaticamente */ };

        // Chamar a função playPiano
        playPiano();

    }, []);

    return (
        <div className={`game-over-menu ${isDarkMode ? "dark" : ""}`}>
            <Background darkMode={isDarkMode} />
            <h1 className="game-over-title">GAME OVER</h1>
            <p className="score-text">Score: {score}</p>
            <div className="button-container">
                <button className="game-over-button" onClick={() => navigate("/tonerunner")}>Play Again</button>
                <button className="game-over-button" onClick={() => navigate("/")}>Main Menu</button>
            </div>
            <div id="piano-container" className="piano-container"></div>
        </div>
    );
};

export default ToneRunnerGameOverMenu;
