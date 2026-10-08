import { FullscreenButton } from '../components/FullscreenButton';
import { BombIndicator } from '../components/BombIndicator';
export function HomePage({ onQuick, onSettings }: { onQuick: () => void; onSettings: () => void }) {
  return (
    <main className="home page">
      <div className="home-atmosphere" aria-hidden="true">
        <i />
        <i />
        <i />
      </div>
      <header className="brand">
        <span className="brand-mark">风</span>
        <span>拼音风火轮</span>
        <span className="edition">PARTY / 01</span>
        <FullscreenButton compact />
      </header>
      <div className="home-copy">
        <span className="eyebrow">
          <i /> 聚在一起，随时开局
        </span>
        <h1>
          拼音
          <span>
            风火轮<span className="title-spark">✳</span>
          </span>
        </h1>
        <p className="tagline">
          围桌接力，<strong>别在你手里爆炸。</strong>
        </p>
      </div>
      <div className="hero-machine" aria-hidden="true">
        <div className="hero-ring" />
        <div className="hero-track" />
        <span className="hero-letter hl-b">B</span>
        <span className="hero-letter hl-x">X</span>
        <span className="hero-letter hl-l">L</span>
        <span className="hero-letter hl-c">C</span>
        <span className="hero-letter hl-s">S</span>
        <span className="hero-letter hl-a">A</span>
        <BombIndicator preview />
        <span className="machine-caption">HIDDEN BOMB · KEEP IT MOVING</span>
      </div>
      <div className="home-bottom">
        <div className="steps">
          <span>
            <b>01</b> 看题目
          </span>
          <i>／</i>
          <span>
            <b>02</b> 说答案
          </span>
          <i>／</i>
          <span>
            <b>03</b> 拍首字母
          </span>
        </div>
        <button className="primary start-button" onClick={onQuick}>
          快速开始 <span>↗</span>
        </button>
        <button className="secondary" onClick={onSettings}>
          游戏设置 <span>⚙</span>
        </button>
        <p className="fine-print">设备放桌中央 · 约定顺时针接力 · 答案由大家判断</p>
      </div>
    </main>
  );
}
