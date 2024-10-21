export interface PuzzleData {
  grid: string[][];
  clues: {
    across: { [key: string]: string };
    down: { [key: string]: string };
  };
}

export type ClueType = 'across' | 'down';
