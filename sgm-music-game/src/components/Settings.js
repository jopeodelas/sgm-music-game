import React, { useState, useEffect } from "react";
import "../styles/Settings.css";

const Settings = ({ onVolumeChange }) => {
  const [volume, setVolume] = useState(50);
  const [darkMode, setDarkMode] = useState(false);

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

  const handleDarkModeToggle = () => {
    setDarkMode((prevDarkMode) => !prevDarkMode);
  };
  const volumeBarStyle = darkMode
    ? {
        backgroundColor: "black",
        borderStyle: "solid",
        borderWidth: "2px",
        borderColor: "white",
      }
    : {
        backgroundColor: "white",
        borderStyle: "solid",
        borderWidth: "2px",
        borderColor: "black",
      };

  const filledBarStyle = darkMode
    ? {
        backgroundColor: "white",
        borderStyle: "solid",
        borderWidth: "2px",
        borderColor: "black",
      }
    : {
        backgroundColor: "black",
        borderStyle: "solid",
        borderWidth: "2px",
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
  }, [darkMode]);

  return (
    <div id="floatingWindow">
      <div className="volumeController">
        <label htmlFor="volume">{volume}%</label>
        <div className="volumeBarContainer">
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
        </div>
        <div>
          <button onClick={decreaseVolume}>-</button>
          <button onClick={increaseVolume}>+</button>
        </div>
      </div>
      <div className="darkMode">
        <label htmlFor="darkMode">Dark Mode</label>
        <input
          type="checkbox"
          id="darkMode"
          checked={darkMode}
          onChange={handleDarkModeToggle}
        />
      </div>
    </div>
  );
};

export default Settings;
