import { useMemo, type ReactNode } from 'react';
import { LetterButton } from './LetterButton';
import { cardPositions } from '../game/layout';
export function LetterWheel({
  usedLetters,
  activeLetters,
  locked,
  children,
  onPress,
}: {
  usedLetters: string[];
  activeLetters: string[];
  locked: boolean;
  children?: ReactNode;
  onPress: (letter: string) => void;
}) {
  const remaining = useMemo(
    () => activeLetters.filter((l) => !usedLetters.includes(l)),
    [activeLetters, usedLetters],
  );
  const positions = useMemo(() => cardPositions(remaining), [remaining]);
  return (
    <div className="card-wheel arc-wheel">
      <div className="card-track" />
      <svg className="ring-cards" viewBox="0 0 100 100" aria-label="环形字母牌盘">
        {remaining.map((letter) => (
          <LetterButton
            key={letter}
            letter={letter}
            locked={locked}
            position={positions[letter]}
            onPress={onPress}
          />
        ))}
      </svg>
      {children}
    </div>
  );
}
