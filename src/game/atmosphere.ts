import type { GameState } from '../types/game';
import { effectiveTime } from './timing';
export interface Atmosphere {
  heat: number;
  urgent: boolean;
  remaining: number;
  ratio: number;
  pulse: number;
  beat: number;
  // Translation in percent of the rendered board; rotation in degrees.
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
  const exponent = 1.8 + (s.atmosphereCurve - 0.8);
  // Integrate a continuous, nondecreasing tempo. The quiet opening lasts until
  // mechanicalAt; later segments accelerate toward 100ms per beat at explosion.
  const points = [0, s.mechanicalAt, s.sparksAt, s.alarmAt, s.extremeAt, 1];
  const rates = [1 / 0.9, 1 / 0.9, 2, 3.5, 5, 10];
  let phase = 0;
  for (let i = 0; i < points.length - 1; i++) {
    const width = points[i + 1] - points[i];
    const elapsed = Math.max(0, Math.min(width, age - points[i]));
    const progress = elapsed / width;
    phase +=
      seconds *
      width *
      (rates[i] * progress +
        ((rates[i + 1] - rates[i]) * Math.pow(progress, exponent + 1)) / (exponent + 1));
  }
  const beat = Math.floor(phase);
  const smooth = (start: number, end: number) => {
    const x = Math.max(0, Math.min(1, (age - start) / (end - start)));
    return x * x * (3 - 2 * x);
  };
  const mechanical = smooth(s.mechanicalAt, s.sparksAt);
  const alarm = smooth(s.alarmAt, s.extremeAt);
  // Sparks and the entire board grow together: small, pronounced, then extreme.
  const danger =
    0.35 * smooth(s.sparksAt, s.alarmAt) +
    0.35 * smooth(s.alarmAt, s.extremeAt) +
    0.3 * smooth(s.extremeAt, 1);
  const sparks = danger;
  const heat = 0.1 + 0.2 * mechanical + 0.7 * danger;
  // Exactly the same phase as the sound. Small, smooth fog movements avoid full-screen flashes.
  const beatFraction = phase - beat;
  const pulse = (1 + Math.cos(beatFraction * Math.PI * 2)) / 2;
  // Scale with the responsive board, including after rotation or fullscreen changes.
  const shakeStrength = Math.pow(danger, 1.6);
  const amplitude = 2.4 * shakeStrength;
  const impact = Math.exp(-beatFraction * 4.5);
  const shakeX = amplitude * Math.cos(phase * Math.PI) * impact;
  const shakeY = amplitude * 0.8 * Math.sin(phase * Math.PI * 2 + 0.5) * impact;
  const shakeAngle = 1.4 * shakeStrength * Math.cos(phase * Math.PI) * impact;
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
