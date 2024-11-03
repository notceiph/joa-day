import React, { forwardRef } from 'react';
import '../styles/ClueList.css';
import { ClueType } from '../types';

export interface ClueListProps {
  clues: {
    across: { [key: string]: { easy: string; hard: string } };
    down: { [key: string]: { easy: string; hard: string } };
  };
  onClueClick: (number: string, type: ClueType) => void;
  selectedClue: { number: string; type: ClueType } | null;
  isHardMode: boolean;
  toggleDifficulty: () => void;
}

const ClueList = forwardRef<HTMLDivElement, ClueListProps>(({ clues, onClueClick, selectedClue, isHardMode }, ref) => {
  const renderClueSection = (type: ClueType, clueList: { [key: string]: { easy: string; hard: string } }) => (
    <div className="clue-section">
      <h3>{type.charAt(0).toUpperCase() + type.slice(1)}</h3>
      <div className="clue-container">
        {Object.entries(clueList).map(([number, clue]) => (
          <div
            key={`${type}-${number}`}
            data-clue-id={`${type}-${number}`}
            className={`clue ${selectedClue?.number === number && selectedClue?.type === type ? 'selected' : ''}`}
            onClick={() => onClueClick(number, type)}
          >
            <span className="clue-number">{number}</span>
            <span className="clue-text" dangerouslySetInnerHTML={{ __html: isHardMode ? clue.hard : clue.easy }} />
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="clue-list" ref={ref}>
      <div className="clue-list-container">
        {renderClueSection('across', clues.across)}
        {renderClueSection('down', clues.down)}
      </div>
    </div>
  );
});

export default ClueList;
