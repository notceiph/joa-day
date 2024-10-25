import React from 'react';

interface WordleGameProps {
    index: number;
    onClose: (completed: boolean) => void; // Update to accept completion status
}

const WordleGame: React.FC<WordleGameProps> = ({ index, onClose }) => {
    const handleGameCompletion = () => {
        // Logic to determine if the game is completed
        const completed = true; // Replace with actual completion logic
        onClose(completed);
    };

    return (
        <div className="wordle-game">
            <h2>Wordle Game {index + 1}</h2>
            {/* Wordle game UI goes here */}
            <button onClick={handleGameCompletion}>Complete Game</button>
            <button onClick={() => onClose(false)}>Close</button>
        </div>
    );
};

export default WordleGame;
