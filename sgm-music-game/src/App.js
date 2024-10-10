import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Homepage from "./Scene/Homepage";
import Piano from "./Scene/Piano";

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Homepage />} />
        <Route path="/piano" element={<Piano />} />
      </Routes>
    </Router>
  );
};

export default App;