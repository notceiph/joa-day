import React, { useState, useEffect } from 'react';
import Crossword from './components/Crossword';
import WordleGame from './components/WordleGame';
import './App.css';

const App: React.FC = () => {
  const [currentGame, setCurrentGame] = useState<'crossword' | 'wordle'>('crossword');
  const [wordleState, setWordleState] = useState<any>(null); // Store Wordle game state
  const [isWordleCompleted, setIsWordleCompleted] = useState(false);
  const [isCrosswordCompleted, setIsCrosswordCompleted] = useState(false);
  const [showCompletionToast, setShowCompletionToast] = useState(false);
  const [showDevTools, setShowDevTools] = useState(false);
  const [keySequence, setKeySequence] = useState('');

  // Check if both games are completed
  useEffect(() => {
    if (isWordleCompleted && isCrosswordCompleted) {
      setShowCompletionToast(true);
    }
  }, [isWordleCompleted, isCrosswordCompleted]);

  // Track keystrokes for dev tools activation
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      setKeySequence(prev => {
        const newSequence = (prev + e.key).slice(-4);
        if (newSequence === '/DEV') {
          setShowDevTools(true);
        }
        return newSequence;
      });
    };

    window.addEventListener('keypress', handleKeyPress);
    return () => window.removeEventListener('keypress', handleKeyPress);
  }, []);

  const handleGameSwitch = () => {
    setCurrentGame(currentGame === 'crossword' ? 'wordle' : 'crossword');
  };

  const handleWordleClose = (completed: boolean) => {
    setIsWordleCompleted(completed);
    setCurrentGame('crossword');
  };

  const handleCrosswordComplete = (completed: boolean) => {
    setIsCrosswordCompleted(completed);
  };

  const handleWordleStateChange = (newState: any) => {
    setWordleState(newState);
  };

  // Dev tools handlers
  const handleCompleteWordle = () => {
    setIsWordleCompleted(true);
    setShowDevTools(false);
  };

  const handleCompleteCrossword = () => {
    setIsCrosswordCompleted(true);
    setShowDevTools(false);
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
      
      {/* Dev Tools Modal */}
      {showDevTools && (
        <div className="dev-tools-overlay">
          <div className="dev-tools-modal">
            <h3>Dev Tools</h3>
            <div className="dev-tools-content">
              <button 
                onClick={handleCompleteWordle}
                className="dev-tool-btn"
                disabled={isWordleCompleted}
              >
                Complete Wordle {isWordleCompleted ? '(Done)' : ''}
              </button>
              <button 
                onClick={handleCompleteCrossword}
                className="dev-tool-btn"
                disabled={isCrosswordCompleted}
              >
                Complete Crossword {isCrosswordCompleted ? '(Done)' : ''}
              </button>
            </div>
            <button 
              onClick={() => setShowDevTools(false)}
              className="close-modal-btn"
            >
              Close
            </button>
          </div>
        </div>
      )}

      <div style={{ display: currentGame === 'crossword' ? 'block' : 'none' }}>
        <Crossword onComplete={handleCrosswordComplete} />
      </div>
      {currentGame === 'wordle' && (
        <WordleGame 
          index={0} 
          onClose={handleWordleClose}
          savedState={wordleState}
          onStateChange={handleWordleStateChange}
        />
      )}
      {showCompletionToast && (
        <div className="completion-modal-overlay">
          <div className="completion-modal">
            <div className="completion-modal-header">
              <h2>YOU DID IT! 🎉</h2>
              <button 
                onClick={() => setShowCompletionToast(false)}
                className="modal-close-btn"
                aria-label="Close completion modal"
              >
                ×
              </button>
            </div>
            <div className="completion-content">
              <p>Congratulations on completing both games!</p>
              <p>You're amazing, and I hope you enjoyed this little gift.</p>
              <p>I love you so much, and I hope you have the best birthday ever!</p>
              <div className="completion-hearts">
                ❤️ 💖 💝 💕 💗
              </div>
              <a 
                href="https://open.spotify.com/playlist/your_playlist_id" 
                target="_blank" 
                rel="noopener noreferrer"
                className="spotify-link"
              >
                Click here for your birthday playlist! 🎵
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
