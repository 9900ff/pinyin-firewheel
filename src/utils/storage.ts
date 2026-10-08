import type { Settings } from '../types/game';
import { topicBanks, DEFAULT_TOPIC_BANKS } from '../game/topicCatalog';
export const STORAGE_KEY = 'pinyin-firewheel:settings:v1';
export const DEFAULT_SETTINGS: Settings = {
  bombMin: 30,
  bombMax: 90,
  thinking: 15,
  timeoutLimit: 3,
  topicBanks: [...DEFAULT_TOPIC_BANKS],
  difficulty: 'standard',
  sound: true,
  vibration: true,
};
export const THINKING_RANGE = { min: 1, max: 300 };
export const TIMEOUT_RANGE = { min: 0, max: 99 };
export function isThinkingTime(n: number) {
  return Number.isInteger(n) && n >= THINKING_RANGE.min && n <= THINKING_RANGE.max;
}
export function isTimeoutLimit(n: number) {
  return Number.isInteger(n) && n >= TIMEOUT_RANGE.min && n <= TIMEOUT_RANGE.max;
}
export function isSettings(v: unknown): v is Settings {
  if (!v || typeof v !== 'object') return false;
  const s = v as Settings;
  return (
    Number.isInteger(s.bombMin) &&
    s.bombMin >= 20 &&
    s.bombMin <= 180 &&
    Number.isInteger(s.bombMax) &&
    s.bombMax >= 30 &&
    s.bombMax <= 300 &&
    s.bombMax > s.bombMin &&
    isThinkingTime(s.thinking) &&
    isTimeoutLimit(s.timeoutLimit) &&
    ['easy', 'standard', 'hard'].includes(s.difficulty) &&
    Array.isArray(s.topicBanks) &&
    s.topicBanks.length > 0 &&
    s.topicBanks.every(
      (id) => typeof id === 'string' && topicBanks.some((bank) => bank.id === id),
    ) &&
    new Set(s.topicBanks).size === s.topicBanks.length &&
    typeof s.sound === 'boolean' &&
    typeof s.vibration === 'boolean'
  );
}
export function loadSettings(): Settings {
  try {
    const saved: unknown = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? 'null');
    // Keep existing preferences when upgrading from the original settings schema.
    const s =
      saved && typeof saved === 'object'
        ? { timeoutLimit: 3, topicBanks: [...DEFAULT_TOPIC_BANKS], ...saved }
        : saved;
    return isSettings(s) ? s : { ...DEFAULT_SETTINGS };
  } catch {
    return { ...DEFAULT_SETTINGS };
  }
}
export function saveSettings(s: Settings): boolean {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
    return true;
  } catch {
    return false;
  }
}
