import React, { useState, useEffect } from 'react';
import '../styles/WordleGame.css';

interface WordleGameProps {
    index: number;
    onClose: (completed: boolean) => void;
    savedState?: WordleGameState;
    onStateChange?: (state: WordleGameState) => void;
}

const WORDS = [
    "ELI", "PAUL", "SLEEP", "HEART", "VOICE",
    "YAPPER", "BURRITO", "ACCENT", "FEET", "EVERYTHING", "LAUGH"
];

const MAX_ATTEMPTS = 8;

const KEYBOARD_ROWS = [
    ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
    ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
    ['Z', 'X', 'C', 'V', 'B', 'N', 'M', 'ENTER', '⌫']
];

// Add this interface for tracking word history
interface WordHistory {
    word: string;
    guesses: string[];
}

// Add this interface near the top with other interfaces
interface WordleGameState {
    targetWord: string;
    wordLength: number;
    guesses: string[];
    currentAttempt: number;
    currentGuess: string;
    gameStatus: 'playing' | 'won' | 'lost';
    usedLetters: { [key: string]: string };
    flipAnimations: boolean[][];
    completedWords: WordHistory[];
    currentWordIndex: number;
    availableWords: string[];
}

const WordleGame: React.FC<WordleGameProps> = ({ index, onClose, savedState, onStateChange }) => {
    // Update state initializations to use savedState if available
    const [targetWord, setTargetWord] = useState<string>(savedState?.targetWord || '');
    const [wordLength, setWordLength] = useState<number>(savedState?.wordLength || 0);
    const [guesses, setGuesses] = useState<string[]>(savedState?.guesses || []);
    const [currentAttempt, setCurrentAttempt] = useState<number>(savedState?.currentAttempt || 0);
    const [currentGuess, setCurrentGuess] = useState<string>(savedState?.currentGuess || '');
    const [gameStatus, setGameStatus] = useState<'playing' | 'won' | 'lost'>(savedState?.gameStatus || 'playing');
    const [usedLetters, setUsedLetters] = useState<{ [key: string]: string }>(savedState?.usedLetters || {});
    const [flipAnimations, setFlipAnimations] = useState<boolean[][]>(savedState?.flipAnimations || []);
    const [completedWords, setCompletedWords] = useState<WordHistory[]>(savedState?.completedWords || []);
    const [currentWordIndex, setCurrentWordIndex] = useState<number>(savedState?.currentWordIndex || 0);
    const [availableWords, setAvailableWords] = useState<string[]>(savedState?.availableWords || [...WORDS]);

    // Add effect to save state when it changes
    useEffect(() => {
        if (onStateChange) {
            onStateChange({
                targetWord,
                wordLength,
                guesses,
                currentAttempt,
                currentGuess,
                gameStatus,
                usedLetters,
                flipAnimations,
                completedWords,
                currentWordIndex,
                availableWords
            });
        }
    }, [targetWord, wordLength, guesses, currentAttempt, currentGuess, gameStatus, usedLetters, flipAnimations, completedWords, currentWordIndex, availableWords]);

    // Only call selectNewWord if there's no saved state
    useEffect(() => {
        if (!savedState) {
            selectNewWord();
        }
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
        
        const newAvailableWords = [...availableWords];
        newAvailableWords.splice(randomIndex, 1);
        setAvailableWords(newAvailableWords);
    };

    const moveToNextWord = () => {
        // Check if the word is already in completedWords before adding it
        const isWordAlreadyCompleted = completedWords.some(history => history.word === targetWord);
        
        if (!isWordAlreadyCompleted) {
            // Store only the correct guess for the completed word
            const wordHistory: WordHistory = {
                word: targetWord,
                guesses: [currentGuess] // Only store the successful guess
            };
            setCompletedWords(prev => [...prev, wordHistory]);
        }

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
            <div className="completed-words-title">Correct Words</div>
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

    // Add this function to get a hint for the current word
    const getWordHint = () => {
        switch (targetWord) {
            case "ELI": return "Your favorite person in the world. Your protector.";
            case "PAUL": return "A human in fur coat.";
            case "SLEEP": return "You get none of this.";
            case "HEART": return "You belong in my _____";
            case "VOICE": return "My favorite thing about you.";
            case "YAPPER": return "I could talk to you all day. You're my _____";
            case "BURRITO": return "You hate me but you love me at the same time.";
            case "ACCENT": return "When this randomly comes out, its so cute.";
            case "FEET": return "Your favorite part of my body............freak";
            case "EVERYTHING": return "You are my __________";
            case "LAUGH": return "Music to my ears, your _____";
            default: return "";
        }
    };

    // Add this new render function
    const renderProgressBlocks = () => (
        <div className="progress-blocks">
            {WORDS.map((_, index) => (
                <div 
                    key={index} 
                    className={`progress-block ${
                        index < currentWordIndex ? 'completed' : 
                        index === currentWordIndex ? 'current' : ''
                    }`}
                />
            ))}
        </div>
    );

    return (
        <div className="wordle-game">
            {renderCompletedWords()}
            <div className="wordle-header">
                <div className="title-container">
                    <h2>Wordle Game {currentWordIndex + 1}</h2>
                    <span className="word-hint">{getWordHint()}</span>
                </div>
                <button onClick={() => onClose(false)} className="close-button">×</button>
            </div>
            <div className="progress-blocks-container">
                {renderProgressBlocks()}
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
