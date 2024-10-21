import React, { useState, useEffect, useCallback } from 'react';
import Grid from './Grid';
import ClueList from './ClueList';
import { PuzzleData } from '../types';
import puzzleData from '../data/puzzleData.json';
import '../styles/Crossword.css';

const Crossword: React.FC = () => {
  const [puzzle, setPuzzle] = useState<PuzzleData | null>(null);
  const [userAnswers, setUserAnswers] = useState<string[][]>([]);
  const [selectedCell, setSelectedCell] = useState<[number, number] | null>(null);
  const [direction, setDirection] = useState<'across' | 'down'>('across');

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
      newAnswers[row][col] = '';
      return newAnswers;
    });

    const prevCell = getPreviousCell(row, col);
    if (prevCell) {
      setSelectedCell(prevCell);
    }
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
      setDirection(prev => prev === 'across' ? 'down' : 'across');
    } else {
      setSelectedCell([row, col]);
    }
  };

  const checkAnswers = () => {
    if (!puzzle) return;
    const correct = userAnswers.every((row, i) =>
      row.every((cell, j) => cell === '' || cell === puzzle.grid[i][j])
    );
    alert(correct ? 'Congratulations! All answers are correct!' : 'Some answers are incorrect. Keep trying!');
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

  if (!puzzle) return <div>Loading...</div>;

  return (
    <div className="crossword">
      <div className="crossword-container">
        <Grid
          grid={puzzle.grid}
          userAnswers={userAnswers}
          onInputChange={handleInputChange}
          onBackspace={handleBackspace}
          onCellClick={handleCellClick}
          selectedCell={selectedCell}
          direction={direction}
          currentWordCells={getCurrentWordCells()}
        />
        <ClueList clues={puzzle.clues} />
      </div>
      <button onClick={checkAnswers} className="check-answers-btn">Check Answers</button>
    </div>
  );
};

export default Crossword;
