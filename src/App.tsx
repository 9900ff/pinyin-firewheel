import { useState } from 'react';
import { HomePage } from './pages/HomePage';
import { SettingsPage } from './pages/SettingsPage';
import { GamePage } from './pages/GamePage';
import { DEFAULT_SETTINGS, loadSettings, saveSettings } from './utils/storage';
import { audio } from './utils/audio';
import type { Settings } from './types/game';
export default function App() {
  const [page, setPage] = useState<'home' | 'settings' | 'game'>('home');
  const [settings, setSettings] = useState(loadSettings);
  const [roundSettings, setRoundSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [notice, setNotice] = useState('');
  function start(s: Settings, persist: boolean) {
    if (s.sound) audio.unlock();
    if (persist) {
      setSettings(s);
      if (!saveSettings(s)) setNotice('浏览器无法保存设置，本次游戏仍可正常进行。');
    }
    setRoundSettings({ ...s });
    setPage('game');
  }
  return (
    <>
      <div className="ambient-grid" aria-hidden="true" />
      {page === 'home' ? (
        <HomePage
          onQuick={() => start({ ...DEFAULT_SETTINGS }, false)}
          onSettings={() => setPage('settings')}
        />
      ) : page === 'settings' ? (
        <SettingsPage
          settings={settings}
          onBack={() => setPage('home')}
          onStart={(s) => start(s, true)}
        />
      ) : (
        <GamePage
          settings={roundSettings}
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
