import type { Topic, TopicBank, TopicBankDefinition } from '../types/game';
import bank1 from './topics/1';
import bank2 from './topics/2';
import bank3 from './topics/3';
import bank4 from './topics/4';
import bank5 from './topics/5';
export const DEFAULT_TOPIC_BANKS = ['1'];
const banks: TopicBankDefinition[] = [bank1, bank2, bank3, bank4, bank5];
export const topicBanks: TopicBank[] = banks.map(({ topics: _topics, ...metadata }) => metadata);
export const topics: Topic[] = banks.flatMap((bank) =>
  bank.topics.map((topic) => ({ ...topic, bankId: bank.id })),
);
export function topicKey(topic: Pick<Topic, 'bankId' | 'id'>): string {
  return topic.bankId + ':' + topic.id;
}
export function getTopicPool(bankIds: readonly string[]): Topic[] {
  return topics.filter((topic) => bankIds.includes(topic.bankId));
}
export function pickTopic(
  bankIds: readonly string[],
  random = Math.random,
  previousTopic?: Pick<Topic, 'bankId' | 'id'>,
): Topic {
  const selected = getTopicPool(bankIds);
  const pool = selected.length ? selected : getTopicPool(DEFAULT_TOPIC_BANKS);
  const alternatives = pool.filter(
    (topic) => !previousTopic || topicKey(topic) !== topicKey(previousTopic),
  );
  const choices = alternatives.length ? alternatives : pool;
  return choices[Math.min(choices.length - 1, Math.floor(random() * choices.length))];
}
