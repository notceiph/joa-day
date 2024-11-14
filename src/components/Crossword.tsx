import React, { useState, useEffect, useCallback, useRef, createContext, useContext } from 'react';
import Grid from './Grid';
import ClueList from './ClueList';
import LoadingBar from './LoadingBar'; // Import the new LoadingBar component
import { PuzzleData, ClueType } from '../types';
import puzzleData from '../data/puzzleData.json';
import '../styles/Crossword.css';

// Create a context for the crossword state
const CrosswordContext = createContext<any>(null);

const CrosswordProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [puzzle, setPuzzle] = useState<PuzzleData | null>(null);
  const [userAnswers, setUserAnswers] = useState<string[][]>([]);
  const [selectedCell, setSelectedCell] = useState<[number, number] | null>(null);
  const [direction, setDirection] = useState<'across' | 'down'>('across');
  const [selectedClue, setSelectedClue] = useState<{ number: string; type: ClueType } | null>(null);
  const [isHardMode, setIsHardMode] = useState<boolean>(true); // Set initial difficulty to Hard
  const [correctAnswersCount, setCorrectAnswersCount] = useState<number>(0); // New state for correct answers
  const totalCluesCount = Object.keys(puzzleData.clues.across).length + Object.keys(puzzleData.clues.down).length; // Total clues
  const [incorrectCells, setIncorrectCells] = useState<[number, number][]>([]);
  const [modalMessage, setModalMessage] = useState<string | null>(null);
  const [showWelcomeModal, setShowWelcomeModal] = useState<boolean>(true);

  useEffect(() => {
    setPuzzle(puzzleData);
    setUserAnswers(Array(puzzleData.grid.length).fill(null).map(() => 
      Array(puzzleData.grid[0].length).fill('')
    ));
  }, []);

  // Save modal state when it's closed
  const handleCloseWelcomeModal = () => {
    setShowWelcomeModal(false);
    localStorage.setItem('hasSeenWelcome', 'true');
  };

  return (
    <CrosswordContext.Provider value={{
      puzzle,
      userAnswers,
      setUserAnswers,
      selectedCell,
      setSelectedCell,
      direction,
      setDirection,
      selectedClue,
      setSelectedClue,
      isHardMode,
      setIsHardMode,
      correctAnswersCount, // Provide correct answers count
      setCorrectAnswersCount, // Provide setter for correct answers count
      totalCluesCount, // Provide total clues count
      incorrectCells,
      setIncorrectCells,
      modalMessage,
      setModalMessage,
      showWelcomeModal,
      setShowWelcomeModal,
    }}>
      {children}
    </CrosswordContext.Provider>
  );
};

interface CrosswordProps {
  onComplete: (completed: boolean) => void;
}

