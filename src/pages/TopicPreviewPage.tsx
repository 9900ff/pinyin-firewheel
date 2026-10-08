import { useEffect, useRef, useState } from 'react';
import type { Topic } from '../types/game';
import { topicBanks, topicKey } from '../game/topicCatalog';
import { Modal } from '../components/Modal';
import { FullscreenButton } from '../components/FullscreenButton';
export function TopicPreviewPage({
  topic,
  selectedBanks,
  onBanksChange,
  onConfirm,
  onRefresh,
  onBack,
}: {
  topic: Topic;
  selectedBanks: string[];
  onBanksChange: (ids: string[]) => void;
  onConfirm: () => void;
  onRefresh: () => void;
  onBack: () => void;
}) {
  const [choosingBanks, setChoosingBanks] = useState(false);
  const [outgoing, setOutgoing] = useState<Topic | null>(null);
  const locked = useRef(false);
  const changing = outgoing !== null;
  useEffect(() => {
    if (!changing) return;
    // Fallback completion also works if animations are disabled or the tab loses visibility.
    const timer = window.setTimeout(() => {
      setOutgoing(null);
      locked.current = false;
    }, 460);
    return () => window.clearTimeout(timer);
  }, [changing]);
  function refresh() {
    if (locked.current) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      onRefresh();
      return;
    }
    locked.current = true;
    setOutgoing(topic);
    onRefresh();
  }
  function card(value: Topic, leaving = false) {
    const bank = topicBanks.find((bank) => bank.id === value.bankId);
    return (
      <section
        key={(leaving ? 'out:' : 'in:') + topicKey(value)}
        className={
          'preview-topic-card ' +
          (leaving ? 'topic-card-leave' : changing ? 'topic-card-arrive' : '')
        }
        aria-hidden={leaving || undefined}
      >
        <span className="eyebrow">本轮主题</span>
        <h1>{value.name}</h1>
        <span className="chip">{bank?.name}</span>
      </section>
    );
  }
  return (
    <main className="topic-preview page">
      <header className="page-header">
        <button className="icon-button" aria-label="返回首页" onClick={onBack}>
          ←
        </button>
        <span>先选题，再开局</span>
        <FullscreenButton compact />
      </header>
      <div
        className="preview-card-stage"
        aria-live="polite"
        aria-atomic="true"
        aria-busy={changing}
      >
        <div className="preview-card-back" aria-hidden="true" />
        {card(topic)}
        {outgoing && card(outgoing, true)}
      </div>
      <div className="preview-actions">
        <button
          className="preview-bank-button"
          disabled={changing}
          aria-haspopup="dialog"
          onClick={() => setChoosingBanks(true)}
        >
          <span>切换题库</span>
          <small>
            {topicBanks
              .filter((bank) => selectedBanks.includes(bank.id))
              .map((bank) => bank.name)
              .join('、')}
          </small>
          <span aria-hidden="true">›</span>
        </button>
        <p className="muted">
          大家看好题目，准备好了再开始。
          <br />
          确认前不计时。
        </p>
        <div className="preview-button-row">
          <button className="secondary refresh-topic" disabled={changing} onClick={refresh}>
            <span aria-hidden="true">↻</span> 换一张
          </button>
          <button
            className="primary"
            disabled={changing}
            onClick={() => {
              if (!locked.current) onConfirm();
            }}
          >
            确定开始 <span>▶</span>
          </button>
        </div>
      </div>
      {choosingBanks && (
        <Modal titleId="preview-banks-title" className="preview-banks-modal">
          <h2 id="preview-banks-title">选择题库</h2>
          <p className="muted">可多选，修改自动保存并重新抽题，至少保留一个。</p>
          <div className="bank-list">
            {topicBanks.map((bank) => {
              const checked = selectedBanks.includes(bank.id);
              return (
                <label
                  key={bank.id}
                  className={'bank-card bank-choice ' + (checked ? 'bank-selected' : '')}
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    disabled={checked && selectedBanks.length === 1}
                    onChange={() =>
                      onBanksChange(
                        checked
                          ? selectedBanks.filter((id) => id !== bank.id)
                          : [...selectedBanks, bank.id],
                      )
                    }
                  />
                  <span className="bank-copy">
                    <span className="bank-title">
                      {bank.name}
                      {bank.adultOnly && <span className="adult-badge">18+</span>}
                    </span>
                    <span className="bank-description">{bank.description}</span>
                  </span>
                </label>
              );
            })}
          </div>
          <button className="primary" onClick={() => setChoosingBanks(false)}>
            返回抽签
          </button>
        </Modal>
      )}
    </main>
  );
}
