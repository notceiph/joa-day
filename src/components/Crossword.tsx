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

  useEffect(() => {
    setPuzzle(puzzleData);
    setUserAnswers(Array(puzzleData.grid.length).fill(null).map(() => 
      Array(puzzleData.grid[0].length).fill('')
    ));
  }, []);

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
    }}>
      {children}
    </CrosswordContext.Provider>
  );
};

const Crossword: React.FC = () => {
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
  } = useContext(CrosswordContext);

  const clueListRef = useRef<HTMLDivElement>(null);

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
      setDirection(prev => prev === 'across' ? 'down' : 'across');
      return;
    }

    // Check if the clicked cell has a number
    const cellValue = puzzle.grid[row][col];
    const hasNumber = cellValue !== '.' && !isNaN(Number(cellValue));
    
    if (hasNumber) {
      // Check if this number starts both across and down clues
      const number = cellValue;
      const hasAcross = puzzle.clues.across[number];
      const hasDown = puzzle.clues.down[number];

      if (hasAcross && hasDown) {
        // If both directions are available, prefer the current direction
        // If no current direction (first click), default to across
        setDirection(prev => prev || 'across');
      } else if (hasAcross) {
        setDirection('across');
      } else if (hasDown) {
        setDirection('down');
      }
    }

    setSelectedCell([row, col]);
  }, [puzzle, selectedCell]);

  const updateSelectedClue = (row: number, col: number, currentDirection: ClueType) => {
    if (!puzzle) return;
    const cellContent = puzzle.grid[row][col];
    if (cellContent !== '#') {
      const clueNumber = findClueNumber(row, col, currentDirection);
      setSelectedClue({ number: clueNumber, type: currentDirection });
      scrollToClue(clueNumber, currentDirection);
    }
  };

  const findClueNumber = (row: number, col: number, type: ClueType): string => {
    if (type === 'across') {
      while (col > 0 && puzzle!.grid[row][col - 1] !== '#') {
        col--;
      }
    } else {
      while (row > 0 && puzzle!.grid[row - 1][col] !== '#') {
        row--;
      }
    }
    return puzzle!.grid[row][col];
  };

  const checkAnswers = () => {
    if (!puzzle) return;

    let incorrectCount = 0; // Initialize a counter for incorrect answers
    let hasInput = false; // Track if there is any user input
    let correctCount = 0; // Track correct answers

    // Check across clues
    for (const clueNumber in puzzle.clues.across) {
      const clue = puzzle.clues.across[clueNumber];
      const [startRow, startCol] = findStartingCell(clueNumber, 'across');
      if (startRow !== -1 && startCol !== -1) {
        const userAnswer = userAnswers[startRow].slice(startCol, startCol + clue.answer.length).join('');
        if (userAnswer.toUpperCase() !== clue.answer.toUpperCase()) {
          incorrectCount++;
          console.log(`Incorrect answer for clue ${clueNumber}: expected "${clue.answer}", got "${userAnswer}"`);
        } else {
          correctCount++; // Increment correct count
          hasInput = true; // Mark that there is at least one input
        }
      }
    }

    // Check down clues
    for (const clueNumber in puzzle.clues.down) {
      const clue = puzzle.clues.down[clueNumber];
      const [startRow, startCol] = findStartingCell(clueNumber, 'down');
      if (startRow !== -1 && startCol !== -1) {
        const userAnswer = userAnswers.slice(startRow, startRow + clue.answer.length).map(row => row[startCol]).join('');
        if (userAnswer.toUpperCase() !== clue.answer.toUpperCase()) {
          incorrectCount++;
          console.log(`Incorrect answer for clue ${clueNumber}: expected "${clue.answer}", got "${userAnswer}"`);
        } else {
          correctCount++; // Increment correct count
          hasInput = true; // Mark that there is at least one input
        }
      }
    }

    // Update the correct answers count state
    setCorrectAnswersCount(correctCount);

    // Alert the user with the result only if there is input
    if (!hasInput) {
      alert('Please enter some answers before checking!');
    } else if (incorrectCount === 0) {
      alert('Congratulations! All answers are correct!');
    } else {
      alert(`Some answers are incorrect. You have ${incorrectCount} incorrect answer(s). Keep trying!`);
    }
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
      alert('Please select a word to check');
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
      alert('This word is correct!');
    } else if (userAnswer.length === 0) {
      alert('Please enter some letters before checking');
    } else {
      // Pass incorrect positions to Grid component
      setIncorrectCells(incorrectPositions);
      setTimeout(() => setIncorrectCells([]), 2000); // Clear after 2 seconds
    }
  };

  if (!puzzle) return <div>Loading...</div>;

  return (
    <div onKeyDown={handleKeyDown} tabIndex={0} className="crossword">
      <LoadingBar progress={calculateProgress()} /> {/* Render the loading bar */}
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
