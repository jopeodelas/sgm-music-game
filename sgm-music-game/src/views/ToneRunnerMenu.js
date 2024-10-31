import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Background from '../components/Background'; // Caminho atualizado
import Settings from '../components/Settings'; // Caminho atualizado
import '../styles/ToneRunnerMenu.css'; // Certifique-se de que tens um arquivo CSS para este componente
import menuMusic from '../assets/audio/ToneRunnerMenuMusic.mp3'; // Caminho atualizado para o ficheiro de áudio

const ToneRunnerMenu = () => {
    const navigate = useNavigate();
    const [showSettings, setShowSettings] = useState(false);
    const [isDarkMode, setIsDarkMode] = useState(
        localStorage.getItem('darkMode') === 'true' || false
    );
    const [volume, setVolume] = useState(
        parseInt(localStorage.getItem('volume'), 10) || 50
    );
    const audioRef = useRef(null); // Cria uma referência para o objeto de áudio

    useEffect(() => {
        // Inicializa o objeto de áudio apenas uma vez
        audioRef.current = new Audio(menuMusic);
        audioRef.current.loop = true;
        audioRef.current.volume = volume / 100; // Define o volume inicial

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
    }, []);

    // Atualiza o volume do áudio quando o volume mudar
    useEffect(() => {
        if (audioRef.current) {
            audioRef.current.volume = volume / 100;
        }
    }, [volume]);

    // Guarda o volume no localStorage sempre que for alterado
    useEffect(() => {
        localStorage.setItem('volume', volume);
    }, [volume]);

    // Guarda o dark mode no localStorage
    useEffect(() => {
        localStorage.setItem('darkMode', isDarkMode);
        document.body.className = isDarkMode ? 'dark-body' : ''; // Aplica uma classe ao body
    }, [isDarkMode]);

    const increaseVolume = () => {
        setVolume((prevVolume) => Math.min(prevVolume + 10, 100));
    };

    const decreaseVolume = () => {
        setVolume((prevVolume) => Math.max(prevVolume - 10, 0));
    };

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

        // Rotaciona a wheel
        wheel.style.transform = `translate(-50%, -50%) rotate(${angle + Math.PI / 2}rad)`;
    };

    return (
        <div className={`tone-runner-menu ${isDarkMode ? 'dark' : ''}`} onMouseMove={handleMouseMove}>
            {/* Passar o darkMode como prop para o componente Background */}
            <Background darkMode={isDarkMode} />
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
                    darkMode={isDarkMode}
                    onDarkModeToggle={() => setIsDarkMode(!isDarkMode)}
                    onVolumeChange={setVolume} // Passa a função de alteração de volume
                />
            )}
        </div>
    );
};

export default ToneRunnerMenu;
