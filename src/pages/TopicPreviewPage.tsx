import { useEffect, useRef, useState } from 'react';
import type { Topic } from '../types/game';
import { topicBanks, topicKey } from '../game/topicCatalog';
import { FullscreenButton } from '../components/FullscreenButton';
export function TopicPreviewPage({
  topic,
  onConfirm,
  onRefresh,
  onBack,
}: {
  topic: Topic;
  onConfirm: () => void;
  onRefresh: () => void;
  onBack: () => void;
}) {
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
    </main>
  );
}
