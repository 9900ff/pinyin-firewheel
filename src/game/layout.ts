export interface CardPosition {
  angle: number;
  path: string;
}
// Fixed-radius arc cards redistribute on every selection. Capped width leaves gaps as cards diminish.
export function cardPositions(letters: string[]): Record<string, CardPosition> {
  const span = Math.min(24, 360 / Math.max(1, letters.length) - 1.2);
  const half = (span * Math.PI) / 360;
  const point = (radius: number, sign: number) =>
    [50 + sign * Math.sin(half) * radius, 50 - Math.cos(half) * radius].join(' ');
  const shape =
    'M ' +
    point(49, -1) +
    ' A 49 49 0 0 1 ' +
    point(49, 1) +
    ' L ' +
    point(32, 1) +
    ' A 32 32 0 0 0 ' +
    point(32, -1) +
    ' Z';
  return Object.fromEntries(
    letters.map((letter, i) => [letter, { angle: (i / letters.length) * 360, path: shape }]),
  );
}
