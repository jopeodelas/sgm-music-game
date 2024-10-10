import React from "react";
import { useNavigate } from "react-router-dom";

const Homepage = () => {
  const navigate = useNavigate();

  const goToPiano = () => {
    navigate("/piano");
  };

  return (
    <div style={styles.container}>
      <div style={styles.sidebar}>
        <div style={styles.tile} onClick={goToPiano}>
          <span style={styles.tileText}>Game Mode 1</span>
        </div>
        <div style={styles.blacktile}></div>
        <div style={styles.tile}>
          <span style={styles.tileText}>Game Mode 2</span>
        </div>
        <div style={styles.tile}>
          <span style={styles.tileText}>Game Mode 3</span>
        </div>
        <div style={styles.blacktile}></div>
        <div style={styles.tile}>
          <span style={styles.tileText}>Free Mode</span>
        </div>
        <div style={styles.blacktile}></div>
        <div style={styles.tile}>
          <span style={styles.tileText}>Settings</span>
        </div>
      </div>
      <div style={styles.mainContent}>
        <h1>Game Name</h1>
        <p>Choose your game mode, learn and have fun!</p>
      </div>
    </div>
  );
};

const styles = {
  container: {
    display: "flex",
    height: "100vh",
  },
  sidebar: {
    width: "55%",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    padding: "20px",
  },
  tile: {
    width: "100%",
    height: "20%",
    textAlign: "left",
    fontSize: "30px",
    fontWeight: "800",
    cursor: "pointer",
    borderRadius: "6px",
    border: "1px solid #ccc",
    boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
  },
  tileText: {
    marginLeft: "20px",
  },
  tileHover: {
    backgroundColor: "#ddd",
  },
  mainContent: {
    width: "75%",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  blacktile: {
    width: "25%",
    height: "1%",
    backgroundColor: "black",
    alignSelf: "flex-end",
    margin: "-44px -2px -44px",
    borderRadius: "6px",
    padding: "40px",
    zIndex: 1,
  },
};

export default Homepage;

