// Particle geometry is deterministic within a beat; only a new shared beat emits a new burst.
export function Sparks({
  beat,
  phase,
  intensity,
  seed,
}: {
  beat: number;
  phase: number;
  intensity: number;
  seed: number;
}) {
  if (intensity <= 0) return null;
  const random = (index: number) => {
    const n = Math.sin(seed + beat * 73.13 + index * 127.1) * 43758.5453;
    return n - Math.floor(n);
  };
  const count = 4 + Math.floor(intensity * 20);
  return (
    <svg className="spark-layer" viewBox="0 0 100 100" aria-hidden="true">
      {Array.from({ length: count }, (_, i) => {
        const angle = random(i * 3) * Math.PI * 2;
        const radius = 44 + phase * (3 + intensity * (9 + random(i * 3 + 1) * 9));
        const length = 0.6 + intensity * (4 + random(i * 3 + 2) * 7);
        const x = 50 + Math.cos(angle) * radius,
          y = 50 + Math.sin(angle) * radius;
        return (
          <line
            key={i}
            x1={x}
            y1={y}
            x2={x + Math.cos(angle) * length}
            y2={y + Math.sin(angle) * length}
            stroke={i % 2 ? '#efa34c' : '#ffd078'}
            strokeLinecap="round"
            strokeWidth={0.18 + intensity * (0.45 + random(i) * 0.35)}
            opacity={Math.pow(1 - phase, 1.35) * (0.3 + intensity * 0.65)}
          />
        );
      })}
    </svg>
  );
}
