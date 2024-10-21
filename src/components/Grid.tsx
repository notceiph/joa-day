import React from 'react';
import Cell from './Cell';
import '../styles/Grid.css';

interface GridProps {
  grid: string[][];
  userAnswers: string[][];
  onInputChange: (row: number, col: number, value: string) => void;
  onBackspace: (row: number, col: number) => void;
  onCellClick: (row: number, col: number) => void;
  selectedCell: [number, number] | null;
  direction: 'across' | 'down';
}

const Grid: React.FC<GridProps> = ({
  grid,
  userAnswers,
  onInputChange,
  onBackspace,
  onCellClick,
  selectedCell,
  direction
}) => {
  const isHighlighted = (row: number, col: number) => {
    if (!selectedCell) return false;
    const [selectedRow, selectedCol] = selectedCell;
    if (direction === 'across') {
      return row === selectedRow;
    } else {
      return col === selectedCol;
    }
  };

  return (
    <div className="grid">
      {grid.map((row, rowIndex) => (
        <div key={rowIndex} className="row">
          {row.map((cell, colIndex) => (
            <Cell
              key={`${rowIndex}-${colIndex}`}
              value={userAnswers[rowIndex][colIndex]}
              onChange={(value) => onInputChange(rowIndex, colIndex, value)}
              onBackspace={() => onBackspace(rowIndex, colIndex)}
              onClick={() => onCellClick(rowIndex, colIndex)}
              isBlack={cell === '#'}
              number={cell !== '#' && cell !== '.' ? parseInt(cell) : undefined}
              isSelected={selectedCell ? selectedCell[0] === rowIndex && selectedCell[1] === colIndex : false}
              isHighlighted={isHighlighted(rowIndex, colIndex)}
            />
          ))}
        </div>
      ))}
    </div>
  );
};

export default Grid;