import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { GamePage } from '../src/pages/GamePage';
import { DEFAULT_SETTINGS } from '../src/utils/storage';
test('table renders both reading directions, public personal timer and only active cards', () => {
  const html = renderToStaticMarkup(
    createElement(GamePage, {
      settings: { ...DEFAULT_SETTINGS, topicBanks: ['1'] },
      onSettings: () => {},
      onExit: () => {},
    }),
  );
  assert.equal((html.match(/class="table-topic"/g) ?? []).length, 2);
  assert.equal((html.match(/class="ring-card"/g) ?? []).length, 20);
  assert.ok(html.includes('本位剩余'));
  assert.ok(html.includes('本轮超时'));
  assert.ok(!html.includes('bombDuration'));
});
