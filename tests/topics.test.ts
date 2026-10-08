import { test } from 'node:test';
import assert from 'node:assert/strict';
import { topics, topicBanks, getTopicPool, pickTopic, topicKey } from '../src/game/topicCatalog';
import { DEFAULT_SETTINGS, isSettings } from '../src/utils/storage';
test('topic banks keep unique numeric IDs and adult topics are excluded by default', () => {
  assert.equal(topics.length, 2060);
  for (const bank of topicBanks) {
    const pool = getTopicPool([bank.id]);
    assert.equal(pool.length, bank.id === '1' ? 12 : 512);
    assert.equal(new Set(pool.map((topic) => topic.name)).size, pool.length);
    assert.deepEqual(
      pool.map((t) => t.id),
      pool.map((_, i) => String(i + 1)),
    );
  }
  assert.equal(pickTopic(['1', '2'], () => 0, { bankId: '2', id: '1' }).bankId, '1');
  assert.equal(pickTopic(['1', '2'], () => 0, { bankId: '2', id: '1' }).id, '1');
  assert.equal(new Set(topics.map(topicKey)).size, 2060);
  assert.ok(topics.every((t) => /^\d+$/.test(t.id) && topicBanks.some((b) => b.id === t.bankId)));
  assert.ok(getTopicPool(DEFAULT_SETTINGS.topicBanks).every((t) => t.bankId !== '5'));
  assert.ok(getTopicPool(['5']).every((t) => t.bankId === '5'));
});
test('mixed draws and redraws stay in selected banks and reject empty settings', () => {
  const banks = ['2', '4'];
  assert.equal(getTopicPool(banks).length, 1024);
  for (const r of [0, 0.2, 0.5, 0.99]) {
    const first = pickTopic(banks, () => r);
    assert.ok(banks.includes(first.bankId));
    const next = pickTopic(banks, () => r, first);
    assert.ok(banks.includes(next.bankId));
    assert.notEqual(topicKey(next), topicKey(first));
  }
  assert.equal(isSettings({ ...DEFAULT_SETTINGS, topicBanks: [] }), false);
  assert.equal(isSettings({ ...DEFAULT_SETTINGS, topicBanks: ['missing'] }), false);
  assert.equal(isSettings({ ...DEFAULT_SETTINGS, topicBanks: ['1', '5'] }), true);
});
