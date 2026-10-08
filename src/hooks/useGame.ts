import { useCallback, useEffect, useRef, useState } from 'react';
import type { Settings, Topic } from '../types/game';
import { GameEngine } from '../game/gameEngine';
import { pickTopic } from '../game/topicCatalog';
import { atmosphere } from '../game/atmosphere';
import { effectiveTime } from '../game/timing';
import { audio } from '../utils/audio';
import { vibrate } from '../utils/vibration';
export function useGame(settings: Settings, initialTopic?: Topic) {
  const [engine] = useState(
    () => new GameEngine(settings, performance.now(), Math.random, initialTopic),
  );
  const [state, setState] = useState(engine.state);
  const [mood, setMood] = useState(() => atmosphere(engine.state, performance.now()));
  const [penaltyVisible, setPenaltyVisible] = useState(false);
  const lastState = useRef(engine.state),
    lastBeat = useRef(-1);
  const sync = useCallback(() => {
    const s = engine.state,
      old = lastState.current;
    if (s === old) return;
    if (s.gameStatus === 'bombExploded' && old.gameStatus !== s.gameStatus) {
      audio.play('boom', settings.sound);
      vibrate(settings.vibration, [180, 80, 240]);
    } else if (s.timeoutCount > old.timeoutCount) {
      audio.play('timeout', settings.sound);
      vibrate(settings.vibration, [70, 70, 70]);
    }
    if (s.gameStatus === 'cleared' && old.gameStatus !== s.gameStatus)
      audio.play('clear', settings.sound);
    lastState.current = s;
    setState(s);
  }, [engine, settings]);
  useEffect(() => {
    let frame = 0,
      lastPaint = -Infinity;
    function update(now: number) {
      engine.tick(now);
      sync();
      const s = engine.state;
      if (['playing', 'paused'].includes(s.gameStatus)) {
        const m = atmosphere(s, now);
        const newBeat = s.gameStatus === 'playing' && m.beat !== lastBeat.current;
        if (newBeat || now - lastPaint >= 16) {
          setMood(m);
          lastPaint = now;
          setPenaltyVisible(
            s.lastTimeoutAt !== null && effectiveTime(s, now) - s.lastTimeoutAt < 2000,
          );
        }
        if (s.gameStatus === 'playing') {
          if (m.beat !== lastBeat.current) {
            audio.play('beat', settings.sound, m);
            lastBeat.current = m.beat;
          }
        }
      }
      frame = requestAnimationFrame(update);
    }
    frame = requestAnimationFrame(update);
    const hide = () => {
      if (document.hidden) {
        engine.pause();
        sync();
      }
    };
    document.addEventListener('visibilitychange', hide);
    return () => {
      cancelAnimationFrame(frame);
      document.removeEventListener('visibilitychange', hide);
    };
  }, [engine, settings, sync]);
  function start(topic?: Topic) {
    if (settings.sound) audio.unlock();
    engine.state = new GameEngine(settings, performance.now(), Math.random, topic).state;
    lastBeat.current = -1;
    setPenaltyVisible(false);
    setMood(atmosphere(engine.state, performance.now()));
    sync();
  }
  return {
    state,
    mood,
    penaltyVisible,
    press: (letter: string) => {
      if (engine.press(letter)) {
        audio.play('click', settings.sound);
        vibrate(settings.vibration, 12);
        setMood(atmosphere(engine.state, performance.now()));
      }
      sync();
    },
    undo: () => {
      engine.undo();
      sync();
    },
    pause: () => {
      engine.pause();
      sync();
    },
    resume: () => {
      if (settings.sound) audio.unlock();
      engine.resume();
      sync();
    },
    restart: () => start(engine.state.currentTopic),
    next: () => start(pickTopic(settings.topicBanks, Math.random, engine.state.currentTopic)),
    redraw: () => {
      start(pickTopic(settings.topicBanks, Math.random, engine.state.currentTopic));
    },
  };
}
