import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Homepage from "./views/Homepage.js";
import Piano from "./views/ToneRunner.js";

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Homepage />} />
        <Route path="/tonerunner" element={<Piano />} />
      </Routes>
    </Router>
  );
};

export default App;
