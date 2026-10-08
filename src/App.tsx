import { useState } from 'react';
import { TopicPreviewPage } from './pages/TopicPreviewPage';
import { pickTopic } from './game/topicCatalog';
import { HomePage } from './pages/HomePage';
import { SettingsPage } from './pages/SettingsPage';
import { GamePage } from './pages/GamePage';
import { DEFAULT_SETTINGS, loadSettings, saveSettings } from './utils/storage';
import { audio } from './utils/audio';
import type { Settings, Topic } from './types/game';
export default function App() {
  const [page, setPage] = useState<'home' | 'settings' | 'preview' | 'game'>('home');
  const [settings, setSettings] = useState(loadSettings);
  const [roundSettings, setRoundSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [notice, setNotice] = useState('');
  const [previewTopic, setPreviewTopic] = useState<Topic | null>(null);
  const [initialTopic, setInitialTopic] = useState<Topic | undefined>();
  function previewQuick() {
    const config = { ...settings, topicBanks: [...settings.topicBanks] };
    setRoundSettings(config);
    setPreviewTopic(pickTopic(config.topicBanks));
    setPage('preview');
  }
  function previewNext(previousTopic: Topic) {
    setPreviewTopic(pickTopic(roundSettings.topicBanks, Math.random, previousTopic));
    setPage('preview');
  }
  function updateSettings(s: Settings): boolean {
    setSettings(s);
    const saved = saveSettings(s);
    setNotice(saved ? '' : '浏览器无法保存设置，本次会话仍会使用你的修改。');
    return saved;
  }
  function start(s: Settings, topic?: Topic) {
    if (s.sound) audio.unlock();
    setRoundSettings({ ...s });
    setInitialTopic(topic);
    setPage('game');
  }
  return (
    <>
      <div className="ambient-grid" aria-hidden="true" />
      {page === 'home' ? (
        <HomePage onQuick={previewQuick} onSettings={() => setPage('settings')} />
      ) : page === 'preview' && previewTopic ? (
        <TopicPreviewPage
          topic={previewTopic}
          onConfirm={() => start(roundSettings, previewTopic)}
          onRefresh={() =>
            setPreviewTopic((current) =>
              pickTopic(roundSettings.topicBanks, Math.random, current ?? undefined),
            )
          }
          onBack={() => setPage('home')}
        />
      ) : page === 'settings' ? (
        <SettingsPage
          settings={settings}
          onBack={() => setPage('home')}
          onChange={updateSettings}
          onStart={(s) => start(s)}
        />
      ) : (
        <GamePage
          settings={roundSettings}
          initialTopic={initialTopic}
          onNext={previewNext}
          onSettings={() => setPage('settings')}
          onExit={() => setPage('home')}
        />
      )}
      {notice && (
        <button className="toast" onClick={() => setNotice('')} role="status">
          {notice} ×
        </button>
      )}
    </>
  );
}
