import React, { useState, useEffect } from 'react';
import '../styles/WordleGame.css';

interface WordleGameProps {
    index: number;
    onClose: (completed: boolean) => void;
}

const WORDS = [
    "HAPPY", "SMILE", "LAUGH", "DANCE", "SHINE",
    "DREAM", "HEART", "SWEET", "PEACE", "LIGHT",
    "BIRTHDAY", "CELEBRATE", "WONDERFUL", "FANTASTIC",
    "JOYFUL", "AMAZING", "SPECIAL", "BLESSED"
];

const MAX_ATTEMPTS = 6;

const KEYBOARD_ROWS = [
    ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
    ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
    ['ENTER', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', '⌫']
];

// Add this interface for tracking word history
interface WordHistory {
    word: string;
    guesses: string[];
}

const WordleGame: React.FC<WordleGameProps> = ({ index, onClose }) => {
    const [targetWord, setTargetWord] = useState<string>('');
    const [wordLength, setWordLength] = useState<number>(0);
    const [guesses, setGuesses] = useState<string[]>([]);
    const [currentAttempt, setCurrentAttempt] = useState<number>(0);
    const [currentGuess, setCurrentGuess] = useState<string>('');
    const [gameStatus, setGameStatus] = useState<'playing' | 'won' | 'lost'>('playing');
    const [usedLetters, setUsedLetters] = useState<{ [key: string]: string }>({});
    const [flipAnimations, setFlipAnimations] = useState<boolean[][]>([]);
    const [completedWords, setCompletedWords] = useState<WordHistory[]>([]);
    const [currentWordIndex, setCurrentWordIndex] = useState<number>(0);
    const [availableWords, setAvailableWords] = useState<string[]>([...WORDS]);

    useEffect(() => {
        selectNewWord();
    }, []);

    const selectNewWord = () => {
        if (availableWords.length === 0) {
            onClose(true);
            return;
        }

        const randomIndex = Math.floor(Math.random() * availableWords.length);
        const selectedWord = availableWords[randomIndex];
        setTargetWord(selectedWord);
        setWordLength(selectedWord.length);
        
        setGuesses(Array(MAX_ATTEMPTS).fill(''));
        setFlipAnimations(
            Array(MAX_ATTEMPTS).fill([]).map(() => Array(selectedWord.length).fill(false))
        );
        
        setAvailableWords(prev => prev.filter((_, i) => i !== randomIndex));
    };

    const moveToNextWord = () => {
        // Store only the correct guess for the completed word
        const wordHistory: WordHistory = {
            word: targetWord,
            guesses: [currentGuess] // Only store the successful guess
        };
        setCompletedWords(prev => [...prev, wordHistory]);

        // Reset game state for next word
        setCurrentWordIndex(prev => prev + 1);
        setGuesses(Array(MAX_ATTEMPTS).fill(''));
        setCurrentAttempt(0);
        setCurrentGuess('');
        setGameStatus('playing');
        setUsedLetters({});
        setFlipAnimations(Array(MAX_ATTEMPTS).fill([]).map(() => Array(wordLength).fill(false)));

        // Select next word
        selectNewWord();
    };

    const handleKeyPress = (key: string) => {
        if (gameStatus !== 'playing') return;

        if (key === '⌫' || key === 'Backspace') {
            setCurrentGuess(prev => prev.slice(0, -1));
        } else if ((key === 'ENTER' || key === 'Enter') && currentGuess.length === wordLength) {
            submitGuess();
        } else if (/^[A-Za-z]$/.test(key) && currentGuess.length < wordLength) {
            setCurrentGuess(prev => (prev + key).toUpperCase());
        }
    };

    const submitGuess = () => {
        const newGuesses = [...guesses];
        newGuesses[currentAttempt] = currentGuess;
        setGuesses(newGuesses);

        // Trigger flip animations sequentially
        for (let i = 0; i < wordLength; i++) {
            setTimeout(() => {
                setFlipAnimations(prev => {
                    const newAnimations = [...prev];
                    newAnimations[currentAttempt] = [...prev[currentAttempt]];
                    newAnimations[currentAttempt][i] = true;
                    return newAnimations;
                });
            }, i * 200);
        }

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
                if (availableWords.length > 0) {
                    // If there are more words, move to next word after a delay
                    setTimeout(() => moveToNextWord(), 1500);
                } else {
                    setGameStatus('won');
                }
            } else if (currentAttempt === MAX_ATTEMPTS - 1) {
                setGameStatus('lost');
            } else {
                setCurrentAttempt(prev => prev + 1);
                setCurrentGuess('');
            }
        }, wordLength * 200);
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

    const renderCompletedWords = () => (
        <div className="completed-words">
            {completedWords.map((wordHistory, index) => (
                <div key={index} className="mini-wordle-row">
                    {wordHistory.word.split('').map((letter, i) => (
                        <div 
                            key={i}
                            className="mini-wordle-cell correct"
                        >
                            {letter}
                        </div>
                    ))}
                </div>
            ))}
        </div>
    );

    return (
        <div className="wordle-game">
            {renderCompletedWords()}
            <div className="wordle-header">
                <h2>Wordle Game {currentWordIndex + 1}</h2>
                <button onClick={() => onClose(false)} className="close-button">×</button>
            </div>
            <div className="wordle-grid">
                {guesses.map((guess, i) => (
                    <div key={i} className="wordle-row">
                        {Array(wordLength).fill(0).map((_, j) => {
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
