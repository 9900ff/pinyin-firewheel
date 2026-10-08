import type { CSSProperties } from 'react';
export function TableCenter({
  topic,
  remaining,
  ratio,
  urgent,
}: {
  topic: string;
  remaining: number;
  ratio: number;
  urgent: boolean;
}) {
  const face = (opposite: boolean) => (
    <div
      className={'table-face ' + (opposite ? 'opposite' : '')}
      aria-hidden={opposite || undefined}
    >
      <span className="table-topic">{topic}</span>
      <span className="turn-seconds">
        {remaining}
        <small>秒</small>
      </span>
      <span className="turn-caption">本位剩余</span>
    </div>
  );
  return (
    <div
      className={'table-center ' + (urgent ? 'countdown-urgent' : '')}
      style={{ '--turn-ratio': ratio } as CSSProperties}
    >
      <svg className="turn-ring" viewBox="0 0 100 100" aria-hidden="true">
        <circle className="turn-ring-track" cx="50" cy="50" r="47" />
        <circle
          className="turn-ring-value"
          cx="50"
          cy="50"
          r="47"
          pathLength="1"
          strokeDasharray={ratio + ' 1'}
        />
      </svg>
      {face(true)}
      <span className="center-fuse" aria-hidden="true">
        ✹
      </span>
      {face(false)}
    </div>
  );
}
