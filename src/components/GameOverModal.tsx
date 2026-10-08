import type { GameStatus } from '../types/game';
import { Modal } from './Modal';
export function GameOverModal({
  status,
  onNext,
  onSettings,
}: {
  status: GameStatus;
  onNext: () => void;
  onSettings: () => void;
}) {
  const bomb = status === 'bombExploded',
    cleared = status === 'cleared';
  return (
    <Modal
      titleId="result-title"
      className={'result-modal ' + (bomb ? 'explosion' : cleared ? 'cleared' : 'timeout')}
    >
      <div className="result-stamp">{bomb ? '✹' : cleared ? '✓' : '！'}</div>
      <span className="eyebrow">{cleared ? 'WELL PLAYED' : 'ROUND OVER'}</span>
      <h1 id="result-title">{bomb ? 'BOOM!' : cleared ? '全员过关！' : '超时上限！'}</h1>
      <p>
        {bomb
          ? '当前玩家被炸！'
          : cleared
            ? '全部可用字母已完成，默契拉满。'
            : '这位受罚 · 本轮超时次数已达上限'}
      </p>
      <div className="result-divider" />
      <button className="primary" onClick={onNext}>
        下一轮 <span>↗</span>
      </button>
      <button className="secondary" onClick={onSettings}>
        返回设置
      </button>
      <p className="fine-print">
        {cleared ? '换个题目，再来一轮。' : '深呼吸，把好运留给下一轮。'}
      </p>
    </Modal>
  );
}
