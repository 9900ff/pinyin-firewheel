import { test } from 'node:test';
import assert from 'node:assert/strict';
import { GameEngine } from '../src/game/gameEngine';
import { DEFAULT_SETTINGS, loadSettings, STORAGE_KEY } from '../src/utils/storage';
import { atmosphere } from '../src/game/atmosphere';
const make = (limit = 3) =>
  new GameEngine(
    { ...DEFAULT_SETTINGS, thinking: 8, topicBanks: ['1'], timeoutLimit: limit },
    0,
    () => 0.5,
  );
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

test('remaining-time stages keep their order and use both ratio and seconds caps', () => {
  for (const seconds of [5, 30, 60, 90, 300]) {
    for (const random of [0, 0.5, 0.999999]) {
      const s = new GameEngine(
        { ...DEFAULT_SETTINGS, bombMin: seconds, bombMax: seconds },
        0,
        () => random,
      ).state;
      const expected = [
        [s.mechanicalAt, 0.6, 0.08, 32, 6],
        [s.sparksAt, 0.38, 0.08, 19, 6],
        [s.alarmAt, 0.26, 0.06, 14, 4],
        [s.extremeAt, 0.12, 0.04, 6, 2],
      ];
      let previous = 0;
      for (const [at, ratio, ratioRange, cap, capRange] of expected) {
        assert.ok(at > previous && at < 1);
        assert.ok(
          Math.abs(
            (1 - at) * seconds -
              Math.min(seconds * (ratio + random * ratioRange), cap + random * capRange),
          ) < 1e-8,
        );
        previous = at;
      }
      assert.ok(atmosphere(s, s.sparksAt * s.bombDuration).sparks < 1e-12);
      assert.ok(atmosphere(s, s.alarmAt * s.bombDuration).alarm < 1e-12);
    }
  }
});
test('tempo stays continuous and never slows across stage boundaries', () => {
  const s = make(0).state;
  const phase = (time: number) => {
    const a = atmosphere(s, time);
    return a.beat + a.beatFraction;
  };
  let previousRate = 0;
  for (let time = 0; time < s.bombDuration - 1; time += 50) {
    const rate = (phase(time + 1) - phase(time)) * 1000;
    assert.ok(rate >= previousRate - 1e-7);
    previousRate = rate;
  }
  for (const at of [s.mechanicalAt, s.sparksAt, s.alarmAt, s.extremeAt]) {
    const time = at * s.bombDuration;
    const left = (phase(time) - phase(time - 0.01)) / 0.01;
    const right = (phase(time + 0.01) - phase(time)) / 0.01;
    assert.ok(Math.abs(left - right) < 1e-6);
  }
  assert.ok(Math.abs((phase(1) - phase(0)) * 1000 - 1 / 0.9) < 1e-5);
  assert.ok(Math.abs((phase(s.bombDuration) - phase(s.bombDuration - 1)) * 1000 - 10) < 0.01);
});