const Crossword: React.FC<CrosswordProps> = ({ onComplete }) => {
  const {
    puzzle,
    userAnswers,
    setUserAnswers,
    selectedCell,
    setSelectedCell,
    direction,
    setDirection,
    selectedClue,
    setSelectedClue,
    isHardMode,
    setIsHardMode,
    correctAnswersCount,
    setCorrectAnswersCount,
    totalCluesCount,
    incorrectCells,
    setIncorrectCells,
    modalMessage,
    setModalMessage,
    showWelcomeModal,
    setShowWelcomeModal,
  } = useContext(CrosswordContext);

  const clueListRef = useRef<HTMLDivElement>(null);
  const modalTimeoutRef = useRef<number | null>(null);

  const calculateProgress = () => {
    if (totalCluesCount === 0) return 0; // Prevent division by zero
    return (correctAnswersCount / totalCluesCount) * 100; // Calculate progress percentage
  };

  const handleInputChange = useCallback((row: number, col: number, value: string) => {
    if (!puzzle) return;

    // Validate input: only allow letters
    if (!/^[A-Z]*$/.test(value.toUpperCase())) return;

    const upperCaseValue = value.toUpperCase(); // Convert input to uppercase

    setUserAnswers(prev => {
      const newAnswers = prev.map(r => [...r]);
      newAnswers[row][col] = upperCaseValue; // Store the uppercase value
      return newAnswers;
    });

    if (upperCaseValue !== '') {
      const nextCell = getNextCell(row, col);
      if (nextCell) {
        setSelectedCell(nextCell);
      }
    }
  }, [puzzle, direction]);

  const handleBackspace = useCallback((row: number, col: number) => {
    if (!puzzle) return;

    setUserAnswers(prev => {
      const newAnswers = prev.map(r => [...r]);
      if (newAnswers[row][col] !== '') {
        // If the current cell has a value, clear it
        newAnswers[row][col] = '';
      } else {
        // If the current cell is empty, move to the previous cell and clear it
        const prevCell = getPreviousCell(row, col);
        if (prevCell) {
          const [prevRow, prevCol] = prevCell;
          newAnswers[prevRow][prevCol] = '';
          setSelectedCell(prevCell);
        }
      }
      return newAnswers;
    });
  }, [puzzle, direction]);

  const getNextCell = (row: number, col: number): [number, number] | null => {
    if (!puzzle) return null;

    if (direction === 'across') {
      for (let j = col + 1; j < puzzle.grid[row].length; j++) {
        if (puzzle.grid[row][j] === '#') break; // Stop at '#'
        if (puzzle.grid[row][j] === '.' || !isNaN(Number(puzzle.grid[row][j]))) {
          return [row, j]; // Move to '.' or a number
        }
      }
    } else {
      for (let i = row + 1; i < puzzle.grid.length; i++) {
        if (puzzle.grid[i][col] === '#') break; // Stop at '#'
        if (puzzle.grid[i][col] === '.' || !isNaN(Number(puzzle.grid[i][col]))) {
          return [i, col]; // Move to '.' or a number
        }
      }
    }

    return null;
  };

  const getPreviousCell = (row: number, col: number): [number, number] | null => {
    if (!puzzle) return null;

    if (direction === 'across') {
      for (let j = col - 1; j >= 0; j--) {
        if (puzzle.grid[row][j] !== '#') return [row, j];
      }
    } else {
      for (let i = row - 1; i >= 0; i--) {
        if (puzzle.grid[i][col] !== '#') return [i, col];
      }
    }

    return null;
  };

  const handleCellClick = useCallback((row: number, col: number) => {
    if (!puzzle || puzzle.grid[row][col] === '#') return;

    // If clicking the same cell, toggle direction
    if (selectedCell && selectedCell[0] === row && selectedCell[1] === col) {
      const newDirection = direction === 'across' ? 'down' : 'across';
      setDirection(newDirection);
      // Update the selected clue when toggling direction
      updateSelectedClue(row, col, newDirection);
      return;
    }

    // Check if the clicked cell has a number
    const cellValue = puzzle.grid[row][col];
    const hasNumber = cellValue !== '.' && !isNaN(Number(cellValue));
    
    let newDirection = direction;
    if (hasNumber) {
      // Check if this number starts both across and down clues
      const number = cellValue;
      const hasAcross = puzzle.clues.across[number];
      const hasDown = puzzle.clues.down[number];

      if (hasAcross && hasDown) {
        // If both directions are available, prefer the current direction
        // If no current direction (first click), default to across
        newDirection = direction || 'across';
      } else if (hasAcross) {
        newDirection = 'across';
      } else if (hasDown) {
        newDirection = 'down';
      }
    }

    setDirection(newDirection);
    setSelectedCell([row, col]);
    
    // Find the clue number for the current word and update selected clue
    updateSelectedClue(row, col, newDirection);
  }, [puzzle, selectedCell, direction]);

  const updateSelectedClue = useCallback((row: number, col: number, currentDirection: ClueType) => {
    if (!puzzle) return;
    
    // Find the start of the current word
    let startRow = row;
    let startCol = col;
    
    if (currentDirection === 'across') {
      while (startCol > 0 && puzzle.grid[row][startCol - 1] !== '#') {
        startCol--;
      }
    } else {
      while (startRow > 0 && puzzle.grid[startRow - 1][col] !== '#') {
        startRow--;
      }
    }
    
    // Get the clue number from the starting cell
    const clueNumber = puzzle.grid[startRow][startCol];
    if (clueNumber !== '#' && clueNumber !== '.') {
      setSelectedClue({ number: clueNumber, type: currentDirection });
      scrollToClue(clueNumber, currentDirection);
    }
  }, [puzzle]);

  const checkAnswers = () => {
    if (!puzzle) return;

    let hasInput = false;
    let incorrectCount = 0;

    // Check each answer
    for (let row = 0; row < puzzle.grid.length; row++) {
      for (let col = 0; col < puzzle.grid[0].length; col++) {
        if (puzzle.grid[row][col] !== null) {
          if (userAnswers[row][col] !== '') {
            hasInput = true;
          }
          if (userAnswers[row][col].toUpperCase() !== puzzle.grid[row][col]) {
            incorrectCount++;
          }
        }
      }
    }

    // Update the correct answers count state
    const correctCount = totalCluesCount - incorrectCount;
    setCorrectAnswersCount(correctCount);

    // Show modal message instead of alert
    if (!hasInput) {
      setModalMessage('Please enter some answers before checking!');
    } else if (incorrectCount === 0) {
      setModalMessage('Congratulations! All answers are correct!');
      onComplete(true);
    } else {
      setModalMessage(`Some answers are incorrect. You have ${incorrectCount} incorrect answer(s). Keep trying!`);
    }

    // Auto-hide the modal after 3 seconds
    setTimeout(() => setModalMessage(null), 3000);
  };

  const handleClueClick = useCallback((number: string, type: ClueType) => {
    setSelectedClue({ number, type });
    const [row, col] = findStartingCell(number, type);
    if (row !== -1 && col !== -1) {
      setSelectedCell([row, col]);
      setDirection(type);
      scrollToClue(number, type);
    }
  }, [puzzle]);

  const findStartingCell = (number: string, type: ClueType): [number, number] => {
    if (!puzzle) return [-1, -1];
    for (let i = 0; i < puzzle.grid.length; i++) {
      for (let j = 0; j < puzzle.grid[i].length; j++) {
        if (puzzle.grid[i][j] === number) {
          return [i, j];
        }
      }
    }
    return [-1, -1];
  };

  const getCurrentWordCells = useCallback(() => {
    if (!selectedCell || !puzzle) return [];

    const [row, col] = selectedCell;
    const cells: [number, number][] = [];
    
    // Find the starting cell of the current word
    let startRow = row;
    let startCol = col;
    
    if (direction === 'across') {
      // Move left until we hit a black cell or the edge
      while (startCol > 0 && puzzle.grid[row][startCol - 1] !== '#') {
        startCol--;
      }
      
      // Collect all cells from start to end
      let currentCol = startCol;
      while (currentCol < puzzle.grid[row].length && puzzle.grid[row][currentCol] !== '#') {
        cells.push([row, currentCol]);
        currentCol++;
      }
    } else {
      // Move up until we hit a black cell or the edge
      while (startRow > 0 && puzzle.grid[startRow - 1][col] !== '#') {
        startRow--;
      }
      
      // Collect all cells from start to end
      let currentRow = startRow;
      while (currentRow < puzzle.grid.length && puzzle.grid[currentRow][col] !== '#') {
        cells.push([currentRow, col]);
        currentRow++;
      }
    }

    return cells;
  }, [selectedCell, puzzle, direction]);

  const scrollToClue = (number: string, type: ClueType) => {
    if (clueListRef.current) {
      const clueElement = clueListRef.current.querySelector(`[data-clue-id="${type}-${number}"]`);
      if (clueElement) {
        clueElement.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }
  };

  const toggleDifficulty = () => {
    setIsHardMode(!isHardMode);
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (!selectedCell) return;

    const [row, col] = selectedCell;
    switch (event.key) {
      case 'ArrowUp':
        if (row > 0) setSelectedCell([row - 1, col]);
        break;
      case 'ArrowDown':
        if (row < puzzle.grid.length - 1) setSelectedCell([row + 1, col]);
        break;
      case 'ArrowLeft':
        if (col > 0) setSelectedCell([row, col - 1]);
        break;
      case 'ArrowRight':
        if (col < puzzle.grid[row].length - 1) setSelectedCell([row, col + 1]);
        break;
      default:
        break;
    }
  };

  const checkCurrentWord = () => {
    if (!puzzle || !selectedCell || !direction) return;

    const currentCells = getCurrentWordCells();
    if (currentCells.length === 0) {
      showModal('Please select a word to check');
      return;
    }

    // Find the clue number for the current word
    const [startRow, startCol] = currentCells[0];
    const clueNumber = findClueNumber(startRow, startCol, direction);
    const clue = puzzle.clues[direction][clueNumber];

    if (!clue) return;

    // Get the user's answer for the current word
    let userAnswer = '';
    if (direction === 'across') {
      userAnswer = currentCells.map(([row, col]) => userAnswers[row][col]).join('');
    } else {
      userAnswer = currentCells.map(([row, col]) => userAnswers[row][col]).join('');
    }

    // Compare with correct answer and mark incorrect letters
    const correctAnswer = clue.answer;
    const incorrectPositions = currentCells.filter((_, index) => 
      userAnswer[index]?.toUpperCase() !== correctAnswer[index]?.toUpperCase() && 
      userAnswer[index] !== ''
    );

    if (incorrectPositions.length === 0 && userAnswer.length > 0) {
      showModal('This word is correct!');
    } else if (userAnswer.length === 0) {
      showModal('Please enter some letters before checking');
    } else {
      showModal('Some letters are incorrect. Keep trying!');
      setIncorrectCells(incorrectPositions);
      setTimeout(() => setIncorrectCells([]), 2000);
    }
  };

  const showModal = (message: string) => {
    // Clear any existing timeout
    if (modalTimeoutRef.current) {
      clearTimeout(modalTimeoutRef.current);
    }
    
    // Show the new message
    setModalMessage(message);
    
    // Set new timeout and store its ID
    modalTimeoutRef.current = window.setTimeout(() => {
      setModalMessage(null);
      modalTimeoutRef.current = null;
    }, 3000);
  };

  // Clean up timeout on component unmount
  useEffect(() => {
    return () => {
      if (modalTimeoutRef.current) {
        clearTimeout(modalTimeoutRef.current);
      }
    };
  }, []);

  const handleCloseWelcomeModal = useCallback(() => {
    setShowWelcomeModal(false);
    localStorage.setItem('hasSeenWelcome', 'true');
  }, [setShowWelcomeModal]);

  const WelcomeModal = () => (
    <div className="welcome-modal-overlay" onClick={handleCloseWelcomeModal}>
      <div className="welcome-modal" onClick={e => e.stopPropagation()}>
        <h2>happy mf birthday to the cutest girl in the world ❤🎉</h2>
        <p>
          it's your special day, and it's now one of my favorites
          <img src="/bugcat-capoo.gif" alt="Bugcat Nod" className="gif-icon" />
        </p>
        <p>
          when we met, i had no interest in crossword puzzles or wordles at all LOL but i did really enjoy watching you work through it all, and it slowly became something we bonded over, our little routine... :')
        </p>
        <p>
          so what better way to celebrate your special day, i spent waaaaaaaay too much time doing this but i hope you have fun playing
        </p>
        <button onClick={handleCloseWelcomeModal}>
          start
        </button>
      </div>
    </div>
  );

  if (!puzzle) return <div>Loading...</div>;

  return (
    <div onKeyDown={handleKeyDown} tabIndex={0} className="crossword">
      {showWelcomeModal && <WelcomeModal />}
      <button 
        className="show-welcome-btn"
        onClick={() => setShowWelcomeModal(true)}
        aria-label="Open Welcome Message"
      >
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          viewBox="0 0 24 24" 
          fill="currentColor" 
          className="gift-icon"
        >
          <path d="M9.375 3a1.875 1.875 0 0 0-1.875 1.875c0 1.036.84 1.875 1.875 1.875h.375a3.75 3.75 0 0 1 2.625 1.052l.076.073a.75.75 0 0 0 1.053-.005l.066-.064A3.75 3.75 0 0 1 14.625 6.75h.375a1.875 1.875 0 0 0 0-3.75h-.375a1.875 1.875 0 0 0-1.875 1.875v.375a.375.375 0 0 1-.375.375h-.75a.375.375 0 0 1-.375-.375v-.375A1.875 1.875 0 0 0 9.375 3Zm-.375 5.25a.75.75 0 0 0-.75.75v10.5c0 .414.336.75.75.75h12a.75.75 0 0 0 .75-.75V9a.75.75 0 0 0-.75-.75H9Zm6.75-4.5v3.75a.375.375 0 0 1-.375.375h-.75a.375.375 0 0 1-.375-.375V3.75a1.875 1.875 0 0 0-1.875-1.875h5.25a1.875 1.875 0 0 1 0 3.75h-.375a1.875 1.875 0 0 1-1.5-.75Z" />
        </svg>
      </button>
      <LoadingBar progress={calculateProgress()} />
      {modalMessage && (
        <div className="feedback-modal">
          <p>{modalMessage}</p>
        </div>
      )}
      <div className="crossword-header">
        <button onClick={checkAnswers} className="check-answers-btn">Check Answers</button>
        <button onClick={checkCurrentWord} className="check-word-btn">Check Word</button>
        <button onClick={toggleDifficulty} className="difficulty-toggle">
          {isHardMode ? 'Hard' : 'Easy'}
        </button>
      </div>
      <div className="crossword-container">
        <ClueList 
          ref={clueListRef}
          clues={puzzle.clues} 
          onClueClick={handleClueClick}
          selectedClue={selectedClue}
          isHardMode={isHardMode}
          toggleDifficulty={toggleDifficulty}
        />
        <Grid
          grid={puzzle.grid}
          userAnswers={userAnswers}
          onInputChange={handleInputChange}
          onBackspace={handleBackspace}
          onCellClick={handleCellClick}
          selectedCell={selectedCell}
          currentWordCells={getCurrentWordCells()}
          direction={direction}
          incorrectCells={incorrectCells}
        />
      </div>
    </div>
  );
};

// Wrap the Crossword component with the provider
const App: React.FC = () => (
  <CrosswordProvider>
    <Crossword />
  </CrosswordProvider>
);

export default App;
