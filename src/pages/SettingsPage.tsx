import { useState } from 'react';
import type { Settings, Difficulty } from '../types/game';
import { TopicBankSelector } from '../components/TopicBankSelector';
import { difficultyLetters, difficultyNames } from '../game/letters';
import {
  DEFAULT_SETTINGS,
  isSettings,
  THINKING_RANGE,
  TIMEOUT_RANGE,
  isThinkingTime,
  isTimeoutLimit,
} from '../utils/storage';
export function SettingsPage({
  settings,
  onChange,
  onBack,
  onStart,
}: {
  settings: Settings;
  onChange: (settings: Settings) => boolean;
  onBack: () => void;
  onStart: (s: Settings) => void;
}) {
  const [draft, setDraft] = useState(settings);
  const [customThinking, setCustomThinking] = useState(![5, 8, 10, 15].includes(settings.thinking));
  const [customTimeout, setCustomTimeout] = useState(![1, 3, 5, 0].includes(settings.timeoutLimit));
  const [saveState, setSaveState] = useState<'idle' | 'saved' | 'error'>('idle');
  function persist(next: Settings) {
    setSaveState(onChange(next) ? 'saved' : 'error');
  }
  function update<K extends keyof Settings>(key: K, value: Settings[K]) {
    const next = { ...draft, [key]: value };
    setDraft(next);
    if (isSettings(next)) persist(next);
    else {
      // Keep independent valid changes even while a different field is being edited.
      const validChange = { ...settings, [key]: value };
      if (isSettings(validChange)) persist(validChange);
    }
  }
  function reset() {
    const defaults = { ...DEFAULT_SETTINGS, topicBanks: [...DEFAULT_SETTINGS.topicBanks] };
    setDraft(defaults);
    setCustomThinking(false);
    setCustomTimeout(false);
    persist(defaults);
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
      <div className="settings-save-row">
        <p
          className={'settings-save-status ' + (saveState === 'error' || !valid ? 'error' : '')}
          role="status"
        >
          {saveState === 'error'
            ? '保存失败，修改仅在本次会话有效'
            : !valid
              ? '有效项已保留，请修正无效设置'
              : saveState === 'saved'
                ? '✓ 设置已自动保存'
                : '设置修改后自动保存'}
        </p>
        <button type="button" className="reset-settings" onClick={reset}>
          重置设置
        </button>
      </div>
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
            {[8, 10, 15, 20].map((n) => (
              <button
                type="button"
                key={n}
                aria-pressed={!customThinking && draft.thinking === n}
                className={!customThinking && draft.thinking === n ? 'selected' : ''}
                onClick={() => {
                  setCustomThinking(false);
                  update('thinking', n);
                }}
              >
                {n}
                <small> 秒</small>
              </button>
            ))}
          </div>
          <button
            type="button"
            className={'custom-option ' + (customThinking ? 'selected' : '')}
            aria-pressed={customThinking}
            aria-expanded={customThinking}
            aria-controls="custom-thinking"
            onClick={() => setCustomThinking(true)}
          >
            自定义思考时间
          </button>
          {customThinking && (
            <div className="custom-number-field">
              <label htmlFor="custom-thinking">思考时间（秒）</label>
              <input
                id="custom-thinking"
                type="number"
                inputMode="numeric"
                min={THINKING_RANGE.min}
                max={THINKING_RANGE.max}
                step="1"
                value={Number.isNaN(draft.thinking) ? '' : draft.thinking}
                aria-invalid={!isThinkingTime(draft.thinking)}
                aria-describedby="thinking-hint"
                onChange={(e) => update('thinking', e.target.valueAsNumber)}
              />
              <p
                id="thinking-hint"
                className={'field-note ' + (!isThinkingTime(draft.thinking) ? 'error' : '')}
              >
                请输入 1–300 的整数，有效修改自动保存。
              </p>
            </div>
          )}
          <p className="field-note">拍下有效字母，下一位的思考时间立即开始。</p>
        </section>
        <section className="setting-card">
          <div className="section-label">03 / 每轮超时上限</div>
          <div className="segmented">
            {[1, 3, 5, 0].map((n) => (
              <button
                key={n}
                type="button"
                aria-pressed={!customTimeout && draft.timeoutLimit === n}
                className={!customTimeout && draft.timeoutLimit === n ? 'selected' : ''}
                onClick={() => {
                  setCustomTimeout(false);
                  update('timeoutLimit', n);
                }}
              >
                {n === 0 ? '不限' : n + ' 次'}
              </button>
            ))}
          </div>
          <button
            type="button"
            className={'custom-option ' + (customTimeout ? 'selected' : '')}
            aria-pressed={customTimeout}
            aria-expanded={customTimeout}
            aria-controls="custom-timeout"
            onClick={() => setCustomTimeout(true)}
          >
            自定义超时上限
          </button>
          {customTimeout && (
            <div className="custom-number-field">
              <label htmlFor="custom-timeout">每轮超时上限（次）</label>
              <input
                id="custom-timeout"
                type="number"
                inputMode="numeric"
                min={TIMEOUT_RANGE.min}
                max={TIMEOUT_RANGE.max}
                step="1"
                value={Number.isNaN(draft.timeoutLimit) ? '' : draft.timeoutLimit}
                aria-invalid={!isTimeoutLimit(draft.timeoutLimit)}
                aria-describedby="timeout-hint"
                onChange={(e) => update('timeoutLimit', e.target.valueAsNumber)}
              />
              <p
                id="timeout-hint"
                className={'field-note ' + (!isTimeoutLimit(draft.timeoutLimit) ? 'error' : '')}
              >
                请输入 1–99 的整数，0 表示不限。有效修改自动保存。
              </p>
            </div>
          )}
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
          开始游戏 <span>↗</span>
        </button>
      </form>
      <p className="fine-print">个人倒计时公开 · 炸弹时间隐藏 · 设备放桌中央</p>
    </main>
  );
}
