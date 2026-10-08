import { test } from 'node:test';
import assert from 'node:assert/strict';
import { GameEngine } from '../src/game/gameEngine';
import { DEFAULT_SETTINGS, loadSettings, STORAGE_KEY } from '../src/utils/storage';
import { atmosphere } from '../src/game/atmosphere';
const make = (limit = 3) =>
  new GameEngine({ ...DEFAULT_SETTINGS, topicBanks: ['1'], timeoutLimit: limit }, 0, () => 0.5);
test('personal timeout hands off until round limit; an expired tap is rejected', () => {
  const e = make();
  assert.equal(e.press('X', 8000), false);
  assert.equal(e.state.gameStatus, 'playing');
  assert.equal(e.state.timeoutCount, 1);
  assert.equal(e.state.turnStartTime, 8000);
  e.tick(16000);
  assert.equal(e.state.timeoutCount, 2);
  e.tick(24000);
  assert.equal(e.state.gameStatus, 'thinkingTimeout');
  assert.equal(e.state.bombStartTime, 0);
});
test('unlimited penalties still end on bomb; exact ties go to bomb', () => {
  const e = make(0);
  e.tick(60000);
  assert.equal(e.state.timeoutCount, 7);
  assert.equal(e.state.gameStatus, 'bombExploded');
  const b = make(0);
  b.state.bombDuration = 8000;
  b.tick(8000);
  assert.equal(b.state.gameStatus, 'bombExploded');
  assert.equal(b.state.timeoutCount, 0);
});
test('every selection stays playable and never freezes either clock for layout', () => {
  const e = make();
  e.state.activeLetters
    .slice(0, 9)
    .forEach((letter, i) => assert.equal(e.press(letter, 100 + i * 100), true));
  assert.equal(e.state.gameStatus, 'playing');
  assert.equal(e.state.bombStartTime, 0);
  assert.equal(e.state.turnStartTime, 900);
  assert.equal(e.state.pausedAt, null);
  e.undo(950);
  assert.equal(e.state.gameStatus, 'playing');
  assert.equal(e.state.turnStartTime, 800);
  assert.equal(e.state.bombStartTime, 0);
});
test('manual pause still freezes both clocks', () => {
  const e = make();
  e.press('X', 800);
  e.pause(1000);
  e.resume(11000);
  assert.equal(e.state.gameStatus, 'playing');
  assert.equal(e.state.bombStartTime, 10000);
  assert.equal(e.state.turnStartTime, 10800);
});
test('undo restores card without cancelling or replaying recorded penalties', () => {
  const e = make();
  e.press('X', 1000);
  e.tick(9000);
  assert.equal(e.state.timeoutCount, 1);
  e.undo(9500);
  assert.deepEqual(e.state.usedLetters, []);
  assert.equal(e.state.timeoutCount, 1);
  assert.equal(e.state.turnStartTime, 9000);
  assert.equal(e.state.bombStartTime, 0);
});
test('heat and beat phase rise monotonically without false alarms', () => {
  const s = make().state;
  let previousHeat = 0,
    previousBeat = -1;
  for (let now = 0; now <= 60000; now += 500) {
    const a = atmosphere(s, now);
    assert.ok(a.heat >= previousHeat);
    assert.ok(a.beat >= previousBeat);
    previousHeat = a.heat;
    previousBeat = a.beat;
  }
});
test('existing saved settings migrate to default timeout limit', () => {
  const old: Record<string, unknown> = { ...DEFAULT_SETTINGS, thinking: 15 };
  delete old.timeoutLimit;
  Object.defineProperty(globalThis, 'localStorage', {
    configurable: true,
    value: { getItem: (key: string) => (key === STORAGE_KEY ? JSON.stringify(old) : null) },
  });
  assert.equal(loadSettings().timeoutLimit, 3);
  assert.equal(loadSettings().thinking, 15);
  delete (globalThis as { localStorage?: Storage }).localStorage;
});
