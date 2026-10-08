import type { CSSProperties } from 'react';
import type { CardPosition } from '../game/layout';
export function LetterButton({
  letter,
  locked,
  position,
  onPress,
}: {
  letter: string;
  locked: boolean;
  position: CardPosition;
  onPress: (letter: string) => void;
}) {
  return (
    <g
      className="ring-card"
      role="button"
      tabIndex={locked ? -1 : 0}
      aria-label={letter + ' 字母卡'}
      aria-disabled={locked}
      style={{ '--angle': position.angle + 'deg' } as CSSProperties}
      onPointerDown={(e) => {
        if (e.button !== 0 || locked) return;
        e.preventDefault();
        onPress(letter);
      }}
      onClick={(e) => {
        if (e.detail === 0 && !locked) onPress(letter);
      }}
      onKeyDown={(e) => {
        if ((e.key === 'Enter' || e.key === ' ') && !locked && !e.repeat) {
          e.preventDefault();
          onPress(letter);
        }
      }}
    >
      <path d={position.path} />
      <text
        x="50"
        y="9.5"
        dominantBaseline="central"
        textAnchor="middle"
        transform="rotate(180 50 9.5)"
        aria-hidden="true"
      >
        {letter}
      </text>
    </g>
  );
}
