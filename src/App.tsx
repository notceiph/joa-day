import React, { useState } from 'react';
import Crossword from './components/Crossword';
import WordleGame from './components/WordleGame';
import './App.css';

const App: React.FC = () => {
  const [currentGame, setCurrentGame] = useState<'crossword' | 'wordle'>('crossword');

  const handleGameSwitch = () => {
    setCurrentGame(currentGame === 'crossword' ? 'wordle' : 'crossword');
  };

  const handleWordleClose = (completed: boolean) => {
    // You can handle the completion status here if needed
    setCurrentGame('crossword');
  };

  return (
    <div className="App">
      <h1>happy birthday joa :)</h1>
      <h4>you deserve all the love and recognition in the world 💕</h4>
      <button 
        onClick={handleGameSwitch}
        className="game-switch-btn"
      >
        Switch to {currentGame === 'crossword' ? 'Wordle' : 'Crossword'}
      </button>
      <div style={{ display: currentGame === 'crossword' ? 'block' : 'none' }}>
        <Crossword />
      </div>
      {currentGame === 'wordle' && (
        <WordleGame 
          index={0} 
          onClose={handleWordleClose}
        />
      )}
    </div>
  );
};

export default App;
