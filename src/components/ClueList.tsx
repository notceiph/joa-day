import React from 'react';
import '../styles/ClueList.css';
import { ClueType } from '../types';

interface ClueListProps {
  clues: {
    across: { [key: string]: string };
    down: { [key: string]: string };
  };
  onClueClick: (number: string, type: ClueType) => void;
  selectedClue: { number: string; type: ClueType } | null;
}

const ClueList: React.FC<ClueListProps> = ({ clues, onClueClick, selectedClue }) => {
  const renderClueSection = (type: ClueType, clueList: { [key: string]: string }) => (
    <div className="clue-section">
      <h3>{type.charAt(0).toUpperCase() + type.slice(1)}</h3>
      {Object.entries(clueList).map(([number, clue]) => (
        <p
          key={`${type}-${number}`}
          className={`clue ${selectedClue?.number === number && selectedClue?.type === type ? 'selected' : ''}`}
          onClick={() => onClueClick(number, type)}
        >
          <strong>{number}.</strong> {clue}
        </p>
      ))}
    </div>
  );

  return (
    <div className="clue-list">
      {renderClueSection('across', clues.across)}
      {renderClueSection('down', clues.down)}
    </div>
  );
};

export default ClueList;
