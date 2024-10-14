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
  const [descriptionVisible, setDescriptionVisible] = useState(false);

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

  const setDescriptionVisibility = () => {
    setDescriptionVisible(true);
  };

  const goToToneRunner = () => {
    navigate("/tonerunner");
  };

  const toggleVolumeControl = () => {
    setShowVolumeControl(!showVolumeControl);
  };

  const handleDarkModeToggle = () => {
    setDarkMode((prevDarkMode) => !prevDarkMode);
  };

  const handleBlackTileHover = (id) => {
    document.getElementById(id).style.backgroundColor = "#fff";
    document.getElementById(id).style.border = "2px solid rgb(0, 0, 0)";
  };

  const handleBlackTileLeave = (id) => {
    document.getElementById(id).style.backgroundColor = "";
    document.getElementById(id).style.border = "";
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
          <div
            className="blackTile"
            id="blackTile-1"
            data-text="Guess the audio and identify the sound!"
            onMouseEnter={() => handleBlackTileHover("tile-1")}
            onMouseLeave={() => handleBlackTileLeave("tile-1")}
          ></div>

          <div className="tile" id="tile-2">
            <div>
              <MelodyIcon className="icon" />
              <span className="tileText">Melody Mimic</span>
            </div>
          </div>
          <div
            className="blackTile"
            id="blackTile-2"
            data-text="Mimic the melody that you hear!"
            onMouseEnter={() => handleBlackTileHover("tile-2")}
            onMouseLeave={() => handleBlackTileLeave("tile-2")}
          ></div>

          <div className="tile" id="tile-3" onClick={goToToneRunner}>
            <div>
              <ToneRunnerIcon className="icon" />
              <span className="tileText">Tone Runner</span>
            </div>
          </div>
          <div
            className="blackTile"
            id="blackTile-3"
            data-text="Run through the notes and hit the right ones!"
            onMouseEnter={() => handleBlackTileHover("tile-3")}
            onMouseLeave={() => handleBlackTileLeave("tile-3")}
            onClick={goToToneRunner}
          ></div>
          <div className="tile" id="tile-4">
            <div>
              <FreeModeIcon className="icon" />
              <span className="tileText">Free Mode</span>
            </div>
          </div>
          <div
            className="blackTile"
            id="blackTile-4"
            data-text="Play freely and explore the sounds!"
            onMouseEnter={() => handleBlackTileHover("tile-4")}
            onMouseLeave={() => handleBlackTileLeave("tile-4")}
          ></div>

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
          <p id="developedBy">
            Developed by: Bernardo Coelho, Diogo Martins, João Gomes, João
            Castro
          </p>
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
