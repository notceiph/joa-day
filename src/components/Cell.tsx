import React from 'react';
import '../styles/Cell.css';
import { ClueType } from '../types';

interface CellProps {
  value: string;
  onClick: () => void;
  isBlack: boolean;
  number?: number;
  isSelected: boolean;
  isHighlighted: boolean;
  direction: ClueType;
}

const Cell: React.FC<CellProps> = ({
  value,
  onClick,
  isBlack,
  number,
  isSelected,
  isHighlighted,
  direction
}) => {
  if (isBlack) {
    return <div className="cell black"></div>;
  }

  const cellClassName = `cell ${isSelected ? 'selected' : ''} ${isHighlighted ? 'highlighted' : ''} ${direction}`;

  return (
    <div className={cellClassName} onClick={onClick}>
      {number && <span className="cell-number">{number}</span>}
      <div className="cell-content">{value}</div>
    </div>
  );
};

export default Cell;
