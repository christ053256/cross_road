import React from 'react';
import './HitUI.css'; // Make sure to style your UI appropriately

function HitUI({ onContinue }) {
  return (
    <div className="hit-ui-overlay">
      <div className="hit-ui-rectangle">
        <h2>Game Paused</h2>
        <div className="hit-ui-buttons">
          <button className="hit-ui-button continue" onClick={onContinue}>
            Continue
          </button>
          <button
            className="hit-ui-button quit"
            onClick={() => console.log('Leaving game')}
          >
            Quit
          </button>
        </div>
      </div>
    </div>
  );
}

export default HitUI;
