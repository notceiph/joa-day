import React from 'react';
import Crossword from './components/Crossword';
import './App.css';

const App: React.FC = () => {
  return (
    <div className="App">
      <h1>Interactive Crossword Puzzle</h1>
      <Crossword />
    </div>
  );
};

export default App;