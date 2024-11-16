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
  const [showAnswers, setShowAnswers] = useState(false);

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

  const handleToggleAnswers = () => {
    setShowAnswers(!showAnswers);
  };

  const handleResetGames = () => {
    setIsWordleCompleted(false);
    setIsCrosswordCompleted(false);
    setWordleState(null);
    setShowCompletionToast(false);
    setShowDevTools(false);
  };

  const handleToggleToast = () => {
    setShowCompletionToast(!showCompletionToast);
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
      
      {/* Updated Dev Tools Modal */}
      {showDevTools && (
        <div className="dev-tools-overlay">
          <div className="dev-tools-modal">
            <div className="dev-tools-header">
              <h3>Dev Tools</h3>
              <button 
                onClick={() => setShowDevTools(false)}
                className="modal-close-btn"
                aria-label="Close dev tools"
              >
                ×
              </button>
            </div>
            <div className="dev-tools-content">
              <div className="dev-tools-section">
                <h4>Game Completion</h4>
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

              <div className="dev-tools-section">
                <h4>Game Controls</h4>
                <button 
                  onClick={handleResetGames}
                  className="dev-tool-btn warning"
                >
                  Reset All Games
                </button>
                <button 
                  onClick={handleToggleAnswers}
                  className="dev-tool-btn"
                >
                  {showAnswers ? 'Hide Answers' : 'Show Answers'}
                </button>
                <button 
                  onClick={() => setCurrentGame(currentGame === 'crossword' ? 'wordle' : 'crossword')}
                  className="dev-tool-btn"
                >
                  Switch Game
                </button>
              </div>

              <div className="dev-tools-section">
                <h4>UI Controls</h4>
                <button 
                  onClick={handleToggleToast}
                  className="dev-tool-btn"
                >
                  Toggle Completion Modal
                </button>
              </div>

              <div className="dev-tools-section">
                <h4>Game State</h4>
                <div className="dev-tools-info">
                  <p>Wordle: {isWordleCompleted ? '✅' : '❌'}</p>
                  <p>Crossword: {isCrosswordCompleted ? '✅' : '❌'}</p>
                  <p>Current Game: {currentGame}</p>
                </div>
              </div>
            </div>
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
              <h2>shhhhhhhh</h2>
              <button 
                onClick={() => setShowCompletionToast(false)}
                className="modal-close-btn"
                aria-label="Close completion modal"
              >
                ×
              </button>
            </div>
            <div className="completion-content">
              <p>this is only part 1 pal...</p>
              <p>do not let anyone hear this audio, this is for your ears only</p>
              <img 
                src="/shh.gif" 
                alt="shhh GIF" 
                className="completion-gif"
              />
              <br></br>
              <audio 
                controls
                className="completion-audio"
                aria-label="Completion celebration audio"
              >
                <source src="/voicememo.mp3" type="audio/mpeg" />
                Your browser does not support the audio element.
              </audio>
              <div className="completion-hearts">
                😩🤪🥳🤓😈💯
              </div>
              <a 
                href="https://open.spotify.com/playlist/your_playlist_id" 
                target="_blank" 
                rel="noopener noreferrer"
                className="spotify-link"
              >
                click here after you listen 🤍
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
