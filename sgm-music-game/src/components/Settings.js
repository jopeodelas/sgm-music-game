import React, { useState, useEffect } from "react";
import "../styles/Settings.css";
import { CloseIcon } from "../assets/icons/index.js";
import { AddIcon } from "../assets/icons/index.js";
import { SubtractIcon } from "../assets/icons/index.js";
import { SettingsIcon } from "../assets/icons/index.js";

const Settings = ({ onVolumeChange, onClose, darkMode, onDarkModeToggle }) => {
  const [volume, setVolume] = useState(50);

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

  const volumeBarStyle = darkMode
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

  const filledBarStyle = darkMode
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

  const volumeBarBorderStyle = darkMode
    ? { borderColor: "white" }
    : { borderColor: "black" };

  const filledBarBorderStyle = darkMode
    ? { borderColor: "white" }
    : { borderColor: "black" };

  useEffect(() => {
    const floatingWindow = document.getElementById("floatingWindow");
    if (floatingWindow) {
      floatingWindow.style.backgroundColor = darkMode ? "black" : "white";
      floatingWindow.style.color = darkMode ? "white" : "black";
    }

    const closeButton = document.getElementById("closeIcon");
    if (closeButton) {
      closeButton.style.stroke = darkMode ? "white" : "black";
    }

    const addButton = document.getElementById("addIcon");
    if (addButton) {
      addButton.style.stroke = darkMode ? "white" : "black";
    }

    const subtractButton = document.getElementById("subtractIcon");
    if (subtractButton) {
      subtractButton.style.fill = darkMode ? "white" : "black";
    }

    const settingsIcon = document.getElementById("settingsIcon");
    if (settingsIcon) {
      settingsIcon.style.fill = darkMode ? "white" : "black";
    }
  }, [darkMode]);

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
        {/* <div className="darkMode">
          <label htmlFor="darkMode" id="darkModeLabel">
            Dark Mode
          </label>
          <input
            type="checkbox"
            id="darkMode"
            checked={darkMode}
            onChange={onDarkModeToggle}
          />
        </div> */}
        <div className="darkMode">
          <label htmlFor="darkMode" id="darkModeLabel">
            Dark Mode
          </label>
          <div className="switch">
            <input
              type="checkbox"
              id="darkMode"
              checked={darkMode}
              onChange={onDarkModeToggle}
            />
            <span className="slider"></span>
          </div>
        </div>
      </div>
    </>
  );
};

export default Settings;
