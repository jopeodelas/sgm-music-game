import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Homepage.css";
import Settings from "../components/Settings.js";
import {
  ToneRunnerIcon,
  AudioQuizIcon,
  FreeModeIcon,
  SettingsIcon,
  MelodyIcon,
} from "../assets/icons/index.js";
import Background from "../components/Background.js";

const Homepage = () => {
  const navigate = useNavigate();
  const [showVolumeControl, setShowVolumeControl] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [isClickable, setIsClickable] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsClickable(true);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const storedDarkMode = localStorage.getItem("darkMode");
    if (storedDarkMode) {
      setDarkMode(JSON.parse(storedDarkMode));
    }
  }, []);

  const goToToneRunner = () => {
    navigate("/tonerunner");
  };

  const toggleVolumeControl = () => {
    setShowVolumeControl(!showVolumeControl);
  };

  const handleDarkModeToggle = () => {
    setDarkMode((prevDarkMode) => !prevDarkMode);
  };

  return (
    <div id="homepage" style={{ pointerEvents: isClickable ? "auto" : "none" }}>
      <Background darkMode={darkMode} />
      <div
        id="container"
        style={{ pointerEvents: isClickable ? "auto" : "none" }}
      >
        <div id="sidebar">
          <div className="tile" id="tile-1">
            <div>
              <AudioQuizIcon className="icon" />
              <span className="tileText">Audio Quiz</span>
            </div>
          </div>
          <div className="blackTile blackTile-1"></div>
          <div className="tile" id="tile-2">
            <div>
              <MelodyIcon className="icon" />
              <span className="tileText">Melody Mimic</span>
            </div>
          </div>
          <div className="blackTile blackTile-2"></div>
          <div className="tile" id="tile-3" onClick={goToToneRunner}>
            <div>
              <ToneRunnerIcon className="icon" />
              <span className="tileText">Tone Runner</span>
            </div>
          </div>
          <div className="blackTile blackTile-3"></div>
          <div className="tile" id="tile-4">
            <div>
              <FreeModeIcon className="icon" />
              <span className="tileText">Free Mode</span>
            </div>
          </div>
          <div className="blackTile blackTile-4"></div>
          <div className="tile" id="tile-5" onClick={toggleVolumeControl}>
            <div>
              <SettingsIcon className="icon" />
              <span className="tileText">Settings</span>
            </div>
          </div>
        </div>
        <div
          id="mainContent"
          style={{
            color: darkMode ? "white" : "black",
          }}
        >
          <h1 id="gameName">Game Name</h1>
          <p id="gameSlogan">Choose your game mode, learn and have fun!</p>
        </div>
        {showVolumeControl && (
          <Settings
            onClose={toggleVolumeControl}
            darkMode={darkMode}
            onDarkModeToggle={handleDarkModeToggle}
          />
        )}
      </div>
    </div>
  );
};

export default Homepage;
