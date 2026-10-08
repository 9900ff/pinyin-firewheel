export function BombIndicator({
  preview = false,
  urgent = false,
}: {
  preview?: boolean;
  urgent?: boolean;
}) {
  return (
    <div className={'core ' + (preview ? 'core-preview' : '')} aria-hidden="true">
      <div className="core-orbit" />
      <div className="core-inner">
        <svg viewBox="0 0 100 100" className="bomb-icon">
          <path
            d="M61 29l8-11 9 7-8 10M73 18c5-12 12-2 15-12"
            fill="none"
            stroke="currentColor"
            strokeWidth="6"
            strokeLinecap="round"
          />
          <circle cx="46" cy="59" r="29" fill="currentColor" />
          <path
            d="M28 53c1-7 6-12 12-13"
            fill="none"
            stroke="#181911"
            strokeWidth="5"
            strokeLinecap="round"
          />
          <path
            d="M86 6l5-2m-3 9 6 2"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
          />
        </svg>
        <span>{preview ? '随时开炸' : urgent ? '快接上！' : '别停下来'}</span>
        <div className="core-dots">● ● ●</div>
      </div>
    </div>
  );
}
