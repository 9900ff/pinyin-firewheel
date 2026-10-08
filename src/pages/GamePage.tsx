import { FullscreenButton } from '../components/FullscreenButton';
import type { CSSProperties } from 'react';
import type { Settings, Topic } from '../types/game';
import { useGame } from '../hooks/useGame';
import { LetterWheel } from '../components/LetterWheel';
import { Sparks } from '../components/Sparks';
import { TableCenter } from '../components/TableCenter';
import { GameOverModal } from '../components/GameOverModal';
import { Modal } from '../components/Modal';
export function GamePage({
  settings,
  initialTopic,
  onNext,
  onSettings,
  onExit,
}: {
  settings: Settings;
  initialTopic?: Topic;
  onNext: (previousTopic: Topic) => void;
  onSettings: () => void;
  onExit: () => void;
}) {
  const game = useGame(settings, initialTopic),
    { state, mood } = game;
  const over = ['bombExploded', 'thinkingTimeout', 'cleared'].includes(state.gameStatus);
  const penalty = game.penaltyVisible && !over;
  const message = penalty
    ? '超时！这位受罚 · 下一位继续'
    : state.usedLetters.length
      ? '✓ ' + state.usedLetters.at(-1) + ' 已选 · 下一位！'
      : '设备放桌中央 · 第一位开始';
  return (
    <main
      className={'table-game page ' + (over ? 'round-ended' : '')}
      style={
        {
          '--heat': mood.heat,
          '--pulse': mood.pulse,
          '--mechanical': mood.mechanical,
          '--alarm': mood.alarm,
          '--shake-x': (state.gameStatus === 'playing' ? mood.shakeX : 0) + '%',
          '--shake-y': (state.gameStatus === 'playing' ? mood.shakeY : 0) + '%',
          '--shake-angle': (state.gameStatus === 'playing' ? mood.shakeAngle : 0) + 'deg',
        } as CSSProperties
      }
    >
      <div className="table-ambience" aria-hidden="true" />
      <header className="table-toolbar">
        <button
          className="icon-button"
          aria-label="撤销上一个字母"
          title="只恢复卡牌，不取消处罚，不补时"
          disabled={!state.turnHistory.length || state.gameStatus !== 'playing'}
          onClick={game.undo}
        >
          ↶
        </button>
        <span className="table-counter">
          本轮超时{' '}
          <b>
            {state.timeoutCount} / {settings.timeoutLimit || '不限'}
          </b>
        </span>
        <button
          className="icon-button"
          aria-label="暂停与菜单"
          disabled={over || state.gameStatus === 'paused'}
          onClick={game.pause}
        >
          Ⅱ
        </button>
      </header>
      <div className="table-board">
        <div
          className={'table-notice notice-opposite ' + (penalty ? 'penalty' : '')}
          aria-hidden="true"
        >
          {message}
        </div>
        <LetterWheel
          usedLetters={state.usedLetters}
          activeLetters={state.activeLetters}
          locked={state.gameStatus !== 'playing'}
          onPress={game.press}
        >
          <Sparks
            beat={mood.beat}
            phase={mood.beatFraction}
            intensity={state.gameStatus === 'playing' ? mood.sparks : 0}
            seed={state.effectSeed}
          />
          <TableCenter
            topic={state.currentTopic.name}
            remaining={mood.remaining}
            ratio={mood.ratio}
            urgent={mood.urgent}
          />
        </LetterWheel>
        <div className={'table-notice ' + (penalty ? 'penalty' : '')} role="status">
          {message}
        </div>
      </div>
      <footer className="table-footer">
        <p>说答案，拍首字母 · 按约定顺序接力</p>
        <span>zh → Z · ch → C · sh → S</span>
      </footer>
      {state.gameStatus === 'paused' && (
        <Modal titleId="pause-title">
          <span className="eyebrow">TAKE A BREATH</span>
          <h2 id="pause-title">喘口气，继续玩。</h2>
          <p className="muted">炸弹和个人时间已冻结 · 可先执行处罚</p>
          <button className="primary" onClick={game.resume}>
            继续游戏 <span>▶</span>
          </button>
          <FullscreenButton />
          <button className="secondary" onClick={game.restart}>
            重新开始本轮
          </button>
          <button className="secondary" onClick={() => onNext(state.currentTopic)}>
            选题并进入下一轮
          </button>
          <button className="secondary" onClick={onSettings}>
            返回设置
          </button>
          <button className="text-button" onClick={onExit}>
            退出游戏
          </button>
        </Modal>
      )}
      {over && (
        <GameOverModal
          status={state.gameStatus}
          onNext={() => onNext(state.currentTopic)}
          onSettings={onSettings}
        />
      )}
    </main>
  );
}
