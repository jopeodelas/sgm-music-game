import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Homepage.css";
import Settings from "../components/Settings.js";
import {
  ToneRunnerIcon,
  AudioQuizIcon,
  FreeModeIcon,
  SettingsIcon,
  MelodyIcon,
} from "../assets/icons";

const Homepage = () => {
  const navigate = useNavigate();
  const [showVolumeControl, setShowVolumeControl] = useState(false);

  const goToToneRunner = () => {
    navigate("/tonerunner");
  };

  const toggleVolumeControl = () => {
    setShowVolumeControl(!showVolumeControl);
  };

  return (
    <div id="homepage">
      <div id="container">
        <div id="sidebar">
          <div className="tile">
            <div>
              <AudioQuizIcon className="icon" />
              <span className="tileText">Audio Quiz</span>
            </div>
          </div>
          <div className="blackTile"></div>
          <div className="tile">
            <div>
              <MelodyIcon className="icon" />
              <span className="tileText">Melody Mimic</span>
            </div>
          </div>
          <div className="tile" onClick={goToToneRunner}>
            <div>
              <ToneRunnerIcon className="icon" />
              <span className="tileText">Tone Runner</span>
            </div>
          </div>
          <div className="blackTile"></div>
          <div className="tile">
            <div>
              <FreeModeIcon className="icon" id="freeModeIcon" />
              <span className="tileText">Free Mode</span>
            </div>
          </div>
          <div className="blackTile"></div>
          <div className="tile" onClick={toggleVolumeControl}>
            <div>
              <SettingsIcon className="icon" id="freeModeIcon" />
              <span className="tileText">Settings</span>
            </div>
          </div>
        </div>
        <div id="mainContent">
          <h1 id="gameName">Game Name</h1>
          <p id="gameSlogan">Choose your game mode, learn and have fun!</p>
        </div>
        {showVolumeControl && (
          <>
            <div id="overlay" onClick={toggleVolumeControl}></div>{" "}
            <div className="floatingWindow">
              <label>Master volume:</label>
              <Settings />
              <button className="closeButton" onClick={toggleVolumeControl}>
                Close
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Homepage;
