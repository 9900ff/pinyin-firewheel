import type { GameState } from '../types/game';
export function deadlines(s: GameState) {
  return { bomb: s.bombStartTime + s.bombDuration, turn: s.turnStartTime + s.thinkingTimeLimit };
}
export function effectiveTime(s: GameState, now: number) {
  return s.pausedAt ?? now;
}
export function shiftClocks(s: GameState, delta: number): GameState {
  return {
    ...s,
    bombStartTime: s.bombStartTime + delta,
    turnStartTime: s.turnStartTime + delta,
    turnHistory: s.turnHistory.map((t) => t + delta),
    lastTimeoutAt: s.lastTimeoutAt === null ? null : s.lastTimeoutAt + delta,
  };
}
