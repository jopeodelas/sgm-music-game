import React, { useState } from "react";
import "./Settings.css";

const Settings = ({ onVolumeChange }) => {
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

  return (
    <div className="volume-controller">
      <label htmlFor="volume">{volume}%</label>
      <div className="volume-bar-container">
        {volumeBars.map((filled, index) => (
          <div key={index} className={`volume-bar ${filled ? "filled" : ""}`} />
        ))}
      </div>
      <div>
        <button onClick={decreaseVolume}>-</button>
        <button onClick={increaseVolume}>+</button>
      </div>
    </div>
  );
};

export default Settings;
