export type Difficulty = 'easy' | 'standard' | 'hard';
export type GameStatus =
  'idle' | 'playing' | 'paused' | 'bombExploded' | 'thinkingTimeout' | 'cleared';
export interface Settings {
  bombMin: number;
  bombMax: number;
  thinking: number;
  timeoutLimit: number;
  topicBanks: string[];
  difficulty: Difficulty;
  sound: boolean;
  vibration: boolean;
}
export interface TopicBank {
  id: string;
  name: string;
  description: string;
  adultOnly?: boolean;
}
export interface Topic {
  id: string;
  name: string;
  bankId: string;
  category?: string;
  recommendedLetters?: string[];
  disabledLetters?: string[];
}
export interface GameState {
  gameStatus: GameStatus;
  usedLetters: string[];
  currentTopic: Topic;
  bombStartTime: number;
  bombDuration: number;
  turnStartTime: number;
  thinkingTimeLimit: number;
  pausedAt: number | null;
  turnHistory: number[];
  selectionTimeoutCounts: number[];
  activeLetters: string[];
  timeoutCount: number;
  timeoutLimit: number;
  lastTimeoutAt: number | null;
  atmosphereCurve: number;
  mechanicalAt: number;
  alarmAt: number;
  effectSeed: number;
}

// Topic IDs are unique within one bank; bankId is attached by the catalog.
export interface TopicBankDefinition extends TopicBank {
  topics: Omit<Topic, 'bankId'>[];
}
