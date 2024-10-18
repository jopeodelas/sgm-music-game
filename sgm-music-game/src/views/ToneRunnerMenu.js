import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Background from '../components/Background'; // Caminho atualizado
import Settings from '../components/Settings'; // Caminho atualizado
import '../styles/ToneRunnerMenu.css'; // Certifique-se de que tens um arquivo CSS para este componente

// Importa o áudio
import menuMusic from '../assets/audio/ToneRunnerMenuMusic.mp3'; // Caminho atualizado para o ficheiro de áudio

const ToneRunnerMenu = () => {
    const navigate = useNavigate();
    const [showSettings, setShowSettings] = useState(false);
    const audioRef = useRef(null); // Cria uma referência para o objeto de áudio

    // Reproduz o áudio quando o componente é carregado
    useEffect(() => {
        // Inicializa o objeto de áudio apenas uma vez
        audioRef.current = new Audio(menuMusic);
        audioRef.current.loop = true;

        // Tenta reproduzir o áudio quando o componente for montado
        const playAudio = async () => {
            try {
                await audioRef.current.play(); // Espera o áudio ser tocado
            } catch (error) {
                console.log('Erro ao tentar reproduzir o áudio:', error);
            }
        };

        playAudio();

        // Pausa o áudio quando o componente for desmontado
        return () => {
            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current.currentTime = 0; // Reseta o áudio ao início
            }
        };
    }, []); // Executa apenas uma vez, quando o componente for montado

    const handleSettingsToggle = () => {
        setShowSettings(!showSettings);
    };

    const handleMouseMove = (e) => {
        const wheel = document.querySelector('.wheel');
        const rect = wheel.getBoundingClientRect();

        // Centro da roda (wheel)
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;

        // Calcula o ângulo entre o centro da wheel e o cursor
        const deltaX = e.clientX - centerX;
        const deltaY = e.clientY - centerY;
        const angle = Math.atan2(deltaY, deltaX); // Ângulo em radianos

        // Adiciona uma correção de 90 graus (π/2 radianos)
        wheel.style.transform = `translate(-50%, -50%) rotate(${angle + Math.PI / 2}rad)`;  // Rotaciona a wheel
    };

    return (
        <div className="tone-runner-menu" onMouseMove={handleMouseMove}>
            <Background />
            <h1 className="title">TONE RUNNER</h1>
            <div className="wheel">
                <div className="arrow"></div>
            </div>
            <div className="menu-buttons">
                <button 
                    className="menu-button menu-button-1"
                    onClick={() => navigate('/tonerunner')}
                >
                    Start
                </button>
                <button 
                    className="menu-button menu-button-2"
                    onClick={handleSettingsToggle}
                >
                    Settings
                </button>
                <div className="button-container">
                    <button 
                        className="menu-button menu-button-3"
                        onClick={() => navigate('/')}
                    >
                        Go Back
                    </button>
                </div>
            </div>
            {showSettings && (
                <Settings 
                    onClose={handleSettingsToggle}
                    darkMode={true}
                    onDarkModeToggle={() => console.log('Toggle dark mode')} 
                />
            )}
        </div>
    );
};

export default ToneRunnerMenu;
