// src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';  // Import Router and Routes
import Homepage from './objects/HomePage.jsx'; // Homepage component
import AboutGame from './objects/AboutGame.jsx'; // AboutGame component (you'll need to create this if not already done)
import './App.css';

const App = () => {
  return (
    <Router>
      <Routes>
        {/* Define Routes for each page */}
        <Route path="/" element={<Homepage />} /> {/* Home page route */}
        <Route path="/about-game" element={<AboutGame />} /> {/* About Game page route */}
      </Routes>
    </Router>
  );
};

export default App;
