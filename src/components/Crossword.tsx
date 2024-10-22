import React, { useState, useEffect, useCallback, useRef } from 'react';
import Grid from './Grid';
import ClueList from './ClueList';
import { PuzzleData, ClueType } from '../types';
import puzzleData from '../data/puzzleData.json';
import '../styles/Crossword.css';

const Crossword: React.FC = () => {
  const [puzzle, setPuzzle] = useState<PuzzleData | null>(null);
  const [userAnswers, setUserAnswers] = useState<string[][]>([]);
  const [selectedCell, setSelectedCell] = useState<[number, number] | null>(null);
  const [direction, setDirection] = useState<'across' | 'down'>('across');
  const [selectedClue, setSelectedClue] = useState<{ number: string; type: ClueType } | null>(null);
  const [isHardMode, setIsHardMode] = useState<boolean>(true); // Set initial difficulty to Hard
  const clueListRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setPuzzle(puzzleData);
    setUserAnswers(Array(puzzleData.grid.length).fill(null).map(() => 
      Array(puzzleData.grid[0].length).fill('')
    ));
  }, []);

  const handleInputChange = useCallback((row: number, col: number, value: string) => {
    if (!puzzle) return;

    setUserAnswers(prev => {
      const newAnswers = prev.map(r => [...r]);
      newAnswers[row][col] = value.toUpperCase();
      return newAnswers;
    });

    if (value !== '') {
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
        if (puzzle.grid[row][j] !== '#') return [row, j];
      }
    } else {
      for (let i = row + 1; i < puzzle.grid.length; i++) {
        if (puzzle.grid[i][col] !== '#') return [i, col];
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

  const handleCellClick = (row: number, col: number) => {
    if (selectedCell && selectedCell[0] === row && selectedCell[1] === col) {
      const newDirection = direction === 'across' ? 'down' : 'across';
      setDirection(newDirection);
      updateSelectedClue(row, col, newDirection);
    } else {
      setSelectedCell([row, col]);
      updateSelectedClue(row, col, direction);
    }
  };

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
    const correct = userAnswers.every((row, i) =>
      row.every((cell, j) => cell === '' || cell === puzzle.grid[i][j])
    );
    alert(correct ? 'Congratulations! All answers are correct!' : 'Some answers are incorrect. Keep trying!');
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
    if (!puzzle || !selectedCell) return [];

    const [row, col] = selectedCell;
    const cells: [number, number][] = [[row, col]];

    if (direction === 'across') {
      // Check left
      for (let j = col - 1; j >= 0 && puzzle.grid[row][j] !== '#'; j--) {
        cells.unshift([row, j]);
      }
      // Check right
      for (let j = col + 1; j < puzzle.grid[row].length && puzzle.grid[row][j] !== '#'; j++) {
        cells.push([row, j]);
      }
    } else {
      // Check up
      for (let i = row - 1; i >= 0 && puzzle.grid[i][col] !== '#'; i--) {
        cells.unshift([i, col]);
      }
      // Check down
      for (let i = row + 1; i < puzzle.grid.length && puzzle.grid[i][col] !== '#'; i++) {
        cells.push([i, col]);
      }
    }

    return cells;
  }, [puzzle, selectedCell, direction]);

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

  if (!puzzle) return <div>Loading...</div>;

  return (
    <div className="crossword">
      <div className="crossword-header">
        <button onClick={checkAnswers} className="check-answers-btn">Check Answers</button>
        <button onClick={toggleDifficulty} className="difficulty-toggle">
          {isHardMode ? 'Hard' : 'Easy'}
        </button>
      </div>
      <div className="crossword-container">
        <Grid
          grid={puzzle.grid}
          userAnswers={userAnswers}
          onInputChange={handleInputChange}
          onBackspace={handleBackspace}
          onCellClick={handleCellClick}
          selectedCell={selectedCell}
          currentWordCells={getCurrentWordCells()}
          direction={direction}
        />
        <ClueList 
          ref={clueListRef}
          clues={puzzle.clues} 
          onClueClick={handleClueClick}
          selectedClue={selectedClue}
          isHardMode={isHardMode}
          toggleDifficulty={toggleDifficulty}
        />
      </div>
    </div>
  );
};

export default Crossword;
