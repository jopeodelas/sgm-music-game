import React, { useState, useEffect, useRef } from "react";
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
  
  // State to manage the visibility of descriptions
  const [tileDescriptions, setTileDescriptions] = useState({
    1: false,
    2: false,
    3: false,
    4: false,
  });
  const [tileWidths, setTileWidths] = useState({
    1: "20%",
    2: "20%",
    3: "20%",
    4: "20%",
  });

  const tileRefs = useRef({
    1: React.createRef(),
    2: React.createRef(),
    3: React.createRef(),
    4: React.createRef(),
  });

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
    navigate("/tonerunnermenu");
  };

  const goToFreeMode = () => {
    navigate("/freemode");
  };

  const goToMelodyMimic = () => {
    navigate("/melodymimic");
  };

  const toggleVolumeControl = () => {
    setShowVolumeControl(!showVolumeControl);
  };

  const handleDarkModeToggle = () => {
    setDarkMode((prevDarkMode) => !prevDarkMode);
  };

  // Function to handle hover over a black tile
  const handleBlackTileHover = (id) => {
    // Expand tile to 100% width
    setTileWidths((prevWidths) => ({
      ...prevWidths,
      [id]: "100%",
    }));

    // Attach an event listener to detect when the transition is done
    const tile = tileRefs.current[id].current;

    tile.addEventListener("transitionend", () => {
      // After transition ends and tile width is fully expanded (100%), show the description
      if (tile.style.width === "100%") {
        setTileDescriptions((prev) => ({
          ...prev,
          [id]: true, // Show description only after the tile has expanded fully
        }));
      }
    });
  };

  // Function to handle when mouse leaves a black tile
  const handleBlackTileLeave = (id) => {
    // Reset the tile to its initial width (20%)
    setTileWidths((prevWidths) => ({
      ...prevWidths,
      [id]: "20%",
    }));

    // Hide the description when the tile is not hovered
    setTileDescriptions((prev) => ({
      ...prev,
      [id]: false,
    }));
  };

  // Function to handle hover over a white tile (in this case, the tiles with class "tile")
  const handleWhiteTileHover = (id) => {
    handleBlackTileHover(id); // Call the same function as the black tile hover
  };

  // Function to handle mouse leave from a white tile
  const handleWhiteTileLeave = (id) => {
    handleBlackTileLeave(id); // Call the same function as the black tile leave
  };

  return (
    <div id="homepage" style={{ pointerEvents: isClickable ? "auto" : "none" }}>
      <Background darkMode={darkMode} />
      <div
        id="container"
        style={{ pointerEvents: isClickable ? "auto" : "none" }}
      >
        <div id="sidebar">
          <div
            className="tile"
            id="tile-1"
            onMouseEnter={() => handleWhiteTileHover(1)}
            onMouseLeave={() => handleWhiteTileLeave(1)}
          >
            <div>
              <AudioQuizIcon className="icon" />
              <span className="tileText">Audio Quiz</span>
            </div>
          </div>
          <div
            className="blackTile"
            id="blackTile-1"
            data-text="Guess the audio and identify the sound!"
            style={{ width: tileWidths[1] }}
            ref={tileRefs.current[1]}
            onMouseEnter={() => handleBlackTileHover(1)}
            onMouseLeave={() => handleBlackTileLeave(1)}
          >
            {tileDescriptions[1] && (
              <span className="tileDescription">
                {document.getElementById("blackTile-1").dataset.text}
              </span>
            )}
          </div>
          <div
            className="tile"
            id="tile-2"
            onMouseEnter={() => handleWhiteTileHover(2)}
            onMouseLeave={() => handleWhiteTileLeave(2)}
            onClick={goToMelodyMimic}
          >
            <div>
              <MelodyIcon className="icon" />
              <span className="tileText">Melody Mimic</span>
            </div>
          </div>
          <div
            className="blackTile"
            id="blackTile-2"
            data-text="Mimic the melody that you hear!"
            style={{ width: tileWidths[2] }}
            ref={tileRefs.current[2]}
            onMouseEnter={() => handleBlackTileHover(2)}
            onMouseLeave={() => handleBlackTileLeave(2)}
          >
            {tileDescriptions[2] && (
              <span className="tileDescription">
                {document.getElementById("blackTile-2").dataset.text}
              </span>
            )}
          </div>
          <div
            className="tile"
            id="tile-3"
            onMouseEnter={() => handleWhiteTileHover(3)}
            onMouseLeave={() => handleWhiteTileLeave(3)}
            onClick={goToToneRunner}
          >
            <div>
              <ToneRunnerIcon className="icon" />
              <span className="tileText">Tone Runner</span>
            </div>
          </div>
          <div
            className="blackTile"
            id="blackTile-3"
            data-text="Run through the notes and hit the right ones!"
            style={{ width: tileWidths[3] }}
            ref={tileRefs.current[3]}
            onMouseEnter={() => handleBlackTileHover(3)}
            onMouseLeave={() => handleBlackTileLeave(3)}
            onClick={goToToneRunner}
          >
            {tileDescriptions[3] && (
              <span className="tileDescription">
                {document.getElementById("blackTile-3").dataset.text}
              </span>
            )}
          </div>
          <div
            className="tile"
            id="tile-4"
            onMouseEnter={() => handleWhiteTileHover(4)}
            onMouseLeave={() => handleWhiteTileLeave(4)}
            onClick={goToFreeMode}
          >
            <div>
              <FreeModeIcon className="icon" />
              <span className="tileText">Free Mode</span>
            </div>
          </div>
          <div
            className="blackTile"
            id="blackTile-4"
            data-text="Play freely and explore the sounds!"
            style={{ width: tileWidths[4] }}
            ref={tileRefs.current[4]}
            onMouseEnter={() => handleBlackTileHover(4)}
            onMouseLeave={() => handleBlackTileLeave(4)}
            onClick={goToFreeMode}
          >
            {tileDescriptions[4] && (
              <span className="tileDescription">
                {document.getElementById("blackTile-4").dataset.text}
              </span>
            )}
          </div>
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
