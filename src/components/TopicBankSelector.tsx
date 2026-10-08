import { getTopicPool, topicBanks } from '../game/topicCatalog';
export function TopicBankSelector({
  selected,
  onChange,
}: {
  selected: string[];
  onChange: (ids: string[]) => void;
}) {
  function toggle(id: string) {
    onChange(selected.includes(id) ? selected.filter((value) => value !== id) : [...selected, id]);
  }
  return (
    <section className="setting-card topic-bank-section" aria-labelledby="banks-heading">
      <div className="section-label" id="banks-heading">
        04 / 题库风格 <span className="chip">可多选</span>
      </div>
      <p className="bank-intro">从轻松热身到放开脑洞，混搭你们想玩的题。</p>
      <div className="bank-list">
        {topicBanks.map((bank) => {
          const entries = getTopicPool([bank.id]);
          const checked = selected.includes(bank.id);
          return (
            <div
              className={
                'bank-card ' +
                (checked ? 'bank-selected ' : '') +
                (bank.adultOnly ? 'bank-adult' : '')
              }
              key={bank.id}
            >
              <label className="bank-choice">
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => toggle(bank.id)}
                  aria-label={bank.name + (bank.adultOnly ? '，18岁以上' : '')}
                />
                <span className="bank-copy">
                  <span className="bank-title">
                    {bank.name}
                    {bank.adultOnly && <span className="adult-badge">18+</span>}
                    <small>{entries.length} 题</small>
                  </span>
                  <span className="bank-description">{bank.description}</span>
                </span>
              </label>
              <details className="bank-preview">
                <summary>查看题目</summary>
                <ul>
                  {entries.map((topic) => (
                    <li key={topic.bankId + ':' + topic.id}>{topic.name}</li>
                  ))}
                </ul>
              </details>
            </div>
          );
        })}
      </div>
      <p className={'field-note ' + (!selected.length ? 'error' : '')} role="status">
        {selected.length
          ? '已选 ' +
            selected.length +
            ' 个题库 · 共 ' +
            getTopicPool(selected).length +
            ' 题，混合随机抽取。'
          : '至少选择一个题库才能开始游戏。'}
      </p>
    </section>
  );
}
