import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import ts from 'typescript';
import { topics, topicBanks, getTopicPool, pickTopic, topicKey } from '../src/game/topicCatalog';
import { DEFAULT_SETTINGS, isSettings } from '../src/utils/storage';
test('topic banks keep unique numeric IDs and adult topics are excluded by default', () => {
  assert.equal(topicBanks.length, 5);
  assert.deepEqual(
    topicBanks.map((bank) => bank.id),
    ['1', '2', '3', '4', '5'],
  );
  assert.deepEqual(
    topicBanks.map((bank) => bank.name),
    ['轻松上手', '日常联想', '开放脑洞', '聚会趣味', '🤫🤫🤫'],
  );
  assert.equal(topics.length, 12 + 4 * 512);
  assert.equal(new Set(topics.map((topic) => topic.name)).size, topics.length);
  assert.equal(topicBanks.find((bank) => bank.id === '5')?.adultOnly, true);
  for (const bank of topicBanks) {
    const pool = getTopicPool([bank.id]);
    assert.equal(pool.length, bank.id === '1' ? 12 : 512);
    if (bank.id !== '1') assert.equal(pool.slice(12).length, 500);
    assert.equal(new Set(pool.map((topic) => topic.name)).size, pool.length);
    assert.deepEqual(
      pool.map((t) => t.id),
      pool.map((_, i) => String(i + 1)),
    );
  }
  assert.equal(pickTopic(['1', '2'], () => 0, { bankId: '2', id: '1' }).bankId, '1');
  assert.equal(pickTopic(['1', '2'], () => 0, { bankId: '2', id: '1' }).id, '1');
  assert.equal(new Set(topics.map(topicKey)).size, topics.length);
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

const expectedOpeningTopicNames: Record<string, string[]> = {
  '1': [
    '动物',
    '水果',
    '食物',
    '城市',
    '职业',
    '蔬菜',
    '交通工具',
    '运动项目',
    '家里的电器',
    '穿在身上的东西',
    '厨房用具',
    '文具',
  ],
  '2': [
    '品牌',
    '游戏',
    '电影 / 电视剧',
    '校园里的东西',
    '酒桌上能看到的东西',
    '便利店里卖的东西',
    '出门旅行会带的东西',
    '上班会用到的东西',
    '早餐会吃的东西',
    '下雨天会想到的东西',
    '手机里的应用',
    '周末会做的事',
  ],
  '3': [
    '红色的东西',
    '很贵的东西',
    '会发出声音的东西',
    '家里囤多了会占地方的东西',
    '让人觉得时间过得很慢的事',
    '看着没用却舍不得扔的东西',
    '迟到时常用的理由',
    '容易让宠物害怕的东西',
    '第一次用时容易弄错的东西',
    '容易让聊天冷场的话题',
    '有钱也不一定买得到的东西',
    '适合带去荒岛的东西',
  ],
  '4': [
    '生日聚会桌上的食物',
    '朋友聚餐常点的凉菜',
    '火锅店里常点的荤菜',
    '烧烤摊上常点的素菜',
    '聚会时可以分着吃的零食',
    '适合多人一起玩的桌游',
    '拍合照时常见的动作',
    '朋友来家里能一起做的事',
    'KTV包厢里的物品',
    '野餐时会带的饮料',
    '聚会结束后需要收拾的东西',
    '生日时可以送朋友的实用礼物',
  ],
  '5': [
    '容易让人想歪的物品',
    '听着暧昧其实很日常的动作',
    '让约会升温的举动',
    '适合两个人独处的地方',
    '暧昧聊天里的称呼',
    '让人脸红的夸奖',
    '有点撩人的穿搭',
    '卧室里能找到的东西',
    '情侣之间的小暗号',
    '让人想靠近的气味',
    '电影里的暧昧场景',
    '深夜聊天时容易让人想歪的话题',
  ],
};

test('topic banks keep their expected opening topics', () => {
  for (const bank of topicBanks) {
    assert.deepEqual(
      getTopicPool([bank.id])
        .slice(0, 12)
        .map((topic) => topic.name),
      expectedOpeningTopicNames[bank.id],
    );
  }
});

test('topic source files contain only explicit static objects', () => {
  for (const bank of topicBanks) {
    const file = new URL('../src/game/topics/' + bank.id + '.ts', import.meta.url);
    const source = ts.createSourceFile(
      file.pathname,
      readFileSync(file, 'utf8'),
      ts.ScriptTarget.Latest,
      true,
      ts.ScriptKind.TS,
    );
    assert.equal(
      source.statements.length,
      2,
      'Only a type import and default definition are allowed',
    );
    const [typeImport, definition] = source.statements;
    assert.ok(ts.isImportDeclaration(typeImport));
    assert.ok(typeImport.importClause?.isTypeOnly);
    assert.ok(ts.isStringLiteral(typeImport.moduleSpecifier));
    assert.equal(typeImport.moduleSpecifier.text, '../../types/game');
    assert.ok(ts.isExportAssignment(definition));
    assert.equal(definition.isExportEquals, undefined);
    assert.ok(ts.isSatisfiesExpression(definition.expression));
    assert.equal(definition.expression.type.getText(source), 'TopicBankDefinition');
    const value = definition.expression.expression;
    assert.ok(ts.isObjectLiteralExpression(value));
    assert.deepEqual(
      value.properties.map((property) => property.name?.getText(source)),
      bank.id === '5'
        ? ['id', 'name', 'description', 'adultOnly', 'topics']
        : ['id', 'name', 'description', 'topics'],
    );
    for (const property of value.properties) {
      assert.ok(ts.isPropertyAssignment(property));
      const key = property.name.getText(source);
      if (key === 'topics') {
        assert.ok(ts.isArrayLiteralExpression(property.initializer));
        const entries = property.initializer.elements;
        assert.equal(entries.length, bank.id === '1' ? 12 : 512);
        entries.forEach((entry, index) => {
          assert.ok(ts.isObjectLiteralExpression(entry));
          assert.deepEqual(
            entry.properties.map((item) => item.name?.getText(source)),
            ['id', 'name'],
          );
          for (const item of entry.properties) {
            assert.ok(ts.isPropertyAssignment(item));
            assert.ok(ts.isStringLiteral(item.initializer));
            if (item.name.getText(source) === 'id')
              assert.equal(item.initializer.text, String(index + 1));
            else assert.equal(item.initializer.text, getTopicPool([bank.id])[index].name);
          }
        });
      } else if (key === 'adultOnly') {
        assert.equal(property.initializer.kind, ts.SyntaxKind.TrueKeyword);
      } else {
        assert.ok(ts.isStringLiteral(property.initializer));
      }
    }
  }
});
