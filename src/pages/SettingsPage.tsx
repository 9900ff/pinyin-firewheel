import { useState } from 'react';
import type { Settings, Difficulty } from '../types/game';
import { TopicBankSelector } from '../components/TopicBankSelector';
import { difficultyLetters, difficultyNames } from '../game/letters';
import { isSettings } from '../utils/storage';
export function SettingsPage({
  settings,
  onBack,
  onStart,
}: {
  settings: Settings;
  onBack: () => void;
  onStart: (s: Settings) => void;
}) {
  const [draft, setDraft] = useState(settings);
  function update<K extends keyof Settings>(key: K, value: Settings[K]) {
    setDraft((s) => ({ ...s, [key]: value }));
  }
  const valid = isSettings(draft);
  return (
    <main className="settings page">
      <header className="page-header">
        <button className="icon-button" onClick={onBack} aria-label="返回首页">
          ←
        </button>
        <span>定制这一局</span>
        <span className="tiny">SETUP / 01</span>
      </header>
      <h1>
        游戏设置<span className="accent">.</span>
      </h1>
      <p className="muted">调整节奏，让每个人都心跳加速。</p>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (valid) onStart(draft);
        }}
      >
        <section className="setting-card">
          <div className="section-label">
            <span>01 / 隐藏炸弹</span>
            <span className="chip">随机引爆</span>
          </div>
          <div className="time-inputs">
            <label>
              最短时间
              <div>
                <input
                  aria-label="最短爆炸时间"
                  type="number"
                  min="20"
                  max="180"
                  step="1"
                  value={Number.isNaN(draft.bombMin) ? '' : draft.bombMin}
                  onChange={(e) => update('bombMin', e.target.valueAsNumber)}
                />
                <span>秒</span>
              </div>
            </label>
            <span className="time-separator">—</span>
            <label>
              最长时间
              <div>
                <input
                  aria-label="最长爆炸时间"
                  type="number"
                  min="30"
                  max="300"
                  step="1"
                  value={Number.isNaN(draft.bombMax) ? '' : draft.bombMax}
                  onChange={(e) => update('bombMax', e.target.valueAsNumber)}
                />
                <span>秒</span>
              </div>
            </label>
          </div>
          <p className={draft.bombMax <= draft.bombMin ? 'field-note error' : 'field-note'}>
            最短 20–180 秒，最长 30–300 秒，最长须大于最短。
          </p>
        </section>
        <section className="setting-card">
          <div className="section-label">02 / 个人思考时间</div>
          <div className="segmented">
            {[5, 8, 10, 15].map((n) => (
              <button
                type="button"
                key={n}
                aria-pressed={draft.thinking === n}
                className={draft.thinking === n ? 'selected' : ''}
                onClick={() => update('thinking', n)}
              >
                {n}
                <small> 秒</small>
              </button>
            ))}
          </div>
          <p className="field-note">拍下有效字母，下一位的思考时间立即开始。</p>
        </section>
        <section className="setting-card">
          <div className="section-label">03 / 每轮超时上限</div>
          <div className="segmented">
            {[1, 3, 5, 0].map((n) => (
              <button
                key={n}
                type="button"
                aria-pressed={draft.timeoutLimit === n}
                className={draft.timeoutLimit === n ? 'selected' : ''}
                onClick={() => update('timeoutLimit', n)}
              >
                {n === 0 ? '不限' : n + ' 次'}
              </button>
            ))}
          </div>
          <p className="field-note">
            超时提醒处罚并换下一位；累计达到上限才结束本轮。炸弹始终继续。
          </p>
        </section>
        <TopicBankSelector
          selected={draft.topicBanks}
          onChange={(ids) => update('topicBanks', ids)}
        />
        <section className="setting-card">
          <div className="section-label">05 / 字母难度</div>
          <div className="segmented">
            {(['easy', 'standard', 'hard'] as Difficulty[]).map((d) => (
              <button
                key={d}
                type="button"
                className={draft.difficulty === d ? 'selected' : ''}
                aria-pressed={draft.difficulty === d}
                onClick={() => update('difficulty', d)}
              >
                {difficultyNames[d]}
                <small className="block">{difficultyLetters[d].length} 个字母</small>
              </button>
            ))}
          </div>
        </section>
        <section className="setting-card switches">
          {(['sound', 'vibration'] as const).map((k) => (
            <label className="switch-row" key={k}>
              <span>
                {k === 'sound' ? '声音反馈' : '触感反馈'}
                <small>{k === 'sound' ? '听见危险，感受节奏' : '不支持震动的设备自动跳过'}</small>
              </span>
              <input
                type="checkbox"
                role="switch"
                checked={draft[k]}
                onChange={(e) => update(k, e.target.checked)}
              />
            </label>
          ))}
        </section>
        <button className="primary" disabled={!valid} type="submit">
          保存设置，开始游戏 <span>↗</span>
        </button>
      </form>
      <p className="fine-print">个人倒计时公开 · 炸弹时间隐藏 · 设备放桌中央</p>
    </main>
  );
}
