import type { Difficulty } from '../types/game';
export const LETTERS = 'ABCDEFGHJKLMNOPQRSTWXYZ'.split('');
// Omitted initials stay visible, but disabled, so the wheel never shifts between modes.
export const difficultyLetters: Record<Difficulty, string[]> = {
  easy: 'BCDFGHJLMNPSX'.split(''),
  standard: 'BCDFGHJKLMNPQRSTWXYZ'.split(''),
  hard: LETTERS,
};
export const difficultyNames: Record<Difficulty, string> = {
  easy: '简单',
  standard: '标准',
  hard: '困难',
};
