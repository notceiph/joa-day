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
  isIncorrect: boolean;
}

const Cell: React.FC<CellProps> = ({
  value,
  onClick,
  isBlack,
  number,
  isSelected,
  isHighlighted,
  direction,
  isIncorrect
}) => {
  if (isBlack) {
    return <div className="cell black"></div>;
  }

  const cellClassName = `cell ${isSelected ? 'selected' : ''} ${isHighlighted ? 'highlighted' : ''} ${direction} ${isIncorrect ? 'incorrect' : ''}`;

  return (
    <div className={cellClassName} onClick={onClick}>
      {number && <span className="cell-number">{number}</span>}
      <div className="cell-content">{value}</div>
      {isIncorrect && <div className="incorrect-mark">✕</div>}
    </div>
  );
};

export default Cell;
