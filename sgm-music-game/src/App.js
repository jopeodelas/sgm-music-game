// src/App.js
import React from 'react';
import Piano from './Scene/Piano'; // Import the Piano component
import './App.css'; // You can keep this or remove if not needed

function App() {
  return (
    <div className="App">
      <Piano /> {/* This will render the 3D piano game */}
    </div>
  );
}

export default App;
