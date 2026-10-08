import { useEffect, useState } from 'react';
type FullscreenDocument = Document & {
  webkitFullscreenElement?: Element;
  webkitFullscreenEnabled?: boolean;
  webkitExitFullscreen?: () => Promise<void> | void;
};
type FullscreenRoot = HTMLElement & { webkitRequestFullscreen?: () => Promise<void> | void };
export function FullscreenButton({ compact = false }: { compact?: boolean }) {
  const [active, setActive] = useState(false),
    [busy, setBusy] = useState(false),
    [help, setHelp] = useState('');
  useEffect(() => {
    const doc = document as FullscreenDocument;
    const sync = () => setActive(Boolean(doc.fullscreenElement || doc.webkitFullscreenElement));
    sync();
    document.addEventListener('fullscreenchange', sync);
    document.addEventListener('webkitfullscreenchange', sync);
    return () => {
      document.removeEventListener('fullscreenchange', sync);
      document.removeEventListener('webkitfullscreenchange', sync);
    };
  }, []);
  async function toggle() {
    if (busy) return;
    setBusy(true);
    setHelp('');
    const doc = document as FullscreenDocument,
      root = document.documentElement as FullscreenRoot;
    try {
      if (doc.fullscreenElement || doc.webkitFullscreenElement) {
        if (doc.exitFullscreen) await doc.exitFullscreen();
        else if (doc.webkitExitFullscreen) await doc.webkitExitFullscreen();
      } else if (root.requestFullscreen && doc.fullscreenEnabled !== false) {
        await root.requestFullscreen();
      } else if (root.webkitRequestFullscreen && doc.webkitFullscreenEnabled !== false) {
        await root.webkitRequestFullscreen();
      } else {
        setHelp('这个浏览器不支持一键全屏。');
      }
      setActive(Boolean(doc.fullscreenElement || doc.webkitFullscreenElement));
    } catch {
      setHelp('浏览器没有允许进入全屏，可以尝试从主屏幕打开。');
    } finally {
      setBusy(false);
    }
  }
  const label = active ? '退出全屏' : '全屏体验';
  return (
    <div className={'fullscreen-control ' + (compact ? 'fullscreen-compact' : '')}>
      <button
        type="button"
        className={compact ? 'fullscreen-button' : 'secondary'}
        onClick={toggle}
        disabled={busy}
        aria-label={label}
        aria-pressed={active}
        title={label}
      >
        <span aria-hidden="true">{active ? '⊡' : '⛶'}</span>{' '}
        {compact ? <span className="fullscreen-short">{active ? '退出' : '全屏'}</span> : label}
      </button>
      {help && (
        <div className="fullscreen-help" role="status">
          <p>{help}</p>
          <p>
            iPhone / iPad：在 Safari 中点“分享 → 添加到主屏幕”，如有“作为网页 App
            打开”选项请开启，再从桌面图标启动。
          </p>
          <p>安卓：在浏览器菜单中选择“添加到主屏幕”或“安装应用”（以浏览器提供的选项为准）。</p>
          <p>独立窗口可隐藏地址栏，系统状态栏是否保留由设备决定。</p>
          <button type="button" onClick={() => setHelp('')}>
            知道了
          </button>
        </div>
      )}
    </div>
  );
}
