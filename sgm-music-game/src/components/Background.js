import React, { useEffect } from "react";
import "../styles/Background.css";

const Background = ({ darkMode }) => {
  const numStars = 750;

  useEffect(() => {
    setTimeout(() => {
      const container = document.querySelector("#star-container");

      if (container) {
        container.innerHTML = "";

        for (let i = 0; i < numStars; i++) {
          const star = document.createElement("div");
          star.classList.add("star");

          const top = Math.random() * 100;
          const left = Math.random() * 100;

          star.style.top = `${top}%`;
          star.style.left = `${left}%`;

          const size = Math.random() * 4 + 1;
          star.style.width = `${size}px`;
          star.style.height = `${size}px`;

          const animationDelay = Math.random() * 10 + "s";
          star.style.animationDelay = animationDelay;

          container.appendChild(star);

          container.style.backgroundColor = darkMode ? "black" : "white";
          star.style.backgroundColor = darkMode ? "white" : "black";
        }
      } else {
        console.log("Container não encontrado.");
      }
    }, 0);
  }, [darkMode]);

  return <div id="star-container" className="star-container"></div>;
};

export default Background;
