import React, { useEffect, useState, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Background from "../components/Background";

function GameOver() {
    const navigate = useNavigate();
    const location = useLocation();
    const score = useState(() => location.state?.score || 0);
    console.log("score: "+score)
    const [isDarkMode, setIsDarkMode] = useState(
        localStorage.getItem("darkMode") === "true" || false
    );

    const style = {
        menu: {
            height: "100vh",
            display: "flex",
            flexDirection: "column",
            justifyContent: "flexTop",
            textAlign: "center",
        },
        gameOver: {
            fontSize: "10vh",
            fontWeight: "bold",
            textTransform: "uppercase",
            color: `${isDarkMode ? "white" : "black"}`,
            fontFamily: "Poppins-Semibold"
        },
        score: {
            fontSize: "4vh",
            fontWeight: "bold",
            textTransform: "uppercase",
            color: `${isDarkMode ? "white" : "black"}`,
            fontFamily: "Poppins-Semibold"
        },
        button: {
            backgroundColor: `${isDarkMode ? "white" : "black"}`,
            color: `${isDarkMode ? "black" : "white"}`,
            padding: "1.5vh 3vw",
            borderRadius: "2vw",
            fontSize: "2.5vh",
            cursor: "pointer",
            border: "none",
            transition: "transform 0.3s",
            fontFamily: "Poppins-Semibold",
            margin: "5px"
        }
    }
    return (
        <div style={style.menu}>
            <Background
                darkMode={isDarkMode}
                style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "100%",
                    height: "100%",
                    zIndex: -1,
                }}
            />
            <h1 style={style.gameOver}>GAME OVER</h1>
            <p style={style.score}><b>Score: </b>{score}</p>
            <div className="button-container">
                <button
                    style={style.button}
                    onClick={() => navigate("/melodymimic")}
                >
                    Play Again
                </button>
                <button style={style.button} onClick={() => navigate("/")}>
                    Main Menu
                </button>
            </div>
        </div>
    )
}


export default GameOver;