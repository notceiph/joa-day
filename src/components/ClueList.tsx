import React from 'react';
import '../styles/ClueList.css';

interface ClueListProps {
  clues: {
    across: { [key: string]: string };
    down: { [key: string]: string };
  };
}

const ClueList: React.FC<ClueListProps> = ({ clues }) => {
  return (
    <div className="clue-list">
      <div className="clue-section">
        <h3>Across</h3>
        {Object.entries(clues.across).map(([number, clue]) => (
          <p key={`across-${number}`}>
            <strong>{number}.</strong> {clue}
          </p>
        ))}
      </div>
      <div className="clue-section">
        <h3>Down</h3>
        {Object.entries(clues.down).map(([number, clue]) => (
          <p key={`down-${number}`}>
            <strong>{number}.</strong> {clue}
          </p>
        ))}
      </div>
    </div>
  );
};

export default ClueList;