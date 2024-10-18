import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Homepage from "./views/Homepage.js";
import ToneRunnerMenu from "./views/ToneRunnerMenu.js";
import ToneRunner from "./views/ToneRunner.js";

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Homepage />} />
        <Route path="/tonerunnermenu" element={<ToneRunnerMenu />} />
        <Route path="/tonerunner" element={<ToneRunner />} />
      </Routes>
    </Router>
  );
};

export default App;
