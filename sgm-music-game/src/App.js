import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Homepage from "./views/Homepage.js";
import ToneRunnerMenu from "./views/ToneRunnerMenu.js";
import ToneRunner from "./views/ToneRunner.js";
import ToneRunnerGameOverMenu from "./views/ToneRunnerGameOverMenu.js";

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Homepage />} />
        <Route path="/tonerunnermenu" element={<ToneRunnerMenu />} />
        <Route path="/tonerunner" element={<ToneRunner />} />
        <Route path="/tonerunnergameovermenu" element={<ToneRunnerGameOverMenu />} />
      </Routes>
    </Router>
  );
};

export default App;
