import React, { useState, useEffect } from "react";
import "../styles/Settings.css";
import { CloseIcon } from "../assets/icons/index.js";
import { AddIcon } from "../assets/icons/index.js";
import { SubtractIcon } from "../assets/icons/index.js";
import { SettingsIcon } from "../assets/icons/index.js";

const Settings = ({ onVolumeChange, onClose, darkMode, onDarkModeToggle }) => {
  // Retrieve the saved volume and darkMode from localStorage (or default to 50% volume and false for darkMode)
  const savedVolume = localStorage.getItem("volume");
  const initialVolume = savedVolume ? parseInt(savedVolume, 10) : 50;
  
  const savedDarkMode = localStorage.getItem("darkMode") === "true"; // Retrieve darkMode state from localStorage
  const [volume, setVolume] = useState(initialVolume);
  const [isDarkMode, setIsDarkMode] = useState(savedDarkMode);

  // Save volume to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("volume", volume);
  }, [volume]);

  // Save darkMode to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("darkMode", isDarkMode);
  }, [isDarkMode]);

  const increaseVolume = () => {
    setVolume((prevVolume) => {
      const newVolume = Math.min(prevVolume + 10, 100);
      if (onVolumeChange) {
        onVolumeChange(newVolume);
      }
      return newVolume;
    });
  };

  const decreaseVolume = () => {
    setVolume((prevVolume) => {
      const newVolume = Math.max(prevVolume - 10, 0);
      if (onVolumeChange) {
        onVolumeChange(newVolume);
      }
      return newVolume;
    });
  };

  const volumeBars = Array.from({ length: 10 }, (_, index) => {
    return index < Math.ceil(volume / 10);
  });

  const volumeBarStyle = isDarkMode
    ? {
        backgroundColor: "black",
        borderStyle: "solid",
        borderWidth: "3px",
        borderColor: "white",
      }
    : {
        backgroundColor: "white",
        borderStyle: "solid",
        borderWidth: "3px",
        borderColor: "black",
      };

  const filledBarStyle = isDarkMode
    ? {
        backgroundColor: "white",
        borderStyle: "solid",
        borderWidth: "3px",
        borderColor: "black",
      }
    : {
        backgroundColor: "black",
        borderStyle: "solid",
        borderWidth: "3px",
        borderColor: "white",
      };

  const volumeBarBorderStyle = isDarkMode
    ? { borderColor: "white" }
    : { borderColor: "black" };

  const filledBarBorderStyle = isDarkMode
    ? { borderColor: "white" }
    : { borderColor: "black" };

  useEffect(() => {
    const floatingWindow = document.getElementById("floatingWindow");
    if (floatingWindow) {
      floatingWindow.style.backgroundColor = isDarkMode ? "black" : "white";
      floatingWindow.style.color = isDarkMode ? "white" : "black";
    }

    const closeButton = document.getElementById("closeIcon");
    if (closeButton) {
      closeButton.style.stroke = isDarkMode ? "white" : "black";
    }

    const addButton = document.getElementById("addIcon");
    if (addButton) {
      addButton.style.stroke = isDarkMode ? "white" : "black";
    }

    const subtractButton = document.getElementById("subtractIcon");
    if (subtractButton) {
      subtractButton.style.fill = isDarkMode ? "white" : "black";
    }

    const settingsIcon = document.getElementById("settingsIcon");
    if (settingsIcon) {
      settingsIcon.style.fill = isDarkMode ? "white" : "black";
    }
  }, [isDarkMode]);

  const handleDarkModeToggle = () => {
    setIsDarkMode((prevDarkMode) => !prevDarkMode);
    onDarkModeToggle(); // Assuming you still want to call the prop passed in `onDarkModeToggle`
  };

  return (
    <>
      <div id="overlay" onClick={onClose}></div>
      <div id="floatingWindow">
        <div id="settingsTop">
          <div>
            <SettingsIcon className="icon" id="settingsIcon" />
            <label id="settingsLabel">Settings</label>
          </div>
          <div className="closeIconContainer">
            <CloseIcon
              id="closeIcon"
              className="iconSettings"
              onClick={onClose}
            />
          </div>
        </div>
        <div className="volumeController">
          <label htmlFor="volume" id="volumeLabel">
            Volume: {volume}%
          </label>
          <div className="volumeBarContainer">
            <SubtractIcon
              onClick={decreaseVolume}
              id="subtractIcon"
              className="iconSettings"
            />
            {volumeBars.map((filled, index) => (
              <div
                key={index}
                className={`volumeBar ${filled ? "filled" : ""}`}
                style={
                  filled
                    ? { ...filledBarStyle, ...filledBarBorderStyle }
                    : { ...volumeBarStyle, ...volumeBarBorderStyle }
                }
              />
            ))}
            <AddIcon
              onClick={increaseVolume}
              id="addIcon"
              className="iconSettings"
            />
          </div>
        </div>
        <div className="darkMode">
          <label htmlFor="darkMode" id="darkModeLabel">
            Dark Mode
          </label>
          <div className="switch">
            <input
              type="checkbox"
              id="darkMode"
              checked={isDarkMode}
              onChange={handleDarkModeToggle} // Call the new toggle function
            />
            <span className="slider"></span>
          </div>
        </div>
      </div>
    </>
  );
};

export default Settings;
