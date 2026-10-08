import type { GameState } from '../types/game';
import { effectiveTime } from './timing';
export interface Atmosphere {
  heat: number;
  urgent: boolean;
  remaining: number;
  ratio: number;
  pulse: number;
  beat: number;
  shakeX: number;
  shakeY: number;
  shakeAngle: number;
  mechanical: number;
  alarm: number;
  sparks: number;
  beatFraction: number;
}
export function atmosphere(s: GameState, now: number): Atmosphere {
  const clock = effectiveTime(s, now);
  const age = Math.max(0, Math.min(1, (clock - s.bombStartTime) / s.bombDuration));
  const seconds = s.bombDuration / 1000;
  const exponent = 7.2 + (s.atmosphereCurve - 0.8) * 1.3;
  const heat = 0.1 + 0.9 * Math.pow(age, 1.5);
  // Integral of 1/0.9 + (10 - 1/0.9) * age^exponent: ~900ms to 100ms,
  // with most acceleration near the end and no phase discontinuities.
  const phase =
    seconds * (age / 0.9 + ((10 - 1 / 0.9) * Math.pow(age, exponent + 1)) / (exponent + 1));
  const beat = Math.floor(phase);
  const smooth = (start: number, end: number) => {
    const x = Math.max(0, Math.min(1, (age - start) / (end - start)));
    return x * x * (3 - 2 * x);
  };
  const mechanical = smooth(s.mechanicalAt, s.mechanicalAt + 0.16);
  const alarm = smooth(s.alarmAt, Math.min(0.98, s.alarmAt + 0.1));
  // Sparks and ring tremor share the same randomized onset and growth curve.
  const danger = smooth(s.alarmAt - 0.08, 1);
  const sparks = danger;
  // Exactly the same phase as the sound. Small, smooth fog movements avoid full-screen flashes.
  const beatFraction = phase - beat;
  const pulse = (1 + Math.cos(beatFraction * Math.PI * 2)) / 2;
  const amplitude = 4 * danger * danger;
  const impact = Math.exp(-(phase - beat) * 6);
  const shakeX = amplitude * Math.cos(phase * Math.PI) * impact;
  const shakeY = amplitude * 0.7 * Math.sin(phase * Math.PI * 2 + 0.5) * impact;
  const shakeAngle = 0.5 * danger * danger * Math.cos(phase * Math.PI) * impact;
  const remaining = Math.max(0, s.turnStartTime + s.thinkingTimeLimit - clock);
  return {
    heat,
    mechanical,
    alarm,
    sparks,
    beatFraction,
    urgent: remaining <= 3000,
    remaining: Math.ceil(remaining / 1000),
    ratio: Math.min(1, remaining / s.thinkingTimeLimit),
    pulse,
    beat,
    shakeX,
    shakeY,
    shakeAngle,
  };
}
