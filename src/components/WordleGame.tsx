import React, { useState, useEffect } from 'react';
import '../styles/WordleGame.css';

interface WordleGameProps {
    index: number;
    onClose: (completed: boolean) => void;
}

const WORD_LENGTH = 5;
const MAX_ATTEMPTS = 6;
const WORDS = [
    "HAPPY", "SMILE", "LAUGH", "DANCE", "SHINE",
    "DREAM", "HEART", "SWEET", "PEACE", "LIGHT"
]; // You can expand this list

const WordleGame: React.FC<WordleGameProps> = ({ index, onClose }) => {
    const [targetWord, setTargetWord] = useState<string>('');
    const [guesses, setGuesses] = useState<string[]>(Array(MAX_ATTEMPTS).fill(''));
    const [currentAttempt, setCurrentAttempt] = useState<number>(0);
    const [currentGuess, setCurrentGuess] = useState<string>('');
    const [gameStatus, setGameStatus] = useState<'playing' | 'won' | 'lost'>('playing');

    useEffect(() => {
        // Select a random word when the game starts
        const randomWord = WORDS[Math.floor(Math.random() * WORDS.length)];
        setTargetWord(randomWord);
    }, []);

    const handleKeyPress = (key: string) => {
        if (gameStatus !== 'playing') return;

        if (key === 'Backspace') {
            setCurrentGuess(prev => prev.slice(0, -1));
        } else if (key === 'Enter' && currentGuess.length === WORD_LENGTH) {
            submitGuess();
        } else if (/^[A-Za-z]$/.test(key) && currentGuess.length < WORD_LENGTH) {
            setCurrentGuess(prev => (prev + key).toUpperCase());
        }
    };

    const submitGuess = () => {
        const newGuesses = [...guesses];
        newGuesses[currentAttempt] = currentGuess;
        setGuesses(newGuesses);

        if (currentGuess === targetWord) {
            setGameStatus('won');
            onClose(true);
        } else if (currentAttempt === MAX_ATTEMPTS - 1) {
            setGameStatus('lost');
            onClose(false);
        } else {
            setCurrentAttempt(prev => prev + 1);
            setCurrentGuess('');
        }
    };

    const getLetterStatus = (letter: string, position: number, guess: string) => {
        if (!letter) return 'empty';
        if (guess[position] === targetWord[position]) return 'correct';
        if (targetWord.includes(guess[position])) return 'present';
        return 'absent';
    };

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => handleKeyPress(e.key);
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [currentGuess, currentAttempt, gameStatus]);

    return (
        <div className="wordle-game">
            <div className="wordle-header">
                <h2>Wordle Game {index + 1}</h2>
                <button onClick={() => onClose(false)} className="close-button">×</button>
            </div>
            <div className="wordle-grid">
                {guesses.map((guess, i) => (
                    <div key={i} className="wordle-row">
                        {Array(WORD_LENGTH).fill(0).map((_, j) => {
                            const letter = i === currentAttempt ? currentGuess[j] : guess[j];
                            const status = i < currentAttempt ? getLetterStatus(letter, j, guess) : 'empty';
                            return (
                                <div key={j} className={`wordle-cell ${status}`}>
                                    {letter || ''}
                                </div>
                            );
                        })}
                    </div>
                ))}
            </div>
            {gameStatus !== 'playing' && (
                <div className="game-over">
                    <p>{gameStatus === 'won' ? 'Congratulations!' : `The word was: ${targetWord}`}</p>
                    <button onClick={() => onClose(gameStatus === 'won')}>Close</button>
                </div>
            )}
        </div>
    );
};

export default WordleGame;
