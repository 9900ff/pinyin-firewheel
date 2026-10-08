import type { Settings, GameState, Topic } from '../types/game';
import { pickTopic } from './topicCatalog';
import { difficultyLetters } from './letters';
import { deadlines, shiftClocks } from './timing';
export class GameEngine {
  state: GameState;
  constructor(settings: Settings, now = performance.now(), random = Math.random, topic?: Topic) {
    const currentTopic = topic ?? pickTopic(settings.topicBanks, random);
    const activeLetters = difficultyLetters[settings.difficulty].filter(
      (l) => !currentTopic.disabledLetters?.includes(l),
    );
    this.state = {
      gameStatus: 'playing',
      usedLetters: [],
      currentTopic,
      bombStartTime: now,
      bombDuration: (settings.bombMin + random() * (settings.bombMax - settings.bombMin)) * 1000,
      turnStartTime: now,
      thinkingTimeLimit: settings.thinking * 1000,
      pausedAt: null,
      turnHistory: [],
      selectionTimeoutCounts: [],
      activeLetters,
      timeoutCount: 0,
      timeoutLimit: settings.timeoutLimit,
      lastTimeoutAt: null,
      atmosphereCurve: 0.8 + random() * 0.6,
      mechanicalAt: 0.4 + random() * 0.15,
      alarmAt: 0.75 + random() * 0.12,
      effectSeed: random() * 10000,
    };
  }
  tick(now = performance.now()) {
    let s = this.state;
    if (s.gameStatus !== 'playing') return;
    const d = deadlines(s);
    // Catch up elapsed turns from their deadlines, not from a delayed render frame.
    const beforeBomb = Math.ceil((d.bomb - d.turn) / s.thinkingTimeLimit);
    const elapsedTurns = Math.floor((now - d.turn) / s.thinkingTimeLimit) + 1;
    const count = Math.max(
      0,
      Math.min(
        beforeBomb,
        elapsedTurns,
        s.timeoutLimit ? s.timeoutLimit - s.timeoutCount : Infinity,
      ),
    );
    if (count > 0) {
      s = {
        ...s,
        timeoutCount: s.timeoutCount + count,
        turnStartTime: d.turn + (count - 1) * s.thinkingTimeLimit,
        lastTimeoutAt: d.turn + (count - 1) * s.thinkingTimeLimit,
      };
      if (s.timeoutLimit && s.timeoutCount >= s.timeoutLimit) {
        this.state = { ...s, gameStatus: 'thinkingTimeout' };
        return;
      }
    }
    this.state = now >= d.bomb ? { ...s, gameStatus: 'bombExploded' } : s;
  }
  press(letter: string, now = performance.now()): boolean {
    const previousTimeouts = this.state.timeoutCount;
    this.tick(now);
    const s = this.state;
    // A tap that crossed a timeout belongs to the expired player, not the next player.
    if (
      previousTimeouts !== s.timeoutCount ||
      s.gameStatus !== 'playing' ||
      !s.activeLetters.includes(letter) ||
      s.usedLetters.includes(letter)
    )
      return false;
    const usedLetters = [...s.usedLetters, letter];
    this.state = {
      ...s,
      usedLetters,
      turnHistory: [s.turnStartTime],
      selectionTimeoutCounts: [s.timeoutCount],
      turnStartTime: now,
      gameStatus: usedLetters.length === s.activeLetters.length ? 'cleared' : 'playing',
    };
    return true;
  }
  undo(now = performance.now()): boolean {
    const previousTimeouts = this.state.timeoutCount;
    this.tick(now);
    const s = this.state;
    if (
      s.gameStatus !== 'playing' ||
      !s.usedLetters.length ||
      !s.turnHistory.length ||
      previousTimeouts !== s.timeoutCount
    )
      return false;
    // A recorded penalty is final; restoring an older card cannot replay an expired turn.
    const samePenaltyCount = s.selectionTimeoutCounts.at(-1) === s.timeoutCount;
    this.state = {
      ...s,
      usedLetters: s.usedLetters.slice(0, -1),
      turnStartTime: samePenaltyCount ? s.turnHistory.at(-1)! : s.turnStartTime,
      turnHistory: [],
      selectionTimeoutCounts: [],
    };
    this.tick(now);
    return true;
  }
  pause(now = performance.now()) {
    this.tick(now);
    if (this.state.gameStatus === 'playing')
      this.state = { ...this.state, gameStatus: 'paused', pausedAt: now };
  }
  resume(now = performance.now()) {
    const s = this.state;
    if (s.gameStatus !== 'paused' || s.pausedAt === null) return;
    this.state = {
      ...shiftClocks(s, Math.max(0, now - s.pausedAt)),
      gameStatus: 'playing',
      pausedAt: null,
    };
  }
}
