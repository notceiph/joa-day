export interface PuzzleData {
  grid: string[][];
  clues: {
    across: {
      [key: string]: {
        easy: string;
        hard: string;
        answer: string;
      };
    };
    down: {
      [key: string]: {
        easy: string;
        hard: string;
        answer: string;
      };
    };
  };
}

export type ClueType = 'across' | 'down';
