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
];

const KEYBOARD_ROWS = [
    ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
    ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
    ['ENTER', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', '⌫']
];

const WordleGame: React.FC<WordleGameProps> = ({ index, onClose }) => {
    const [targetWord, setTargetWord] = useState<string>('');
    const [guesses, setGuesses] = useState<string[]>(Array(MAX_ATTEMPTS).fill(''));
    const [currentAttempt, setCurrentAttempt] = useState<number>(0);
    const [currentGuess, setCurrentGuess] = useState<string>('');
    const [gameStatus, setGameStatus] = useState<'playing' | 'won' | 'lost'>('playing');
    const [usedLetters, setUsedLetters] = useState<{ [key: string]: string }>({});
    const [flipAnimations, setFlipAnimations] = useState<boolean[][]>(
        Array(MAX_ATTEMPTS).fill([]).map(() => Array(WORD_LENGTH).fill(false))
    );

    useEffect(() => {
        const randomWord = WORDS[Math.floor(Math.random() * WORDS.length)];
        setTargetWord(randomWord);
    }, []);

    const handleKeyPress = (key: string) => {
        if (gameStatus !== 'playing') return;

        if (key === '⌫' || key === 'Backspace') {
            setCurrentGuess(prev => prev.slice(0, -1));
        } else if ((key === 'ENTER' || key === 'Enter') && currentGuess.length === WORD_LENGTH) {
            submitGuess();
        } else if (/^[A-Za-z]$/.test(key) && currentGuess.length < WORD_LENGTH) {
            setCurrentGuess(prev => (prev + key).toUpperCase());
        }
    };

    const submitGuess = () => {
        const newGuesses = [...guesses];
        newGuesses[currentAttempt] = currentGuess;
        setGuesses(newGuesses);

        // Trigger flip animations sequentially
        for (let i = 0; i < WORD_LENGTH; i++) {
            setTimeout(() => {
                setFlipAnimations(prev => {
                    const newAnimations = [...prev];
                    newAnimations[currentAttempt] = [...prev[currentAttempt]];
                    newAnimations[currentAttempt][i] = true;
                    return newAnimations;
                });
            }, i * 200); // Delay each flip by 200ms
        }

        // Update used letters status after a slight delay
        setTimeout(() => {
            const newUsedLetters = { ...usedLetters };
            for (let i = 0; i < currentGuess.length; i++) {
                const letter = currentGuess[i];
                const status = getLetterStatus(letter, i, currentGuess);
                if (!newUsedLetters[letter] || 
                    (newUsedLetters[letter] === 'absent' && status !== 'absent') ||
                    (newUsedLetters[letter] === 'present' && status === 'correct')) {
                    newUsedLetters[letter] = status;
                }
            }
            setUsedLetters(newUsedLetters);

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
        }, WORD_LENGTH * 200); // Wait for all flips to complete
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

    const renderKeyboard = () => (
        <div className="keyboard">
            {KEYBOARD_ROWS.map((row, i) => (
                <div key={i} className="keyboard-row">
                    {row.map((key) => (
                        <button
                            key={key}
                            className={`keyboard-key ${key.length > 1 ? 'wide-key' : ''} ${usedLetters[key] || ''}`}
                            onClick={() => handleKeyPress(key)}
                        >
                            {key}
                        </button>
                    ))}
                </div>
            ))}
        </div>
    );

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
                            const shouldFlip = flipAnimations[i][j];
                            return (
                                <div 
                                    key={j} 
                                    className={`wordle-cell ${status} ${shouldFlip ? 'flip' : ''}`}
                                >
                                    {letter || ''}
                                </div>
                            );
                        })}
                    </div>
                ))}
            </div>
            {renderKeyboard()}
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
