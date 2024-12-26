import React from 'react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate from React Router
import './AboutGame.css';

const GamePage = () => {
  const navigate = useNavigate(); // Initialize useNavigate hook

  // Function to navigate back to Homepage
  const handleBackClick = () => {
    navigate('/'); // Navigate back to the homepage
  };

  return (
    <div className="game-page">
      <div className="slime-background">
        <div className="content-container">
          <button onClick={handleBackClick} className="back-button">Back to Homepage</button> {/* Back button */}

          <h1 className="title">Slime on Road</h1>
          
          <section className="section">
            <h2>Mechanics</h2>
            <div className="mechanics-grid">
              <div className="mechanic-card">
                <div className="slime-icon move"></div>
                <h3>Movement Controls</h3>
                <p>Use the arrow keys or WASD to move Rimuru across the road safely, avoiding vehicles.</p>
              </div>
              <div className="mechanic-card">
                <div className="slime-icon teleport"></div>
                <h3>Teleport Mechanic</h3>
                <p>Press Q to teleport forward three tiles and escape tricky situations in a flash. This skills has a coldown of 3s</p>
              </div>
              <div className="mechanic-card">
                <div className="slime-icon hazards"></div>
                <h3>Hazards</h3>
                <p>Cars, Trucks, and Vans will block your way. The faster you go, the more hazardous the traffic becomes!</p>
              </div>
              <div className="mechanic-card">
                <div className="slime-icon score"></div>
                <h3>Scoring System</h3>
                <p>Each successful crossing all roads awards you 1 point, vehicles speed also increase by 5. Avoid collisions to keep going!</p>
              </div>
            </div>
          </section>

          <section className="section">
            <h2>Story</h2>
            <div className="story-container">
              <p>In the heart of a bustling modern city, a quirky slime named <strong>Rimuru</strong> finds itself stranded on the wrong side of a chaotic road. Rimuru must cross this hazardous street filled with speeding cars, trucks, and vans. Can it make it to the peaceful meadows beyond?</p>
              <p>Guide Rimuru through the dangerous urban landscape, using its slime agility to dodge, jump, and teleport. Every move is a test of skill, and the further you go, the more intense the traffic becomes. It's a race against time and hazard to find safety on the other side!</p>
            </div>
          </section>

          <section className="section">
            <h2>Development Team</h2>
            <div className="team-grid">
              <div className="team-member">
                <div className="member-avatar avatar1"></div>
                <h3>Christian Isiderio</h3>
                <p>Game Director/Developer</p>
                <a href="https://web.facebook.com/christ111503" target="_blank">Facebook</a>
              </div>

              <div className="team-member">
                <div className="member-avatar avatar2"></div>
                <h3>Lance Desoloc</h3>
                <p>Developer</p>
                <a href="https://web.facebook.com/maikeru.raansu" target="_blank">Facebook</a>
              </div>

              <div className="team-member">
                <div className="member-avatar avatar3"></div>
                <h3>Samantha Bulac</h3>
                <p>Artist</p>
                <a href="https://web.facebook.com/samantha.bulac" target="_blank">Facebook</a>
              </div>

            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default GamePage;
