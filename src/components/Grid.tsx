import React, { useRef, useEffect } from 'react';
import Cell from './Cell';
import '../styles/Grid.css';
import { ClueType } from '../types';

interface GridProps {
  grid: string[][];
  userAnswers: string[][];
  onInputChange: (row: number, col: number, value: string) => void;
  onBackspace: (row: number, col: number) => void;
  onCellClick: (row: number, col: number) => void;
  selectedCell: [number, number] | null;
  currentWordCells: [number, number][];
  direction: ClueType;
  incorrectCells: [number, number][];
}

const Grid: React.FC<GridProps> = ({
  grid,
  userAnswers,
  onInputChange,
  onBackspace,
  onCellClick,
  selectedCell,
  currentWordCells,
  direction,
  incorrectCells
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  const isHighlighted = (row: number, col: number) => {
    return currentWordCells.some(([r, c]) => r === row && c === col);
  };

  useEffect(() => {
    if (selectedCell && inputRef.current) {
      inputRef.current.focus();
    }
  }, [selectedCell]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (gridRef.current && !gridRef.current.contains(e.target as Node)) {
        if (inputRef.current) {
          inputRef.current.blur();
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleGridClick = () => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!selectedCell) return;

    const [row, col] = selectedCell;
    
    if (e.key === 'Backspace') {
      e.preventDefault();
      onBackspace(row, col);
      return;
    }

    if (e.key.length === 1 && /^[A-Za-z]$/.test(e.key)) {
      e.preventDefault();
      onInputChange(row, col, e.key);
    }
  };

  return (
    <div 
      className="grid-container" 
      ref={gridRef}
      onClick={handleGridClick}
      onMouseDown={(e) => e.preventDefault()}
    >
      <input
        ref={inputRef}
        type="text"
        className="hidden-input"
        onKeyDown={handleKeyDown}
        value=""
        onChange={() => {}}
        aria-label="Crossword input"
        onBlur={(e) => {
          if (gridRef.current?.contains(e.relatedTarget as Node)) {
            e.preventDefault();
            inputRef.current?.focus();
          }
        }}
      />
      <div className="grid">
        {grid.map((row, rowIndex) => (
          <div key={rowIndex} className="row">
            {row.map((cell, colIndex) => (
              <Cell
                key={`${rowIndex}-${colIndex}`}
                value={userAnswers[rowIndex][colIndex]}
                onClick={() => onCellClick(rowIndex, colIndex)}
                isBlack={cell === '#'}
                number={cell !== '#' && cell !== '.' ? parseInt(cell) : undefined}
                isSelected={selectedCell ? selectedCell[0] === rowIndex && selectedCell[1] === colIndex : false}
                isHighlighted={isHighlighted(rowIndex, colIndex)}
                direction={direction}
                isIncorrect={incorrectCells.some(([row, col]) => row === rowIndex && col === colIndex)}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Grid;
